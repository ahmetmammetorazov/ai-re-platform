/**
 * Centralized Configuration System
 * Consolidates all configuration that was scattered across files
 *
 * Environment variables:
 * - HTTP_TIMEOUT: Request timeout in ms (default: 10000)
 * - MAX_BUNDLE_SIZE: Max bundle download size in bytes (default: 10MB)
 * - BUNDLE_FETCH_CONCURRENCY: Parallel bundle downloads (default: 5)
 * - REGEX_TIMEOUT: Max regex matching time in ms (default: 1000)
 */

export const config = {
  // HTTP Client Settings
  http: {
    timeout: parseInt(process.env.HTTP_TIMEOUT || "10000", 10),
    maxBundleSize: parseInt(
      process.env.MAX_BUNDLE_SIZE || String(10 * 1024 * 1024),
      10,
    ), // 10MB default
    bundleFetchConcurrency: parseInt(
      process.env.BUNDLE_FETCH_CONCURRENCY || "5",
      10,
    ),

    // SSRF Protection
    blockedHosts: [
      "localhost",
      "127.0.0.1",
      "::1",
      "0.0.0.0",
      "169.254.169.254", // AWS metadata
    ],

    // Blocked IP ranges (CIDR notation support)
    blockedRanges: [
      "10.0.0.0/8", // Private networks
      "172.16.0.0/12",
      "192.168.0.0/16",
      "127.0.0.0/8", // Loopback
      "169.254.0.0/16", // Link local
      "224.0.0.0/4", // Multicast
      "240.0.0.0/4", // Reserved
    ],

    // Response validation
    validateResponseHeaders: true,
    validateContentType: ["text/javascript", "application/javascript"],
  },

  // Analyzer Settings
  analyzers: {
    bundleRoute: {
      minConfidence: 0.7,
      // Blacklisted prefixes for routes
      blacklist: [
        "/_next",
        "/__nextjs_original-stack-frame",
        "/static",
        "/public",
        "/images",
        "/fonts",
        "/styles",
        "/js",
        "/css",
        "/assets",
        "/node_modules",
        "/ROOT",
        "/admin",
      ],
      // Blacklisted extensions for routes
      blacklistExtensions: [
        ".js",
        ".css",
        ".map",
        ".woff",
        ".woff2",
        ".ttf",
        ".eot",
        ".svg",
        ".png",
        ".jpg",
        ".jpeg",
        ".gif",
        ".ico",
      ],
    },

    apiEndpoint: {
      // Blacklisted prefixes for API endpoints
      blacklist: [
        "/_next",
        "/static",
        "/public",
        "/assets",
        "/images",
        "/fonts",
        "/.well-known",
      ],

      // Common API endpoint patterns
      patterns: {
        minPathLength: 2,
        maxPathLength: 100,
        invalidChars: /[<>'"{}\\]/,
      },
    },

    htmlAnalysis: {
      minimumMatches: 1,
      caseSensitive: false,
    },

    metaAnalysis: {
      minimumMatches: 1,
      caseSensitive: false,
    },

    headerAnalysis: {
      minimumMatches: 1,
      caseSensitive: false,
    },

    domAnalysis: {
      minimumMatches: 1,
      caseSensitive: false,
    },

    bundleAnalysis: {
      minimumMatches: 1,
      caseSensitive: false,
    },

    sitemapAnalysis: {
      maxUrls: 50000, // Max URLs to fetch from sitemap
      maxDepth: 3, // Max recursion depth for sitemap index
      timeout: 30000, // Sitemap fetch timeout
    },

    sourceMapAnalysis: {
      timeout: 10000,
      maxSize: 5 * 1024 * 1024, // 5MB
    },

    assetAnalysis: {
      trackTypes: ["script", "style", "image", "font"],
    },
  },

  // Pattern Matching
  patterns: {
    reDoSTimeout: parseInt(process.env.REGEX_TIMEOUT || "1000", 10), // Timeout for slow regex
    enableReDoSProtection: true,
  },

  // Service Settings
  service: {
    parallelizeBundleFetch: true,
    cacheResults: false, // Set to true with Redis
    cacheTTL: 3600, // 1 hour
    errorRecoveryMode: "partial", // 'partial', 'strict', 'lenient'
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || "info", // debug, info, warn, error
    format: "json", // json or text
    enableRequestLogging: true,
    redactSensitiveData: true,
  },

  // Feature Flags
  features: {
    enableSitemapAnalysis: true,
    enableSourceMapAnalysis: true,
    enableAssetAnalysis: true,
    enableBundleRouteAnalysis: true,
    enableApiEndpointAnalysis: true,
  },
};

/**
 * Load config from environment with validation
 */
export function validateConfig() {
  const errors = [];

  if (config.http.timeout < 1000) {
    errors.push("HTTP_TIMEOUT must be >= 1000ms");
  }

  if (config.http.maxBundleSize < 1024) {
    errors.push("MAX_BUNDLE_SIZE must be >= 1024 bytes");
  }

  if (config.http.bundleFetchConcurrency < 1) {
    errors.push("BUNDLE_FETCH_CONCURRENCY must be >= 1");
  }

  if (errors.length > 0) {
    throw new Error(`Config validation failed:\n${errors.join("\n")}`);
  }

  return config;
}

export default config;
