import { getSearchConsoleClient } from '../google-client.js';

export async function inspectUrl(siteUrl: string, inspectionUrl: string, languageCode: string = 'en-US') {
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
