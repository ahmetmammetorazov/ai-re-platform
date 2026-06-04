import { extractApiEndpoints } from "./api-endpoint-parser.js";

import { normalizeEndpoint, isValidEndpoint } from "./api-endpoint-filter.js";

export const discoverApiEndpoints = (bundles) => {
  const endpoints = new Map();

  for (const bundle of bundles) {
    const extracted = extractApiEndpoints(bundle.content);

    for (const endpoint of extracted) {
      const normalized = normalizeEndpoint(endpoint);

      if (!isValidEndpoint(normalized)) {
        continue;
      }

      if (!endpoints.has(normalized)) {
        endpoints.set(normalized, {
          path: normalized,
          sources: ["bundle"],
        });
      }
    }
  }

  return [...endpoints.values()];
};
