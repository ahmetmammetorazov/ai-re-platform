/**
 * AnalyzerRegistry - Plugin Architecture for Managing Analyzers
 *
 * This registry:
 * - Registers and manages multiple analyzers
 * - Executes them in parallel or sequence
 * - Provides error recovery and fallback options
 * - Allows easy extension without modifying service layer
 *
 * Usage:
 *   const registry = new AnalyzerRegistry()
 *     .register(new HTMLAnalyzer(config.rules.html))
 *     .register(new MetaAnalyzer(config.rules.meta))
 *     .register(new ApiEndpointAnalyzer());
 *
 *   const results = await registry.analyzeAll(context);
 */

import { config } from "../config/index.js";

export class AnalyzerRegistry {
  constructor(options = {}) {
    this.analyzers = [];
    this.options = {
      parallel: true, // Run all analyzers in parallel
      continueOnError: true, // Continue even if one analyzer fails
      errorMode: options.errorMode || config.service.errorRecoveryMode, // 'strict', 'partial', 'lenient'
      timeout: options.timeout || config.http.timeout,
      ...options,
    };
    this.results = {};
  }

  /**
   * Register an analyzer
   * @param {Analyzer} analyzer - Instance of analyzer
   * @param {string} name - Optional name override
   * @returns {AnalyzerRegistry} - For chaining
   */
  register(analyzer, name = null) {
    const analyzerName =
      name || analyzer.name || `Analyzer_${this.analyzers.length}`;
    this.analyzers.push({
      analyzer,
      name: analyzerName,
    });
    return this;
  }

  /**
   * Register multiple analyzers
   * @param {Array} analyzers - Array of analyzer instances
   * @returns {AnalyzerRegistry} - For chaining
   */
  registerMultiple(analyzers) {
    analyzers.forEach((a) => this.register(a));
    return this;
  }

  /**
   * Unregister an analyzer by name
   * @param {string} name
   * @returns {AnalyzerRegistry} - For chaining
   */
  unregister(name) {
    this.analyzers = this.analyzers.filter((a) => a.name !== name);
    return this;
  }

  /**
   * Get registered analyzer by name
   * @param {string} name
   * @returns {Analyzer|null}
   */
  getAnalyzer(name) {
    const entry = this.analyzers.find((a) => a.name === name);
    return entry ? entry.analyzer : null;
  }

  /**
   * List all registered analyzers
   * @returns {Array<{name: string, analyzer: Analyzer}>}
   */
  getAnalyzers() {
    return [...this.analyzers];
  }

  /**
   * Execute all analyzers on context
   * @param {Object} context - Analysis context with html, headers, bundles, etc.
   * @returns {Promise<Object>} - Results keyed by analyzer name
   */
  async analyzeAll(context) {
    const results = {};

    if (this.options.parallel) {
      return this._analyzeParallel(context);
    } else {
      return this._analyzeSequential(context);
    }
  }

  /**
   * Execute analyzers in parallel
   * @private
   */
  async _analyzeParallel(context) {
    const promises = this.analyzers.map(({ analyzer, name }) =>
      this._executeAnalyzer(analyzer, name, context)
        .then((result) => ({ name, result, error: null }))
        .catch((error) => ({
          name,
          result: null,
          error,
        })),
    );

    const results = {};
    const settledResults = await Promise.all(promises);

    for (const { name, result, error } of settledResults) {
      if (error) {
        if (this.options.errorMode === "strict") {
          throw error;
        }
        console.warn(`Analyzer "${name}" failed: ${error.message}`);
        results[name] = { error: error.message };
      } else {
        results[name] = result;
      }
    }

    return results;
  }

  /**
   * Execute analyzers sequentially
   * @private
   */
  async _analyzeSequential(context) {
    const results = {};

    for (const { analyzer, name } of this.analyzers) {
      try {
        const result = await this._executeAnalyzer(analyzer, name, context);
        results[name] = result;
      } catch (error) {
        if (this.options.errorMode === "strict") {
          throw error;
        }
        console.warn(`Analyzer "${name}" failed: ${error.message}`);
        results[name] = { error: error.message };
      }
    }

    return results;
  }

  /**
   * Execute single analyzer with timeout
   * @private
   */
  async _executeAnalyzer(analyzer, name, context) {
    return Promise.race([
      analyzer.analyze(context),
      this._createTimeout(this.options.timeout, `Analyzer "${name}" timed out`),
    ]);
  }

  /**
   * Create a timeout promise
   * @private
   */
  _createTimeout(ms, message) {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error(message)), ms),
    );
  }

  /**
   * Get result from specific analyzer
   * @param {string} name
   * @returns {any}
   */
  getResult(name) {
    return this.results[name];
  }

  /**
   * Validate all analyzers
   * @returns {Array<{name: string, valid: boolean, error?: string}>}
   */
  validate() {
    return this.analyzers.map(({ analyzer, name }) => {
      try {
        const valid = analyzer.validate ? analyzer.validate() : true;
        return {
          name,
          valid,
        };
      } catch (error) {
        return {
          name,
          valid: false,
          error: error.message,
        };
      }
    });
  }

  /**
   * Get metadata about all analyzers
   * @returns {Object}
   */
  getMetadata() {
    return {
      count: this.analyzers.length,
      analyzers: this.analyzers.map(({ analyzer, name }) => ({
        name,
        metadata: analyzer.getMetadata ? analyzer.getMetadata() : {},
      })),
      config: {
        parallel: this.options.parallel,
        continueOnError: this.options.continueOnError,
        timeout: this.options.timeout,
      },
    };
  }

  /**
   * Reset results
   */
  resetResults() {
    this.results = {};
    return this;
  }

  /**
   * Clone registry with same analyzers
   * @returns {AnalyzerRegistry}
   */
  clone() {
    const cloned = new AnalyzerRegistry(this.options);
    this.analyzers.forEach(({ analyzer, name }) => {
      cloned.register(analyzer, name);
    });
    return cloned;
  }
}

/**
 * Factory function to create default analyzer registry
 * with all standard analyzers
 *
 * @param {Object} cfg - Config object
 * @returns {AnalyzerRegistry}
 */
export function createDefaultAnalyzerRegistry(cfg = config) {
  const registry = new AnalyzerRegistry({
    parallel: true,
    continueOnError: true,
  });

  // Analyzers will be registered here by the service
  // This is just a factory for convenience

  return registry;
}
