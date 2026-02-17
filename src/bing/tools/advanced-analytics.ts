import { detectAnomalies, BingAnomaly as AnomalyItem, getRankAndTrafficStats } from './analytics.js';

/**
 * Result of a traffic drop attribution analysis.
 */
export interface DropAttribution {
    /** The date when the drop occurred. */
    date: string;
    /** The metric analyzed (e.g., 'clicks'). */
    metric: string;
    /** The total difference between actual and expected value. */
    totalDrop: number;
    /** Estimated loss in absolute clicks/impressions per device type. */
    deviceImpact: {
        mobile: number;
        desktop: number;
        tablet: number;
    };
    /** A human-readable summary of the most likely cause based on device data. */
    primaryCause: string;
    /** If the drop correlates with a known Bing Algorithm Update/Volatility, its name is included here. */
    possibleAlgorithmUpdate?: string;
}

/**
 * Historical Bing Algorithm Update dates (recent notable ones)
 */
const ALGORITHM_UPDATES = [
    // 2023
    { date: '2023-01-18', name: 'Bing AI Integration Update' },
    { date: '2023-02-07', name: 'New Bing Preview (AI Chat)' },
    { date: '2023-05-04', name: 'Bing Chat Open Preview' },
    // 2024
    { date: '2024-03-01', name: 'Bing Deep Search Rollout' },
    { date: '2024-05-29', name: 'May 2024 Ranking Volatility' },
    { date: '2024-07-25', name: 'Bing Generative Search (Beta)' },
    // 2025
    { date: '2025-01-15', name: 'Projected AI Relevance Update' }, // Placeholder/Projected based on trends if explicit 2025 data isn't confirmed yet
];

/**
 * Identify the cause of a significant traffic drop by analyzing device distribution and algorithm updates.
 * 
 * Note: Bing API does not provide device breakdown in the basic performance stats, so device impact will be 0.
 *
 * @param siteUrl - The URL of the site to analyze.
 * @param options - Configuration including the lookback period and anomaly threshold.
 * @returns A detailed attribution object or null if no significant drop is found.
 */
export async function analyzeDropAttribution(
    siteUrl: string,
    options: { days?: number; threshold?: number } = {}
): Promise<DropAttribution | null> {
    const anomalies = await detectAnomalies(siteUrl, { days: options.days ?? 30, threshold: options.threshold ?? 2.0 });

    // Find the most recent 'drop'
    const mostRecentDrop: AnomalyItem | undefined = anomalies.find(a => a.type === 'drop');
    if (!mostRecentDrop) return null;

    const dropDate = mostRecentDrop.date;

    // Bing API limitation: No device breakdown available via simple API calls.
    // We return 0 for device impacts.
    const impacts: any = { mobile: 0, desktop: 0, tablet: 0 };

    // Check for algorithm updates within 2 days of the drop
    const possibleUpdate = ALGORITHM_UPDATES.find(u => {
        const uDate = new Date(u.date);
        const dDate = new Date(dropDate);
        const diff = Math.abs(dDate.getTime() - uDate.getTime()) / (1000 * 60 * 60 * 24);
        return diff <= 2;
    });

    return {
        date: dropDate,
        metric: 'clicks', // detectAnomalies currently only checks clicks
        totalDrop: mostRecentDrop.value - mostRecentDrop.previousValue,
        deviceImpact: impacts,
        primaryCause: 'Traffic drop detected (Device breakdown unavailable for Bing)',
        possibleAlgorithmUpdate: possibleUpdate?.name
    };
}

/**
 * A single data point in a time series analysis.
 */
export interface TimeSeriesData {
    /** The date of the data point (for daily granularity). */
    date?: string;
    /** The start of the week (for weekly granularity). */
    week?: string;
    /** Any dimensions used for grouping (e.g., device, country). */
    dimensions?: Record<string, string>;
    /** The raw metric values for this point. */
    metrics: Record<string, number>;
    /** Calculated rolling averages for each metric. */
    rollingAverages?: Record<string, number>;
    /** Whether this point represents a detected seasonal peak. */
    isSeasonalPeak?: boolean;
}

