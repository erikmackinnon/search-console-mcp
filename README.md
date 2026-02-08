# Google Search Console MCP Server

A Model Context Protocol (MCP) server that transforms how you interact with Google Search Console. Stop exporting CSVs and start asking questions.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tests](https://github.com/saurabhsharma2u/search-console-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/saurabhsharma2u/search-console-mcp/actions/workflows/ci.yml)

## Why use this?

### ❌ The Old Way
1.  Open Search Console -> Performance Tab
2.  Filter by "Last 28 days"
3.  Export to CSV
4.  Open in Excel/Sheets
5.  Create a filter for "Position > 10" AND "Impressions > 1000"
6.  Analyze manually to find opportunities

### ✅ The New Way
**Just ask:**
> "Find low-hanging fruit keywords (positions 11-20) with high impressions that I should optimize."

The MCP server handles the API calls, filtering, and analysis instantly, giving you a prioritized list of actions.

---

## 🔒 Security & Privacy

We take your data security seriously. This tool is designed to be **local-first** and **secure by default**.

*   **Credentials Never Logged**: Your Google Service Account keys are used *only* in memory to authenticate with Google APIs. They are never written to disk, logs, or sent to any third-party server.
*   **Local Execution**: The code runs entirely on your local machine (or wherever you host your MCP server).
*   **Direct Communication**: All API calls go directly from your machine to Google's servers (`googleapis.com`). There is no middleman or proxy server.
*   **Open Source**: The code is fully open source. You can audit exactly how your credentials are used in `src/google-client.ts`.

---

## 🚀 Killer Prompts

Copy and paste these into your MCP client (Claude Desktop, etc.) to get immediate value:

**1. Find Quick Wins (Low-Hanging Fruit)**
> "Find pages with keywords ranking on page 2 (positions 11-20) that have high impressions (>500). Suggest titles to boost them to page 1."

**2. Diagnose Traffic Drops**
> "Analyze the impact of the latest core update. Compare performance for the last 28 days vs the previous period. Which specific pages lost the most traffic?"

**3. Improve Click-Through Rates (CTR)**
> "Find queries where I rank in the top 5 but have a CTR below 3%. These represent missed opportunities. Provide 3 headline variations to improve CTR for the top result."

**4. Audit for Cannibalization**
> "Check for keyword cannibalization on my site. Are there multiple pages competing for the same high-volume keywords?"

**5. Technical SEO Audit**
> "Inspect the top 5 pages by traffic. detailed technical SEO audit using PageSpeed Insights and URL inspection. Summarize critical issues."

**6. Content Gap Analysis**
> "Analyze my 'analytics_top_queries' for the last 3 months. Identify high-impression topics I am ranking for but do not have a dedicated page for (e.g., I'm ranking with a generic homepage or category page)."

---

## Features

- **Advanced Analytics**: Query performance data with powerful filters (Regex supported).
    - *New*: Support for 'News', 'Discover', 'Image' search types.
    - *New*: 'Fresh' data support for real-time monitoring.
- **Trend Detection**: Automatically identify rising or falling trends in your traffic.
- **Anomaly Detection**: Spot unusual spikes or drops that need attention.
- **Sitemaps Management**: List, submit, and validte sitemaps.
- **URL Inspection**: Check real-time indexing status and mobile usability.
- **PageSpeed Insights**: Integrated performance and Core Web Vitals analysis.
- **Schema Validation**: Validate JSON-LD structured data.

---

## Quick Start

### Prerequisites
1.  **Node.js 18+** installed.
2.  A **Google Cloud Service Account** key (JSON file) with access to your Search Console property.

### Installation

**Option 1: Use with npx (Recommended)**
Identify the path to your service account key and the site URL you want to manage.

```bash
npx search-console-mcp
```

**Option 2: Claude Desktop Configuration**
Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "google-search-console": {
      "command": "npx",
      "args": ["-y", "search-console-mcp"],
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "/absolute/path/to/your/service-account-key.json"
      }
    }
  }
}
```

---

## Tools Reference

### Analytics
| Tool | Description |
|------|-------------|
| `analytics_query` | Master tool for raw data. Supports `dimensions`, `filters`, `aggregationType` (byPage/byProperty), `dataState` (final/all), and `type` (web/image/news/discover). |
| `analytics_trends` | Detect trends (rising/falling) for specific queries or pages. |
| `analytics_anomalies` | Detect statistical anomalies in daily traffic. |
| `analytics_compare_periods` | Compare two date ranges (e.g., WoW, MoM). |
| `seo_brand_vs_nonbrand` | **[NEW]** Analyze performance split between Brand vs Non-Brand traffic. |

### SEO Opportunities (Opinionated)
| Tool | Description |
|------|-------------|
| `seo_low_hanging_fruit` | Find keywords ranking in pos 5-20 with high impressions. |
| `seo_striking_distance` | **[NEW]** Find keywords ranking 8-15 (Quickest ROI wins). |
| `seo_low_ctr_opportunities` | **[NEW]** Find top ranking queries (pos 1-10) with poor CTR. |
| `seo_cannibalization` | **[Enhanced]** Detect pages competing for the same query with traffic conflict. |
| `seo_lost_queries` | **[NEW]** Identify queries that lost all traffic in the last 28 days. |

### SEO Primitives (Atoms for Agents)
These are low-level tools designed to be used by other AI agents to build complex logic.
| Tool | Description |
|------|-------------|
| `seo_primitive_ranking_bucket` | Categorize a position (e.g. "Top 3", "Page 1", "Unranked"). |
| `seo_primitive_traffic_delta` | Calculate absolute and % change between two numbers. |
| `seo_primitive_is_brand` | Check if a query matches a brand regex. |
| `seo_primitive_is_cannibalized` | Check if two pages are competing for the same query. |

### Sites & Sitemaps
| Tool | Description |
|------|-------------|
| `sites_list` | List all verified sites. |
| `sites_add` / `sites_delete` | Manage properties. |
| `sitemaps_list` / `sitemaps_submit` | Manage sitemaps. |

### Inspection & Validation
| Tool | Description |
|------|-------------|
| `inspection_inspect` | Google URL Inspection API (Index status, mobile usability). |
| `pagespeed_analyze` | Lighthouse scores & Core Web Vitals. |
| `schema_validate` | Validate Structured Data (JSON-LD). |

---

## Contributing

We love contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## License

MIT
