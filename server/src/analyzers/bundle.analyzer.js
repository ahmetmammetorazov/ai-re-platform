import axios from "axios";
import { bundleRules } from "../rules/bundle.rules.js";

export const fetchBundles = async (baseUrl, scripts) => {
  const findings = [];

  const bundles = scripts.slice(0, 5);

  for (const script of bundles) {
    try {
      const bundleUrl = new URL(script, baseUrl).href;

      const response = await axios.get(bundleUrl);

      const content = response.data;

      findings.push({
        url: bundleUrl,
        content,
      });
    } catch (error) {
      console.error(`Failed to fetch bundle: ${script}`);
    }
  }

  return findings;
};

export const analyzeBundleEvidence = (bundles) => {
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
