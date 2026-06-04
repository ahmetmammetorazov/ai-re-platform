import { discoverApiEndpoints } from "./api-endpoint-discovery.js";

export const analyzeApiEndpoints = (bundles) => {
  const endpoints = discoverApiEndpoints(bundles);

  return {
    endpoints,
  };
};
