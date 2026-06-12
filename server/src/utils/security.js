/**
 * Security Utilities for SSRF Prevention and URL Validation
 */

import { config } from "../config/index.js";

/**
 * Validate URL for SSRF vulnerabilities
 * Blocks requests to:
 * - Localhost/loopback addresses
 * - Private IP ranges
 * - AWS metadata service
 * - Other special-purpose addresses
 *
 * @param {string} urlString - URL to validate
 * @returns {{valid: boolean, error?: string}}
 */
export function validateUrlForSSRF(urlString) {
  try {
    const url = new URL(urlString);
    const hostname = url.hostname.toLowerCase();

    // Check blocked hosts
    if (config.http.blockedHosts.includes(hostname)) {
      return {
        valid: false,
        error: `Blocked host: ${hostname}`,
      };
    }

    // Check if it's an IP address
    if (isIPAddress(hostname)) {
      const ip = hostname;

      // Check blocked IP ranges
      for (const cidr of config.http.blockedRanges) {
        if (isIPInRange(ip, cidr)) {
          return {
            valid: false,
            error: `Blocked IP range: ${ip} in ${cidr}`,
          };
        }
      }

      // Check for IPv6 loopback
      if (hostname === "::1" || hostname.startsWith("::ffff:127.")) {
        return {
          valid: false,
          error: `Blocked IPv6 loopback: ${hostname}`,
        };
      }
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: `Invalid URL: ${error.message}`,
    };
  }
}

/**
 * Check if string is an IP address (IPv4 or IPv6)
 * @param {string} hostname
 * @returns {boolean}
 */
function isIPAddress(hostname) {
  // IPv4 check
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$|^(::)?1$|^::ffff:/i;

  // IPv6 check
  const ipv6Regex = /^[\da-f:]+$/i;

  return (
    ipv4Regex.test(hostname) ||
    (ipv6Regex.test(hostname) && hostname.includes(":"))
  );
}

/**
 * Check if IP is in CIDR range
 * Simplified implementation - for production use ipaddr.js library
 * @param {string} ip - IP address
 * @param {string} cidr - CIDR notation (e.g., "10.0.0.0/8")
 * @returns {boolean}
 */
function isIPInRange(ip, cidr) {
  const [range, bits] = cidr.split("/");
  const maskBits = parseInt(bits, 10);

  // Simple implementation for common ranges
  const ipParts = ip.split(".").map(Number);
  const rangeParts = range.split(".").map(Number);

  if (ipParts.length !== 4 || rangeParts.length !== 4) {
    return false;
  }

  // Convert to 32-bit integer
  const ipNum =
    (ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3];
  const rangeNum =
    (rangeParts[0] << 24) |
    (rangeParts[1] << 16) |
    (rangeParts[2] << 8) |
    rangeParts[3];

  const mask = (0xffffffff << (32 - maskBits)) >>> 0;

  return (ipNum & mask) === (rangeNum & mask);
}

/**
 * Validate response to prevent abuse
 * @param {Object} response - Axios response
 * @returns {{valid: boolean, error?: string}}
 */
export function validateResponse(response) {
  const { data, headers } = response;

  // Check response size
  const contentLength = parseInt(headers["content-length"] || "0", 10);
  if (contentLength > config.http.maxBundleSize) {
    return {
      valid: false,
      error: `Response too large: ${contentLength} bytes (max: ${config.http.maxBundleSize})`,
    };
  }

  // Check content type if validation enabled
  if (config.http.validateResponseHeaders && headers["content-type"]) {
    const contentType = headers["content-type"].split(";")[0].trim();

    // Only for bundle endpoints, validate it's JavaScript
    if (config.http.validateContentType) {
      const isValidType = config.http.validateContentType.some((type) =>
        contentType.includes(type),
      );

      if (!isValidType) {
        return {
          valid: false,
          error: `Invalid content type: ${contentType}`,
        };
      }
    }
  }

  // Check actual data size
  if (data && data.length > config.http.maxBundleSize) {
    return {
      valid: false,
      error: `Response body too large: ${data.length} bytes`,
    };
  }

  return { valid: true };
}

/**
 * Sanitize URL for logging (remove sensitive parts)
 * @param {string} urlString
 * @returns {string}
 */
export function sanitizeUrlForLogging(urlString) {
  try {
    const url = new URL(urlString);
    // Remove query params and fragments
    return `${url.protocol}//${url.hostname}${url.pathname}`;
  } catch {
    return "[invalid-url]";
  }
}

/**
 * Create axios config with security settings
 * @returns {Object}
 */
export function getSecureAxiosConfig() {
  return {
    timeout: config.http.timeout,
    maxContentLength: config.http.maxBundleSize,
    maxRedirects: 5, // Limit redirects
    validateStatus: () => true, // Don't throw on any status
  };
}
