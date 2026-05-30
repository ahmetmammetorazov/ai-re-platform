import { TECHNOLOGIES } from "../constants/technologies.js";

export const domRules = [
  {
    technology: TECHNOLOGIES.NEXT_JS,
    signatures: ['id="__next"', "id='__next'"],
    minimumMatches: 1,
  },

  {
    technology: TECHNOLOGIES.REACT,
    signatures: ['id="root"', "id='root'", "data-reactroot"],
    minimumMatches: 1,
  },

  {
    technology: TECHNOLOGIES.VUE,
    signatures: ['id="app"', "id='app'"],
    minimumMatches: 1,
  },

  {
    technology: TECHNOLOGIES.ANGULAR,
    signatures: ["<app-root", "ng-version"],
    minimumMatches: 1,
  },

  {
    technology: TECHNOLOGIES.SVELTE,
    signatures: ["svelte"],
    minimumMatches: 1,
  },
];
