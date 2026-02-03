import { getSearchConsoleClient } from '../google-client.js';
import { searchconsole_v1 } from 'googleapis';

export async function inspectUrl(
  siteUrl: string,
  inspectionUrl: string,
  languageCode: string = 'en-US'
): Promise<searchconsole_v1.Schema$InspectUrlIndexResponse> {
  const client = await getSearchConsoleClient();
  const res = await client.urlInspection.index.inspect({
    requestBody: {
      inspectionUrl,
      siteUrl,
      languageCode
    }
  });
  return res.data;
}
