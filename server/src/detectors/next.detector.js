export const detectNextJS = (html, scripts) => {
  return (
    html.includes("/_next/") ||
    scripts.some((script) => script.includes("_next"))
  );
};
