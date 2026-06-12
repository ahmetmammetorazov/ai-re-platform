import { discoverSourceMaps } from "./source-map-discovery.js";

export const analyzeSourceMaps = async (bundles) => {
  const sourceMaps = await discoverSourceMaps(bundles);

  return {
    sourceMaps,
  };
};
