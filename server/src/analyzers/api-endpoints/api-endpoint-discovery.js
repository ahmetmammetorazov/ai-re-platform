import { GenericExtractor } from "../base/GenericExtractor.js";
import { extractApiEndpoints } from "./api-endpoint-parser.js";
import { normalizeEndpoint, isValidEndpoint } from "./api-endpoint-filter.js";

/**
 * Discover API endpoints from bundles using GenericExtractor
 * Refactored to reduce duplication
 */
export const discoverApiEndpoints = (bundles) => {
  const extractor = new GenericExtractor({
    extractFn: (content) => extractApiEndpoints(content),
    normalizeFn: (endpoint) => normalizeEndpoint(endpoint),
    filterFn: (endpoint) => isValidEndpoint(endpoint),
    getKeyFn: (endpoint) => endpoint,
    sourceKey: "content",
  });

  const endpoints = extractor.extract(bundles, {
    transformFn: (endpoint) => ({
      path: endpoint,
      sources: ["bundle"],
    }),
  });

  return endpoints;
};
