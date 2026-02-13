# Google Search Console MCP Server - Roadmap

This document outlines the planned features and improvements for this project.

## ✅ Completed

### v1.0.0 - Initial Release

- Sites management (list, add, delete, get)
- Sitemaps management (list, submit, delete, get)
- Search Analytics queries with filtering
- Performance summary with metrics
- URL inspection
- MCP resources and prompts
- Error handling with user-friendly messages

### v1.1.0 - Documentation Resources

- Embedded documentation as MCP resources
- Dimensions reference (`docs://dimensions`)
- Filters reference (`docs://filters`)
- Search types reference (`docs://search-types`)
- Common patterns & recipes (`docs://patterns`)

### v1.2.0 - Enhanced Analytics Tools

- `analytics_compare_periods` - Compare two date ranges
- `analytics_top_queries` - Top queries by clicks/impressions
- `analytics_top_pages` - Top pages by clicks/impressions
- Pagination support via `startRow` parameter
- Comprehensive README with installation guides

### v1.3.0 - More Prompts

- `compare-performance` - Compare this week vs last week
- `find-declining-pages` - Identify pages losing traffic
- `keyword-opportunities` - Find low-CTR high-impression queries
- `new-content-impact` - Analyze new content performance
- `mobile-vs-desktop` - Compare device performance

### v1.4.0 - Additional Resources

- `sitemaps://list/{siteUrl}` - List sitemaps for a site
- `analytics://summary/{siteUrl}` - Performance summary for a site

### v1.5.0 - CI/CD & PageSpeed Integration

- GitHub Actions CI workflow (Node 18/20/22)
- Automated npm publish on release
- `pagespeed_analyze` - PageSpeed Insights analysis
- `pagespeed_core_web_vitals` - Core Web Vitals (LCP, FID, CLS, FCP, TTI, TBT)

### v1.8.0 - SEO Insights

- `seo_recommendations` - Generate actionable SEO improvement suggestions
- `seo_low_hanging_fruit` - Find high-impression keywords at positions 5-20
- `seo_cannibalization` - Detect pages competing for the same keywords
- `seo_quick_wins` - Find pages close to page 1 (positions 11-20)

### v1.9.0 - Schema Validator & Experience

### v1.9.1 - Advanced Analytics

- \`analytics_trends\` - Detect traffic trends (growing/declining)
- \`analytics_anomalies\` - Identify unusual spikes or drops
- \`analytics_by_country\` - Performance breakdown by country
- \`analytics_search_appearance\` - Data by search appearance type

### v1.9.2 - Security & Docs Site

- `schema_validate` - Validate structured data (JSON-LD)
- Enhanced Setup Wizard with project support and better UX
- \`analytics_drop_attribution\` - Device impact & Google Algorithm correlation
- \`analytics_time_series\` - Dynamic rolling averages & trend forecasting
- **Security Hardening**: Path traversal protection in setup wizard
- **Expanded Documentation**: Algorithm updates reference (\`docs://algorithm-updates\`)

### v1.9.3 - Schema Validator & Experience

- `sites_health_check` - Check all sites for issues

---

## 🚧 In Progress

_Nothing currently in progress_

---

## 📋 Planned

### v1.11.0 - Bulk Operations

| Feature           | Description                       |
| ----------------- | --------------------------------- |
| `inspection_bulk` | Inspect multiple URLs in one call |

| Export to CSV/JSON | Export analytics data |
| Batch URL status | Check indexing status for URL list |

### v2.0.0 - OAuth2 Support

- Browser-based OAuth2 flow for personal accounts
- Token refresh handling
- Multi-account support
- Account switcher

---

## 🔮 Future Considerations

### Additional APIs

| API                  | Use Case                               |
| -------------------- | -------------------------------------- |
| Google Analytics 4   | Session/user data, conversion tracking |
| Bing Webmaster Tools | Microsoft search performance           |
| Screaming Frog API   | Technical SEO audits                   |

### Monitoring & Alerts

- Performance threshold alerts
- Indexing issue notifications
- Manual actions monitoring
- Security issues dashboard
- Sitemap error tracking

### Reporting

- Scheduled reports (daily/weekly/monthly)
- Custom report templates
- PDF/HTML report generation
- Slack/Discord webhook integration
- Email digest summaries

### Developer Experience

- Debug logging mode (`--verbose`)
- Request/response caching (Redis support)
- Rate limit handling with exponential backoff
- Webhook support for real-time updates
- GraphQL-style query builder

### Multi-Site Management

- Site groups/tags
- Cross-site comparison
- Portfolio dashboards
- Aggregate analytics

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for how to contribute to this project.

Ideas and feature requests are welcome! Please open an issue to discuss.
