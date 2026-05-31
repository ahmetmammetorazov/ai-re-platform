import axios from "axios";

import {
  extractSitemaps,
  extractLocs,
  isSitemapIndex,
} from "./sitemap-parser.js";

export const discoverSitemapUrls = async (baseUrl) => {
  const urls = new Set();

  urls.add(new URL("/sitemap.xml", baseUrl).href);

  try {
    const robotsUrl = new URL("/robots.txt", baseUrl).href;

    const response = await axios.get(robotsUrl);

    const sitemapUrls = extractSitemaps(response.data);

    sitemapUrls.forEach((url) => urls.add(url));
  } catch (error) {
    console.error("Failed to fetch robots.txt");
  }

  return [...urls];
};

export const processSitemap = async (
  sitemapUrl,
  stats,
  visited = new Set(),
) => {
  if (visited.has(sitemapUrl)) {
    return [];
  }

  visited.add(sitemapUrl);

  stats.sitemapCount++;

  try {
    const response = await axios.get(sitemapUrl);

    const xml = response.data;

    if (isSitemapIndex(xml)) {
      const childSitemaps = extractLocs(xml);

      let urls = [];

      for (const child of childSitemaps) {
        const results = await processSitemap(child, stats, visited);

        urls.push(...results);
      }

      return urls;
    }

    const urls = extractLocs(xml);

    stats.urlCount += urls.length;

    return urls;
  } catch (error) {
    console.error(`Failed to process sitemap: ${sitemapUrl}`);

    return [];
  }
};
