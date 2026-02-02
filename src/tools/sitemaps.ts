import { getSearchConsoleClient } from '../google-client.js';

export async function listSitemaps(siteUrl: string) {
  const client = await getSearchConsoleClient();
  const res = await client.sitemaps.list({ siteUrl });
  return res.data.sitemap || [];
}

export async function submitSitemap(siteUrl: string, feedpath: string) {
  const client = await getSearchConsoleClient();
  await client.sitemaps.submit({ siteUrl, feedpath });
  return `Successfully submitted sitemap: ${feedpath} for ${siteUrl}`;
}

export async function deleteSitemap(siteUrl: string, feedpath: string) {
  const client = await getSearchConsoleClient();
  await client.sitemaps.delete({ siteUrl, feedpath });
  return `Successfully deleted sitemap: ${feedpath} from ${siteUrl}`;
}

export async function getSitemap(siteUrl: string, feedpath: string) {
  const client = await getSearchConsoleClient();
  const res = await client.sitemaps.get({ siteUrl, feedpath });
  return res.data;
}
