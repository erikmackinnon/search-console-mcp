import { queryAnalytics } from './analytics.js';

/**
 * Insight: A single SEO recommendation or finding
 */
export interface SEOInsight {
    type: 'opportunity' | 'warning' | 'success';
    category: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    data?: Record<string, unknown>;
}

/**
 * Low-hanging fruit: Keywords with high impressions but low position (potential quick wins)
 */
export interface LowHangingFruit {
    query: string;
    impressions: number;
    clicks: number;
    ctr: number;
    position: number;
    potentialClicks: number; // Estimated clicks if moved to position 1-3
}

/**
 * Cannibalization: Multiple pages competing for the same query
 */
export interface CannibalizationIssue {
    query: string;
    pages: Array<{
        page: string;
        clicks: number;
        impressions: number;
        position: number;
    }>;
    totalClicks: number;
    totalImpressions: number;
}

/**
 * Quick Win: Page close to page 1 that needs a push
 */
export interface QuickWin {
    page: string;
    queries: Array<{
        query: string;
        position: number;
        impressions: number;
    }>;
    avgPosition: number;
    totalImpressions: number;
}

/**
 * Find low-hanging fruit keywords: high impressions, low CTR, positions 5-20
 */
export async function findLowHangingFruit(
    siteUrl: string,
    options: { days?: number; minImpressions?: number; limit?: number } = {}
): Promise<LowHangingFruit[]> {
    const { days = 28, minImpressions = 100, limit = 50 } = options;

    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 3); // Account for GSC data delay
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);

    const rows = await queryAnalytics({
        siteUrl,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        dimensions: ['query'],
        limit: 5000
    });

    // Filter for low-hanging fruit: position 5-20, high impressions, low CTR
    const candidates = rows
        .filter(row => {
            const position = row.position ?? 100;
            const impressions = row.impressions ?? 0;
            return position >= 5 && position <= 20 && impressions >= minImpressions;
        })
        .map(row => {
            const position = row.position ?? 10;
            const impressions = row.impressions ?? 0;
            const clicks = row.clicks ?? 0;
            const ctr = row.ctr ?? 0;

            // Estimate potential clicks if moved to top 3
            // Average CTR for position 1-3 is ~15-25%, we use 15% conservatively
            const potentialClicks = Math.round(impressions * 0.15) - clicks;

            return {
                query: row.keys?.[0] ?? '',
                impressions,
                clicks,
                ctr,
                position,
                potentialClicks: Math.max(0, potentialClicks)
            };
        })
        .sort((a, b) => b.potentialClicks - a.potentialClicks)
        .slice(0, limit);

    return candidates;
}

/**
 * Detect keyword cannibalization: multiple pages ranking for the same query
 */
export async function detectCannibalization(
    siteUrl: string,
    options: { days?: number; minImpressions?: number; limit?: number } = {}
): Promise<CannibalizationIssue[]> {
    const { days = 28, minImpressions = 50, limit = 30 } = options;

    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 3);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);

    const rows = await queryAnalytics({
        siteUrl,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        dimensions: ['query', 'page'],
        limit: 10000
    });

    // Group by query
    const queryMap = new Map<string, Array<{
        page: string;
        clicks: number;
        impressions: number;
        position: number;
    }>>();

    for (const row of rows) {
        const query = row.keys?.[0] ?? '';
        const page = row.keys?.[1] ?? '';
        const impressions = row.impressions ?? 0;

        if (impressions < minImpressions) continue;

        if (!queryMap.has(query)) {
            queryMap.set(query, []);
        }

        queryMap.get(query)!.push({
            page,
            clicks: row.clicks ?? 0,
            impressions,
            position: row.position ?? 0
        });
    }

    // Find queries with multiple pages
    const cannibalization: CannibalizationIssue[] = [];

    for (const [query, pages] of queryMap) {
        if (pages.length >= 2) {
            // Sort by position (best first)
            pages.sort((a, b) => a.position - b.position);

            cannibalization.push({
                query,
                pages,
                totalClicks: pages.reduce((sum, p) => sum + p.clicks, 0),
                totalImpressions: pages.reduce((sum, p) => sum + p.impressions, 0)
            });
        }
    }

    // Sort by total impressions (highest impact first)
    return cannibalization
        .sort((a, b) => b.totalImpressions - a.totalImpressions)
        .slice(0, limit);
}

