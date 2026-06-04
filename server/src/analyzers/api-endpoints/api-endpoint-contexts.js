export const API_PATTERNS = [
  /\/api\/[a-zA-Z0-9\-_/]+(?:\?[^\s"'`]*)?/g,
  /\/v\d+\/[a-zA-Z0-9\-_/]+(?:\?[^\s"'`]*)?/g,
  /\/graphql\b/g,
];
