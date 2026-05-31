export const extractSitemaps = (robotsTxt) => {
  const sitemaps = new Set();

  const matches = robotsTxt.matchAll(/^Sitemap:\s*(.+)$/gim);

  for (const match of matches) {
    sitemaps.add(match[1].trim());
  }

  return [...sitemaps];
};

export const extractLocs = (xml) => {
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/gi)].map((match) =>
    match[1].trim(),
  );
};

export const isSitemapIndex = (xml) => {
  return xml.includes("<sitemapindex");
};
