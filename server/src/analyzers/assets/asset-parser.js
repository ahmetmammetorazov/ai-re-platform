export const extractAssets = (html) => {
  const scripts = [...html.matchAll(/<script[^>]*src=["']([^"']+)["']/gi)].map(
    (match) => match[1],
  );

  const stylesheets = [
    ...html.matchAll(/<link[^>]*href=["']([^"']+\.css[^"']*)["']/gi),
  ].map((match) => match[1]);

  const images = [...html.matchAll(/<img[^>]*src=["']([^"']+)["']/gi)].map(
    (match) => match[1],
  );

  const fonts = [...html.matchAll(/["']([^"']+\.(woff2?|ttf|otf))["']/gi)].map(
    (match) => match[1],
  );

  return {
    scripts,
    stylesheets,
    images,
    fonts,
  };
};
