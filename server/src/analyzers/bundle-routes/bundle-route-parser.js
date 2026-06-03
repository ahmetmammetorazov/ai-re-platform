import { routePatterns } from "./bundle-route-contexts.js";

export const extractRouteCandidates = (content) => {
  const findings = [];

  for (const pattern of routePatterns) {
    const matches = content.matchAll(pattern.regex);

    for (const match of matches) {
      findings.push({
        path: match[1],

        evidence: pattern.type,

        confidence: pattern.confidence,
      });
    }
  }

  return findings;
};
