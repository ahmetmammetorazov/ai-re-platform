import { headerRules } from "../rules/header.rules.js";

export const analyzeHeaders = (headers) => {
  const results = [];

  const headerEntries = Object.entries(headers);

  for (const rule of headerRules) {
    const evidence = new Set();

    for (const [key, value] of headerEntries) {
      const headerText = `${key} ${value}`.toLowerCase();

      for (const signature of rule.signatures) {
        if (headerText.includes(signature.toLowerCase())) {
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
