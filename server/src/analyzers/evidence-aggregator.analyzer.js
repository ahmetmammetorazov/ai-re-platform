import { SOURCE_WEIGHTS } from "../constants/source-weights.js";

export const aggregateEvidence = ({
  htmlEvidence = [],
  headerEvidence = [],
  bundleEvidence = [],
  metaEvidence = [],
  domEvidence = [],
}) => {
  const technologies = new Map();

  const addEvidence = (source, findings) => {
    for (const finding of findings) {
      const technology = finding.technology;

      if (!technologies.has(technology)) {
        technologies.set(technology, {
          technology,
          confidence: "Low",
          score: 0,
          evidence: {},
        });
      }

      const tech = technologies.get(technology);

      tech.evidence[source] = finding.evidence;
    }
  };

  addEvidence("html", htmlEvidence);

  addEvidence("headers", headerEvidence);

  addEvidence("bundles", bundleEvidence);

  addEvidence("meta", metaEvidence);

  addEvidence("dom", domEvidence);

  for (let tech of technologies.values()) {
    const score = Object.keys(tech.evidence).reduce(
      (total, source) => total + SOURCE_WEIGHTS[source],
      0,
    );

    if (score >= 70) {
      tech.confidence = "High";
    } else if (score >= 40) {
      tech.confidence = "Medium";
    } else {
      tech.confidence = "Low";
    }

    tech.score = score;
  }

  return [...technologies.values()];
};
