import { google } from 'googleapis';
import { searchconsole_v1 } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/webmasters'];

let cachedClient: searchconsole_v1.Searchconsole | null = null;

/**
 * Get an authenticated Google Search Console API client.
 * Supports both file-based credentials (GOOGLE_APPLICATION_CREDENTIALS)
 * and environment variable credentials (GOOGLE_CLIENT_EMAIL + GOOGLE_PRIVATE_KEY).
 */
export async function getSearchConsoleClient(): Promise<searchconsole_v1.Searchconsole> {
  if (cachedClient) {
    return cachedClient;
  }

  // Option 1: Environment variables (for serverless/Cloudflare)
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

  // Option 2: File-based credentials (default)
  const auth = new google.auth.GoogleAuth({
    scopes: SCOPES,
  });

  const client = await auth.getClient();
  cachedClient = google.searchconsole({ version: 'v1', auth: client as any });
  return cachedClient;
}
