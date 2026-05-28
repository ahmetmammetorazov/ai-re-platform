export const extractScripts = (html) => {
  const scriptRegex = /<script[^>]*src=[\"']([^\"']+)[\"']/g;

  const scripts = [];

  let match;

  while ((match = scriptRegex.exec(html)) !== null) {
    scripts.push(match[1]);
  }

  return scripts;
};
