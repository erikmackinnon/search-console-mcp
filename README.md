
# Google Search Console MCP Server

Search Console MCP exposes Google Search Console data as structured, queryable tools for AI agents. Stop exporting CSVs and start asking questions.

[📚 View Documentation](https://searchconsolemcp.mintlify.app/)

---

### [🏠 Overview](#) | [🎯 Prompts](#-magic-prompts) | [🚀 Quick Start](#-quick-start) | [🛠️ Tools](#-tools-reference)

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

## 🎯 Assumptions for AI Agents

AI agents interacting with this MCP server should assume:
1. **Ready to Query**: Authentication has already been completed by the user.
2. **Silent Refresh**: Tokens auto-refresh silently in the background.
3. **Account-Based Access**: The authenticated account determines which properties are accessible.
4. **No Manual Invite Needed**: If no properties are found, it's likely the wrong Google account was used. No manual email additions to Search Console are required.

---

## 🏰 Property Access Model

Search Console access is tied directly to the Google account used during OAuth.
- The MCP server calls `sites.list` and returns *only* the properties that account has access to.
- It cannot access properties outside of granted permissions.

---

## 🛠️ Tools Reference

### Analytics
| Tool | Description |
|------|-------------|
| `analytics_query` | Master tool for raw data. Supports `dimensions`, `filters`, `aggregationType` (byPage/byProperty), `dataState` (final/all), and `type` (web/image/news/discover). |
| `analytics_trends` | Detect trends (rising/falling) for specific queries or pages. |
| `analytics_anomalies` | Detect statistical anomalies in daily traffic. |
| `analytics_drop_attribution` | Attribute traffic drops to mobile/desktop or correlate with known Google Algorithm Updates. |
| `analytics_time_series` | Advanced time series with rolling averages, seasonality detection, and forecasting. |
| `analytics_compare_periods` | Compare two date ranges (e.g., WoW, MoM). |
| `seo_brand_vs_nonbrand` | Analyze performance split between Brand vs Non-Brand traffic. |

### SEO Opportunities
| Tool | Description |
|------|-------------|
| `seo_low_hanging_fruit` | Find keywords ranking in pos 5-20 with high impressions. |
| `seo_striking_distance` | Find keywords ranking 8-15 (Quickest ROI wins). |
| `seo_low_ctr_opportunities` | Find top ranking queries (pos 1-10) with poor CTR. |
| `seo_cannibalization` | Detect pages competing for the same query with traffic conflict. |
| `seo_lost_queries` | Identify queries that lost all traffic in the last 28 days. |

### Sites & Sitemaps
| Tool | Description |
|------|-------------|
| `sites_list` | List all verified sites. |
| `sites_health_check` | Run a health check on one or all sites. Checks WoW performance, sitemaps, and anomalies. |
| `sitemaps_list` / `sitemaps_submit` | Manage sitemaps. |

---

## 🛡️ Fort Knox Security

This MCP server implements a multi-layered security architecture:

*   **Keychain Integration**: Primarily uses the **macOS Keychain**, **Windows Credential Manager**, or **libsecret (Linux)** to store tokens.
*   **Hardware-Bound Vault**: Fallback tokens are stored in `~/.search-console-mcp-tokens.enc` and encrypted with **AES-256-GCM**.
*   **Machine Fingerprinting**: The encryption key is derived from your unique hardware UUID and OS user. The encrypted file is useless if moved to another machine.
*   **Minimalist Storage**: Only the `refresh_token` and `expiry_date` are stored.
*   **Strict Unix Permissions**: The fallback file is created with `mode 600` (read/write only by your user).

---

## License

MIT
