const ignoredPrefixes = [
  "/_next",
  "/static",
  "/images",
  "/fonts",
  "/node_modules",
  "/ROOT",
];

export const normalizeRoute = (route) => {
  return route.split("?")[0].split("#")[0].replace(/\/$/, "") || "/";
};

export const isValidRoute = (route) => {
  if (!route) return false;

  if (ignoredPrefixes.some((prefix) => route.startsWith(prefix))) {
    return false;
  }

  if (route.startsWith("//")) {
    return false;
  }

  if (route.includes("${")) {
    return false;
  }

  if (route.length < 3) {
    return false;
  }

  if (!route.startsWith("/")) {
    return false;
  }

  if (/\.(js|css|png|jpg|jpeg|svg|gif|webp|ico|woff|woff2|map)$/i.test(route)) {
    return false;
  }

  if (!/[a-zA-Z]/.test(route)) {
    return false;
  }

  return true;
};