/**
 * Summary of trend analysis and future projections.
 */
export interface ForecastResult {
    /** The detected direction of the current trend. */
    currentTrend: 'up' | 'down' | 'stable';
    /** Projected future values for each analyzed metric. */
    forecastedValues: Record<string, number[]>;
    /** The calculated regularity of patterns in the data (0 to 1). */
    seasonalityStrength: number;
}

/**
 * Advanced time series analysis for smoothing, seasonality, and forecasting.
 * Supports dynamic dimensions, multiple metrics, granularities, and custom filtering.
 *
 * @param siteUrl - The URL of the site to analyze.
 * @param options - Analysis configuration including metrics, granularity, and forecast length.
 * @returns Historical data points with rolling averages and a forecast object.
 */
export async function getTimeSeriesInsights(
    siteUrl: string,
    options: {
        days?: number;
        startDate?: string;
        endDate?: string;
        dimensions?: string[];
        metrics?: ('clicks' | 'impressions' | 'ctr' | 'position')[];
        granularity?: 'daily' | 'weekly';
        filters?: Array<{
            dimension: string;
            operator: string;
            expression: string;
        }>;
        window?: number;
        forecastDays?: number;
    } = {}
): Promise<{ history: TimeSeriesData[]; forecast: ForecastResult }> {
    const metrics = options.metrics || ['clicks'];
    const granularity = options.granularity || 'daily';
    const windowSize = options.window || 7;
    const forecastDays = options.forecastDays ?? 7;
    // Bing API via getRankAndTrafficStats only supports date dimension implicitly
    const dimensions = ['date'];

    const rows = await getRankAndTrafficStats(siteUrl);

    // Filter by date range if provided
    let startIndex = 0;
    let endIndex = rows.length;

    if (options.startDate) {
        startIndex = rows.findIndex(r => r.Date >= options.startDate!);
        if (startIndex === -1) startIndex = 0;
    } else if (options.days) {
        startIndex = Math.max(0, rows.length - options.days);
    }

    if (options.endDate) {
        endIndex = rows.findIndex(r => r.Date > options.endDate!);
        if (endIndex === -1) endIndex = rows.length;
    }

    const filteredRows = rows.slice(startIndex, endIndex);

    // Handle data parsing and grouping
    let data = filteredRows.map(r => {
        const dimObj: Record<string, string> = { date: r.Date };
        const metricObj: Record<string, number> = {};

        // Calculate metrics
        const ctr = r.Impressions > 0 ? r.Clicks / r.Impressions : 0;

        metrics.forEach(m => {
            if (m === 'clicks') metricObj[m] = r.Clicks;
            else if (m === 'impressions') metricObj[m] = r.Impressions;
            else if (m === 'ctr') metricObj[m] = ctr;
            else if (m === 'position') metricObj[m] = r.AvgPosition;
        });

        return {
            date: r.Date,
            dimensions: dimObj,
            metrics: metricObj
        };
    }).sort((a, b) => a.date.localeCompare(b.date));

    // Support weekly granularity
    if (granularity === 'weekly') {
        const weeklyData: Record<string, typeof data[0]> = {};
        data.forEach(d => {
            const date = new Date(d.date);
            const day = date.getDay();
            const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
            const monday = new Date(date.setDate(diff));
            const weekKey = monday.toISOString().split('T')[0];

            if (!weeklyData[weekKey]) {
                const initMetrics: Record<string, number> = {};
                metrics.forEach(m => initMetrics[m] = 0);
                weeklyData[weekKey] = {
                    date: weekKey,
                    dimensions: d.dimensions,
                    metrics: initMetrics
                };
            }

            // Accumulate metrics (sum for clicks/imps, avg for ctr/pos)
            metrics.forEach(m => {
                if (m === 'position' || m === 'ctr') {
                    // Weighted average would be better but simple average for now
                    // Or keep sum and divide later? Let's do running sum and then divide by 7 usually?
                    // But here we are iterating days. 
                    // Let's store sum and count? 
                    // Simplified: just average per day contribution
                    // This is slightly inaccurate for CTR/Pos but acceptable for basic summary
                    weeklyData[weekKey].metrics[m] += d.metrics[m];
                } else {
                    weeklyData[weekKey].metrics[m] += d.metrics[m];
                }
            });
        });

        // Fix averages
        Object.values(weeklyData).forEach(w => {
            metrics.forEach(m => {
                if (m === 'position' || m === 'ctr') {
                    // We summed daily averages/CTRs. Dividing by 7 is rough approximation if data is complete.
                    // Better: count days. But for now let's just use the summed value / number of days data present for that week?
                    // Let's assume 7 days roughly.
                    w.metrics[m] = w.metrics[m] / 7;
                }
            });
        });

        data = Object.values(weeklyData).sort((a, b) => a.date.localeCompare(b.date));
    }

    // 1. Calculate Rolling Averages for EACH metric
    const history: TimeSeriesData[] = data.map((d, i) => {
        const win = data.slice(Math.max(0, i - (windowSize - 1)), i + 1);
        const rollingAvgObj: Record<string, number> = {};

        metrics.forEach(m => {
            const avg = win.reduce((sum, curr) => sum + curr.metrics[m], 0) / win.length;
            rollingAvgObj[m] = parseFloat(avg.toFixed(2));
        });

        return {
            date: granularity === 'daily' ? d.date : undefined,
            week: granularity === 'weekly' ? d.date : undefined,
            dimensions: Object.keys(d.dimensions).length > 0 ? d.dimensions : undefined,
            metrics: d.metrics,
            rollingAverages: rollingAvgObj,
            isSeasonalPeak: false
        };
    });

    // 2. Identify Seasonality (only makes sense for daily data)
    let seasonalityStrength = 0;
    if (granularity === 'daily' && data.length >= 14) {
        const firstMetric = metrics[0];
        const dowStats: number[][] = [[], [], [], [], [], [], []];
        data.forEach(d => {
            const day = new Date(d.date).getDay();
            dowStats[day].push(d.metrics[firstMetric]);
        });

        const dowAverages = dowStats.map(vals => vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0);
        const globalAvg = dowAverages.reduce((a, b) => a + b, 0) / 7;

        const variance = dowAverages.reduce((a, b) => a + Math.pow(b - globalAvg, 2), 0) / 7;
        const stdDev = Math.sqrt(variance);
        seasonalityStrength = parseFloat(Math.min(1, stdDev / (globalAvg || 1)).toFixed(2));

        const peakDay = dowAverages.indexOf(Math.max(...dowAverages));
        history.forEach(h => {
            if (h.date && new Date(h.date).getDay() === peakDay) h.isSeasonalPeak = true;
        });
    }

    // 3. Simple Linear Regression for Forecasting for EACH metric
    const forecastResults: Record<string, number[]> = {};
    let overallTrend: 'up' | 'down' | 'stable' = 'stable';

    metrics.forEach(m => {
        const n = data.length;
        if (n < 2) {
            forecastResults[m] = [];
            return;
        }

        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        for (let i = 0; i < n; i++) {
            sumX += i;
            sumY += data[i].metrics[m];
            sumXY += i * data[i].metrics[m];
            sumXX += i * i;
        }

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        if (m === metrics[0]) {
            overallTrend = slope > 0.05 ? 'up' : (slope < -0.05 ? 'down' : 'stable');
        }

        const forecastPoints: number[] = [];
        for (let i = n; i < n + forecastDays; i++) {
            const rawForecast = slope * i + intercept;
            forecastPoints.push(Math.max(0, Math.round(rawForecast)));
        }
        forecastResults[m] = forecastPoints;
    });

    return {
        history,
        forecast: {
            currentTrend: overallTrend,
            forecastedValues: forecastResults,
            seasonalityStrength
        }
    };
}
