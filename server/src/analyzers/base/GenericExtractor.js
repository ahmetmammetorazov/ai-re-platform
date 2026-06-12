/**
 * GenericExtractor - Base class for extraction-based analyzers
 * Eliminates duplication across api-endpoint-discovery, bundle-route-discovery, etc.
 *
 * Pattern this handles:
 * 1. Iterate over sources (bundles, html, etc.)
 * 2. Extract items using provided function
 * 3. Normalize items
 * 4. Filter/validate items
 * 5. Deduplicate using Map
 * 6. Return array of unique results
 *
 * Usage:
 *   const extractor = new GenericExtractor({
 *     extractFn: (content) => extractApiEndpoints(content),
 *     normalizeFn: (item) => normalizeEndpoint(item),
 *     filterFn: (normalized) => isValidEndpoint(normalized),
 *     getKeyFn: (item) => item.path,
 *   });
 *   const results = extractor.extract(bundles);
 */
export class GenericExtractor {
  constructor({
    extractFn = (content) => [],
    normalizeFn = (item) => item,
    filterFn = (item) => true,
    getKeyFn = (item) => JSON.stringify(item),
    sourceKey = "content", // key to access extractable content
  } = {}) {
    this.extractFn = extractFn;
    this.normalizeFn = normalizeFn;
    this.filterFn = filterFn;
    this.getKeyFn = getKeyFn;
    this.sourceKey = sourceKey;
  }

  /**
   * Extract and deduplicate items from sources
   * @param {Array} sources - Array of objects with extractable content
   * @param {Object} options - Additional extraction options
   * @returns {Array} Deduplicated extracted items
   */
  extract(sources, options = {}) {
    const results = new Map();
    const { transformFn = (item) => item } = options;

    for (const source of sources) {
      // Handle both direct content and nested sourceKey
      const content =
        typeof source === "string" ? source : source[this.sourceKey];

      if (!content) continue;

      try {
        const extracted = this.extractFn(content);

        for (const item of extracted) {
          const normalized = this.normalizeFn(item);

          if (!this.filterFn(normalized)) {
            continue;
          }

          const key = this.getKeyFn(normalized);
          const transformed = transformFn(normalized);

          // Keep first found or override based on priority
          if (!results.has(key)) {
            results.set(key, transformed);
          }
        }
      } catch (error) {
        console.warn(`Failed to extract from source: ${error.message}`);
        continue;
      }
    }

    return [...results.values()];
  }

  /**
   * Extract with priority/confidence comparison
   * Allows replacing items based on confidence or priority
   *
   * @param {Array} sources
   * @param {Function} priorityFn - (newItem, existingItem) => boolean (true to replace)
   * @returns {Array}
   */
  extractWithPriority(sources, priorityFn = () => false) {
    const results = new Map();

    for (const source of sources) {
      const content =
        typeof source === "string" ? source : source[this.sourceKey];

      if (!content) continue;

      try {
        const extracted = this.extractFn(content);

        for (const item of extracted) {
          const normalized = this.normalizeFn(item);

          if (!this.filterFn(normalized)) {
            continue;
          }

          const key = this.getKeyFn(normalized);
          const existing = results.get(key);

          if (!existing || priorityFn(normalized, existing)) {
            results.set(key, normalized);
          }
        }
      } catch (error) {
        console.warn(`Failed to extract from source: ${error.message}`);
        continue;
      }
    }

    return [...results.values()];
  }

  /**
   * Set extraction functions (for chaining)
   */
  setExtractFn(fn) {
    this.extractFn = fn;
    return this;
  }

  setNormalizeFn(fn) {
    this.normalizeFn = fn;
    return this;
  }

  setFilterFn(fn) {
    this.filterFn = fn;
    return this;
  }

  setGetKeyFn(fn) {
    this.getKeyFn = fn;
    return this;
  }
}
