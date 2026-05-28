export const detectVue = (html, scripts) => {
  return (
    html.includes("vue") ||
    scripts.some((script) => script.toLowerCase().includes("vue"))
  );
};
