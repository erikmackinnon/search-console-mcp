export interface BingSite {
    Url: string;
    State: string;
    Role: string;
}

export interface BingQueryStats {
    Query: string;
    Clicks: number;
    Impressions: number;
    CTR: number;
    AvgPosition: number;
    Date: string;
}

export interface BingPageStats {
    Query: string; // The API returns URL in the 'Query' field for GetPageStats
    Clicks: number;
    Impressions: number;
    CTR: number;
    AvgPosition: number;
    Date: string;
}

export interface BingKeywordStats {
    Keyword: string;
    Impressions: number;
    Date: string;
}

export interface BingCrawlIssue {
    Url: string;
    IssueType: string;
    FirstSeen: string;
    LastSeen: string;
}

export interface BingUrlSubmissionQuota {
    DailyQuota: number;
    RemainingQuota: number;
}

export interface BingRankAndTrafficStats {
    Date: string;
    Clicks: number;
    Impressions: number;
    AvgPosition: number;
}

export interface BingQueryPageStats {
    Query: string;
    Page: string;
    Clicks: number;
    Impressions: number;
    Date: string;
}

export interface BingCrawlStats {
    Date: string;
    PagesIndexed: number;
    PagesCrawled: number;
    CrawlErrors: number;
}

export interface BingUrlInfo {
    Url: string;
    HttpCode: number;
    LastCrawled: string;
    InIndex: boolean;
    Issues: string[];
}

export interface BingLinkCount {
    Url: string;
    InboundLinks: number;
}

export interface BingRelatedKeyword {
    Keyword: string;
    SearchVolume: number;
}

export class BingClient {
    private apiKey: string;
    private baseUrl = 'https://ssl.bing.com/webmaster/api.svc/json';

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    private async request<T>(method: string, params: Record<string, any> = {}, isPost = false): Promise<T> {
        const url = new URL(`${this.baseUrl}/${method}`);
        url.searchParams.append('apikey', this.apiKey);

        const options: any = {
            method: isPost ? 'POST' : 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (isPost) {
            options.body = JSON.stringify(params);
        } else {
            for (const [key, value] of Object.entries(params)) {
                url.searchParams.append(key, String(value));
            }
        }

        const response = await fetch(url.toString(), options);
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Bing API error (${method}): ${response.status} ${error}`);
        }

        const data = await response.json() as any;
        if (data && data.hasOwnProperty('d')) {
            return data.d as T;
        }
        return data as T;
    }

    async getSiteList(): Promise<BingSite[]> {
        return this.request<BingSite[]>('GetUserSites');
    }

    async getQueryStats(siteUrl: string): Promise<BingQueryStats[]> {
        return this.request<BingQueryStats[]>('GetQueryStats', { siteUrl }, true);
    }

    async getPageStats(siteUrl: string): Promise<BingPageStats[]> {
        return this.request<BingPageStats[]>('GetPageStats', { siteUrl }, true);
    }

    async getPageQueryStats(siteUrl: string, pageUrl: string): Promise<BingQueryStats[]> {
        return this.request<BingQueryStats[]>('GetPageQueryStats', { siteUrl, pageUrl }, true);
    }

    async submitSitemap(siteUrl: string, sitemapUrl: string): Promise<void> {
        await this.request<void>('SubmitSitemap', { siteUrl, sitemapUrl }, true);
    }

    async getSitemaps(siteUrl: string): Promise<any[]> {
        return this.request<any[]>('GetSitemaps', { siteUrl }, true);
    }

    async getKeywordStats(q: string, country?: string, language?: string): Promise<BingKeywordStats[]> {
        return this.request<BingKeywordStats[]>('GetKeywordStats', { q, country, language }, true);
    }

    async getCrawlIssues(siteUrl: string): Promise<BingCrawlIssue[]> {
        return this.request<BingCrawlIssue[]>('GetCrawlIssues', { siteUrl }, true);
    }

    async getUrlSubmissionQuota(siteUrl: string): Promise<BingUrlSubmissionQuota> {
        return this.request<BingUrlSubmissionQuota>('GetUrlSubmissionQuota', { siteUrl }, true);
    }

    async submitUrl(siteUrl: string, url: string): Promise<void> {
        return this.request<void>('SubmitUrl', { siteUrl, url }, true);
    }

    async submitUrlBatch(siteUrl: string, urlList: string[]): Promise<void> {
        return this.request<void>('SubmitUrlBatch', { siteUrl, urlList }, true);
    }

    async getQueryPageStats(siteUrl: string): Promise<BingQueryPageStats[]> {
        return this.request<BingQueryPageStats[]>('GetQueryPageStats', { siteUrl }, true);
    }

    async getRankAndTrafficStats(siteUrl: string): Promise<BingRankAndTrafficStats[]> {
        return this.request<BingRankAndTrafficStats[]>('GetRankAndTrafficStats', { siteUrl }, true);
    }

    async getCrawlStats(siteUrl: string): Promise<BingCrawlStats[]> {
        return this.request<BingCrawlStats[]>('GetCrawlStats', { siteUrl }, true);
    }

    async getUrlInfo(siteUrl: string, url: string): Promise<BingUrlInfo> {
        return this.request<BingUrlInfo>('GetUrlInfo', { siteUrl, url }, true);
    }

    async getLinkCounts(siteUrl: string): Promise<BingLinkCount[]> {
        return this.request<BingLinkCount[]>('GetLinkCounts', { siteUrl }, true);
    }

    async getRelatedKeywords(q: string, country?: string, language?: string): Promise<BingRelatedKeyword[]> {
        return this.request<BingRelatedKeyword[]>('GetRelatedKeywords', { q, country, language }, true);
    }
}

let cachedBingClient: BingClient | null = null;

export async function getBingClient(): Promise<BingClient> {
    if (cachedBingClient) return cachedBingClient;

    const apiKey = process.env.BING_API_KEY;
    if (!apiKey) {
        throw new Error('Bing API Key not found. Please set BING_API_KEY environment variable or run setup.');
    }

    cachedBingClient = new BingClient(apiKey);
    return cachedBingClient;
}
