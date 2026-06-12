import { RuleAnalyzer } from "./base/RuleAnalyzer.js";
import { htmlRules } from "../rules/html.rules.js";

/**
 * HTML Analyzer - Detects technologies from HTML content
 * Refactored to use RuleAnalyzer base class
 */
class HTMLAnalyzer extends RuleAnalyzer {
  constructor() {
    super("HTML", htmlRules, {
      caseSensitive: false,
      useSet: true,
    });
  }

  async analyze(context) {
    // Combine HTML and scripts content for searching
    const { html = "", scripts = [] } = context;
    const scriptContent = Array.isArray(scripts) ? scripts.join("\n") : scripts;
    const combinedContent = `${html}\n${scriptContent}`;

    return super.analyze({ content: combinedContent });
  }
}

// Export both class and function for backward compatibility
export const analyzeHTML = (html, scripts) => {
  const analyzer = new HTMLAnalyzer();
  return analyzer.analyze({ html, scripts });
};

export { HTMLAnalyzer };
