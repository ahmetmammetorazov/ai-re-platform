export const detectReact = (html, scripts) => {
  return (
    html.includes("react") ||
    html.includes("__REACT_DEVTOOLS") ||
    scripts.some((script) => script.toLowerCase().includes("react"))
  );
};
