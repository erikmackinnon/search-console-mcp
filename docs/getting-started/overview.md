---
title: "Overview"
description: "What is search-console-mcp?"
---

**search-console-mcp** is an open-source implementation of the [Model Context Protocol](https://modelcontextprotocol.io) that gives AI agents direct, structured access to **Google Search Console (GSC)** and **Bing Webmaster Tools**.

Unlike simple API wrappers, this project focuses on providing **SEO Intelligence Tools**. Instead of just asking an agent to "look at my data," you can give it tools to "find quick wins," "detect traffic anomalies," or "submit URLs instantly."

## Key Capabilities

*   **Multi-Engine Support:** Manage valid sites and data for both Google and Bing in one place.
*   **Advanced Analytics:** Go beyond basic queries with multi-dimensional analysis, rolling averages, and drop attribution for both search engines.
*   **SEO Insights:** Deterministic detection of cannibalization, Striking Distance keywords, and "Low-Hanging Fruit."
*   **Site Health Check:** Automated diagnostics across all your properties — performance trends, sitemap status, and anomaly detection in one call.
*   **Instant Indexing:** Use **IndexNow** to instantly notify Bing and other engines of content changes.
*   **Sitemap Control:** List, submit, and delete sitemaps.
*   **URL Inspection:** Check the indexing status of individual pages on Google and Bing.
*   **PageSpeed Integration:** Measure performance and Core Web Vitals directly within your SEO workflow.

## The Problem

Working with SEO data in LLMs usually involves:
1.  Exporting CSVs.
2.  Uploading them to a chat window.
3.  Hoping the model calculates standard deviations or trends correctly.

## The Solution

With this MCP server, the agent has a "toolbox." When you ask "Why did my traffic drop?", the agent doesn't guess. It calls `analytics_time_series` to check for anomalies, `inspect_url` to see if pages were de-indexed, and `seo_insights` to check for ranking shifts.

## Supported Clients

This server works with any MCP-compatible client, including:
*   [Claude Desktop](https://claude.ai/download)
*   [Cursor](https://cursor.com)
*   [LibreChat](https://librechat.ai)
*   Custom agent implementations using the MCP SDK.
