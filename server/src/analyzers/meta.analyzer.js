import { RuleAnalyzer } from "./base/RuleAnalyzer.js";
import { metaRules } from "../rules/meta.rules.js";

/**
 * Meta Tags Analyzer - Detects technologies from meta tags
 * Refactored to use RuleAnalyzer base class
 */
class MetaAnalyzer extends RuleAnalyzer {
  constructor() {
    super("Meta", metaRules, {
      caseSensitive: false,
      useSet: true,
    });
  }

  async analyze(context) {
    const { html = "" } = context;

    // Extract meta tags and combine into searchable content
    const metaTags = [
      ...html.matchAll(
        /<meta[^>]*name=["']([^"']+)["'][^>]*content=["']([^"']+)["'][^>]*>/gi,
      ),
    ];

    const metaContent = metaTags
      .map(([, name, content]) => `${name} ${content}`)
      .join(" ");

    return super.analyze({ content: metaContent });
  }
}

// Export both class and function for backward compatibility
export const analyzeMetaTags = (html) => {
  const analyzer = new MetaAnalyzer();
  return analyzer.analyze({ html });
};

export { MetaAnalyzer };
