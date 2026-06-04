const INVALID_PREFIXES = ["/_next", "/static", "/assets"];

const INVALID_EXTENSIONS = [
  ".js",
  ".css",
  ".png",
  ".jpg",
  ".jpeg",
  ".svg",
  ".ico",
  ".webp",
];

const EXCLUDED_SEGMENTS = ["/docs/", "/.well-known/"];

export const normalizeEndpoint = (endpoint) => {
  if (!endpoint) return null;

  const [path] = endpoint.split("?");

  return path.replace(/\/+$/, "");
};

export const isValidEndpoint = (endpoint) => {
  if (!endpoint) return false;

  if (endpoint.includes("${")) {
    return false;
  }

  if (INVALID_PREFIXES.some((prefix) => endpoint.startsWith(prefix))) {
    return false;
  }

  if (EXCLUDED_SEGMENTS.some((segment) => endpoint.includes(segment))) {
    return false;
  }

  if (INVALID_EXTENSIONS.some((ext) => endpoint.endsWith(ext))) {
    return false;
  }

  return true;
};
