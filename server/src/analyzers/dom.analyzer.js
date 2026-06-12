import { RuleAnalyzer } from "./base/RuleAnalyzer.js";
import { domRules } from "../rules/dom.rules.js";

/**
 * DOM Analyzer - Detects technologies from DOM structure
 * Refactored to use RuleAnalyzer base class
 */
class DOMAnalyzer extends RuleAnalyzer {
  constructor() {
    super("DOM", domRules, {
      caseSensitive: false,
      useSet: true,
    });
  }

  async analyze(context) {
    const { html = "" } = context;
    return super.analyze({ content: html });
  }
}

// Export both class and function for backward compatibility
export const analyzeDom = (html) => {
  const analyzer = new DOMAnalyzer();
  return analyzer.analyze({ html });
};

export { DOMAnalyzer };
