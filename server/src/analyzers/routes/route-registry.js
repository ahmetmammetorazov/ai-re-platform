export class RouteRegistry {
  constructor() {
    this.routes = new Map();
  }

  normalizeRoute(path) {
    try {
      const url = new URL(path);

      return url.pathname.replace(/\/$/, "") || "/";
    } catch {
      return path.replace(/\/$/, "") || "/";
    }
  }

  addRoute(path, source) {
    if (!path) return;

    const normalizedPath = this.normalizeRoute(path);

    if (!this.routes.has(normalizedPath)) {
      this.routes.set(normalizedPath, {
        path: normalizedPath,
        sources: new Set(),
      });
    }

    this.routes.get(normalizedPath).sources.add(source);
  }

  getRoutes() {
    return [...this.routes.values()]
      .map((route) => ({
        path: route.path,
        sources: [...route.sources],
      }))
      .sort((a, b) => a.path.localeCompare(b.path));
  }
}
