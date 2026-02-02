import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as sites from "./tools/sites.js";
import * as sitemaps from "./tools/sitemaps.js";
import * as analytics from "./tools/analytics.js";
import * as inspection from "./tools/inspection.js";

const server = new McpServer({
  name: "google-search-console",
  version: "1.0.0",
});

// Sites Tools
server.tool(
  "sites_list",
  "List all sites in Search Console",
  {},
  async () => {
    const result = await sites.listSites();
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
    };
  }
);

server.tool(
  "sites_add",
  "Add a website to Search Console",
  { siteUrl: z.string().describe("The URL of the site to add") },
  async ({ siteUrl }) => {
    const result = await sites.addSite(siteUrl);
    return {
      content: [{ type: "text", text: result }]
    };
  }
);

server.tool(
  "sites_delete",
  "Remove a website from Search Console",
  { siteUrl: z.string().describe("The URL of the site to delete") },
  async ({ siteUrl }) => {
    const result = await sites.deleteSite(siteUrl);
    return {
      content: [{ type: "text", text: result }]
    };
  }
);

server.tool(
  "sites_get",
  "Get information about a specific site",
  { siteUrl: z.string().describe("The URL of the site") },
  async ({ siteUrl }) => {
    const result = await sites.getSite(siteUrl);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
    };
  }
);

// Sitemaps Tools
server.tool(
  "sitemaps_list",
  "List sitemaps for a site",
  { siteUrl: z.string().describe("The URL of the site") },
  async ({ siteUrl }) => {
    const result = await sitemaps.listSitemaps(siteUrl);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
    };
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
    const result = await sitemaps.submitSitemap(siteUrl, feedpath);
    return {
      content: [{ type: "text", text: result }]
    };
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
    const result = await sitemaps.deleteSitemap(siteUrl, feedpath);
    return {
      content: [{ type: "text", text: result }]
    };
  }
);

// Analytics Tools
server.tool(
  "analytics_query",
  "Query search analytics data",
  {
    siteUrl: z.string().describe("The URL of the site"),
    startDate: z.string().describe("Start date (YYYY-MM-DD)"),
    endDate: z.string().describe("End date (YYYY-MM-DD)"),
    dimensions: z.array(z.string()).optional().describe("Dimensions to group by (date, query, page, etc.)"),
    type: z.string().optional().describe("Search type (web, image, video, news, etc.)"),
    limit: z.number().optional().describe("Max number of rows"),
    filters: z.array(z.object({
      dimension: z.string(),
      operator: z.string(),
      expression: z.string()
    })).optional().describe("Filters")
  },
  async (args) => {
    const result = await analytics.queryAnalytics(args);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
    };
  }
);

server.tool(
  "analytics_performance_summary",
  "Get the aggregate performance metrics (clicks, impressions, CTR, position) for the last N days. Defaults to 28 days.",
  {
    siteUrl: z.string().describe("The URL of the site"),
    days: z.number().optional().describe("Number of days to look back (default: 28)")
  },
  async ({ siteUrl, days }) => {
    const result = await analytics.getPerformanceSummary(siteUrl, days);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
    };
  }
);

// Inspection Tools
server.tool(
  "inspection_inspect",
  "Inspect a URL",
  {
    siteUrl: z.string().describe("The URL of the property"),
    inspectionUrl: z.string().describe("The URL to inspect"),
    languageCode: z.string().optional().describe("Language code (default: en-US)")
  },
  async ({ siteUrl, inspectionUrl, languageCode }) => {
    const result = await inspection.inspectUrl(siteUrl, inspectionUrl, languageCode);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
    };
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

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Google Search Console MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
