import axios from "axios";
import { bundleRules } from "../rules/bundle.rules.js";

export const fetchBundles = async (baseUrl, scripts) => {
  const bundlePromises = scripts.map(async (script) => {
    try {
      const bundleUrl = new URL(script, baseUrl).href;
      const response = await axios.get(bundleUrl);

      return {
        url: bundleUrl,
        content: response.data,
      };
    } catch (error) {
      console.error(`Failed to fetch bundle: ${script}`);
      return null;
    }
  });

  const findings = await Promise.all(bundlePromises);
  return findings.filter(Boolean);
};

export const analyzeBundles = (bundles) => {
  const results = [];

  for (const rule of bundleRules) {
    const evidence = new Set();

    for (const bundle of bundles) {
      for (const signature of rule.signatures) {
        if (bundle.content.includes(signature)) {
          evidence.add(signature);
        }
      }
    }

    if (evidence.size >= rule.minimumMatches) {
      results.push({
        technology: rule.technology,
        evidence: [...new Set(evidence)],
      });
    }
  }

  return results;
};
