export const routePatterns = [
  {
    type: "router.push",
    confidence: 95,
    regex: /router\.push\(["'`](\/[^"'`]+)["'`]\)/g,
  },

  {
    type: "navigate",
    confidence: 95,
    regex: /navigate\(["'`](\/[^"'`]+)["'`]\)/g,
  },

  {
    type: "pathname",
    confidence: 85,
    regex: /pathname:\s*["'`](\/[^"'`]+)["'`]/g,
  },

  {
    type: "href",
    confidence: 75,
    regex: /href:\s*["'`](\/[^"'`]+)["'`]/g,
  },

  {
    type: "route",
    confidence: 85,
    regex: /route:\s*["'`](\/[^"'`]+)["'`]/g,
  },

  {
    type: "page",
    confidence: 85,
    regex: /page:\s*["'`](\/[^"'`]+)["'`]/g,
  },
];
