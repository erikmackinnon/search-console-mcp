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
  startRow?: number;
}

export interface PerformanceSummary {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  startDate: string;
  endDate: string;
}

export interface PeriodComparison {
  period1: PerformanceSummary;
  period2: PerformanceSummary;
  changes: {
    clicks: number;
    clicksPercent: number;
    impressions: number;
    impressionsPercent: number;
    ctr: number;
    ctrPercent: number;
    position: number;
    positionPercent: number;
  };
}

export interface TopItem {
  key: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface TopItemsResult {
  items: TopItem[];
  startDate: string;
  endDate: string;
  totalRows: number;
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

  // Add pagination support
  if (options.startRow !== undefined && options.startRow > 0) {
    requestBody.startRow = options.startRow;
  }

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

/**
 * Compare performance between two date periods.
 */
export async function comparePeriods(
  siteUrl: string,
  period1Start: string,
  period1End: string,
  period2Start: string,
  period2End: string
): Promise<PeriodComparison> {
  const [period1Rows, period2Rows] = await Promise.all([
    queryAnalytics({ siteUrl, startDate: period1Start, endDate: period1End, limit: 1 }),
    queryAnalytics({ siteUrl, startDate: period2Start, endDate: period2End, limit: 1 })
  ]);

  const period1: PerformanceSummary = {
    clicks: period1Rows[0]?.clicks ?? 0,
    impressions: period1Rows[0]?.impressions ?? 0,
    ctr: period1Rows[0]?.ctr ?? 0,
    position: period1Rows[0]?.position ?? 0,
    startDate: period1Start,
    endDate: period1End
  };

  const period2: PerformanceSummary = {
    clicks: period2Rows[0]?.clicks ?? 0,
    impressions: period2Rows[0]?.impressions ?? 0,
    ctr: period2Rows[0]?.ctr ?? 0,
    position: period2Rows[0]?.position ?? 0,
    startDate: period2Start,
    endDate: period2End
  };

  const calcChange = (current: number, previous: number) => current - previous;
  const calcPercent = (current: number, previous: number) =>
    previous === 0 ? (current > 0 ? 100 : 0) : ((current - previous) / previous) * 100;

  return {
    period1,
    period2,
    changes: {
      clicks: calcChange(period1.clicks, period2.clicks),
      clicksPercent: calcPercent(period1.clicks, period2.clicks),
      impressions: calcChange(period1.impressions, period2.impressions),
      impressionsPercent: calcPercent(period1.impressions, period2.impressions),
      ctr: calcChange(period1.ctr, period2.ctr),
      ctrPercent: calcPercent(period1.ctr, period2.ctr),
      position: calcChange(period1.position, period2.position),
      positionPercent: calcPercent(period1.position, period2.position)
    }
  };
}

/**
 * Get top queries by clicks or impressions.
 */
export async function getTopQueries(
  siteUrl: string,
  options: {
    days?: number;
    limit?: number;
    sortBy?: 'clicks' | 'impressions';
    filters?: AnalyticsOptions['filters'];
  } = {}
): Promise<TopItemsResult> {
  const DATA_DELAY_DAYS = 3;
  const days = options.days ?? 28;
  const limit = options.limit ?? 10;

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
    dimensions: ['query'],
    limit,
    filters: options.filters
  });

  // Sort by clicks or impressions
  const sortKey = options.sortBy ?? 'clicks';
  const sortedRows = [...rows].sort((a, b) => (b[sortKey] ?? 0) - (a[sortKey] ?? 0));

  return {
    items: sortedRows.map(row => ({
      key: row.keys?.[0] ?? '',
      clicks: row.clicks ?? 0,
      impressions: row.impressions ?? 0,
      ctr: row.ctr ?? 0,
      position: row.position ?? 0
    })),
    startDate: startDateStr,
    endDate: endDateStr,
    totalRows: sortedRows.length
  };
}

/**
 * Get top pages by clicks or impressions.
 */
export async function getTopPages(
  siteUrl: string,
  options: {
    days?: number;
    limit?: number;
    sortBy?: 'clicks' | 'impressions';
    filters?: AnalyticsOptions['filters'];
  } = {}
): Promise<TopItemsResult> {
  const DATA_DELAY_DAYS = 3;
  const days = options.days ?? 28;
  const limit = options.limit ?? 10;

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
    dimensions: ['page'],
    limit,
    filters: options.filters
  });

  // Sort by clicks or impressions
  const sortKey = options.sortBy ?? 'clicks';
  const sortedRows = [...rows].sort((a, b) => (b[sortKey] ?? 0) - (a[sortKey] ?? 0));

  return {
    items: sortedRows.map(row => ({
      key: row.keys?.[0] ?? '',
      clicks: row.clicks ?? 0,
      impressions: row.impressions ?? 0,
      ctr: row.ctr ?? 0,
      position: row.position ?? 0
    })),
    startDate: startDateStr,
    endDate: endDateStr,
    totalRows: sortedRows.length
  };
}
