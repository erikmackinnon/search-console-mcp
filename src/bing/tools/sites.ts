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
