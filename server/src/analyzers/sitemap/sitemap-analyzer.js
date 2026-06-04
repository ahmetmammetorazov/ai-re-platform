import { discoverSitemapUrls, processSitemap } from "./sitemap-discovery.js";

import { createSitemapStats } from "./sitemap-stats.js";

export const discoverSitemapRoutes = async (baseUrl) => {
  const stats = createSitemapStats();

  const sitemapUrls = await discoverSitemapUrls(baseUrl);

  const routes = new Set();

  for (const sitemapUrl of sitemapUrls) {
    const urls = await processSitemap(sitemapUrl, stats);

    for (const url of urls) {
      routes.add(url);
    }
  }

  return {
    routes: [...routes].sort(),
    stats,
  };
};
