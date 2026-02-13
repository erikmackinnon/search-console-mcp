---
title: "First Queries"
description: "Testing your SEO agent for the first time."
---

Once the server is installed and authenticated, it's time to test it. Open your MCP-compatible client (like Claude Desktop) and start a conversation.

## Step 1: Verify Connection

Start by asking the agent what it can see. This verifies that the authentication is working.

**User Prompt:**
> "List the sites I have access to in Search Console."

**Expected Agent Response:**
> "I can see the following sites:
> 1. https://example.com
> 2. https://myblog.org"

## Step 2: Get a Basic Performance Summary

Now, ask for a high-level overview of a specific site.

**User Prompt:**
> "Give me a summary of how https://example.com performed in the last 28 days compared to the period before."

The agent will likely use the `compare_periods` tool to give you a breakdown of clicks, impressions, and CTR changes.

## Step 3: Run an Intelligence Tool

This is where the power of the MCP shines. Instead of asking for data, ask for an analysis.

**User Prompt:**
> "Can you find any 'quick wins' for https://example.com? I'm looking for pages ranking just off the first page that have high impressions."

The agent will use the `seo_quick_wins` tool, which performs a deterministic filter to identify the best opportunities.

## Step 4: Run a Site Health Check

Now try the health check tool to get an instant diagnostic across your properties.

**User Prompt:**
> "Run a health check on all my sites and tell me which ones need attention."

The agent will use the `sites_health_check` tool to check performance trends, sitemap status, and traffic anomalies — returning a status of healthy, warning, or critical for each site.

## Tips for Success

*   **Specify the Site:** Always include the `siteUrl` in your prompt if you have access to multiple sites.
*   **Be Outcome-Oriented:** Instead of "show me my clicks," say "analyze why my clicks dropped."
*   **Context is King:** Tell the agent *what* the site is about to get better qualitative insights.
