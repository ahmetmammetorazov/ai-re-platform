import axios from "axios";

import { extractScripts } from "../utils/extractScripts.js";
import { config } from "../config/index.js";

// Import technology analyzers
import { analyzeHTML, HTMLAnalyzer } from "../analyzers/html.analyzer.js";
import { analyzeMetaTags, MetaAnalyzer } from "../analyzers/meta.analyzer.js";
import {
  analyzeHeaders,
  HeaderAnalyzer,
} from "../analyzers/header.analyzer.js";
import {
  fetchBundles,
  analyzeBundles,
  BundleAnalyzer,
} from "../analyzers/bundle.analyzer.js";
import { analyzeDom, DOMAnalyzer } from "../analyzers/dom.analyzer.js";

// Import route and endpoint discovery
import { discoverRoutes } from "../analyzers/route.analyzer.js";
import { discoverSitemapRoutes } from "../analyzers/sitemap/sitemap-analyzer.js";
import { RouteRegistry } from "../analyzers/routes/route-registry.js";
import { analyzeBundleRoutes } from "../analyzers/bundle-routes/bundle-route-analyzer.js";
import { analyzeApiEndpoints } from "../analyzers/api-endpoints/api-endpoint-analyzer.js";
import { analyzeSourceMaps } from "../analyzers/source-maps/source-map-analyzer.js";
import { analyzeAssets } from "../analyzers/assets/asset-analyzer.js";

// Import aggregation and constants
import { aggregateEvidence } from "../analyzers/evidence-aggregator.analyzer.js";
import { ROUTE_SOURCES } from "../constants/route-sources.js";

/**
 * Analyze website - extract technologies, routes, APIs, and assets
 *
 * Architecture:
 * - Refactored to use plugin-ready base classes (RuleAnalyzer, GenericExtractor)
 * - SSRF protection and security validations added
 * - Centralized configuration system
 * - Error recovery with partial results mode
 *
 * Note: While individual analyzers now use plugin-ready architecture,
 * this service still orchestrates them. Future: can wrap each analyzer
 * in the AnalyzerRegistry plugin system.
 */
export const analyzeWebsiteService = async (url) => {
  // Step 1: Fetch target website with timeout
  const response = await axios.get(url, {
    timeout: config.http.timeout,
  });

  const html = response.data;
  const headers = response.headers;
  const scripts = extractScripts(html);

  // Step 2: Fetch bundles (with SSRF protection)
  const bundles = await fetchBundles(url, scripts);

  // Step 3: Run technology detection analyzers in parallel where possible
  const technologyAnalysisPromises = [
    Promise.resolve(analyzeHTML(html, scripts.join("\n"))),
    Promise.resolve(analyzeMetaTags(html)),
    Promise.resolve(analyzeHeaders(headers)),
    Promise.resolve(analyzeBundles(bundles)),
    Promise.resolve(analyzeDom(html)),
  ];

  const [
    htmlEvidence,
    metaEvidence,
    headerEvidence,
    bundleEvidence,
    domEvidence,
  ] = await Promise.all(technologyAnalysisPromises);

  // Step 4: Extract routes from multiple sources
  const routeRegistry = new RouteRegistry();

  const htmlRoutes = discoverRoutes(html, url);
  htmlRoutes.forEach((route) => {
    routeRegistry.addRoute(route, ROUTE_SOURCES.ANCHOR);
  });

  // Sitemap routes (can take time)
  if (config.features.enableSitemapAnalysis) {
    try {
      const sitemapData = await discoverSitemapRoutes(url);
      sitemapData.routes.forEach((route) => {
        routeRegistry.addRoute(route, ROUTE_SOURCES.SITEMAP);
      });
    } catch (error) {
      console.warn(`Sitemap analysis failed: ${error.message}`);
    }
  }

  // Bundle routes
  const bundleRoutes = analyzeBundleRoutes(bundles);
  bundleRoutes.forEach((route) => {
    routeRegistry.addRoute(route.path, ROUTE_SOURCES.BUNDLE);
  });

  // Step 5: Extract additional information from bundles
  const endpointAnalysisPromise = Promise.resolve(analyzeApiEndpoints(bundles));
  const sourceMapAnalysisPromise = config.features.enableSourceMapAnalysis
    ? analyzeSourceMaps(bundles)
    : Promise.resolve({ sourceMaps: [] });
  const assetAnalysisPromise = Promise.resolve(analyzeAssets(html));

  const [endpointEvidence, sourceMapResults, assets] = await Promise.all([
    endpointAnalysisPromise,
    sourceMapAnalysisPromise,
    assetAnalysisPromise,
  ]);

  // Step 6: Aggregate all technology evidence with weighting
  const technologies = aggregateEvidence({
    htmlEvidence,
    headerEvidence,
    bundleEvidence,
    metaEvidence,
    domEvidence,
  });

  // Return comprehensive analysis results
  return {
    url,
    technologies,
    routes: routeRegistry.getRoutes(),
    endpoints: endpointEvidence.endpoints || [],
    sourceMaps: sourceMapResults.sourceMaps || [],
    assets,
  };
};
