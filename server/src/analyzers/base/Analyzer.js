/**
 * Base Analyzer Interface/Abstract Class
 * All analyzers should inherit from or implement this interface
 */

export class Analyzer {
  constructor(name) {
    this.name = name;
  }

  /**
   * Analyze context and return findings
   * @param {Object} context - Analysis context containing html, headers, bundles, etc.
   * @returns {Promise<Array|Object>} Analysis results
   */
  async analyze(context) {
    throw new Error("analyze() must be implemented by subclass");
  }

  /**
   * Validate analyzer configuration
   * @returns {boolean}
   */
  validate() {
    return true;
  }

  /**
   * Get analyzer metadata
   * @returns {Object}
   */
  getMetadata() {
    return {
      name: this.name,
      version: "1.0.0",
      type: "unknown",
    };
  }
}
