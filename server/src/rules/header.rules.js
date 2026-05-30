import { TECHNOLOGIES } from "../constants/technologies.js";

export const headerRules = [
  {
    technology: TECHNOLOGIES.NEXT_JS,
    signatures: ["next.js"],
    minimumMatches: 1,
  },

  {
    technology: TECHNOLOGIES.VERCEL,
    signatures: ["x-vercel-id", "x-vercel-cache"],
    minimumMatches: 1,
  },

  {
    technology: TECHNOLOGIES.CLOUDFLARE,
    signatures: ["cf-cache-status", "cf-ray"],
    minimumMatches: 1,
  },

  {
    technology: TECHNOLOGIES.NGINX,
    signatures: ["nginx"],
    minimumMatches: 1,
  },

  {
    technology: TECHNOLOGIES.APACHE,
    signatures: ["apache"],
    minimumMatches: 1,
  },

  {
    technology: TECHNOLOGIES.FASTLY,
    signatures: ["fastly", "x-served-by"],
    minimumMatches: 1,
  },
];
