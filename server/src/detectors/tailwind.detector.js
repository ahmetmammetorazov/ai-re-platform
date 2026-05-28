export const detectTailwind = (html) => {
  return html.includes("tailwind") || html.includes("--tw-");
};
