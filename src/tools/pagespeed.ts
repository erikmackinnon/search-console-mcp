import { google, pagespeedonline_v5 } from 'googleapis';

const pagespeed = google.pagespeedonline('v5');

export interface PageSpeedResult {
    url: string;
    strategy: 'mobile' | 'desktop';
    performanceScore: number;
    accessibilityScore: number;
    bestPracticesScore: number;
    seoScore: number;
    coreWebVitals: {
        largestContentfulPaint: number | null;
        firstInputDelay: number | null;
        cumulativeLayoutShift: number | null;
        firstContentfulPaint: number | null;
        timeToInteractive: number | null;
        totalBlockingTime: number | null;
    };
    loadingExperience: {
        overallCategory: string | null;
        metrics: Record<string, {
            percentile: number;
            category: string;
        }>;
    } | null;
}

/**
 * Run PageSpeed Insights analysis on a URL
 */
export async function analyzePageSpeed(
    url: string,
    strategy: 'mobile' | 'desktop' = 'mobile'
): Promise<PageSpeedResult> {
    const res = await pagespeed.pagespeedapi.runpagespeed({
        url,
        strategy,
        category: ['performance', 'accessibility', 'best-practices', 'seo']
    });

    const data = res.data;
    const lighthouse = data.lighthouseResult;
    const categories = lighthouse?.categories;
    const audits = lighthouse?.audits;

    // Extract Core Web Vitals from audits
    const coreWebVitals = {
        largestContentfulPaint: audits?.['largest-contentful-paint']?.numericValue ?? null,
        firstInputDelay: audits?.['max-potential-fid']?.numericValue ?? null,
        cumulativeLayoutShift: audits?.['cumulative-layout-shift']?.numericValue ?? null,
        firstContentfulPaint: audits?.['first-contentful-paint']?.numericValue ?? null,
        timeToInteractive: audits?.['interactive']?.numericValue ?? null,
        totalBlockingTime: audits?.['total-blocking-time']?.numericValue ?? null,
    };

    // Extract Loading Experience (real-world CrUX data)
    const loadingExp = data.loadingExperience;
    const loadingExperience = loadingExp ? {
        overallCategory: loadingExp.overall_category ?? null,
        metrics: Object.fromEntries(
            Object.entries(loadingExp.metrics || {}).map(([key, value]) => [
                key,
                {
                    percentile: (value as pagespeedonline_v5.Schema$UserPageLoadMetricV5).percentile ?? 0,
                    category: (value as pagespeedonline_v5.Schema$UserPageLoadMetricV5).category ?? 'NONE'
                }
            ])
        )
    } : null;

    return {
        url,
        strategy,
        performanceScore: (categories?.performance?.score ?? 0) * 100,
        accessibilityScore: (categories?.accessibility?.score ?? 0) * 100,
        bestPracticesScore: (categories?.['best-practices']?.score ?? 0) * 100,
        seoScore: (categories?.seo?.score ?? 0) * 100,
        coreWebVitals,
        loadingExperience
    };
}

/**
 * Get Core Web Vitals summary for mobile and desktop
 */
export async function getCoreWebVitals(url: string): Promise<{
    mobile: PageSpeedResult;
    desktop: PageSpeedResult;
}> {
    const [mobile, desktop] = await Promise.all([
        analyzePageSpeed(url, 'mobile'),
        analyzePageSpeed(url, 'desktop')
    ]);

    return { mobile, desktop };
}
