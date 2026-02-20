
# Search Console MCP

A Model Context Protocol (MCP) server that transforms how you interact with **Google Search Console** and **Bing Webmaster Tools**. Stop exporting CSVs and start asking questions.

[📚 View Documentation](https://searchconsolemcp.mintlify.app/)

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

#### 🔍 The Traffic Detective
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

#### 🔍 Multi-Engine Comparison
> "Compare my performance between Google and Bing for the last 30 days. Which keywords are ranking better on Bing but have lower traffic on Google?"

---

## 🔐 Authentication (Desktop Flow)

Search Console MCP uses a **Secure Desktop Flow**. This provides high-security, professional grade authentication for your Google account:
- **Multi-Account Support**: Automatically detects and stores separate tokens for different Google accounts based on your email.
- **System Keychain Primary**: Tokens are stored in your OS's native credential manager (macOS Keychain, Windows Credential Manager, or Linux Secret Service).
- **AES-256-GCM Hardware-Bound Encryption**: Fallback storage is encrypted with AES-256-GCM using a key derived from your unique hardware machine ID. Tokens stolen from your machine cannot be decrypted on another computer.
- **Silent Background Refresh**: Tokens auto-refresh silently when they expire.

### 🚀 Step 1 — Initiate Login
Run the following command to start the authorization process:
```bash
npx search-console-mcp setup
```

The CLI will:
1. Briefly start a secure local server to handle the redirect.
2. Open your default web browser to the Google Authorization page.
3. Automatically fetch your email after authorization to label your credentials securely.

### 🔑 Step 2 — Logout & Management
To wipe your credentials from both the keychain and the disk:
```bash
# Logout of the default account
npx search-console-mcp logout

# Logout of a specific account
npx search-console-mcp logout user@gmail.com
```

---

## 🔑 Alternative: Service Account (Advanced)

For server-side environments or automated tasks where interactive login isn't possible, you can use a Google Cloud Service Account.

### Setup:
1.  **Create Service Account**: Go to the [Google Cloud Console](https://console.cloud.google.com/iam-admin/serviceaccounts) and create a service account.
2.  **Generate Key**: Click "Keys" > "Add Key" > "Create new key" (JSON). Download this file.
3.  **Share Access**: In Google Search Console, add the service account's email address (e.g., `account@project.iam.gserviceaccount.com`) as a user with at least "Full" or "Restricted" permissions.
4.  **Configure**: Point the server to your key file:
    ```bash
    export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/key.json"
    ```

---

## 🔑 Bing Webmaster Tools (API Key)

To access Bing data, you simply need an API Key.

### Setup:
1.  **Get Your API Key**: Go to [Bing Webmaster Tools Settings](https://www.bing.com/webmasters/settings/api).
2.  **Configure**: Set the API key in your environment:
    ```bash
    export BING_API_KEY="your-api-key-here"
    ```
3.  **IndexNow**: Bing tools also support **IndexNow** for instant URL submission.

---


## 🛡️ Fort Knox Security

This MCP server implements a multi-layered security architecture:

*   **Keychain Integration**: Primarily uses the **macOS Keychain**, **Windows Credential Manager**, or **libsecret (Linux)** to store tokens.
*   **Hardware-Bound Vault**: Fallback tokens are stored in `~/.search-console-mcp-tokens.enc` and encrypted with **AES-256-GCM**.
*   **Machine Fingerprinting**: The encryption key is derived from your unique hardware UUID and OS user. The encrypted file is useless if moved to another machine.
*   **Minimalist Storage**: Only the `refresh_token` and `expiry_date` are stored.
*   **Strict Unix Permissions**: The fallback file is created with `mode 600` (read/write only by your user).

---

## Tools Reference

### Google Analytics
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

### Bing Webmaster Tools
| Tool | Description |
|------|-------------|
| `bing_sites_list` | List all verified sites in Bing. |
| `bing_analytics_query` | Query search performance from Bing. |
| `bing_opportunity_finder` | Find low-hanging fruit keywords on Bing. |
| `bing_seo_recommendations` | Get prioritized SEO insights for Bing. |
| `bing_url_info` | Detailed indexing and crawl info for a URL (Bing). |
| `bing_index_now` | **[NEW]** Instantly notify search engines of changes. |
| `bing_crawl_issues` | List crawl issues detected by Bing. |
| `bing_analytics_detect_anomalies` | Detect daily spikes or drops in Bing traffic. |
| `bing_analytics_time_series` | Advanced time series analysis for Bing. |
| `bing_sitemaps_list` / `bing_sitemaps_submit` | Manage sitemaps in Bing. |



## License

[MIT](LICENSE)
[Contributing](CONTRIBUTING.md)
