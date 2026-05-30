import axios from "axios";

import { extractScripts } from "../utils/extractScripts.js";
import { htmlRules } from "../rules/html.rules.js";
import { analyzeHTML } from "../analyzers/html.analyzer.js";
import { analyzeMetaTags } from "../analyzers/meta.analyzer.js";
import { analyzeHeaders } from "../analyzers/header.analyzer.js";
import { fetchBundles } from "../analyzers/bundle.analyzer.js";
import { analyzeBundles } from "../analyzers/bundle.analyzer.js";
import { analyzeDom } from "../analyzers/dom.analyzer.js";
import { aggregateEvidence } from "../analyzers/evidence-aggregator.analyzer.js";

export const analyzeWebsiteService = async (url) => {
  const response = await axios.get(url);

  const html = response.data;
  const headers = response.headers;
  const scripts = extractScripts(html);
  const bundles = await fetchBundles(url, scripts);
  const metaEvidence = analyzeMetaTags(html);
  const htmlEvidence = analyzeHTML(html, scripts.join("\n"));
  const headerEvidence = analyzeHeaders(headers);
  const bundleEvidence = analyzeBundles(bundles);
  const domEvidence = analyzeDom(html);

  return aggregateEvidence({
    htmlEvidence,
    headerEvidence,
    bundleEvidence,
    metaEvidence,
    domEvidence,
  });
};
