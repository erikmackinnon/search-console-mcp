# Google Search Console MCP Server

A Model Context Protocol (MCP) server that provides AI agents with access to Google Search Console data.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Quick Start

For users with an MCP-compatible client (like Claude Desktop):

```bash
npx google-search-console-mcp
```

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Google Cloud Setup](#google-cloud-setup)
- [MCP Client Configuration](#mcp-client-configuration)
- [Local Development](#local-development)
- [Tools Reference](#tools-reference)
- [Resources](#resources)
- [Prompts](#prompts)

---

## Features

- **Sites Management**: List, add, and delete sites
- **Sitemaps**: List, submit, get, and delete sitemaps
- **Search Analytics**: Query performance data with advanced filtering and pagination
- **Period Comparison**: Compare metrics between two date ranges
- **Top Queries/Pages**: Get top performing queries and pages
- **URL Inspection**: Check indexing status of specific URLs
- **AI Documentation**: Built-in docs for AI agents to understand GSC concepts

---

## Installation

### Option 1: Use with npx (Recommended)

No installation needed. Configure your MCP client to run:

```bash
npx google-search-console-mcp
```

### Option 2: Global Install

```bash
npm install -g google-search-console-mcp
google-search-console-mcp
```

### Option 3: Clone for Development

```bash
git clone https://github.com/saurabhsharma2u/search-console-mcp.git
cd search-console-mcp
npm install
npm run build
node dist/index.js
```

---

## Google Cloud Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Search Console API**:
   - Go to **APIs & Services** > **Library**
   - Search for "Google Search Console API"
   - Click **Enable**

### Step 2: Create a Service Account

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **Service Account**
3. Fill in the details and click **Create**
4. Skip the optional steps and click **Done**
5. Click on the service account email to open it
6. Go to the **Keys** tab > **Add Key** > **Create new key**
7. Select **JSON** and download the key file

### Step 3: Grant Access in Search Console

1. Go to [Google Search Console](https://search.google.com/search-console/)
2. Select your property
3. Go to **Settings** > **Users and permissions**
4. Click **Add user**
5. Enter the service account email (e.g., `my-service@project.iam.gserviceaccount.com`)
6. Set permission to **Full** (for write operations) or **Restricted** (read-only)

### Step 4: Configure Credentials

**Option A: File-based (Local Development)**

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/service-account-key.json"
```

**Option B: Environment Variables (Serverless/Cloudflare)**

```bash
export GOOGLE_CLIENT_EMAIL="your-service-account@project.iam.gserviceaccount.com"
export GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

---

## MCP Client Configuration

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "google-search-console": {
      "command": "npx",
      "args": ["google-search-console-mcp"],
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "/path/to/your/service-account-key.json"
      }
    }
  }
}
```

### Generic MCP Client

```json
{
  "name": "google-search-console",
  "command": "npx",
  "args": ["google-search-console-mcp"],
  "env": {
    "GOOGLE_APPLICATION_CREDENTIALS": "/path/to/your/service-account-key.json"
  }
}
```

---

## Local Development

### Setup

```bash
# Clone the repository
git clone https://github.com/saurabhsharma2u/search-console-mcp.git
cd search-console-mcp

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your credentials

# Build
npm run build

# Run tests
npm test

# Run the server
node dist/index.js
```

### Project Structure

```
src/
├── index.ts          # MCP server entry point
├── google-client.ts  # Google API authentication
├── errors.ts         # Error handling utilities
├── docs/             # Embedded documentation for AI
│   ├── dimensions.ts
│   ├── filters.ts
│   ├── search-types.ts
│   └── patterns.ts
└── tools/            # Tool implementations
    ├── sites.ts
    ├── sitemaps.ts
    ├── analytics.ts
    └── inspection.ts
```

---

## Tools Reference

### Sites

| Tool | Description | Arguments |
|------|-------------|-----------|
| `sites_list` | List all sites | none |
| `sites_add` | Add a site | `siteUrl` |
| `sites_delete` | Delete a site | `siteUrl` |
| `sites_get` | Get site details | `siteUrl` |

### Sitemaps

| Tool | Description | Arguments |
|------|-------------|-----------|
| `sitemaps_list` | List sitemaps | `siteUrl` |
| `sitemaps_get` | Get sitemap details | `siteUrl`, `feedpath` |
| `sitemaps_submit` | Submit sitemap | `siteUrl`, `feedpath` |
| `sitemaps_delete` | Delete sitemap | `siteUrl`, `feedpath` |

### Analytics

| Tool | Description | Arguments |
|------|-------------|-----------|
| `analytics_query` | Query search analytics with filters | `siteUrl`, `startDate`, `endDate`, `dimensions?`, `type?`, `limit?`, `startRow?`, `filters?` |
| `analytics_performance_summary` | Get aggregate metrics for N days | `siteUrl`, `days?` |
| `analytics_compare_periods` | Compare two date ranges | `siteUrl`, `period1Start`, `period1End`, `period2Start`, `period2End` |
| `analytics_top_queries` | Get top queries | `siteUrl`, `days?`, `limit?`, `sortBy?` |
| `analytics_top_pages` | Get top pages | `siteUrl`, `days?`, `limit?`, `sortBy?` |

### Inspection

| Tool | Description | Arguments |
|------|-------------|-----------|
| `inspection_inspect` | Inspect URL index status | `siteUrl`, `inspectionUrl`, `languageCode?` |

---

## Resources

AI agents can read these built-in documentation resources:

| URI | Description |
|-----|-------------|
| `sites://list` | List of all sites (JSON) |
| `docs://dimensions` | Available dimensions reference |
| `docs://filters` | Filter operators and examples |
| `docs://search-types` | Search types (web, image, video, etc.) |
| `docs://patterns` | Common usage patterns and recipes |

---

## Prompts

Pre-configured analysis workflows for AI agents:

| Prompt | Description | Arguments |
|--------|-------------|-----------|
| `analyze-site-performance` | Analyze site's 28-day performance | `siteUrl` |
| `compare-performance` | Compare this week vs last week | `siteUrl` |
| `find-declining-pages` | Find pages losing traffic | `siteUrl` |
| `keyword-opportunities` | Find low-CTR high-impression queries | `siteUrl` |
| `new-content-impact` | Analyze new content performance | `siteUrl`, `pageUrl` |
| `mobile-vs-desktop` | Compare device performance | `siteUrl` |

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

## Roadmap

See [ROADMAP.md](./ROADMAP.md) for planned features.

## License

MIT - see [LICENSE](./LICENSE)
