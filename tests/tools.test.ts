import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockSearchConsoleClient } from './mocks';
import { listSites, addSite, deleteSite, getSite } from '../src/tools/sites';
import { listSitemaps, submitSitemap, deleteSitemap, getSitemap } from '../src/tools/sitemaps';
import { queryAnalytics, getPerformanceSummary } from '../src/tools/analytics';
import { inspectUrl } from '../src/tools/inspection';

describe('Sites Tools', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should list sites', async () => {
    mockSearchConsoleClient.sites.list.mockResolvedValue({
      data: { siteEntry: [{ siteUrl: 'https://example.com' }] },
    });
    const sites = await listSites();
    expect(sites).toEqual([{ siteUrl: 'https://example.com' }]);
    expect(mockSearchConsoleClient.sites.list).toHaveBeenCalled();
  });

  it('should add a site', async () => {
    mockSearchConsoleClient.sites.add.mockResolvedValue({});
    const result = await addSite('https://example.com');
    expect(result).toContain('Successfully added site');
    expect(mockSearchConsoleClient.sites.add).toHaveBeenCalledWith({ siteUrl: 'https://example.com' });
  });

  it('should delete a site', async () => {
    mockSearchConsoleClient.sites.delete.mockResolvedValue({});
    const result = await deleteSite('https://example.com');
    expect(result).toContain('Successfully deleted site');
    expect(mockSearchConsoleClient.sites.delete).toHaveBeenCalledWith({ siteUrl: 'https://example.com' });
  });

  it('should get a site', async () => {
    mockSearchConsoleClient.sites.get.mockResolvedValue({ data: { siteUrl: 'https://example.com', permissionLevel: 'siteOwner' } });
    const result = await getSite('https://example.com');
    expect(result).toEqual({ siteUrl: 'https://example.com', permissionLevel: 'siteOwner' });
    expect(mockSearchConsoleClient.sites.get).toHaveBeenCalledWith({ siteUrl: 'https://example.com' });
  });
});

describe('Sitemaps Tools', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should list sitemaps', async () => {
        mockSearchConsoleClient.sitemaps.list.mockResolvedValue({
            data: { sitemap: [{ path: 'https://example.com/sitemap.xml' }] }
        });
        const sitemaps = await listSitemaps('https://example.com');
        expect(sitemaps).toEqual([{ path: 'https://example.com/sitemap.xml' }]);
        expect(mockSearchConsoleClient.sitemaps.list).toHaveBeenCalledWith({ siteUrl: 'https://example.com' });
    });

    it('should submit sitemap', async () => {
        mockSearchConsoleClient.sitemaps.submit.mockResolvedValue({});
        const result = await submitSitemap('https://example.com', 'https://example.com/sitemap.xml');
        expect(result).toContain('Successfully submitted sitemap');
        expect(mockSearchConsoleClient.sitemaps.submit).toHaveBeenCalledWith({
            siteUrl: 'https://example.com',
            feedpath: 'https://example.com/sitemap.xml'
        });
    });
});

describe('Analytics Tools', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should query analytics', async () => {
        const mockRows = [{ clicks: 100, impressions: 1000 }];
        mockSearchConsoleClient.searchanalytics.query.mockResolvedValue({
            data: { rows: mockRows }
        });

        const result = await queryAnalytics({
            siteUrl: 'https://example.com',
            startDate: '2023-01-01',
            endDate: '2023-01-31'
        });

        expect(result).toEqual(mockRows);
        expect(mockSearchConsoleClient.searchanalytics.query).toHaveBeenCalledWith(expect.objectContaining({
            siteUrl: 'https://example.com',
            requestBody: expect.objectContaining({
                startDate: '2023-01-01',
                endDate: '2023-01-31'
            })
        }));
    });

    it('should get performance summary', async () => {
        const mockRows = [{ clicks: 100, impressions: 1000, ctr: 0.1, position: 5 }];
        mockSearchConsoleClient.searchanalytics.query.mockResolvedValue({
            data: { rows: mockRows }
        });

        const result = await getPerformanceSummary('https://example.com');

        expect(result).toEqual({ clicks: 100, impressions: 1000, ctr: 0.1, position: 5 });
        expect(mockSearchConsoleClient.searchanalytics.query).toHaveBeenCalled();
    });
});

describe('Inspection Tools', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should inspect url', async () => {
        const mockResponse = { inspectionResult: { indexStatusResult: { status: 'VERDICT_PASS' } } };
        mockSearchConsoleClient.urlInspection.index.inspect.mockResolvedValue({
            data: mockResponse
        });

        const result = await inspectUrl('https://example.com', 'https://example.com/page');

        expect(result).toEqual(mockResponse);
        expect(mockSearchConsoleClient.urlInspection.index.inspect).toHaveBeenCalledWith({
            requestBody: {
                inspectionUrl: 'https://example.com/page',
                siteUrl: 'https://example.com',
                languageCode: 'en-US'
            }
        });
    });
});
