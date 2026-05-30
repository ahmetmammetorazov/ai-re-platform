import { TECHNOLOGIES } from "../constants/technologies.js";

export const htmlRules = [
  {
    technology: TECHNOLOGIES.NEXT_JS,
    signatures: ["__NEXT_DATA__", "/_next/", "_next"],
    minimumMatches: 1,
  },

  {
    technology: TECHNOLOGIES.REACT,
    signatures: ["react", "__REACT_DEVTOOLS"],
    minimumMatches: 1,
  },

  {
    technology: TECHNOLOGIES.VUE,
    signatures: ["__VUE__", "vue"],
    minimumMatches: 1,
  },

  {
    technology: TECHNOLOGIES.ANGULAR,
    signatures: ["ng-version", "angular"],
    minimumMatches: 1,
  },

  {
    technology: TECHNOLOGIES.SVELTE,
    signatures: ["__SVELTE", "svelte"],
    minimumMatches: 1,
  },

  {
    technology: TECHNOLOGIES.TAILWIND,
    signatures: ["--tw-", "tailwind"],
    minimumMatches: 1,
  },

  {
    technology: TECHNOLOGIES.BOOTSTRAP,
    signatures: ["bootstrap", "btn-primary", "container-fluid"],
    minimumMatches: 1,
  },
];
