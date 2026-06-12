import axios from "axios";
import { RuleAnalyzer } from "./base/RuleAnalyzer.js";
import { bundleRules } from "../rules/bundle.rules.js";
import {
  validateUrlForSSRF,
  validateResponse,
  sanitizeUrlForLogging,
  getSecureAxiosConfig,
} from "../utils/security.js";
import { config } from "../config/index.js";

/**
 * Bundle Analyzer - Detects technologies from JavaScript bundles
 * Refactored to use RuleAnalyzer base class
 */
class BundleAnalyzer extends RuleAnalyzer {
  constructor() {
    super("Bundle", bundleRules, {
      caseSensitive: false,
      useSet: true,
    });
  }

  async analyze(context) {
    const { bundles = [] } = context;

    // Combine all bundle content
    const bundleContent = bundles
      .map((b) => (typeof b === "string" ? b : b.content || ""))
      .join("\n");

    return super.analyze({ content: bundleContent });
  }
}

/**
 * Fetch bundles with SSRF protection and security validations
 * @param {string} baseUrl - Base URL for resolving relative script paths
 * @param {Array<string>} scripts - Script URLs (absolute or relative)
 * @returns {Promise<Array>} Array of {url, content} objects
 */
export const fetchBundles = async (baseUrl, scripts) => {
  const axiosConfig = getSecureAxiosConfig();

  // Process bundles with controlled concurrency
  const bundlePromises = scripts.map(async (script) => {
    try {
      // Resolve relative URLs
      const bundleUrl = new URL(script, baseUrl).href;

      // Validate URL for SSRF attacks
      const ssrfValidation = validateUrlForSSRF(bundleUrl);
      if (!ssrfValidation.valid) {
        console.warn(
          `SSRF blocked: ${sanitizeUrlForLogging(bundleUrl)} - ${ssrfValidation.error}`,
        );
        return null;
      }

      // Fetch with security config
      const response = await axios.get(bundleUrl, axiosConfig);

      // Validate response for security issues
      const responseValidation = validateResponse(response);
      if (!responseValidation.valid) {
        console.warn(
          `Invalid response from ${sanitizeUrlForLogging(bundleUrl)}: ${responseValidation.error}`,
        );
        return null;
      }

      return {
        url: bundleUrl,
        content: response.data,
      };
    } catch (error) {
      console.warn(
        `Failed to fetch bundle from ${sanitizeUrlForLogging(script)}: ${error.message}`,
      );
      return null;
    }
  });

  // Limit concurrent requests
  const results = [];
  for (
    let i = 0;
    i < bundlePromises.length;
    i += config.http.bundleFetchConcurrency
  ) {
    const chunk = bundlePromises.slice(
      i,
      i + config.http.bundleFetchConcurrency,
    );
    const chunkResults = await Promise.all(chunk);
    results.push(...chunkResults);
  }

  return results.filter(Boolean);
};

/**
 * Analyze bundles for technology signatures
 * Refactored to use RuleAnalyzer
 * @param {Array} bundles - Array of {url, content} objects or strings
 * @returns {Array} Technology findings with evidence
 */
export const analyzeBundles = (bundles) => {
  const analyzer = new BundleAnalyzer();
  return analyzer.analyze({ bundles });
};

export { BundleAnalyzer };
