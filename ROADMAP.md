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

---

## 🚧 In Progress

_Nothing currently in progress_

---

## 📋 Planned

### v2.0.0 - OAuth2 Support

- Browser-based OAuth2 flow for personal accounts
- Token refresh handling
- Multi-account support

---

## 🔮 Future Considerations

### CI/CD
- GitHub Actions for automated testing
- Automated npm publishing on release
- Semantic versioning automation

### Additional APIs
- Google Analytics integration
- PageSpeed Insights integration
- Core Web Vitals data

### Developer Experience
- Debug logging mode
- Request/response caching
- Rate limit handling with retry

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for how to contribute to this project.

Ideas and feature requests are welcome! Please open an issue to discuss.
