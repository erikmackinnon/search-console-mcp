---
title: "Installation"
description: "Get up and running with Google and Bing in less than 2 minutes."
---

We designed `search-console-mcp` to work instantly with your favorite AI editor. No complex configuration required.

## Prerequisites

1.  **Node.js 18 or higher**
2.  **A verified Google Search Console or Bing Webmaster Tools property**

## 🚀 One-Line Setup

Run this command in your terminal. It will authenticate you with Google and generate the configuration you need.

```bash
npx search-console-mcp setup
```

The tool will open your browser for secure authentication and then display the exact code snippet to copy-paste into your config.

---

## Client Configuration

If you prefer to set it up manually, here are the instructions for the most popular clients.

### Claude Desktop

Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "search-console": {
      "command": "npx",
      "args": ["-y", "search-console-mcp"],
      "env": {
        "BING_API_KEY": "your-api-key-here",
        "GOOGLE_APPLICATION_CREDENTIALS": "/path/to/your/service-account.json"
      }
    }
  }
}
```

*That's it! Environment variables are optional and only needed if you are using a Bing API Key or a Google Service Account.*

### Cursor

1.  Open **Cursor Settings** (Cmd + ,).
2.  Navigate to **Features** > **MCP**.
3.  Click **+ Add New MCP Server**.
4.  Enter the following:
    *   **Name:** `Search Console`
    *   **Type:** `command`
    *   **Command:** `npx -y search-console-mcp`
5.  **Environment Variables (Optional):** Click **Edit** on your new server to add variables if needed:
    *   `BING_API_KEY`: For Bing integration.
    *   `GOOGLE_APPLICATION_CREDENTIALS`: For Google Service Account auth.

<Tip>
  If you see an error about "command not found," try using the full path to your node executable or `npm` prefix.
</Tip>

### VS Code

You can configure the server specifically for your workspace using the standard MCP extension.

1.  **Option A: Config File**
    Create a file named `.vscode/mcp.json` and add:

    ```json
    {
        "servers": {
            "search-console": {
                "command": "npx",
                "args": [
                    "-y",
                    "search-console-mcp"
                ],
                "env": {
                    "BING_API_KEY": "your-api-key-here",
                    "GOOGLE_APPLICATION_CREDENTIALS": "/path/to/your/service-account.json"
                }
            }
        }
    }
    ```

2.  **Option B: Command Palette**
    *   Open the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`).
    *   Search for **"MCP: Add Server"**.
    *   Enter the command: `npx -y search-console-mcp`.
