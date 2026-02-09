---
title: "Installation"
description: "How to set up the Search Console MCP server."
---

Setting up `search-console-mcp` is straightforward. You can run it directly using `npx` or install it globally.

## Prerequisites

1.  **Node.js 18 or higher.**
2.  **Google Cloud Service Account:** You need a JSON key file for a service account that has access to your Search Console properties. (See [Authentication](/getting-started/authentication) for details).

## Quick Start (npx)

The easiest way to get started is by using our built-in setup wizard:

```bash
npx search-console-mcp-setup
```

This wizard will help you:
*   Configure your Service Account key path.
*   Validate your credentials.
*   Generate the configuration snippet for Claude Desktop or Cursor.

## Manual Configuration

If you prefer to configure your client manually, you can run the server via `npx`:

```bash
npx search-console-mcp
```

### Environment Variables

The server looks for the following environment variables:

| Variable | Description |
| :--- | :--- |
| `GOOGLE_APPLICATION_CREDENTIALS` | Absolute path to your Google Service Account JSON key file. |

## Client Configuration

### Claude Desktop

Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "search-console": {
      "command": "npx",
      "args": ["-y", "search-console-mcp"],
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "/path/to/your/service-account-key.json"
      }
    }
  }
}
```

### Cursor

1.  Open **Cursor Settings**.
2.  Navigate to **Features** > **MCP**.
3.  Click **+ Add New MCP Server**.
4.  **Name:** `Search Console`
5.  **Type:** `command`
6.  **Command:** `GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json npx -y search-console-mcp`
