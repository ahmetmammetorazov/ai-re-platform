import axios from "axios";
import fs from "fs";

import { extractScripts } from "../utils/extractScripts.js";
import { htmlRules } from "../rules/html.rules.js";
import { analyzeHTML } from "../analyzers/html.analyzer.js";
import { analyzeMetaTags } from "../analyzers/meta.analyzer.js";
import { analyzeHeaders } from "../analyzers/header.analyzer.js";
import { fetchBundles } from "../analyzers/bundle.analyzer.js";
import { analyzeBundles } from "../analyzers/bundle.analyzer.js";
import { analyzeDom } from "../analyzers/dom.analyzer.js";
import { aggregateEvidence } from "../analyzers/evidence-aggregator.analyzer.js";
import { discoverRoutes } from "../analyzers/route.analyzer.js";
import { discoverSitemapRoutes } from "../analyzers/sitemap/sitemap.analyzer.js";
import { RouteRegistry } from "../analyzers/routes/route-registry.js";
import { ROUTE_SOURCES } from "../constants/route-sources.js";
import { analyzeBundleRoutes } from "../analyzers/bundle-routes/bundle-route.analyzer.js";

export const analyzeWebsiteService = async (url) => {
  const response = await axios.get(url);
  const routeRegistry = new RouteRegistry();

  const html = response.data;
  const headers = response.headers;
  const scripts = extractScripts(html);
  const bundles = await fetchBundles(url, scripts);
  const metaEvidence = analyzeMetaTags(html);
  const htmlEvidence = analyzeHTML(html, scripts.join("\n"));
  const headerEvidence = analyzeHeaders(headers);
  const bundleEvidence = analyzeBundles(bundles);
  const domEvidence = analyzeDom(html);
  const technologies = aggregateEvidence({
    htmlEvidence,
    headerEvidence,
    bundleEvidence,
    metaEvidence,
    domEvidence,
  });

  const routes = discoverRoutes(html, url);

  for (const route of routes) {
    routeRegistry.addRoute(route, ROUTE_SOURCES.ANCHOR);
  }

  const sitemapData = await discoverSitemapRoutes(url);

  for (const route of sitemapData.routes) {
    routeRegistry.addRoute(route, ROUTE_SOURCES.SITEMAP);
  }

  const bundleRoutes = analyzeBundleRoutes(bundles);

  for (const route of bundleRoutes) {
    routeRegistry.addRoute(route.path, ROUTE_SOURCES.BUNDLE);
  }

  return {
    url,
    technologies,
    routes: routeRegistry.getRoutes(),
    bundleRoutes,
    scripts,
  };
};
