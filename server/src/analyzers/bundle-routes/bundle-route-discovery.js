import { GenericExtractor } from "../base/GenericExtractor.js";
import { extractRouteCandidates } from "./bundle-route-parser.js";
import { isValidRoute, normalizeRoute } from "./bundle-route-filter.js";

/**
 * Discover routes from bundles using GenericExtractor
 * Refactored to reduce duplication
 */
export const discoverBundleRoutes = (bundles) => {
  const extractor = new GenericExtractor({
    extractFn: (content) => extractRouteCandidates(content),
    normalizeFn: (item) => ({
      ...item,
      path: normalizeRoute(item.path),
    }),
    filterFn: (item) => isValidRoute(item.path),
    getKeyFn: (item) => item.path,
    sourceKey: "content",
  });

  // Use priority-based extraction to keep highest confidence routes
  return extractor.extractWithPriority(bundles, (newItem, existingItem) => {
    return newItem.confidence > (existingItem.confidence || 0);
  });
};
