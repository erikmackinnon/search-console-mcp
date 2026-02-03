import { getSearchConsoleClient } from '../google-client.js';
import { searchconsole_v1 } from 'googleapis';

export async function listSites(): Promise<searchconsole_v1.Schema$WmxSite[]> {
  const client = await getSearchConsoleClient();
  const res = await client.sites.list();
  return res.data.siteEntry || [];
}

export async function addSite(siteUrl: string): Promise<string> {
  const client = await getSearchConsoleClient();
  await client.sites.add({ siteUrl });
  return `Successfully added site: ${siteUrl}`;
}

export async function deleteSite(siteUrl: string): Promise<string> {
  const client = await getSearchConsoleClient();
  await client.sites.delete({ siteUrl });
  return `Successfully deleted site: ${siteUrl}`;
}

export async function getSite(siteUrl: string): Promise<searchconsole_v1.Schema$WmxSite> {
  const client = await getSearchConsoleClient();
  const res = await client.sites.get({ siteUrl });
  return res.data;
}
