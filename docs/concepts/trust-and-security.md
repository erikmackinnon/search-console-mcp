---
title: "Trust and Security"
description: "Safe automation for your most valuable data."
---

Search Console data is sensitive. It reveals exactly what keywords your business depends on. We designed this MCP server with a "security-first" mindset.

## Zero Data Persistence

The `search-console-mcp` server does not have a database. It does not log your API keys or your performance data to any external server. 
*   **Authentication:** Happens locally using your JSON key file.
*   **Processing:** Happens in-memory during the request.
*   **Storage:** Nothing is saved once the process terminates.

## Explainability Over Everything

We believe agents should be able to explain *how* they reached a conclusion.
*   **Tool Proofs:** Advanced tools don't just say "Fix this." They provide the supporting data (clicks, benchmarks, thresholds) so you can verify the logic.
*   **No Black Boxes:** The intelligence tools are open-source. You can see exactly how a "cannibalization conflict" score is calculated in our [SEO engine](https://github.com/saurabhsharma2u/search-console-mcp/blob/main/src/tools/seo-insights.ts).

## Boundary Defenses

The MCP server is explicitly built **NOT** to do certain things:
*   **No Auto-Writing:** It does not generate content for your site. This prevents low-quality "AI slop" from being pushed to your pages.
*   **No Direct Site Editing:** It cannot change your HTML, CMS, or DNS settings.
*   **No Credential Leakage:** The server is designed to prevent leaking your service account email or project ID to the model unless explicitly required.

## Your Responsibilities

While the server is secure, you are responsible for:
1.  **Protecting your JSON key file.** Never commit it to a public repository.
2.  **Service Account Scope.** Only grant the Service Account access to the properties it needs.
3.  **Prompt Oversight.** Always review the agent's findings before making significant business decisions.
