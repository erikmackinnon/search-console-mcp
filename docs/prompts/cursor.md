---
title: "Cursor Prompts"
description: "Using SEO data to drive your development workflow."
---

Cursor allows you to use SEO data directly in your IDE. This is perfect for developers who want to prioritize performance fixes or content updates based on real traffic.

## The "Performance Prioritizer" Prompt
Use this in the Chat window to find which files need optimization.

```markdown
Run a PageSpeed report for my top 5 most visited pages on mobile using the search-console MCP. 
Cross-reference the results with my local file structure. 
Which React components or CSS files are most likely responsible for the 'Largest Contentful Paint' (LCP) issues on these pages?
```

## The "Content Update" Prompt
Use this when you want to update metadata or copy.

```markdown
Find any 'Low CTR Opportunities' for the current site. 
Compare the queries discovered with the current <title> and <meta description> tags in my codebase for those pages. 
Suggest improved, keyword-optimized titles that are likely to increase my CTR.
```

## Why these work well
*   **Contextual Awareness:** Cursor knows your code. By using the MCP, it also knows your *results*. This bridge allows it to make code suggestions based on search performance.
*   **Zero-Context Switching:** You don't have to leave your editor to know that your recent deploy slowed down your most important landing page.
