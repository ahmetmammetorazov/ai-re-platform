import { SOURCE_MAP_EXTENSIONS } from "./source-map-contexts.js";

export const isValidSourceMap = (url) => {
  if (!url) {
    return false;
  }

  return SOURCE_MAP_EXTENSIONS.some((extension) => url.endsWith(extension));
};
