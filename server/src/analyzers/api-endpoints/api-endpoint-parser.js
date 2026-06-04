import { API_PATTERNS } from "./api-endpoint-contexts.js";

export const extractApiEndpoints = (content) => {
  if (!content || typeof content !== "string") {
    return [];
  }

  const endpoints = [];

  for (const pattern of API_PATTERNS) {
    const matches = content.match(pattern) || [];

    endpoints.push(...matches);
  }

  return [...new Set(endpoints)];
};
