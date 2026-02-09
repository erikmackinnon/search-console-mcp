---
title: "Inspection & Performance"
description: "Monitoring indexing status and page speed."
---

Technical SEO is about ensuring your foundation is solid. These tools allow the agent to verify crawling and performance.

## Tools

### `inspect_url`
Checks the indexing status of a single URL in Google Search.
*   **When to use:** When a specific page isn't getting any traffic.
*   **What problem it solves:** Finding out if a page is blocked by robots.txt, redirected, or simply ignored by Google.

### `get_pagespeed`
Runs a full PageSpeed Insights analysis, returning Lighthouse scores and Core Web Vitals (CWV).
*   **When to use:** When a page's rankings are dropping despite good content.
*   **What problem it solves:** Identifying performance bottlenecks like LCP (Largest Contentful Paint) issues.

## Combining the Tools

The power of this MCP is the ability to combine these. An agent can:
1.  Notice a traffic drop on a specific page using **Analytics**.
2.  Check if it's still indexed using **Inspection**.
3.  Check if a recent code change slowed it down using **PageSpeed**.
4.  Tell you the exact root cause.

## Example Agent Prompts

#### 1. Debugging indexing issues
> "I just published https://example.com/new-post. Is it indexed? If not, does the URL inspection tool show any errors?"

#### 2. Performance Audit
> "Check the PageSpeed scores for my top 10 most visited pages on mobile. List any that have an LCP score over 2.5 seconds."

#### 3. Core Web Vitals Check
> "Run a Core Web Vitals report for the homepage and compare the results for mobile vs. desktop."
