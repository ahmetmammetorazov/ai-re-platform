export const detectTechnology = (html, scripts, rule) => {
  const evidence = [];

  for (const pattern of rule.evidence) {
    const foundInHtml = html.includes(pattern);

    const foundInScripts = scripts.some((script) => script.includes(pattern));

    if (foundInHtml || foundInScripts) {
      evidence.push(pattern);
    }
  }

  if (evidence.length === 0) {
    return null;
  }

  return {
    name: rule.name,
    confidence: Math.min(evidence.length * 35, 100),
    evidence,
  };
};
