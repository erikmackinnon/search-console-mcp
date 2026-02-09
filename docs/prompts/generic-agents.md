---
title: "Generic Agent Prompts"
description: "Universal prompts for any MCP-compatible agent."
---

If you are building your own agent or using a client not listed here, these prompts follow a "tool-first" structure that works across most LLMs.

## The "Search Discoverability" Check
Ensures your content is being found.

```markdown
1. List all sitemaps for https://example.com.
2. Check for any sitemap errors.
3. Find any pages in the sitemap that are NOT currently indexed by using the URL inspection tool on a sample of 5 pages.
```

## The "Portfolio Overview"
Useful if you manage multiple properties.

```markdown
1. List all sites in my Search Console account.
2. For each site, get the total clicks and impressions for the last 7 days.
3. Which site had the highest percentage growth in non-brand traffic?
```

## Common Tips for Custom Agents

*   **Specify Dimension:** When asking for analytics, specify if you want it by `query`, `page`, `country`, or `date`.
*   **Limit your scope:** LLMs work best when they process chunks of data. Instead of "Analyze everything," use "Analyze my top 50 pages."
*   **Ask for reasoning:** Always include "Explain why you reached these conclusions" at the end of your prompt to see the agent's logic.
