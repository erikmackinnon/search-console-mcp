---
title: "Claude Desktop Prompts"
description: "Optimized prompts for analyzing SEO in Claude."
---

Claude is excellent at synthesizing the deterministic data from our MCP server into deep strategic insights.

## The "SEO Audit" Prompt
Use this to get a comprehensive view of your site's health.

```markdown
Run a comprehensive SEO audit for https://example.com. 
1. Use the recommendations tool to find high-level opportunities.
2. Check for any keyword cannibalization.
3. Compare the last 28 days to the previous period and summarize the biggest winners and losers.
4. Provide a prioritized list of 3 actions I should take today to increase traffic.
```

## The "Traffic Drop Detective" Prompt
Use this when you notice a decline.

```markdown
My traffic for https://example.com has dropped recently. 
1. Use the time-series tool to find the exact date the drop started.
2. Tell me which pages and queries saw the biggest decrease in clicks.
3. Check the PageSpeed and Indexing status of those pages.
4. Act as a senior SEO consultant and attribute this drop to a specific cause (e.g., technical, algorithm, or seasonality).
```

## Why these work well
*   **Chained Tool Use:** These prompts encourage Claude to use multiple tools in sequence before answering.
*   **Role Prompting:** By asking Claude to "Act as a senior SEO consultant," you improve the quality of the qualitative reasoning it adds to the quantitative data.
*   **Structured Outputs:** Requesting a "prioritized list" forces the model to weigh different findings against each other.
