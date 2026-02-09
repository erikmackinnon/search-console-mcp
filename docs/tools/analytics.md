---
title: "Analytics Tools"
description: "Mastering search performance data."
---

The Analytics tools are the foundation of your SEO agent's knowledge. They allow you to pull basic data or perform complex time-series analysis.

## Core Tools

### `query_analytics`
This is your primary tool for getting raw data. It supports filtering and dimension grouping.
*   **When to use:** When you need a specific list of keywords, pages, or country-level data.
*   **Best for:** "List the top 10 keywords for the last 30 days."

### `compare_periods`
Calculates the delta between two time windows.
*   **When to use:** When you need to see if you are growing or shrinking.
*   **Best for:** "Compare this week's performance to last week."

## Advanced Analysis

### `analytics_time_series`
The "brain" of our analytics suite. It calculates rolling averages (to smooth out weekend dips), detects seasonality, and provides simple forecasting.
*   **When to use:** To understand long-term trends or identify the exact day a drop started.
*   **What problem it solves:** Distinguishing between a "bad day" and a "downward trend."

## Example Agent Prompts

#### 1. Checking specific performance
> "Run a performance report for https://example.com comparing January to December. Segment the data by device (mobile vs. desktop)."

#### 2. Visualizing trends
> "Analyze the click trend for my top 5 keywords over the last 90 days. Use a 7-day rolling average to clean up the data."

#### 3. Regional analysis
> "Which country had the highest growth in CTR for keywords containing 'premium' in the last 6 months?"
