import { RuleAnalyzer } from "./base/RuleAnalyzer.js";
import { headerRules } from "../rules/header.rules.js";

/**
 * Header Analyzer - Detects technologies from HTTP response headers
 * Refactored to use RuleAnalyzer base class
 */
class HeaderAnalyzer extends RuleAnalyzer {
  constructor() {
    super("Headers", headerRules, {
      caseSensitive: false,
      useSet: true,
    });
  }

  async analyze(context) {
    const { headers = {} } = context;

    // Convert headers object to searchable string
    const headerContent = Object.entries(headers)
      .map(([key, value]) => `${key} ${value}`)
      .join(" ");

    return super.analyze({ content: headerContent });
  }
}

// Export both class and function for backward compatibility
export const analyzeHeaders = (headers) => {
  const analyzer = new HeaderAnalyzer();
  return analyzer.analyze({ headers });
};

export { HeaderAnalyzer };
