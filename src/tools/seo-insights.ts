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
/**
 * Enhaced Cannibalization Issue
 */
export interface CannibalizationIssue {
    query: string;
    pages: Array<{
        page: string;
        clicks: number;
        impressions: number;
        position: number;
        ctr: number;
    }>;
    totalClicks: number;
    totalImpressions: number;
    clickShareConflict: number; // 0 to 1 score of how split the traffic is
}

/**
 * Quick Win: Page close to page 1 that needs a push
 */
export interface QuickWin {
    page: string;
    query: string;
    position: number;
    impressions: number;
    potentialClicks: number;
}

/**
 * Low CTR Opportunity: High ranking, high impressions, low CTR
 */
export interface LowCTROpportunity {
    query: string;
    page: string;
    position: number;
    impressions: number;
    clicks: number;
    ctr: number;
    benchmarkCtr: number; // Expected CTR for this position
}

/**
 * Striking Distance: Keywords ranking 8-15
 */
export interface StrikingDistanceQuery {
    query: string;
    page: string;
    position: number;
    impressions: number;
    clicks: number;
}

/**
 * Lost Query: Lost all traffic compared to previous period
 */
export interface LostQuery {
    query: string;
    page: string;
    previousClicks: number;
    previousImpressions: number;
    previousPosition: number;
    currentClicks: number;
    currentImpressions: number;
    currentPosition: number;
    lostClicks: number;
}

/**
 * Brand vs Non-Brand Analysis
 */
export interface BrandVsNonBrandMetrics {
    segment: 'Brand' | 'Non-Brand';
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
    queryCount: number;
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
 * Enhanced to find true conflicts where traffic is split.
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
        limit: 10000,
        filters: [{
            dimension: 'position',
            operator: 'smallerThan',
            expression: '20' // Only care about cannibalization on first 2 pages
        }]
    });

    // Group by query
    const queryMap = new Map<string, Array<{
        page: string;
        clicks: number;
        impressions: number;
        position: number;
        ctr: number;
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
            position: row.position ?? 0,
            ctr: row.ctr ?? 0
        });
    }

    // Find queries with multiple pages
    const cannibalization: CannibalizationIssue[] = [];

    for (const [query, pages] of queryMap) {
        if (pages.length >= 2) {
            // Sort by clicks (highest first)
            pages.sort((a, b) => b.clicks - a.clicks);

            const totalClicks = pages.reduce((sum, p) => sum + p.clicks, 0);

            // Calculate conflict score (0 = one page dominates, 1 = perfectly even split)
            // Simplified Herfindahl-Hirschman Index approach
            const shares = pages.map(p => totalClicks > 0 ? p.clicks / totalClicks : 0);
            const hhi = shares.reduce((sum, s) => sum + s * s, 0);
            const conflictScore = 1 - hhi;

            // Only report if there is actual conflict (not just 1 click vs 1000)
            if (conflictScore > 0.1 || pages[1].impressions > (pages[0].impressions * 0.2)) {
                cannibalization.push({
                    query,
                    pages,
                    totalClicks,
                    totalImpressions: pages.reduce((sum, p) => sum + p.impressions, 0),
                    clickShareConflict: parseFloat(conflictScore.toFixed(2))
                });
            }
        }
    }

    // Sort by conflict severity (impact)
    return cannibalization
        .sort((a, b) => (b.totalClicks * b.clickShareConflict) - (a.totalClicks * a.clickShareConflict))
        .slice(0, limit);
}

/**
 * Find high impression, low CTR opportunities
 * "Why am I ranking well but not getting clicks?"
 */
export async function findLowCTROpportunities(
    siteUrl: string,
    options: { days?: number; minImpressions?: number; limit?: number } = {}
): Promise<LowCTROpportunity[]> {
    const { days = 28, minImpressions = 500, limit = 50 } = options;

    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 3);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);

    const rows = await queryAnalytics({
        siteUrl,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        dimensions: ['query', 'page'],
        limit: 5000
    });

    // Approximate benchmarks for CTR by position (Web)
    const benchmarks: Record<number, number> = {
        1: 0.30, 2: 0.15, 3: 0.10, 4: 0.06, 5: 0.04,
        6: 0.03, 7: 0.02, 8: 0.015, 9: 0.01, 10: 0.01
    };

    return rows
        .filter(r => (r.impressions ?? 0) > minImpressions && (r.position ?? 100) <= 10)
        .map(r => {
            const pos = Math.round(r.position ?? 10);
            const benchmark = benchmarks[pos] || 0.01;
            const actualCtr = r.ctr ?? 0;

            return {
                query: r.keys?.[0] ?? '',
                page: r.keys?.[1] ?? '',
                position: r.position ?? 0,
                impressions: r.impressions ?? 0,
                clicks: r.clicks ?? 0,
                ctr: actualCtr,
                benchmarkCtr: benchmark
            };
        })
        .filter(item => item.ctr < (item.benchmarkCtr * 0.6)) // Only return if < 60% of benchmark
        .sort((a, b) => b.impressions - a.impressions)
        .slice(0, limit);
}

/**
 * Find "Striking Distance" keywords (Ranking 8-15)
 * These are easiest to push to Page 1 / Top 5.
 */
