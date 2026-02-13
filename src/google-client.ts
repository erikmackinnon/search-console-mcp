import { google, searchconsole_v1 } from 'googleapis';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { createCipheriv, createDecipheriv, scryptSync, randomBytes } from 'crypto';
import nodeMachineId from 'node-machine-id';
const { machineIdSync } = nodeMachineId;

const SCOPES = [
  'https://www.googleapis.com/auth/webmasters.readonly',
  'https://www.googleapis.com/auth/userinfo.email'
];
const TOKEN_PATH = join(homedir(), '.search-console-mcp-tokens.enc');
const SERVICE_NAME = 'io.github.saurabhsharma2u.search-console-mcp';
const DEFAULT_ACCOUNT = 'default';

// Default Client ID for Desktop Flow
export const DEFAULT_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '347626597503-dr6t24m0i3g1nl1suam86rs650t3fhau.apps.googleusercontent.com';
export const DEFAULT_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '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';

const ENCRYPTION_ALGORITHM = 'aes-256-gcm';

function getEncryptionKey() {
  const mId = machineIdSync();
  const salt = process.env.USER || 'sc-mcp-salt';
  return scryptSync(mId, salt, 32);
}

function encrypt(text: string): string {
  const iv = randomBytes(12);
  const key = getEncryptionKey();
  const cipher = createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

function decrypt(data: string): string {
  const [ivHex, authTagHex, encryptedHex] = data.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const key = getEncryptionKey();
  const decipher = createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

let cachedClient: searchconsole_v1.Searchconsole | null = null;

export async function getSearchConsoleClient(targetEmail?: string): Promise<searchconsole_v1.Searchconsole> {
  if (cachedClient && !targetEmail) {
    return cachedClient;
  }

  // 1. Load Tokens (Keychain first, then File)
  const tokens = await loadTokens(targetEmail);

  if (tokens) {
    try {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID || DEFAULT_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET || DEFAULT_CLIENT_SECRET
      );
      oauth2Client.setCredentials(tokens);

      // Check for expiry (refresh if needed)
      if (tokens.expiry_date && tokens.expiry_date <= Date.now()) {
        const { credentials } = await oauth2Client.refreshAccessToken();
        // Since we refresh, we need the email to save back. 
        // If we don't have targetEmail, we try to fetch it from the new credentials or previous data
        const email = targetEmail || await getUserEmail(credentials);
        await saveTokens(credentials, email);
        oauth2Client.setCredentials(credentials);
      }

      const client = google.searchconsole({ version: 'v1', auth: oauth2Client });
      if (!targetEmail) cachedClient = client;
      return client;
    } catch (error) {
      console.error('Failed to use stored OAuth2 tokens:', (error as Error).message);
    }
  }

  // 2. Fallback to Service Account (Environment Variables)
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    const jwtClient = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: SCOPES
    });
    await jwtClient.authorize();
    cachedClient = google.searchconsole({ version: 'v1', auth: jwtClient as any });
    return cachedClient;
  }

  // 3. Fallback to File-based credentials
  const auth = new google.auth.GoogleAuth({
    scopes: SCOPES,
  });

  try {
    const client = await auth.getClient();
    cachedClient = google.searchconsole({ version: 'v1', auth: client as any });
    return cachedClient;
  } catch (error) {
    throw new Error('No valid authentication found. Please run "search-console-mcp login" to authorize.');
  }
}

export async function getUserEmail(tokens: any): Promise<string> {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID || DEFAULT_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET || DEFAULT_CLIENT_SECRET
  );
  oauth2Client.setCredentials(tokens);
  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
  const userInfo = await oauth2.userinfo.get();
  return userInfo.data.email || DEFAULT_ACCOUNT;
}

export async function logout(email?: string) {
  const target = email || DEFAULT_ACCOUNT;

  // 1. Try Keychain
  try {
    const { Entry } = await import('@napi-rs/keyring');
    const entry = new Entry(SERVICE_NAME, target);
    await entry.deletePassword();
  } catch (e) { }

  // 2. Clear from file
  if (existsSync(TOKEN_PATH)) {
    try {
      const encryptedData = readFileSync(TOKEN_PATH, 'utf-8');
      const decrypted = decrypt(encryptedData);
      const allTokens = JSON.parse(decrypted);
      delete allTokens[target];
      if (Object.keys(allTokens).length === 0) {
        // Just delete the file if no accounts left
        import('fs').then(fs => fs.unlinkSync(TOKEN_PATH)).catch(() => { });
      } else {
        const updatedEncrypted = encrypt(JSON.stringify(allTokens));
        writeFileSync(TOKEN_PATH, updatedEncrypted, { mode: 0o600 });
      }
    } catch (e) { }
  }
}

