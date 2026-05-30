import { htmlRules } from "../rules/html.rules.js";

export const analyzeHTML = (html, scripts) => {
  const results = [];

  for (const rule of htmlRules) {
    const evidence = [];

    for (const pattern of rule.signatures) {
      const foundInHtml = html.includes(pattern);
      const foundInScripts = scripts.includes(pattern);

      if (foundInHtml || foundInScripts) {
        evidence.push(pattern);
      }
    }

    if (evidence.length >= rule.minimumMatches) {
      results.push({
        technology: rule.technology,
        evidence,
      });
    }
  }

  return results;
};
