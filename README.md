# Google Search Console MCP Server

A Model Context Protocol (MCP) server that transforms how you interact with Google Search Console. Stop exporting CSVs and start asking questions.

[📚 View Documentation](https://searchconsolemcp.mintlify.app/)

---

### [🏠 Overview](#) | [🎯 Prompts](#-magic-prompts) | [🚀 Quick Start](#-quick-start) | [🛠️ Tools](#-tools-reference)

---

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

---

## 🎯 Magic Prompts

Copy and paste these into your MCP client (Claude Desktop, etc.) to see the intelligence engine in action:

#### �️ The Traffic Detective
> "My traffic dropped this week compared to last. Use the anomaly detection and time-series tools to find exactly when the drop started and which pages are responsible."

#### 🎯 The "Striking Distance" Hunter
> "Find keywords for https://example.com where I'm ranking in positions 8-15 but have at least 1,000 impressions. These are my best opportunities for a quick traffic boost."

#### ⚔️ The Cannibalization Cleaner
> "Check for keyword cannibalization. Are there any queries where two or more of my pages are competing and splitting the traffic? Suggest which one should be the primary authority."

#### 📈 The SEO Opportunity Scoreboard
> "Analyze my top 50 keywords for the last 90 days. Rank them by a custom 'Opportunity Score' (Impressions / Position). Give me the top 5 specific pages to focus on."

#### 📊 The Executive Health Check
> "Run a full SEO health check for my site. Segment the results by Brand vs. Non-Brand and give me 3 high-impact actions for the upcoming week."

#### ⚡ The Speed vs. Ranking Correlator
> "Fetch the top 5 pages by impressions. For these pages, run a PageSpeed audit. Is there any correlation between low performance scores and recently declining positions?"

---

## 🔒 Security & Privacy

We take your data security seriously. This tool is designed to be **local-first** and **secure by default**.

*   **Credentials Never Logged**: Your Google Service Account keys are used *only* in memory to authenticate with Google APIs. They are never written to disk, logs, or sent to any third-party server.
*   **Local Execution**: The code runs entirely on your local machine (or wherever you host your MCP server).
*   **Path Traversal Protection**: The setup wizard implements strict validation for file paths, including null-byte removal, extension enforcement (.json), and size limits (1MB) to prevent unauthorized file access.
*   **Direct Communication**: All API calls go directly from your machine to Google's servers (`googleapis.com`). There is no middleman or proxy server.
*   **Open Source**: The code is fully open source. You can audit exactly how your credentials are used in `src/google-client.ts`.

---

## Features

- **Advanced Analytics**: Query performance data with powerful filters (Regex supported).
    - *New*: Support for 'News', 'Discover', 'Image' search types.
    - *New*: 'Fresh' data support for real-time monitoring.
    - *New*: **Drop Attribution** to identify device-level traffic losses.
    - *New*: **Time Series Insights** with rolling averages and trend forecasting.
- **Trend Detection**: Automatically identify rising or falling trends in your traffic.
- **Anomaly Detection**: Spot unusual spikes or drops that need attention.
- **Sitemaps Management**: List, submit, and validte sitemaps.
- **URL Inspection**: Check real-time indexing status and mobile usability.
- **PageSpeed Insights**: Integrated performance and Core Web Vitals analysis.
- **Schema Validation**: Validate JSON-LD structured data.

---

## Quick Start

### 1. Run the Setup Wizard
First, use the interactive wizard to validate your credentials and get your configuration:

```bash
npx -y search-console-mcp setup
```

The wizard will guide you through:
- Creating a Google Service Account.
- Adding the account to Search Console.
- Validating your JSON key file.
- Generating the configuration for your MCP client.

### 2. Connect to an MCP Client

**Note:** The server uses `stdio` to communicate. Do not run `npx search-console-mcp` directly in your terminal; it is meant to be run by an MCP client like Claude Desktop or Cursor.

#### Claude Desktop Configuration
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
| `analytics_drop_attribution` | **[NEW]** Attribute traffic drops to mobile/desktop or correlate with known Google Algorithm Updates. |
| `analytics_time_series` | **[NEW]** Advanced time series with rolling averages, seasonality detection, and forecasting. |
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
| `sites_health_check` | **[NEW]** Run a health check on one or all sites. Checks WoW performance, sitemaps, and anomalies. |
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
