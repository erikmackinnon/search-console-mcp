import { getSearchConsoleClient } from '../google-client.js';

export async function listSites() {
  const client = await getSearchConsoleClient();
  const res = await client.sites.list();
  return res.data.siteEntry || [];
}

export async function addSite(siteUrl: string) {
  const client = await getSearchConsoleClient();
  await client.sites.add({ siteUrl });
  return `Successfully added site: ${siteUrl}`;
}

export async function deleteSite(siteUrl: string) {
  const client = await getSearchConsoleClient();
  await client.sites.delete({ siteUrl });
  return `Successfully deleted site: ${siteUrl}`;
}

export async function getSite(siteUrl: string) {
  const client = await getSearchConsoleClient();
  const res = await client.sites.get({ siteUrl });
  return res.data;
}
