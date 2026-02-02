# Google Search Console MCP Server

A Model Context Protocol (MCP) server that interfaces with the Google Search Console API.

## Features

- **Sites Management**: List, add, and delete sites.
- **Sitemaps**: Manage sitemaps for your sites.
- **Search Analytics**: Query performance data (clicks, impressions, CTR, position) with advanced filtering.
- **Performance Summary**: Get quick aggregated metrics for a site.
- **URL Inspection**: Inspect the indexing status of specific URLs.

## Requirements

- Node.js 16+
- A Google Cloud Project with the Google Search Console API enabled.
- A Service Account with appropriate permissions (or OAuth2 credentials).

## Installation

```bash
npm install
```

## Configuration

You need to provide credentials for the Google Search Console API. You can do this in two ways:

### 1. File-based Credentials (Standard)

Set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to the path of your service account JSON key file.

```bash
export GOOGLE_APPLICATION_CREDENTIALS="path/to/your/service-account-key.json"
```

### 2. Environment Variables (Cloudflare/Serverless)

If you cannot use a file (e.g., in some serverless environments), you can provide the credentials via environment variables:

- `GOOGLE_CLIENT_EMAIL`: The service account email.
- `GOOGLE_PRIVATE_KEY`: The private key (include the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines).

## Build

```bash
npm run build
```

## Testing

```bash
npm test
```

## Usage

To run the server with the MCP CLI or integration:

```bash
node dist/index.js
```

### Tools

- `sites_list`: List all sites.
- `sites_add`: Add a site (args: `siteUrl`).
- `sites_delete`: Delete a site (args: `siteUrl`).
- `sites_get`: Get site details (args: `siteUrl`).
- `sitemaps_list`: List sitemaps (args: `siteUrl`).
- `sitemaps_submit`: Submit sitemap (args: `siteUrl`, `feedpath`).
- `sitemaps_delete`: Delete sitemap (args: `siteUrl`, `feedpath`).
- `analytics_query`: Query analytics (args: `siteUrl`, `startDate`, `endDate`, etc.).
- `analytics_performance_summary`: Get aggregated performance metrics (args: `siteUrl`, `days`).
- `inspection_inspect`: Inspect URL (args: `siteUrl`, `inspectionUrl`).

### Resources

- `sites://list`: A JSON resource listing all sites the user has access to.

### Prompts

- `analyze-site-performance`: A pre-configured prompt to analyze a site's performance over the last 28 days.
