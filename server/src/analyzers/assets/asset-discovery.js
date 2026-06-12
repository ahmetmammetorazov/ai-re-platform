import { extractAssets } from "./asset-parser.js";
import { uniqueAssets } from "./asset-filter.js";

export const discoverAssets = (html) => {
  const assets = extractAssets(html);

  return {
    scripts: uniqueAssets(assets.scripts),

    stylesheets: uniqueAssets(assets.stylesheets),

    images: uniqueAssets(assets.images),

    fonts: uniqueAssets(assets.fonts),
  };
};
