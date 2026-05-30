import { domRules } from "../rules/dom.rules.js";

export const analyzeDom = (html) => {
  const results = [];

  const normalizedHtml = html.toLowerCase();

  for (const rule of domRules) {
    const evidence = new Set();

    for (const signature of rule.signatures) {
      if (normalizedHtml.includes(signature.toLowerCase())) {
        evidence.add(signature);
      }
    }

    if (evidence.size >= rule.minimumMatches) {
      results.push({
        technology: rule.technology,
        evidence: [...evidence],
      });
    }
  }

  return results;
};
