import { getSearchConsoleClient } from '../google-client.js';
import { searchconsole_v1 } from 'googleapis';

/**
 * Inspects a URL for a site to see its current indexing status in Google Search.
 *
 * @param siteUrl - The URL of the site as defined in Search Console.
 * @param inspectionUrl - The specific URL to inspect.
 * @param languageCode - The language used for localized results. Defaults to 'en-US'.
 * @returns Comprehensive indexing and status information for the URL.
 */
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
