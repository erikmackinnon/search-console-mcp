import { getSearchConsoleClient } from '../google-client.js';

export interface AnalyticsOptions {
  siteUrl: string;
  startDate: string;
  endDate: string;
  dimensions?: string[];
  type?: string;
  filters?: Array<{
    dimension: string;
    operator: string;
    expression: string;
  }>;
  limit?: number;
}

export async function queryAnalytics(options: AnalyticsOptions) {
  const client = await getSearchConsoleClient();
  const requestBody: any = {
    startDate: options.startDate,
    endDate: options.endDate,
    dimensions: options.dimensions || [],
    type: options.type || 'web',
    rowLimit: options.limit || 1000,
  };

  if (options.filters) {
    requestBody.dimensionFilterGroups = [{
      filters: options.filters
    }];
  }

  const res = await client.searchanalytics.query({
    siteUrl: options.siteUrl,
    requestBody
  });

  return res.data.rows || [];
}

export async function getPerformanceSummary(siteUrl: string, days: number = 28) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);

  const rows = await queryAnalytics({
    siteUrl,
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    limit: 1
  });

  if (rows.length > 0) {
    return {
      clicks: rows[0].clicks,
      impressions: rows[0].impressions,
      ctr: rows[0].ctr,
      position: rows[0].position
    };
  }

  return { clicks: 0, impressions: 0, ctr: 0, position: 0 };
}
