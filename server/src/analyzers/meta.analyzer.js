import { metaRules } from "../rules/meta.rules.js";

export const analyzeMetaTags = (html) => {
  const results = [];

  const metaTags = [
    ...html.matchAll(
      /<meta[^>]*name=["']([^"']+)["'][^>]*content=["']([^"']+)["'][^>]*>/gi,
    ),
  ];

  for (const rule of metaRules) {
    const evidence = new Set();

    for (const match of metaTags) {
      const [, name, content] = match;

      const searchableText = `${name} ${content}`.toLowerCase();

      for (const signature of rule.signatures) {
        if (searchableText.includes(signature.toLowerCase())) {
          evidence.add(signature);
        }
      }
    }

    if (evidence.size > 0) {
      results.push({
        technology: rule.technology,
        evidence: [...evidence],
      });
    }
  }

  return results;
};
