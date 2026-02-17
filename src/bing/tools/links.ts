import { getBingClient, BingLinkCount } from '../client.js';

/**
 * Get link counts for a site.
 */
export async function getLinkCounts(siteUrl: string): Promise<BingLinkCount[]> {
    const client = await getBingClient();
    return client.getLinkCounts(siteUrl);
}