/**
 * Find quick wins: Pages with queries at positions 11-20 (close to page 1)
 */
export async function findQuickWins(
    siteUrl: string,
    options: { days?: number; minImpressions?: number; limit?: number } = {}
): Promise<QuickWin[]> {
    const { days = 28, minImpressions = 100, limit = 20 } = options;

    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 3);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);

    const rows = await queryAnalytics({
        siteUrl,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        dimensions: ['page', 'query'],
        limit: 10000
    });

    // Group by page, filter for positions 11-20
    const pageMap = new Map<string, Array<{
        query: string;
        position: number;
        impressions: number;
    }>>();

    for (const row of rows) {
        const page = row.keys?.[0] ?? '';
        const query = row.keys?.[1] ?? '';
        const position = row.position ?? 0;
        const impressions = row.impressions ?? 0;

        // Only include queries on page 2 (positions 11-20)
        if (position < 11 || position > 20 || impressions < minImpressions) continue;

        if (!pageMap.has(page)) {
            pageMap.set(page, []);
        }

        pageMap.get(page)!.push({ query, position, impressions });
    }

    // Build quick wins list
    const quickWins: QuickWin[] = [];

    for (const [page, queries] of pageMap) {
        if (queries.length === 0) continue;

        const avgPosition = queries.reduce((sum, q) => sum + q.position, 0) / queries.length;
        const totalImpressions = queries.reduce((sum, q) => sum + q.impressions, 0);

        quickWins.push({
            page,
            queries: queries.sort((a, b) => b.impressions - a.impressions).slice(0, 5),
            avgPosition,
            totalImpressions
        });
    }

    return quickWins
        .sort((a, b) => b.totalImpressions - a.totalImpressions)
        .slice(0, limit);
}

/**
 * Generate SEO recommendations based on site performance data
 */
export async function generateRecommendations(
    siteUrl: string,
    options: { days?: number } = {}
): Promise<SEOInsight[]> {
    const { days = 28 } = options;
    const insights: SEOInsight[] = [];

    // Get low-hanging fruit
    const lowHangingFruit = await findLowHangingFruit(siteUrl, { days, limit: 10 });

    if (lowHangingFruit.length > 0) {
        const totalPotential = lowHangingFruit.reduce((sum, l) => sum + l.potentialClicks, 0);
        insights.push({
            type: 'opportunity',
            category: 'Rankings',
            title: `${lowHangingFruit.length} keywords with ranking potential`,
            description: `Found keywords ranking at positions 5-20 with high impressions. Moving these to top 3 could bring ~${totalPotential} additional clicks.`,
            priority: 'high',
            data: { topKeywords: lowHangingFruit.slice(0, 5).map(l => l.query) }
        });
    }

    // Check for cannibalization
    const cannibalization = await detectCannibalization(siteUrl, { days, limit: 10 });

    if (cannibalization.length > 0) {
        insights.push({
            type: 'warning',
            category: 'Content',
            title: `${cannibalization.length} keyword cannibalization issues`,
            description: `Multiple pages are competing for the same keywords, diluting ranking potential. Consider consolidating content.`,
            priority: 'medium',
            data: { topIssues: cannibalization.slice(0, 3).map(c => c.query) }
        });
    }

    // Find quick wins
    const quickWins = await findQuickWins(siteUrl, { days, limit: 10 });

    if (quickWins.length > 0) {
        insights.push({
            type: 'opportunity',
            category: 'Quick Wins',
            title: `${quickWins.length} pages close to page 1`,
            description: `These pages have queries ranking on page 2 (positions 11-20). Small improvements could push them to page 1.`,
            priority: 'high',
            data: { pages: quickWins.slice(0, 3).map(q => q.page) }
        });
    }

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return insights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}
