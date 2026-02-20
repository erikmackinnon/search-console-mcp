import { getBingClient } from '../client.js';

/**
 * List sitemaps for a Bing site.
 * 
 * @param siteUrl - The URL of the site.
 * @returns A list of sitemaps.
 */
export async function listSitemaps(siteUrl: string): Promise<any[]> {
    const client = await getBingClient();
    return client.getSitemaps(siteUrl);
}

/**
 * Submit a sitemap to Bing Webmaster Tools.
 * 
 * @param siteUrl - The URL of the site.
 * @param sitemapUrl - The URL of the sitemap file.
 */
export async function submitSitemap(siteUrl: string, sitemapUrl: string): Promise<string> {
    const client = await getBingClient();
    await client.submitSitemap(siteUrl, sitemapUrl);
    return `Successfully submitted sitemap: ${sitemapUrl} for site ${siteUrl}`;
}