export async function loadTokens(email?: string): Promise<any> {
  const target = email || DEFAULT_ACCOUNT;

  // 1. Try Keychain
  try {
    const { Entry } = await import('@napi-rs/keyring');
    const entry = new Entry(SERVICE_NAME, target);
    const secret = await entry.getPassword();
    if (secret) {
      return JSON.parse(secret);
    }
  } catch (e) { }

  // 2. Try Encrypted File
  if (existsSync(TOKEN_PATH)) {
    try {
      const encryptedData = readFileSync(TOKEN_PATH, 'utf-8');
      const decrypted = decrypt(encryptedData);
      const allTokens = JSON.parse(decrypted);
      return allTokens[target] || (email ? null : Object.values(allTokens)[0]);
    } catch (e) { }
  }

  return null;
}

export async function saveTokens(tokens: any, email?: string) {
  const target = email || DEFAULT_ACCOUNT;

  // Only store what we need
  const minimalTokens = {
    refresh_token: tokens.refresh_token,
    expiry_date: tokens.expiry_date,
    access_token: tokens.access_token // Needed for immediate use, but refresh_token is the key
  };

  const tokenStr = JSON.stringify(minimalTokens);

  // 1. Try Keychain
  let keychainSuccess = false;
  try {
    const { Entry } = await import('@napi-rs/keyring');
    const entry = new Entry(SERVICE_NAME, target);
    await entry.setPassword(tokenStr);
    keychainSuccess = true;
  } catch (e) { }

  // 2. Always write to encrypted file as a fallback
  try {
    let allTokens: any = {};
    if (existsSync(TOKEN_PATH)) {
      try {
        const encryptedData = readFileSync(TOKEN_PATH, 'utf-8');
        const decrypted = decrypt(encryptedData);
        allTokens = JSON.parse(decrypted);
      } catch (e) { }
    }
    allTokens[target] = minimalTokens;
    const encrypted = encrypt(JSON.stringify(allTokens));
    writeFileSync(TOKEN_PATH, encrypted, { mode: 0o600 });
  } catch (e) {
    if (!keychainSuccess) throw e;
  }
}

export interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_url: string;
  expires_in: number;
  interval: number;
}

export async function initiateDeviceFlow(clientId: string): Promise<DeviceCodeResponse> {
  const response = await fetch('https://oauth2.googleapis.com/device/code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      scope: SCOPES.join(' ')
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to initiate device flow: ${error}`);
  }

  return await response.json() as DeviceCodeResponse;
}

export async function pollForTokens(clientId: string, clientSecret: string, deviceCode: string, interval: number): Promise<any> {
  // This is now deprecated as Device Flow doesn't support Search Console scopes
  throw new Error("Device Flow is not supported for Search Console API.");
}

export async function startLocalFlow(clientId: string, clientSecret: string): Promise<any> {
  const { createServer } = await import('http');
  const { google } = await import('googleapis');
  const open = (await import('open')).default;

  const REDIRECT_URI = 'http://localhost:3000/oauth2callback';
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI);

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });

  return new Promise((resolve, reject) => {
    const server = createServer(async (req, res) => {
      try {
        if (req.url?.startsWith('/oauth2callback')) {
          const url = new URL(req.url, `http://${req.headers.host}`);
          const code = url.searchParams.get('code');

          if (code) {
            const { tokens } = await oauth2Client.getToken(code);
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end('<h1>Authentication Successful!</h1><p>You can close this tab now and return to your terminal.</p>');
            server.close();
            resolve(tokens);
          }
        }
      } catch (e) {
        res.writeHead(500);
        res.end('<h1>Authentication Failed</h1>');
        server.close();
        reject(e);
      }
    }).listen(3000);

    console.log('\nOpening your browser to authorize Search Console access...');
    open(authUrl);
  });
}
