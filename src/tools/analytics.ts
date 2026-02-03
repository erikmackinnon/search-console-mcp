import { getSearchConsoleClient } from '../google-client.js';
import { searchconsole_v1 } from 'googleapis';

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

export interface PerformanceSummary {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  startDate: string;
  endDate: string;
}

export async function queryAnalytics(options: AnalyticsOptions): Promise<searchconsole_v1.Schema$ApiDataRow[]> {
  const client = await getSearchConsoleClient();
  const requestBody: searchconsole_v1.Schema$SearchAnalyticsQueryRequest = {
    startDate: options.startDate,
    endDate: options.endDate,
    dimensions: options.dimensions || [],
    type: options.type || 'web',
    rowLimit: Math.min(options.limit || 1000, 25000),
  };

  if (options.filters && options.filters.length > 0) {
    requestBody.dimensionFilterGroups = [{
      filters: options.filters.map(f => ({
        dimension: f.dimension,
        operator: f.operator,
        expression: f.expression
      }))
    }];
  }

  const res = await client.searchanalytics.query({
    siteUrl: options.siteUrl,
    requestBody
  });

  return res.data.rows || [];
}

/**
 * Get aggregate performance metrics for the last N days.
 * Accounts for GSC data delay by using data from 3 days ago.
 */
export async function getPerformanceSummary(siteUrl: string, days: number = 28): Promise<PerformanceSummary> {
  // GSC data is typically delayed by 2-3 days, so we end 3 days ago
  const DATA_DELAY_DAYS = 3;

  const endDate = new Date();
  endDate.setDate(endDate.getDate() - DATA_DELAY_DAYS);

  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - days);

  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];

  const rows = await queryAnalytics({
    siteUrl,
    startDate: startDateStr,
    endDate: endDateStr,
    limit: 1
  });

  if (rows.length > 0) {
    return {
      clicks: rows[0].clicks ?? 0,
      impressions: rows[0].impressions ?? 0,
      ctr: rows[0].ctr ?? 0,
      position: rows[0].position ?? 0,
      startDate: startDateStr,
      endDate: endDateStr
    };
  }

  return {
    clicks: 0,
    impressions: 0,
    ctr: 0,
    position: 0,
    startDate: startDateStr,
    endDate: endDateStr
  };
}
