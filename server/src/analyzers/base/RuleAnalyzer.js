import { Analyzer } from "./Analyzer.js";

/**
 * RuleAnalyzer - Base class for rule-based technology detection
 * Eliminates duplication across html.analyzer, meta.analyzer, header.analyzer, etc.
 *
 * Usage:
 *   const analyzer = new RuleAnalyzer("HTML", htmlRules);
 *   const results = analyzer.analyze({ html: "...", scripts: "..." });
 */
export class RuleAnalyzer extends Analyzer {
  constructor(name, rules, options = {}) {
    super(name);
    this.rules = rules || [];
    this.options = {
      caseSensitive: false,
      useSet: true, // Use Set to deduplicate evidence
      ...options,
    };
  }

  /**
   * Analyze content against rules
   * @param {Object} context - Can contain: html, scripts, headers, content, etc.
   * @returns {Array} Findings with technology and evidence
   */
  analyze(context) {
    const results = [];
    const { content = "" } = context;

    for (const rule of this.rules) {
      const evidence = this.options.useSet ? new Set() : [];
      const searchableContent = this.options.caseSensitive
        ? content
        : content.toLowerCase();

      for (const signature of rule.signatures) {
        const searchableSignature = this.options.caseSensitive
          ? signature
          : signature.toLowerCase();

        if (searchableContent.includes(searchableSignature)) {
          if (this.options.useSet) {
            evidence.add(signature);
          } else {
            evidence.push(signature);
          }
        }
      }

      // Check minimum matches threshold
      const evidenceCount = this.options.useSet
        ? evidence.size
        : evidence.length;
      const minMatches = rule.minimumMatches || 1;

      if (evidenceCount >= minMatches) {
        results.push({
          technology: rule.technology,
          evidence: this.options.useSet ? [...evidence] : evidence,
          confidence: Math.min(
            evidenceCount / (rule.signatures.length || 1),
            1,
          ),
        });
      }
    }

    return results;
  }

  /**
   * Extend the rules
   * @param {Array} additionalRules
   */
  addRules(additionalRules) {
    this.rules.push(...additionalRules);
  }

  /**
   * Replace rules
   * @param {Array} newRules
   */
  setRules(newRules) {
    this.rules = newRules;
  }

  getMetadata() {
    return {
      ...super.getMetadata(),
      type: "rule-based",
      ruleCount: this.rules.length,
    };
  }
}
