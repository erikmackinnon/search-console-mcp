
/**
 * SEO Primitives: Atomic functions for building higher-level SEO agents.
 */

export interface RankingBucketResult {
    position: number;
    bucket: 'Top 3' | 'Page 1 (4-10)' | 'Page 2 (11-20)' | 'Page 3+' | 'Unranked';
}

export interface TrafficDeltaResult {
    current: number;
    previous: number;
    absoluteChange: number;
    percentChange: number;
    status: 'increased' | 'decreased' | 'unchanged' | 'new' | 'lost';
}

export interface BrandQueryResult {
    query: string;
    isBrand: boolean;
    matchedPattern?: string;
}

export interface CannibalizationCheckResult {
    query: string;
    pageA: string;
    pageB: string;
    isCannibalized: boolean;
    overlapScore: number; // 0 to 1
    recommendation: string;
}

/**
 * Categorize a ranking position into a bucket.
 */
export function getRankingBucket(position: number): RankingBucketResult {
    let bucket: RankingBucketResult['bucket'];

    if (position <= 0) bucket = 'Unranked';
    else if (position <= 3) bucket = 'Top 3';
    else if (position <= 10) bucket = 'Page 1 (4-10)';
    else if (position <= 20) bucket = 'Page 2 (11-20)';
    else bucket = 'Page 3+';

    return { position, bucket };
}

/**
 * Calculate the delta between two traffic metrics.
 */
export function calculateTrafficDelta(current: number, previous: number): TrafficDeltaResult {
    const absoluteChange = current - previous;
    let percentChange = 0;
    let status: TrafficDeltaResult['status'];

    if (previous === 0) {
        if (current > 0) {
            percentChange = 100;
            status = 'new';
        } else {
            percentChange = 0;
            status = 'unchanged';
        }
    } else {
        percentChange = Math.round(((current - previous) / previous) * 100);
        if (current === 0) status = 'lost';
        else if (current > previous) status = 'increased';
        else if (current < previous) status = 'decreased';
        else status = 'unchanged';
    }

    return { current, previous, absoluteChange, percentChange, status };
}

/**
 * Check if a query is a brand query based on a regex pattern.
 */
export function isBrandQuery(query: string, brandRegexString: string): BrandQueryResult {
    try {
        const regex = new RegExp(brandRegexString, 'i');
        const isBrand = regex.test(query);
        return {
            query,
            isBrand,
            matchedPattern: isBrand ? brandRegexString : undefined
        };
    } catch (e) {
        // Invalid regex fallback
        return { query, isBrand: false };
    }
}

/**
 * Check if two pages are cannibalizing each other for a query.
 * Uses a simplified overlap check based on position and impression proximity.
 */
export function isCannibalized(
    query: string,
    pageA: { position: number; impressions: number; clicks: number },
    pageB: { position: number; impressions: number; clicks: number }
): CannibalizationCheckResult {
    // 1. Position proximity: Are ranks close? (e.g. Pos 5 vs Pos 6 is high conflict, Pos 1 vs Pos 50 is low)
    const posDiff = Math.abs(pageA.position - pageB.position);

    // 2. Impression share: do they both get seen?
    const totalImpressions = pageA.impressions + pageB.impressions;
    const shareA = totalImpressions > 0 ? pageA.impressions / totalImpressions : 0;
    const shareB = totalImpressions > 0 ? pageB.impressions / totalImpressions : 0;

    // Overlap score calculation (0 to 1)
    // High overlap if positions are close AND impression shares are balanced
    // 1 / (1 + posDiff) -> Pos diff 0 = 1.0, Diff 9 = 0.1
    const positionScore = 1 / (1 + (posDiff * 0.5));

    // Balance score: 1 - abs(shareA - shareB). If 50/50 -> 1.0. If 100/0 -> 0.0.
    const balanceScore = totalImpressions > 0 ? (1 - Math.abs(shareA - shareB)) : 0;

    const overlapScore = parseFloat((positionScore * balanceScore).toFixed(2));
    const isCannibalized = overlapScore > 0.3; // Threshold

    let recommendation = "No action needed.";
    if (isCannibalized) {
        if (pageA.clicks > pageB.clicks * 2) recommendation = "Consolidate to Page A (stronger performer).";
        else if (pageB.clicks > pageA.clicks * 2) recommendation = "Consolidate to Page B (stronger performer).";
        else recommendation = "Review content intent. Pages are competing closely.";
    }

    return {
        query,
        pageA: "Page A", // Placeholder, logic only cares about metrics
        pageB: "Page B",
        isCannibalized,
        overlapScore,
        recommendation
    };
}