export async function findStrikingDistance(
    siteUrl: string,
    options: { days?: number; limit?: number } = {}
): Promise<StrikingDistanceQuery[]> {
    const { days = 28, limit = 50 } = options;

    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 3);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);

    const rows = await queryAnalytics({
        siteUrl,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        dimensions: ['query', 'page'],
        limit: 5000
    });

    return rows
        .filter(r => {
            const pos = r.position ?? 0;
            return pos >= 8 && pos <= 15;
        })
        .map(r => ({
            query: r.keys?.[0] ?? '',
            page: r.keys?.[1] ?? '',
            position: r.position ?? 0,
            impressions: r.impressions ?? 0,
            clicks: r.clicks ?? 0
        }))
        .sort((a, b) => b.impressions - a.impressions)
        .slice(0, limit);
}

/**
 * Find Lost Queries
 * Queries that had traffic in previous period but zero traffic now.
 */
export async function findLostQueries(
    siteUrl: string,
    options: { days?: number; limit?: number } = {}
): Promise<LostQuery[]> {
    const { days = 28, limit = 50 } = options;

    // Calculate two periods
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 3);
    const midDate = new Date(endDate);
    midDate.setDate(midDate.getDate() - days);
    const startDate = new Date(midDate);
    startDate.setDate(startDate.getDate() - days);

    const [current, previous] = await Promise.all([
        queryAnalytics({
            siteUrl,
            startDate: midDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            dimensions: ['query', 'page'],
            limit: 5000
        }),
        queryAnalytics({
            siteUrl,
            startDate: startDate.toISOString().split('T')[0],
            endDate: midDate.toISOString().split('T')[0],
            dimensions: ['query', 'page'],
            limit: 5000
        })
    ]);

    // Map current period for quick lookup
    const currentMap = new Set(current.map(r => `${r.keys?.[0]}|${r.keys?.[1]}`));

    // Find queries present in previous but NOT in current (or very low traffic)
    // Actually "lost" means clicks went to near zero
    const currentClicksMap = new Map(current.map(r => [`${r.keys?.[0]}|${r.keys?.[1]}`, r.clicks ?? 0]));

    const lostQueries: LostQuery[] = [];

    for (const prev of previous) {
        const key = `${prev.keys?.[0]}|${prev.keys?.[1]}`;
        const prevClicks = prev.clicks ?? 0;

        if (prevClicks < 5) continue; // Ignore low volume noise

        const currClicks = currentClicksMap.get(key) ?? 0;

        // Definition of lost: >80% drop or zero
        if (currClicks === 0 || (currClicks / prevClicks) < 0.2) {
            lostQueries.push({
                query: prev.keys?.[0] ?? '',
                page: prev.keys?.[1] ?? '',
                previousClicks: prevClicks,
                previousImpressions: prev.impressions ?? 0,
                previousPosition: prev.position ?? 0,
                currentClicks: currClicks,
                currentImpressions: 0, // We don't have this easily if it's missing from current, assume 0 or low
                currentPosition: 0,
                lostClicks: prevClicks - currClicks
            });
        }
    }

    return lostQueries
        .sort((a, b) => b.lostClicks - a.lostClicks)
        .slice(0, limit);
}

/**
 * Brand vs Non-Brand Analysis
 * Segments performance by regex match.
 */
export async function analyzeBrandVsNonBrand(
    siteUrl: string,
    brandRegexString: string,
    options: { days?: number } = {}
): Promise<BrandVsNonBrandMetrics[]> {
    const { days = 28 } = options;

    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 3);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);

    const rows = await queryAnalytics({
        siteUrl,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        dimensions: ['query'],
        limit: 10000
    });

    const brandRegex = new RegExp(brandRegexString, 'i');

    const brandStats = { clicks: 0, impressions: 0, ctr: 0, position: 0, queryCount: 0, weightedPos: 0 };
    const nonBrandStats = { clicks: 0, impressions: 0, ctr: 0, position: 0, queryCount: 0, weightedPos: 0 };

    for (const row of rows) {
        const query = row.keys?.[0] ?? '';
        const isBrand = brandRegex.test(query);
        const stats = isBrand ? brandStats : nonBrandStats;

        stats.clicks += row.clicks ?? 0;
        stats.impressions += row.impressions ?? 0;
        stats.weightedPos += (row.position ?? 0) * (row.impressions ?? 0);
        stats.queryCount++;
    }

    const calc = (stats: typeof brandStats, segment: 'Brand' | 'Non-Brand'): BrandVsNonBrandMetrics => ({
        segment,
        clicks: stats.clicks,
        impressions: stats.impressions,
        ctr: stats.impressions > 0 ? (stats.clicks / stats.impressions) : 0,
        position: stats.impressions > 0 ? (stats.weightedPos / stats.impressions) : 0,
        queryCount: stats.queryCount
    });

    return [
        calc(brandStats, 'Brand'),
        calc(nonBrandStats, 'Non-Brand')
    ];
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

    // Simplified logic: Just find page+query pairs in positions 11-20
    const quickWins: QuickWin[] = rows
        .map(r => {
            const impressions = r.impressions ?? 0;
            const clicks = r.clicks ?? 0;

            // Estimate potential clicks if moved to top 3 (conservative 15% CTR)
            const potentialClicks = Math.round(impressions * 0.15) - clicks;

            return {
                page: r.keys?.[0] ?? '',
                query: r.keys?.[1] ?? '',
                position: r.position ?? 0,
                impressions,
                potentialClicks: Math.max(0, potentialClicks)
            };
        })
        .filter(q => q.position >= 11 && q.position <= 20 && q.impressions >= minImpressions)
        .sort((a, b) => b.potentialClicks - a.potentialClicks)
        .slice(0, limit);

    return quickWins;
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
            data: { pages: Array.from(new Set(quickWins.slice(0, 5).map(q => q.page))) }
        });
    }

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return insights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}
