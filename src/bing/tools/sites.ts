import { getBingClient, BingSite } from '../client.js';

/**
 * List all sites verified in the user's Bing Webmaster Tools.
 *
 * @returns A list of verified site properties.
 */
export async function listSites(): Promise<BingSite[]> {
    const client = await getBingClient();
    return client.getSiteList();
}

/**
 * Add a site to Bing Webmaster Tools.
 *
 * @param siteUrl - The URL of the site to add.
 * @returns A success message.
 */
export async function addSite(siteUrl: string): Promise<string> {
    const client = await getBingClient();
    await client.addSite(siteUrl);
    return `Successfully added site: ${siteUrl}`;
}

/**
 * Remove a site from Bing Webmaster Tools.
 *
 * @param siteUrl - The URL of the site to remove.
 * @returns A success message.
 */
export async function removeSite(siteUrl: string): Promise<string> {
    const client = await getBingClient();
    await client.removeSite(siteUrl);
    return `Successfully removed site: ${siteUrl}`;
}
