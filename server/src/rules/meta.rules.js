import { TECHNOLOGIES } from "../constants/technologies.js";

export const metaRules = [
  {
    technology: TECHNOLOGIES.NEXT_JS,
    signatures: ["next.js"],
    minimumMatches: 1,
  },

  {
    technology: TECHNOLOGIES.WORDPRESS,
    signatures: ["wordpress", "wp"],
    minimumMatches: 1,
  },

  {
    technology: TECHNOLOGIES.GHOST,
    signatures: ["ghost"],
    minimumMatches: 1,
  },

  {
    technology: TECHNOLOGIES.GATSBY,
    signatures: ["gatsby"],
    minimumMatches: 1,
  },

  {
    technology: TECHNOLOGIES.NUXT,
    signatures: ["nuxt"],
    minimumMatches: 1,
  },

  {
    technology: TECHNOLOGIES.SHOPIFY,
    signatures: ["shopify"],
    minimumMatches: 1,
  },
];
