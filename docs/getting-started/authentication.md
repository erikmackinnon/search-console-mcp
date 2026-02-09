---
title: "Authentication"
description: "Setting up Google Cloud credentials for Search Console."
---

To use this MCP server, you must authenticate with the Google Search Console API. We use **Service Accounts** because they provide the most reliable "headless" access for AI agents.

## 1. Create a Service Account

1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a new project (or select an existing one).
3.  Go to **IAM & Admin** > **Service Accounts**.
4.  Click **Create Service Account**.
5.  Give it a name (e.g., `seo-agent`) and click **Create and Continue**.
6.  (Optional) Assign a role. You don't actually need project-level roles for Search Console access, but "Viewer" is safe.
7.  Click **Done**.

## 2. Generate a JSON Key

1.  In the Service Accounts list, click on your new account.
2.  Select the **Keys** tab.
3.  Click **Add Key** > **Create new key**.
4.  Select **JSON** and click **Create**.
5.  A JSON file will download to your computer. **Keep this file secure.**

## 3. Enable the APIs

You must enable the following APIs in your Google Cloud Project:
*   [Google Search Console API](https://console.cloud.google.com/apis/library/searchconsole.googleapis.com)
*   [PageSpeed Insights API](https://console.cloud.google.com/apis/library/pagespeedonline.googleapis.com) (Optional, for performance tools)

## 4. Grant Access in Search Console

Finally, you must give your Service Account permission to see your data:

1.  Open the [Google Search Console](https://search.google.com/search-console).
2.  Go to **Settings** > **Users and permissions**.
3.  Click **Add User**.
4.  Enter the **Service Account Email** (e.g., `seo-agent@your-project.iam.gserviceaccount.com`).
5.  Select Permissions:
    *   **Full:** Required for sitemap submission and site management.
    *   **Restricted/Owner:** As needed.
6.  Click **Add**.

<Note>
 It can take a few minutes for the permissions to propagate. If the MCP server returns "Permission denied," wait 5 minutes and try again.
</Note>
