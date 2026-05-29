import axios from "axios";

import { extractScripts } from "../utils/extractScripts.js";
import { detectTechnology } from "../utils/detectTechnology.js";
import { technologyRules } from "../rules/technology.rules.js";
import { analyzeHeaders } from "../analyzers/header.analyzer.js";
import { fetchBundles } from "../analyzers/bundle.analyzer.js";
import { analyzeBundleEvidence } from "../analyzers/bundle.analyzer.js";

export const analyzeWebsiteService = async (url) => {
  const response = await axios.get(url);

  const html = response.data;
  const headers = response.headers;
  const headerEvidence = analyzeHeaders(headers);
  const scripts = extractScripts(html);
  const bundles = await fetchBundles(url, scripts);
  const bundleEvidence = analyzeBundleEvidence(bundles);

  const technologies = [];

  for (const rule of technologyRules) {
    const result = detectTechnology(html, scripts, rule);

    if (result) {
      technologies.push(result);
    }
  }

  return {
    url,
    technologies,
    headerEvidence,
    bundleEvidence,
    scripts,
  };
};
