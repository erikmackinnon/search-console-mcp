#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as sites from "./tools/sites.js";
import * as sitemaps from "./tools/sitemaps.js";
import * as analytics from "./tools/analytics.js";
import * as inspection from "./tools/inspection.js";
import * as pagespeed from "./tools/pagespeed.js";
import { formatError } from "./errors.js";

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
    type: z.string().optional().describe("Search type (web, image, video, news, discover, googleNews)"),
    limit: z.number().optional().describe("Max number of rows (default: 1000, max: 25000)"),
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

// Resources
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
import { dimensionsDocs, filtersDocs, searchTypesDocs, patternsDocs } from "./docs/index.js";

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

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Google Search Console MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
