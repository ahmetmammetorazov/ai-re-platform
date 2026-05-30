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
          evidence: {},
        });
      }

      const tech = technologies.get(technology);

      tech.evidence[source] = finding.evidence;
      const sourceCount = Object.keys(tech.evidence).length;
      if (sourceCount >= 3) {
        tech.confidence = "High";
      } else if (sourceCount >= 2) {
        tech.confidence = "Medium";
      } else {
        tech.confidence = "Low";
      }
    }
  };

  addEvidence("html", htmlEvidence);

  addEvidence("headers", headerEvidence);

  addEvidence("bundles", bundleEvidence);

  addEvidence("meta", metaEvidence);

  addEvidence("dom", domEvidence);

  return [...technologies.values()];
};
