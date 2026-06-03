import { extractRouteCandidates } from "./bundle-route-parser.js";
import { isValidRoute, normalizeRoute } from "./bundle-route-filter.js";

export const discoverBundleRoutes = (bundles) => {
  const routes = new Map();

  for (const bundle of bundles) {
    const findings = extractRouteCandidates(bundle.content);

    for (const finding of findings) {
      const normalizedRoute = normalizeRoute(finding.path);

      if (!isValidRoute(normalizedRoute)) {
        continue;
      }

      const existing = routes.get(normalizedRoute);

      if (!existing || finding.confidence > existing.confidence) {
        routes.set(normalizedRoute, {
          ...finding,
          path: normalizedRoute,
        });
      }
    }
  }

  return [...routes.values()];
};
