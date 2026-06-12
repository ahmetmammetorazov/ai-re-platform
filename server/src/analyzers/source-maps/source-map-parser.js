export const extractSourceMapUrl = (bundle) => {
  if (!bundle?.content) {
    return null;
  }

  const match = bundle.content.match(/\/\/# sourceMappingURL=(.+)/i);

  if (!match) {
    return null;
  }

  return match[1].trim();
};
