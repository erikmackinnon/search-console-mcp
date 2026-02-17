#!/usr/bin/env node
import 'dotenv/config';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as sites from "./google/tools/sites.js";
import * as sitemaps from "./google/tools/sitemaps.js";
import * as analytics from "./google/tools/analytics.js";
import * as inspection from "./google/tools/inspection.js";
import * as pagespeed from "./google/tools/pagespeed.js";
import * as seoInsights from "./google/tools/seo-insights.js";
import * as seoPrimitives from "./common/tools/seo-primitives.js";
import * as schemaValidator from "./common/tools/schema-validator.js";
import * as advancedAnalytics from "./google/tools/advanced-analytics.js";
import * as sitesHealth from "./google/tools/sites-health.js";
import * as bingSites from "./bing/tools/sites.js";
import * as bingSitemaps from "./bing/tools/sitemaps.js";
import * as bingAnalytics from "./bing/tools/analytics.js";
import * as bingKeywords from "./bing/tools/keywords.js";
import * as bingCrawl from "./bing/tools/crawl.js";
import * as bingUrlSubmission from "./bing/tools/url-submission.js";
import * as bingInspection from "./bing/tools/inspection.js";
import * as bingLinks from "./bing/tools/links.js";
import * as bingHealth from "./bing/tools/sites-health.js";
import * as bingSeoInsights from "./bing/tools/seo-insights.js";
import * as indexNow from "./bing/tools/index-now.js";
import * as bingAdvancedAnalytics from "./bing/tools/advanced-analytics.js";
import {
  bingApiDocs,
  indexNowDocs,
  dimensionsDocs as bingDimensionsDocs,
  filtersDocs as bingFiltersDocs,
  searchTypesDocs as bingSearchTypesDocs,
  patternsDocs as bingPatternsDocs,
  algorithmUpdatesDocs as bingAlgorithmUpdatesDocs
} from "./bing/docs/index.js";
import { formatError } from "./common/errors.js";
import { existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const server = new McpServer({
  name: "search-console-mcp",
  version: "1.0.0",
});

// Sites Tools
server.tool(
  "sites_list",
  "List all sites in Search Console",
  {},
  async () => {
    try {
      const result = await sites.listSites();
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

server.tool(
  "sites_add",
  "Add a website to Search Console",
  { siteUrl: z.string().describe("The URL of the site to add (e.g., 'https://example.com' or 'sc-domain:example.com')") },
  async ({ siteUrl }) => {
    try {
      const result = await sites.addSite(siteUrl);
      return {
        content: [{ type: "text", text: result }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

server.tool(
  "sites_delete",
  "Remove a website from Search Console",
  { siteUrl: z.string().describe("The URL of the site to delete") },
  async ({ siteUrl }) => {
    try {
      const result = await sites.deleteSite(siteUrl);
      return {
        content: [{ type: "text", text: result }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

server.tool(
  "sites_get",
  "Get information about a specific site",
  { siteUrl: z.string().describe("The URL of the site") },
  async ({ siteUrl }) => {
    try {
      const result = await sites.getSite(siteUrl);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

server.tool(
  "sites_health_check",
  "Run a health check on one or all verified sites. Checks week-over-week performance, sitemap status, and traffic anomalies. Returns a structured report with an overall status (healthy/warning/critical) per site.",
  {
    siteUrl: z.string().optional().describe("Optional. The URL of a specific site to check. If omitted, checks all verified sites.")
  },
  async ({ siteUrl }) => {
    try {
      const result = await sitesHealth.healthCheck(siteUrl);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

// Sitemaps Tools
server.tool(
  "sitemaps_list",
  "List sitemaps for a site",
  { siteUrl: z.string().describe("The URL of the site") },
  async ({ siteUrl }) => {
    try {
      const result = await sitemaps.listSitemaps(siteUrl);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

server.tool(
  "sitemaps_get",
  "Get details about a specific sitemap",
  {
    siteUrl: z.string().describe("The URL of the site"),
    feedpath: z.string().describe("The URL of the sitemap")
  },
  async ({ siteUrl, feedpath }) => {
    try {
      const result = await sitemaps.getSitemap(siteUrl, feedpath);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

server.tool(
  "sitemaps_submit",
  "Submit a sitemap",
  {
    siteUrl: z.string().describe("The URL of the site"),
    feedpath: z.string().describe("The URL of the sitemap")
  },
  async ({ siteUrl, feedpath }) => {
    try {
      const result = await sitemaps.submitSitemap(siteUrl, feedpath);
      return {
        content: [{ type: "text", text: result }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

server.tool(
  "sitemaps_delete",
  "Delete a sitemap",
  {
    siteUrl: z.string().describe("The URL of the site"),
    feedpath: z.string().describe("The URL of the sitemap")
  },
  async ({ siteUrl, feedpath }) => {
    try {
      const result = await sitemaps.deleteSitemap(siteUrl, feedpath);
      return {
        content: [{ type: "text", text: result }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

// Analytics Tools
server.tool(
  "analytics_query",
  "Query search analytics data with optional pagination",
  {
    siteUrl: z.string().describe("The URL of the site"),
    startDate: z.string().describe("Start date (YYYY-MM-DD)"),
    endDate: z.string().describe("End date (YYYY-MM-DD)"),
    dimensions: z.array(z.string()).optional().describe("Dimensions to group by (date, query, page, country, device, searchAppearance)"),
    type: z.enum(["web", "image", "video", "news", "discover", "googleNews"]).optional().describe("Search type (default: web)"),
    aggregationType: z.enum(["auto", "byProperty", "byPage"]).optional().describe("How to aggregate data (default: auto)"),
    dataState: z.enum(["final", "all"]).optional().describe("Include fresh data? 'all' includes fresh (preliminary) data (default: final)"),
    limit: z.number().optional().describe("Max rows to return (default: 1000)"),
    startRow: z.number().optional().describe("Starting row for pagination (0-based)"),
    filters: z.array(z.object({
      dimension: z.string(),
      operator: z.string(),
      expression: z.string()
    })).optional().describe("Filters (dimension: query/page/country/device, operator: equals/contains/notContains/includingRegex/excludingRegex)")
  },
  async (args) => {
    try {
      const result = await analytics.queryAnalytics(args);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

server.tool(
  "analytics_performance_summary",
  "Get the aggregate performance metrics (clicks, impressions, CTR, position) for the last N days. Defaults to 28 days. Note: Data is typically delayed by 2-3 days.",
  {
    siteUrl: z.string().describe("The URL of the site"),
    days: z.number().optional().describe("Number of days to look back (default: 28)")
  },
  async ({ siteUrl, days }) => {
    try {
      const result = await analytics.getPerformanceSummary(siteUrl, days);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

server.tool(
  "analytics_compare_periods",
  "Compare performance metrics between two date periods. Useful for week-over-week or month-over-month analysis.",
  {
    siteUrl: z.string().describe("The URL of the site"),
    period1Start: z.string().describe("Start date of first (current) period (YYYY-MM-DD)"),
    period1End: z.string().describe("End date of first (current) period (YYYY-MM-DD)"),
    period2Start: z.string().describe("Start date of second (comparison) period (YYYY-MM-DD)"),
    period2End: z.string().describe("End date of second (comparison) period (YYYY-MM-DD)")
  },
  async ({ siteUrl, period1Start, period1End, period2Start, period2End }) => {
    try {
      const result = await analytics.comparePeriods(siteUrl, period1Start, period1End, period2Start, period2End);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

server.tool(
  "analytics_top_queries",
  "Get top search queries by clicks or impressions for the last N days.",
  {
    siteUrl: z.string().describe("The URL of the site"),
    days: z.number().optional().describe("Number of days to look back (default: 28)"),
    limit: z.number().optional().describe("Number of top queries to return (default: 10)"),
    sortBy: z.enum(["clicks", "impressions"]).optional().describe("Sort by clicks or impressions (default: clicks)")
  },
  async ({ siteUrl, days, limit, sortBy }) => {
    try {
      const result = await analytics.getTopQueries(siteUrl, { days, limit, sortBy });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

server.tool(
  "analytics_top_pages",
  "Get top performing pages by clicks or impressions for the last N days.",
  {
    siteUrl: z.string().describe("The URL of the site"),
    days: z.number().optional().describe("Number of days to look back (default: 28)"),
    limit: z.number().optional().describe("Number of top pages to return (default: 10)"),
    sortBy: z.enum(["clicks", "impressions"]).optional().describe("Sort by clicks or impressions (default: clicks)")
  },
  async ({ siteUrl, days, limit, sortBy }) => {
    try {
      const result = await analytics.getTopPages(siteUrl, { days, limit, sortBy });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

server.tool(
  "analytics_by_country",
  "Get performance breakdown by country for the last N days.",
  {
    siteUrl: z.string().describe("The URL of the site"),
    days: z.number().optional().describe("Number of days to look back (default: 28)"),
    limit: z.number().optional().describe("Number of countries to return (default: 250)"),
    sortBy: z.enum(["clicks", "impressions"]).optional().describe("Sort by clicks or impressions (default: clicks)")
  },
  async ({ siteUrl, days, limit, sortBy }) => {
    try {
      const result = await analytics.getPerformanceByCountry(siteUrl, { days, limit, sortBy });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

server.tool(
  "analytics_search_appearance",
  "Get performance breakdown by search appearance type for the last N days.",
  {
    siteUrl: z.string().describe("The URL of the site"),
    days: z.number().optional().describe("Number of days to look back (default: 28)"),
    limit: z.number().optional().describe("Number of types to return (default: 50)"),
    sortBy: z.enum(["clicks", "impressions"]).optional().describe("Sort by clicks or impressions (default: clicks)")
  },
  async ({ siteUrl, days, limit, sortBy }) => {
    try {
      const result = await analytics.getPerformanceBySearchAppearance(siteUrl, { days, limit, sortBy });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

server.tool(
  "analytics_trends",
  "Detect traffic trends (rising/declining) for queries or pages.",
  {
    siteUrl: z.string().describe("The URL of the site"),
    dimension: z.enum(["query", "page"]).optional().describe("Dimension to analyze (default: query)"),
    days: z.number().optional().describe("Number of days to analyze (default: 28)"),
    threshold: z.number().optional().describe("Minimum percentage change to consider (default: 10)"),
    minClicks: z.number().optional().describe("Minimum clicks required to be considered (default: 100)"),
    limit: z.number().optional().describe("Max results to return (default: 20)")
  },
  async ({ siteUrl, dimension, days, threshold, minClicks, limit }) => {
    try {
      const result = await analytics.detectTrends(siteUrl, { dimension, days, threshold, minClicks, limit });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

server.tool(
  "analytics_anomalies",
  "Identify unusual daily spikes or drops in traffic.",
  {
    siteUrl: z.string().describe("The URL of the site"),
    days: z.number().optional().describe("Number of days to look back for baseline (default: 30)"),
    threshold: z.number().optional().describe("Sensitivity threshold (Standard Deviations, default: 2.5)")
  },
  async ({ siteUrl, days, threshold }) => {
    try {
      const result = await analytics.detectAnomalies(siteUrl, { days, threshold });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

server.tool(
  "analytics_drop_attribution",
  "Analyze a significant traffic drop to identify if it was caused by specific devices (mobile/desktop) or coincides with known Google algorithm updates.",
  {
    siteUrl: z.string().describe("The URL of the site"),
    days: z.number().optional().describe("Number of days to look back (default: 30)"),
    threshold: z.number().optional().describe("Sensitivity threshold for drop detection (Standard Deviations, default: 2.0)")
  },
  async ({ siteUrl, days, threshold }) => {
    try {
      const result = await advancedAnalytics.analyzeDropAttribution(siteUrl, { days, threshold });
      return {
        content: [{ type: "text", text: result ? JSON.stringify(result, null, 2) : "No significant traffic drop detected in the specified period." }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

server.tool(
  "analytics_time_series",
  "Get advanced time series data including rolling averages, seasonality strength, and trend forecasting. Supports multi-dimensional analysis, metrics selection, and custom granularities.",
  {
    siteUrl: z.string().describe("The URL of the site"),
    days: z.number().optional().describe("Number of days of history to analyze (default: 60)"),
    startDate: z.string().optional().describe("Start date (YYYY-MM-DD)"),
    endDate: z.string().optional().describe("End date (YYYY-MM-DD)"),
    dimensions: z.array(z.string()).optional().describe("Dimensions to group by (default: ['date'])"),
    metrics: z.array(z.enum(["clicks", "impressions", "ctr", "position"])).optional().describe("Metrics to analyze (default: ['clicks'])"),
    granularity: z.enum(["daily", "weekly"]).optional().describe("Granularity of the data (default: daily)"),
    filters: z.array(z.object({
      dimension: z.string(),
      operator: z.string(),
      expression: z.string()
    })).optional().describe("Filter groups to apply"),
    window: z.number().optional().describe("Window size for rolling average in days/weeks (default: 7)"),
    forecastDays: z.number().optional().describe("Number of units (days/weeks) to forecast into the future (default: 7)")
  },
  async ({ siteUrl, days, startDate, endDate, dimensions, metrics, granularity, filters, window, forecastDays }) => {
    try {
      const result = await advancedAnalytics.getTimeSeriesInsights(siteUrl, {
        days,
        startDate,
        endDate,
        dimensions,
        metrics,
        granularity,
        filters,
        window,
        forecastDays
      });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

// Inspection Tools
server.tool(
  "inspection_inspect",
  "Inspect a URL to check its indexing status, crawl info, and mobile usability",
  {
    siteUrl: z.string().describe("The URL of the property (must match a verified property in Search Console)"),
    inspectionUrl: z.string().describe("The fully-qualified URL to inspect (must be under the siteUrl property)"),
    languageCode: z.string().optional().describe("Language code for localized results (default: en-US)")
  },
  async ({ siteUrl, inspectionUrl, languageCode }) => {
    try {
      const result = await inspection.inspectUrl(siteUrl, inspectionUrl, languageCode);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

// PageSpeed Insights Tools
server.tool(
  "pagespeed_analyze",
  "Run PageSpeed Insights analysis on a URL to get performance, accessibility, best practices, and SEO scores",
  {
    url: z.string().describe("The URL to analyze"),
    strategy: z.enum(["mobile", "desktop"]).optional().describe("Device strategy (default: mobile)")
  },
  async ({ url, strategy }) => {
    try {
      const result = await pagespeed.analyzePageSpeed(url, strategy || 'mobile');
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

server.tool(
  "pagespeed_core_web_vitals",
  "Get Core Web Vitals for both mobile and desktop including LCP, FID, CLS, FCP, TTI, and TBT",
  {
    url: z.string().describe("The URL to analyze")
  },
  async ({ url }) => {
    try {
      const result = await pagespeed.getCoreWebVitals(url);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

// SEO Insights Tools
server.tool(
  "seo_recommendations",
  "Generate SEO recommendations based on site performance data",
  {
    siteUrl: z.string().describe("The site URL (e.g., https://example.com)"),
    days: z.number().optional().describe("Number of days to analyze (default: 28)")
  },
  async ({ siteUrl, days }) => {
    try {
      const result = await seoInsights.generateRecommendations(siteUrl, { days });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

server.tool(
  "seo_low_hanging_fruit",
  "Find keywords with high impressions but low rankings (positions 5-20) that have potential for quick wins",
  {
    siteUrl: z.string().describe("The site URL"),
    days: z.number().optional().describe("Number of days to analyze (default: 28)"),
    minImpressions: z.number().optional().describe("Minimum impressions threshold (default: 100)"),
    limit: z.number().optional().describe("Max results to return (default: 50)")
  },
  async ({ siteUrl, days, minImpressions, limit }) => {
    try {
      const result = await seoInsights.findLowHangingFruit(siteUrl, { days, minImpressions, limit });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

server.tool(
  "seo_cannibalization",
  "Detect keyword cannibalization - multiple pages competing for the same query",
  {
    siteUrl: z.string().describe("The site URL"),
    days: z.number().optional().describe("Number of days to analyze (default: 28)"),
    minImpressions: z.number().optional().describe("Minimum impressions threshold (default: 50)"),
    limit: z.number().optional().describe("Max issues to return (default: 30)")
  },
  async ({ siteUrl, days, minImpressions, limit }) => {
    try {
      const result = await seoInsights.detectCannibalization(siteUrl, { days, minImpressions, limit });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

server.tool(
  "seo_low_ctr_opportunities",
  "Find queries ranking in positions 1-10 with low CTR (< 60% of benchmark). Great for title tag optimization.",
  {
    siteUrl: z.string().describe("The site URL"),
    days: z.number().optional().describe("Number of days to analyze (default: 28)"),
    minImpressions: z.number().optional().describe("Minimum impressions threshold (default: 500)"),
    limit: z.number().optional().describe("Max results to return (default: 50)")
  },
  async ({ siteUrl, days, minImpressions, limit }) => {
    try {
      const result = await seoInsights.findLowCTROpportunities(siteUrl, { days, minImpressions, limit });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

server.tool(
  "seo_striking_distance",
  "Find keywords ranking in positions 8-15. These are high-priority targets to push to Page 1.",
  {
    siteUrl: z.string().describe("The site URL"),
    days: z.number().optional().describe("Number of days to analyze (default: 28)"),
    limit: z.number().optional().describe("Max results to return (default: 50)")
  },
  async ({ siteUrl, days, limit }) => {
    try {
      const result = await seoInsights.findStrikingDistance(siteUrl, { days, limit });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

server.tool(
  "seo_lost_queries",
  "Identify queries that lost all traffic (or dropped >80%) compared to the previous period.",
  {
    siteUrl: z.string().describe("The site URL"),
    days: z.number().optional().describe("Number of days to compare (default: 28)"),
    limit: z.number().optional().describe("Max results to return (default: 50)")
  },
  async ({ siteUrl, days, limit }) => {
    try {
      const result = await seoInsights.findLostQueries(siteUrl, { days, limit });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

server.tool(
  "seo_brand_vs_nonbrand",
  "Analyze performance split between Brand and Non-Brand queries using a regex.",
  {
    siteUrl: z.string().describe("The site URL"),
    brandRegex: z.string().describe("Regex to match brand keywords (e.g. 'acme|acme corp')"),
    days: z.number().optional().describe("Number of days to analyze (default: 28)")
  },
  async ({ siteUrl, brandRegex, days }) => {
    try {
      const result = await seoInsights.analyzeBrandVsNonBrand(siteUrl, brandRegex, { days });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

server.tool(
  "seo_quick_wins",
  "Find pages with queries ranking on page 2 (positions 11-20) that could be pushed to page 1",
  {
    siteUrl: z.string().describe("The site URL"),
    days: z.number().optional().describe("Number of days to analyze (default: 28)"),
    minImpressions: z.number().optional().describe("Minimum impressions threshold (default: 100)"),
    limit: z.number().optional().describe("Max results to return (default: 20)")
  },
  async ({ siteUrl, days, minImpressions, limit }) => {
    try {
      const result = await seoInsights.findQuickWins(siteUrl, { days, minImpressions, limit });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);


// SEO Primitives (Atoms)
server.tool(
  "seo_primitive_ranking_bucket",
  "primitive: Get the ranking bucket for a specific position (e.g. Top 3, Page 1).",
  { position: z.number().describe("The ranking position") },
  async ({ position }) => {
    return {
      content: [{ type: "text", text: JSON.stringify(seoPrimitives.getRankingBucket(position), null, 2) }]
    };
  }
);

server.tool(
  "seo_primitive_traffic_delta",
  "primitive: Calculate the delta between two traffic metrics (absolute and percentage).",
  {
    current: z.number().describe("Current value"),
    previous: z.number().describe("Previous value")
  },
  async ({ current, previous }) => {
    return {
      content: [{ type: "text", text: JSON.stringify(seoPrimitives.calculateTrafficDelta(current, previous), null, 2) }]
    };
  }
);

server.tool(
  "seo_primitive_is_brand",
  "primitive: Check if a query is a brand query based on a regex pattern.",
  {
    query: z.string().describe("The search query"),
    brandRegex: z.string().describe("Regex pattern to identify brand terms")
  },
  async ({ query, brandRegex }) => {
    return {
      content: [{ type: "text", text: JSON.stringify(seoPrimitives.isBrandQuery(query, brandRegex), null, 2) }]
    };
  }
);

server.tool(
  "seo_primitive_is_cannibalized",
  "primitive: Check if two pages are competing for the same query based on their metrics.",
  {
    query: z.string().describe("The search query"),
    pageA_position: z.number(),
    pageA_impressions: z.number(),
    pageA_clicks: z.number(),
    pageB_position: z.number(),
    pageB_impressions: z.number(),
    pageB_clicks: z.number()
  },
  async ({ query, pageA_position, pageA_impressions, pageA_clicks, pageB_position, pageB_impressions, pageB_clicks }) => {
    const pageA = { position: pageA_position, impressions: pageA_impressions, clicks: pageA_clicks };
    const pageB = { position: pageB_position, impressions: pageB_impressions, clicks: pageB_clicks };
    return {
      content: [{ type: "text", text: JSON.stringify(seoPrimitives.isCannibalized(query, pageA, pageB), null, 2) }]
    };
  }
);

// Schema Validator Tools
server.tool(
  "schema_validate",
  "Validate Schema.org structured data (JSON-LD) from a URL, HTML snippet, or JSON object.",
  {
    type: z.enum(["url", "html", "json"]).describe("The type of input provided"),
    data: z.string().describe("The URL, HTML content, or JSON string to validate")
  },
  async ({ type, data }) => {
    try {
      const result = await schemaValidator.validateSchema(data, type as 'url' | 'html' | 'json');
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

// Support Tools
server.tool(
  "util_star_repo",
  "Star the GitHub repository to support the project. Uses GitHub CLI if available, or opens a browser.",
  {},
  async () => {
    try {
      const { starRepository } = await import("./google/tools/support.js");
      const result = await starRepository();
      return {
        content: [{ type: "text", text: result }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

// --- Bing Tools ---

server.tool(
  "bing_sites_list",
  "List all sites verified in Bing Webmaster Tools",
  {},
  async () => {
    try {
      const results = await bingSites.listSites();
      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

server.tool(
  "bing_sitemaps_list",
  "List sitemaps for a Bing site",
  {
    siteUrl: z.string().describe("The URL of the site")
  },
  async ({ siteUrl }) => {
    try {
      const results = await bingSitemaps.listSitemaps(siteUrl);
      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

server.tool(
  "bing_sitemaps_submit",
  "Submit a sitemap to Bing Webmaster Tools",
  {
    siteUrl: z.string().describe("The URL of the site"),
    sitemapUrl: z.string().describe("The URL of the sitemap file")
  },
  async ({ siteUrl, sitemapUrl }) => {
    try {
      const result = await bingSitemaps.submitSitemap(siteUrl, sitemapUrl);
      return {
        content: [{ type: "text", text: result }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

server.tool(
  "bing_analytics_query",
  "Get query performance stats from Bing Webmaster Tools (Top Queries)",
  {
    siteUrl: z.string().describe("The URL of the site")
  },
  async ({ siteUrl }) => {
    try {
      const results = await bingAnalytics.getQueryStats(siteUrl);
      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

server.tool(
  "bing_analytics_page",
  "Get page performance stats from Bing Webmaster Tools (Top Pages)",
  {
    siteUrl: z.string().describe("The URL of the site")
  },
  async ({ siteUrl }) => {
    try {
      const results = await bingAnalytics.getPageStats(siteUrl);
      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

server.tool(
  "bing_analytics_page_query",
  "Get query performance stats for a specific page from Bing Webmaster Tools",
  {
    siteUrl: z.string().describe("The URL of the site"),
    pageUrl: z.string().describe("The URL of the specific page")
  },
  async ({ siteUrl, pageUrl }) => {
    try {
      const results = await bingAnalytics.getPageQueryStats(siteUrl, pageUrl);
      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

server.tool(
  "bing_get_top_queries",
  "Alias for bing_analytics_query. Get top queries for a site.",
  {
    siteUrl: z.string().describe("The URL of the site")
  },
  async ({ siteUrl }) => {
    try {
      const results = await bingAnalytics.getQueryStats(siteUrl);
      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

server.tool(
  "bing_get_top_pages",
  "Alias for bing_analytics_page. Get top pages for a site.",
  {
    siteUrl: z.string().describe("The URL of the site")
  },
  async ({ siteUrl }) => {
    try {
      const results = await bingAnalytics.getPageStats(siteUrl);
      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

server.tool(
  "bing_analytics_query_page",
  "Get combined query and page performance stats for a site",
  {
    siteUrl: z.string().describe("The URL of the site")
  },
  async ({ siteUrl }) => {
    try {
      const results = await bingAnalytics.getQueryPageStats(siteUrl);
      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

server.tool(
  "bing_rank_traffic_stats",
  "Get historical rank and traffic statistics for a site",
  {
    siteUrl: z.string().describe("The URL of the site")
  },
  async ({ siteUrl }) => {
    try {
      const results = await bingAnalytics.getRankAndTrafficStats(siteUrl);
      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

server.tool(
  "bing_keywords_stats",
  "Get historical stats for a keyword in Bing",
  {
    q: z.string().describe("The keyword to research"),
    country: z.string().optional().describe("Optional country code (e.g., US)"),
    language: z.string().optional().describe("Optional language code (e.g., en-US)")
  },
  async ({ q, country, language }) => {
    try {
      const results = await bingKeywords.getKeywordStats(q, country, language);
      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

server.tool(
  "bing_related_keywords",
  "Get related keywords and search volume from Bing",
  {
    q: z.string().describe("The keyword to research"),
    country: z.string().optional().describe("Optional country code (e.g., US)"),
    language: z.string().optional().describe("Optional language code (e.g., en-US)")
  },
  async ({ q, country, language }) => {
    try {
      const results = await bingKeywords.getRelatedKeywords(q, country, language);
      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

server.tool(
  "bing_crawl_issues",
  "Get crawl issues for a site from Bing Webmaster Tools",
  {
    siteUrl: z.string().describe("The URL of the site")
  },
  async ({ siteUrl }) => {
    try {
      const results = await bingCrawl.getCrawlIssues(siteUrl);
      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

server.tool(
  "bing_crawl_stats",
  "Get crawl statistics (indexed, crawled, errors) for a site",
  {
    siteUrl: z.string().describe("The URL of the site")
  },
  async ({ siteUrl }) => {
    try {
      const results = await bingCrawl.getCrawlStats(siteUrl);
      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

server.tool(
  "bing_url_submission_quota",
  "Get remaining URL submission quota for Bing",
  {
    siteUrl: z.string().describe("The URL of the site")
  },
  async ({ siteUrl }) => {
    try {
      const result = await bingUrlSubmission.getUrlSubmissionQuota(siteUrl);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

server.tool(
  "bing_url_submit",
  "Submit a single URL to Bing for indexing",
  {
    siteUrl: z.string().describe("The URL of the site"),
    url: z.string().describe("The specific URL to submit")
  },
  async ({ siteUrl, url }) => {
    try {
      const result = await bingUrlSubmission.submitUrl(siteUrl, url);
      return {
        content: [{ type: "text", text: result }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

server.tool(
  "bing_url_submit_batch",
  "Submit multiple URLs to Bing for indexing in a single batch",
  {
    siteUrl: z.string().describe("The URL of the site"),
    urlList: z.array(z.string()).describe("List of URLs to submit (max 500)")
  },
  async ({ siteUrl, urlList }) => {
    try {
      const result = await bingUrlSubmission.submitUrlBatch(siteUrl, urlList);
      return {
        content: [{ type: "text", text: result }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

server.tool(
  "bing_index_now",
  "Submit URLs via IndexNow API (Bing, Yandex, etc.)",
  {
    host: z.string().describe("The host/domain where URLs are located (e.g., www.example.com)"),
    key: z.string().describe("The IndexNow key generated for this host"),
    keyLocation: z.string().optional().describe("Optional URL of the key file (if not at host root)"),
    urlList: z.array(z.string()).describe("List of absolute URLs to notify IndexNow about")
  },
  async (options) => {
    try {
      const result = await indexNow.submitIndexNow(options);
      return {
        content: [{ type: "text", text: result }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

server.tool(
  "bing_sites_health",
  "Run a comprehensive health check on one or all verified Bing sites",
  {
    siteUrl: z.string().optional().describe("Optional URL of a specific site to check")
  },
  async ({ siteUrl }) => {
    try {
      const results = await bingHealth.healthCheck(siteUrl);
      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

server.tool(
  "bing_opportunity_finder",
  "Find high-potential 'low-hanging fruit' keywords in Bing",
  {
    siteUrl: z.string().describe("The URL of the site"),
    minImpressions: z.number().optional().describe("Minimum impressions threshold (default 100)")
  },
  async ({ siteUrl, minImpressions }) => {
    try {
      const results = await bingSeoInsights.findLowHangingFruit(siteUrl, { minImpressions });
      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

server.tool(
  "bing_seo_recommendations",
  "Generate prioritized SEO recommendations for a Bing site",
  {
    siteUrl: z.string().describe("The URL of the site")
  },
  async ({ siteUrl }) => {
    try {
      const results = await bingSeoInsights.generateRecommendations(siteUrl);
      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

server.tool(
  "bing_striking_distance",
  "Find keywords ranking positions 8-15 on Bing (near page 1)",
  {
    siteUrl: z.string().describe("The URL of the site")
  },
  async ({ siteUrl }) => {
    try {
      const results = await bingSeoInsights.findStrikingDistance(siteUrl);
      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

server.tool(
  "bing_low_ctr_opportunities",
  "Identify high-ranking Bing queries with lower than expected CTR",
  {
    siteUrl: z.string().describe("The URL of the site"),
    minImpressions: z.number().optional().describe("Minimum impressions threshold (default 500)")
  },
  async ({ siteUrl, minImpressions }) => {
    try {
      const results = await bingSeoInsights.findLowCTROpportunities(siteUrl, { minImpressions });
      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

server.tool(
  "bing_url_info",
  "Get detailed indexing and crawl information for a URL in Bing",
  {
    siteUrl: z.string().describe("The site URL"),
    url: z.string().describe("The specific URL to inspect")
  },
  async ({ siteUrl, url }) => {
    try {
      const result = await bingInspection.getUrlInfo(siteUrl, url);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

server.tool(
  "bing_link_counts",
  "Get inbound link counts for a site from Bing",
  {
    siteUrl: z.string().describe("The URL of the site")
  },
  async ({ siteUrl }) => {
    try {
      const results = await bingLinks.getLinkCounts(siteUrl);
      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

server.tool(
  "bing_analytics_detect_anomalies",
  "Detect performance anomalies in Bing traffic",
  {
    siteUrl: z.string().describe("The URL of the site"),
    days: z.number().optional().describe("Number of days to check (default 14)"),
    threshold: z.number().optional().describe("Anomaly threshold (default 2.5)")
  },
  async ({ siteUrl, days, threshold }) => {
    try {
      const results = await bingAnalytics.detectAnomalies(siteUrl, { days, threshold });
      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

server.tool(
  "bing_analytics_compare_periods",
  "Compare performance between two date ranges in Bing",
  {
    siteUrl: z.string().describe("The URL of the site"),
    startDate1: z.string().describe("Start date of period 1 (YYYY-MM-DD)"),
    endDate1: z.string().describe("End date of period 1 (YYYY-MM-DD)"),
    startDate2: z.string().describe("Start date of period 2 (YYYY-MM-DD)"),
    endDate2: z.string().describe("End date of period 2 (YYYY-MM-DD)")
  },
  async ({ siteUrl, startDate1, endDate1, startDate2, endDate2 }) => {
    try {
      const result = await bingAnalytics.comparePeriods(siteUrl, startDate1, endDate1, startDate2, endDate2);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

server.tool(
  "bing_analytics_drop_attribution",
  "Identify the likely cause of a Bing traffic drop",
  {
    siteUrl: z.string().describe("The URL of the site"),
    days: z.number().optional().describe("Lookback period in days (default 30)"),
    threshold: z.number().optional().describe("Anomaly threshold (default 2.0)")
  },
  async ({ siteUrl, days, threshold }) => {
    try {
      const result = await bingAdvancedAnalytics.analyzeDropAttribution(siteUrl, { days, threshold });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);

server.tool(
  "bing_analytics_time_series",
  "Advanced time series analysis for Bing performance data",
  {
    siteUrl: z.string().describe("The URL of the site"),
    days: z.number().optional().describe("Number of days (default 60)"),
    granularity: z.enum(["daily", "weekly"]).optional().describe("Data granularity"),
    metrics: z.array(z.enum(["clicks", "impressions", "ctr", "position"])).optional().describe("Metrics to analyze")
  },
  async ({ siteUrl, days, granularity, metrics }) => {
    try {
      const result = await bingAdvancedAnalytics.getTimeSeriesInsights(siteUrl, { days, granularity, metrics });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    } catch (error) {
      return formatError(error);
    }
  }
);
server.resource(
  "sites",
  "sites://list",
  async (uri) => {
    const result = await sites.listSites();
    return {
      contents: [{
        uri: uri.href,
        text: JSON.stringify(result, null, 2),
        mimeType: "application/json"
      }]
    };
  }
);

server.resource(
  "sitemaps",
  "sitemaps://list/{siteUrl}",
  async (uri) => {
    const siteUrl = decodeURIComponent(uri.pathname.replace('/list/', ''));
    const result = await sitemaps.listSitemaps(siteUrl);
    return {
      contents: [{
        uri: uri.href,
        text: JSON.stringify(result, null, 2),
        mimeType: "application/json"
      }]
    };
  }
);

server.resource(
  "analytics-summary",
  "analytics://summary/{siteUrl}",
  async (uri) => {
    const siteUrl = decodeURIComponent(uri.pathname.replace('/summary/', ''));
    const result = await analytics.getPerformanceSummary(siteUrl);
    return {
      contents: [{
        uri: uri.href,
        text: JSON.stringify(result, null, 2),
        mimeType: "application/json"
      }]
    };
  }
);

// Documentation Resources
import { dimensionsDocs, filtersDocs, searchTypesDocs, patternsDocs, algorithmUpdatesDocs } from "./google/docs/index.js";

server.resource(
  "docs-dimensions",
  "docs://dimensions",
  async (uri) => ({
    contents: [{
      uri: uri.href,
      text: dimensionsDocs,
      mimeType: "text/markdown"
    }]
  })
);

server.resource(
  "docs-filters",
  "docs://filters",
  async (uri) => ({
    contents: [{
      uri: uri.href,
      text: filtersDocs,
      mimeType: "text/markdown"
    }]
  })
);

server.resource(
  "docs-search-types",
  "docs://search-types",
  async (uri) => ({
    contents: [{
      uri: uri.href,
      text: searchTypesDocs,
      mimeType: "text/markdown"
    }]
  })
);

server.resource(
  "docs-patterns",
  "docs://patterns",
  async (uri) => ({
    contents: [{
      uri: uri.href,
      text: patternsDocs,
      mimeType: "text/markdown"
    }]
  })
);

server.resource(
  "docs-algorithm-updates",
  "docs://algorithm-updates",
  async (uri) => ({
    contents: [{
      uri: uri.href,
      text: algorithmUpdatesDocs,
      mimeType: "text/markdown"
    }]
  })
);

server.resource(
  "docs-bing-api",
  "docs://bing-api",
  async (uri) => ({
    contents: [{
      uri: uri.href,
      text: bingApiDocs,
      mimeType: "text/markdown"
    }]
  })
);

server.resource(
  "docs-index-now",
  "docs://index-now",
  async (uri) => ({
    contents: [{
      uri: uri.href,
      text: indexNowDocs,
      mimeType: "text/markdown"
    }]
  })
);


server.resource(
  "docs-bing-dimensions",
  "docs://bing/dimensions",
  async (uri) => ({
    contents: [{
      uri: uri.href,
      text: bingDimensionsDocs,
      mimeType: "text/markdown"
    }]
  })
);

server.resource(
  "docs-bing-filters",
  "docs://bing/filters",
  async (uri) => ({
    contents: [{
      uri: uri.href,
      text: bingFiltersDocs,
      mimeType: "text/markdown"
    }]
  })
);

server.resource(
  "docs-bing-search-types",
  "docs://bing/search-types",
  async (uri) => ({
    contents: [{
      uri: uri.href,
      text: bingSearchTypesDocs,
      mimeType: "text/markdown"
    }]
  })
);

server.resource(
  "docs-bing-patterns",
  "docs://bing/patterns",
  async (uri) => ({
    contents: [{
      uri: uri.href,
      text: bingPatternsDocs,
      mimeType: "text/markdown"
    }]
  })
);

server.resource(
  "docs-bing-algorithm-updates",
  "docs://bing/algorithm-updates",
  async (uri) => ({
    contents: [{
      uri: uri.href,
      text: bingAlgorithmUpdatesDocs,
      mimeType: "text/markdown"
    }]
  })
);

// Prompts
server.prompt(
  "analyze-site-performance",
  { siteUrl: z.string().describe("The URL of the site to analyze") },
  ({ siteUrl }) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `Please analyze the performance of the site ${siteUrl} for the last 28 days.
        Use the 'analytics_performance_summary' tool to get high-level metrics, and 'analytics_query' to dig deeper into top queries and pages if needed.
        Provide a summary of the site's health and any opportunities for improvement.`
      }
    }]
  })
);

server.prompt(
  "compare-performance",
  { siteUrl: z.string().describe("The URL of the site to analyze") },
  ({ siteUrl }) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `Compare the performance of ${siteUrl} for this week vs last week.

Use the 'analytics_compare_periods' tool to compare the two periods:
- Period 1 (this week): last 7 days ending 3 days ago (to account for data delay)
- Period 2 (last week): the 7 days before that

Analyze the changes in clicks, impressions, CTR, and position.
Highlight any significant improvements or declines.
If there are notable changes, use 'analytics_top_queries' to identify which queries are driving the change.`
      }
    }]
  })
);

server.prompt(
  "find-declining-pages",
  { siteUrl: z.string().describe("The URL of the site to analyze") },
  ({ siteUrl }) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `Find pages on ${siteUrl} that are losing traffic.

Steps:
1. Use 'analytics_compare_periods' to compare this week vs last week overall
2. Use 'analytics_query' with dimension 'page' to get page-level data for both periods
3. Identify pages with significant click/impression drops

For each declining page, provide:
- The URL
- Previous vs current performance
- Possible reasons and recommendations`
      }
    }]
  })
);

server.prompt(
  "keyword-opportunities",
  { siteUrl: z.string().describe("The URL of the site to analyze") },
  ({ siteUrl }) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `Find keyword opportunities for ${siteUrl}.

Use 'analytics_top_queries' to get top queries, then analyze for:

1. **Low CTR, High Impressions**: Queries where you rank but don't get clicks
   - These need better titles/meta descriptions
   - Look for CTR < 2% with impressions > 100

2. **High Position (>10), Good Impressions**: Queries not on page 1
   - These are close to ranking well
   - Small optimization could move them up

3. **New Ranking Queries**: Queries that appeared recently
   - Opportunities to create more content

Provide specific recommendations for the top 5 opportunities.`
      }
    }]
  })
);

server.prompt(
  "new-content-impact",
  {
    siteUrl: z.string().describe("The URL of the site"),
    pageUrl: z.string().describe("The URL of the new content to analyze")
  },
  ({ siteUrl, pageUrl }) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `Analyze the impact of new content at ${pageUrl} on site ${siteUrl}.

1. Use 'inspection_inspect' to check if the page is indexed
2. Use 'analytics_query' with a page filter for this URL to get its performance data
3. Identify which queries are driving traffic to this page

Provide:
- Indexing status
- Key metrics (clicks, impressions, CTR, position)
- Top queries ranking for this page
- Recommendations for improvement`
      }
    }]
  })
);

server.prompt(
  "mobile-vs-desktop",
  { siteUrl: z.string().describe("The URL of the site to analyze") },
  ({ siteUrl }) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `Compare mobile vs desktop performance for ${siteUrl}.

Use 'analytics_query' with dimension 'device' to get device-level metrics.

Analyze:
1. Click and impression distribution across devices
2. CTR differences between mobile and desktop
3. Position ranking differences

If there's a significant gap (e.g., mobile CTR much lower), investigate:
- Use 'inspection_inspect' on key pages to check mobile usability
- Recommend specific improvements

Provide a summary with actionable recommendations.`
      }
    }]
  })
);

server.prompt(
  "site-health-check",
  {
    siteUrl: z.string().optional().describe("Optional. The URL of a specific site to check. If omitted, checks all verified sites.")
  },
  ({ siteUrl }) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `Run a comprehensive health check${siteUrl ? ` for ${siteUrl}` : ' across all my verified sites'}.

Use the 'sites_health_check' tool${siteUrl ? ` with siteUrl '${siteUrl}'` : ' without a siteUrl to check all sites'}.

Then for each site in the results:

1. **Summarize the status** (healthy / warning / critical) with a clear visual indicator.
2. **Performance:** Report the week-over-week changes in clicks, impressions, CTR, and position.
3. **Sitemaps:** Note any missing sitemaps, errors, or warnings.
4. **Anomalies:** Highlight any traffic anomaly drops detected.

If any site has a 'critical' or 'warning' status:
- List the specific issues found.
- For critical traffic drops, use 'analytics_drop_attribution' to check if a Google algorithm update is the likely cause.
- For sitemap errors, use 'sitemaps_list' to get detailed error information.
- Provide 3 prioritized action items for each affected site.

End with an overall portfolio summary and the single most important action to take right now.`
      }
    }]
  })
);

async function main() {
  const command = process.argv[2];

  // Handle standalone commands
  if (command === 'setup') {
    const { main: setupMain } = await import('./setup.js');
    await setupMain();
    return;
  }

  if (command === 'logout') {
    const { runLogout } = await import('./setup.js');
    await runLogout();
    return;
  }

  if (command === 'login') {
    const { login } = await import('./setup.js');
    await login();
    return;
  }

  // Check for credentials
  const hasServiceAccount = !!process.env.GOOGLE_APPLICATION_CREDENTIALS || (!!process.env.GOOGLE_CLIENT_EMAIL && !!process.env.GOOGLE_PRIVATE_KEY);
  const tokenPath = join(homedir(), '.search-console-mcp-tokens.enc');
  const hasOAuthTokens = existsSync(tokenPath);

  if (!hasServiceAccount && !hasOAuthTokens) {
    console.error('\n╔══════════════════════════════════════════════════════════════╗');
    console.error('║          🚀 Google Search Console MCP Server                 ║');
    console.error('╚══════════════════════════════════════════════════════════════╝\n');
    console.error('❌ No authentication found.\n');
    console.error('💡 Please authorize with your Google Account:');
    console.error('   npx -y search-console-mcp login\n');
    console.error('Alternatively, run the setup wizard for other options:');
    console.error('   npx -y search-console-mcp setup\n');
    console.error('─'.repeat(64) + '\n');
    // We don't exit here because the transport might still be needed or the user might be piping output
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Google Search Console MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
