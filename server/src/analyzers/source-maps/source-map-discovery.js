import axios from "axios";

import { extractSourceMapUrl } from "./source-map-parser.js";
import { isValidSourceMap } from "./source-map-filter.js";

const getSourceMapStatus = async (sourceMapUrl) => {
  try {
    const response = await axios.get(sourceMapUrl, {
      responseType: "stream",
      timeout: 10000,
      validateStatus: () => true,
    });

    return response.status;
  } catch {
    return null;
  }
};

export const discoverSourceMaps = async (bundles) => {
  const maps = new Map();

  //
  // Collect unique source maps
  //
  for (const bundle of bundles) {
    const mapUrl = extractSourceMapUrl(bundle);

    if (!isValidSourceMap(mapUrl)) {
      continue;
    }

    const sourceMapUrl = new URL(mapUrl, bundle.url).href;

    if (!maps.has(sourceMapUrl)) {
      maps.set(sourceMapUrl, {
        url: sourceMapUrl,
        bundles: [bundle.url],
      });
    } else {
      maps.get(sourceMapUrl).bundles.push(bundle.url);
    }
  }

  //
  // Check accessibility in parallel
  //
  const checks = [...maps.values()].map(async (sourceMap) => {
    const status = await getSourceMapStatus(sourceMap.url);

    return {
      ...sourceMap,
      status,
      accessible: status >= 200 && status < 400,
    };
  });

  return Promise.all(checks);
};
