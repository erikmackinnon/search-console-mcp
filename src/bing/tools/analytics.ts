import { getBingClient, BingQueryStats, BingPageStats, BingQueryPageStats, BingRankAndTrafficStats } from '../client.js';

/**
 * Get query performance stats for a Bing site.
 */
export async function getQueryStats(siteUrl: string): Promise<BingQueryStats[]> {
    const client = await getBingClient();
    return client.getQueryStats(siteUrl);
}

/**
 * Get page performance stats (top pages) for a Bing site.
 */
export async function getPageStats(siteUrl: string): Promise<BingPageStats[]> {
    const client = await getBingClient();
    return client.getPageStats(siteUrl);
}

/**
 * Get query stats for a specific page on a Bing site.
 */
export async function getPageQueryStats(siteUrl: string, pageUrl: string): Promise<BingQueryStats[]> {
    const client = await getBingClient();
    return client.getPageQueryStats(siteUrl, pageUrl);
}

/**
 * Get combined query and page performance stats.
 */
export async function getQueryPageStats(siteUrl: string): Promise<BingQueryPageStats[]> {
    const client = await getBingClient();
    return client.getQueryPageStats(siteUrl);
}

/**
 * Get historical rank and traffic statistics for a site.
 */
export async function getRankAndTrafficStats(siteUrl: string): Promise<BingRankAndTrafficStats[]> {
    const client = await getBingClient();
    return client.getRankAndTrafficStats(siteUrl);
}

/**
 * Aggregate performance metrics for a specific site and period.
 */
export interface PerformanceSummary {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
    startDate: string;
    endDate: string;
}

/**
 * Result of comparing performance between two date ranges.
 */
export interface PeriodComparison {
    period1: PerformanceSummary;
    period2: PerformanceSummary;
    changes: {
        clicks: number;
        clicksPercent: number;
        impressions: number;
        impressionsPercent: number;
        ctr: number;
        ctrPercent: number;
        position: number;
        positionPercent: number;
    };
}

/**
 * Compare performance between two date ranges.
 */
export async function comparePeriods(
    siteUrl: string,
    startDate1: string,
    endDate1: string,
    startDate2: string,
    endDate2: string
): Promise<PeriodComparison> {
    const stats = await getRankAndTrafficStats(siteUrl);

    const getSummary = (start: string, end: string): PerformanceSummary => {
        const s = new Date(start);
        const e = new Date(end);
        const filtered = stats.filter((row: BingRankAndTrafficStats) => {
            const d = new Date(row.Date);
            return d >= s && d <= e;
        });

        const clicks = filtered.reduce((acc: number, row: BingRankAndTrafficStats) => acc + row.Clicks, 0);
        const impressions = filtered.reduce((acc: number, row: BingRankAndTrafficStats) => acc + row.Impressions, 0);
        const avgPos = filtered.length > 0
            ? filtered.reduce((acc: number, row: BingRankAndTrafficStats) => acc + row.AvgPosition, 0) / filtered.length
            : 0;

        return {
            clicks,
            impressions,
            ctr: impressions > 0 ? clicks / impressions : 0,
            position: avgPos,
            startDate: start,
            endDate: end
        };
    };

    const p1 = getSummary(startDate1, endDate1);
    const p2 = getSummary(startDate2, endDate2);

    const calcChange = (current: number, previous: number) => ({
        diff: current - previous,
        percent: previous > 0 ? ((current - previous) / previous) * 100 : (current > 0 ? 100 : 0)
    });

    const clickChange = calcChange(p1.clicks, p2.clicks);
    const impChange = calcChange(p1.impressions, p2.impressions);
    const ctrChange = calcChange(p1.ctr, p2.ctr);
    const posChange = {
        diff: p1.position - p2.position,
        percent: p2.position > 0 ? ((p1.position - p2.position) / p2.position) * 100 : 0
    };

    return {
        period1: p1,
        period2: p2,
        changes: {
            clicks: clickChange.diff,
            clicksPercent: clickChange.percent,
            impressions: impChange.diff,
            impressionsPercent: impChange.percent,
            ctr: ctrChange.diff,
            ctrPercent: ctrChange.percent,
            position: posChange.diff,
            positionPercent: posChange.percent
        }
    };
}

export interface BingAnomaly {
    date: string;
    type: 'drop' | 'spike';
    metric: 'clicks';
    value: number;
    previousValue: number;
    changePercent: number;
}

/**
 * Detect performance anomalies (sharp drops or spikes).
 */
export async function detectAnomalies(
    siteUrl: string,
    options: { days?: number; threshold?: number } = {}
): Promise<BingAnomaly[]> {
    const days = options.days || 14;
    const threshold = options.threshold || 2.5;
    const stats = await getRankAndTrafficStats(siteUrl);

    // Sort by date ascending
    const sorted = [...stats].sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime());
    if (sorted.length < 5) return [];

    const anomalies: BingAnomaly[] = [];
    const recent = sorted.slice(-days);

    for (let i = 1; i < recent.length; i++) {
        const prev = recent[i - 1];
        const curr = recent[i];

        if (prev.Clicks > 10) {
            const drop = (curr.Clicks - prev.Clicks) / prev.Clicks;
            if (drop <= -threshold / 10 || drop >= threshold / 10) {
                anomalies.push({
                    date: curr.Date,
                    type: drop < 0 ? 'drop' : 'spike',
                    metric: 'clicks',
                    value: curr.Clicks,
                    previousValue: prev.Clicks,
                    changePercent: drop * 100
                });
            }
        }
    }

    return anomalies;
}
