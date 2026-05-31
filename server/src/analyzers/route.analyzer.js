const ignoredExtensions = [
  ".js",
  ".css",
  ".svg",
  ".png",
  ".jpg",
  ".webp",
  ".ico",
  ".woff",
  ".woff2",
  ".webmanifest",
];

export const discoverRoutes = (html, baseUrl) => {
  const routes = new Set();

  const hrefRegex = /href=["']([^"']+)["']/gi;

  const matches = [...html.matchAll(hrefRegex)];

  for (const match of matches) {
    const href = match[1];

    if (
      !href ||
      href.startsWith("#") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:")
    ) {
      continue;
    }

    try {
      const route = new URL(href, baseUrl);

      if (ignoredExtensions.some((ext) => route.pathname.endsWith(ext))) {
        continue;
      }

      const base = new URL(baseUrl);

      if (route.hostname === base.hostname) {
        routes.add(route.pathname);
      }
    } catch {
      continue;
    }
  }

  return [...routes].sort();
};
