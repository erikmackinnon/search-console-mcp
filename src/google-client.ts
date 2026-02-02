import { google } from 'googleapis';
import { searchconsole_v1 } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/webmasters'];

export async function getSearchConsoleClient(): Promise<searchconsole_v1.Searchconsole> {
  const auth = new google.auth.GoogleAuth({
    scopes: SCOPES,
  });

  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    const jwtClient = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: SCOPES
    });
    await jwtClient.authorize();
    return google.searchconsole({ version: 'v1', auth: jwtClient as any });
  }

  const client = await auth.getClient();
  return google.searchconsole({ version: 'v1', auth: client as any });
}
