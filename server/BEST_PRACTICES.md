# Best Practices & Maintenance Guide

## 1. Code Organization

### Analyzer Structure

All analyzers should follow the base class patterns:

```
src/analyzers/
├── base/
│   ├── Analyzer.js          # Base interface
│   ├── RuleAnalyzer.js      # For rule-based detection
│   └── GenericExtractor.js  # For extraction patterns
├── [analyzer-group]/
│   ├── [name]-analyzer.js          # Entry point (implement Analyzer)
│   ├── [name]-discovery.js         # Main logic (use GenericExtractor)
│   ├── [name]-parser.js            # Content extraction
│   ├── [name]-filter.js            # Validation/normalization
│   └── [name]-contexts.js          # Constants/patterns
```

### Configuration Pattern

Never hardcode values. Use `src/config/index.js`:

```javascript
// ❌ Wrong
const timeout = 10000;

// ✅ Correct
import { config } from "../config/index.js";
const timeout = config.http.timeout;
```

## 2. Adding New Analyzers

### Quick Start: Rule-Based Analyzer

```javascript
import { RuleAnalyzer } from "../base/RuleAnalyzer.js";
import { myRules } from "../../rules/my.rules.js";

class MyAnalyzer extends RuleAnalyzer {
  constructor() {
    super("MyAnalyzer", myRules, { caseSensitive: false });
  }

  async analyze(context) {
    // Transform context to content string
    const content = context.html || "";
    return super.analyze({ content });
  }
}

export { MyAnalyzer };
```

### Complex Pattern: Using GenericExtractor

```javascript
import { GenericExtractor } from "../base/GenericExtractor.js";

export const discoverItems = (bundles) => {
  const extractor = new GenericExtractor({
    extractFn: (content) => extractPatterns(content),
    normalizeFn: (item) => normalize(item),
    filterFn: (item) => isValid(item),
    getKeyFn: (item) => item.id,
  });

  return extractor.extract(bundles);
};
```

### Registering in Plugin System (Future)

```javascript
import { AnalyzerRegistry } from "../services/AnalyzerRegistry.js";
import { MyAnalyzer } from "../analyzers/my/my-analyzer.js";

const registry = new AnalyzerRegistry();
registry.register(new MyAnalyzer(), "my-analyzer");
```

## 3. Security Guidelines

### URL Handling

```javascript
import { validateUrlForSSRF } from "../utils/security.js";

const validation = validateUrlForSSRF(url);
if (!validation.valid) {
  console.warn(`Blocked: ${validation.error}`);
  return;
}
```

### Response Validation

```javascript
import { validateResponse } from "../utils/security.js";

const response = await axios.get(url);
const validation = validateResponse(response);
if (!validation.valid) {
  console.warn(`Invalid: ${validation.error}`);
  return;
}
```

### Never Log URLs Without Sanitizing

```javascript
import { sanitizeUrlForLogging } from "../utils/security.js";

logger.info("Processing", {
  url: sanitizeUrlForLogging(fullUrl),
});
```

## 4. Error Handling

### Use Error Recovery

```javascript
import { executeWithRecovery, CircuitBreaker } from "../utils/errorHandling.js";

// Multiple tasks with partial failure recovery
const { results, errors } = await executeWithRecovery(
  [
    { name: "html", fn: () => analyzeHTML(html) },
    { name: "headers", fn: () => analyzeHeaders(headers) },
  ],
  {
    parallel: true,
    stopOnError: false,
  },
);
```

### Use Circuit Breaker for External Services

```javascript
const breaker = new CircuitBreaker({
  failureThreshold: 5,
  resetTimeout: 60000,
});

const response = await breaker.execute(() => fetchExternalAPI(url));
```

### Use Retry with Backoff

```javascript
import { retryWithBackoff } from "../utils/errorHandling.js";

const result = await retryWithBackoff(() => fetchUrl(url), {
  maxRetries: 3,
  initialDelayMs: 100,
  backoffMultiplier: 2,
});
```

## 5. Logging Best Practices

### Always Use Structured Logging

```javascript
import { logger } from "../utils/logging.js";

// ❌ Wrong
console.log("Analyzed: " + url + " found " + count + " routes");

// ✅ Correct
logger.info("Analysis completed", {
  url: sanitizeUrlForLogging(url),
  routeCount: count,
});
```

### Log Key Events

```javascript
import { auditLogger } from "../utils/logging.js";

auditLogger.logAnalysis(url, technologies, routeCount);
auditLogger.logSecurityEvent("SSRF_BLOCKED", { url, reason });
```

### Track Performance

```javascript
import { PerformanceMonitor, metrics } from "../utils/logging.js";

const monitor = new PerformanceMonitor("analysis");
// ... do work ...
monitor.mark("analysis_end");
monitor.log();

metrics.recordHistogram("analysis_duration", monitor.duration());
```

## 6. Testing Recommendations

### Unit Tests for Base Classes

```javascript
describe("RuleAnalyzer", () => {
  it("should detect technologies matching rules", () => {
    const analyzer = new RuleAnalyzer("Test", [
      {
        technology: "React",
        signatures: ["react", "React"],
        minimumMatches: 1,
      },
    ]);

    const results = analyzer.analyze({ content: "import React from 'react'" });
    expect(results).toHaveLength(1);
    expect(results[0].technology).toBe("React");
  });
});
```

### Integration Tests for Analyzers

```javascript
describe("HTMLAnalyzer", () => {
  it("should analyze HTML content", async () => {
    const analyzer = new HTMLAnalyzer();
    const html = '<meta name="generator" content="Next.js">';

    const results = await analyzer.analyze({ html });
    expect(results.some((r) => r.technology === "Next.js")).toBe(true);
  });
});
```

### Security Tests

```javascript
describe("Security", () => {
  it("should block internal IP addresses", () => {
    const validation = validateUrlForSSRF("http://127.0.0.1/api");
    expect(validation.valid).toBe(false);
  });

  it("should block private IP ranges", () => {
    const validation = validateUrlForSSRF("http://192.168.1.1/api");
    expect(validation.valid).toBe(false);
  });
});
```

## 7. Performance Optimization

### Parallelization

```javascript
// ✅ Run independent operations in parallel
const [html, bundles, assets] = await Promise.all([
  fetchHTML(url),
  fetchBundles(url),
  fetchAssets(url),
]);
```

### Avoid String Concatenation in Loops

```javascript
// ❌ Bad
let content = "";
for (const bundle of bundles) {
  content += bundle.content; // Creates many intermediate strings
}

// ✅ Good
const contents = bundles.map((b) => b.content);
const content = contents.join("\n");
```

### Use Maps for Deduplication

```javascript
// ✅ Good - O(1) lookup
const unique = new Map();
for (const item of items) {
  if (!unique.has(item.key)) {
    unique.set(item.key, item);
  }
}
return [...unique.values()];
```

## 8. Configuration Management

### Environment Variables

```bash
# .env.local
HTTP_TIMEOUT=15000
LOG_LEVEL=debug
BUNDLE_FETCH_CONCURRENCY=3
```

### Feature Flags

```javascript
if (config.features.enableSitemapAnalysis) {
  // Run sitemap analysis
}

if (config.features.enableSourceMapAnalysis) {
  // Run source map analysis
}
```

### Error Recovery Modes

```javascript
// 'strict': Stop on first error
// 'partial': Skip failed analyzers, continue
// 'lenient': Gracefully degrade

config.service.errorRecoveryMode = "partial";
```

## 9. Monitoring & Observability

### Key Metrics to Monitor

```javascript
metrics.increment("analysis_completed");
metrics.increment("analysis_failed");
metrics.recordHistogram("analysis_duration", durationMs);
metrics.recordHistogram("bundle_size", sizeBytes);
metrics.recordHistogram("technology_count", count);
```

### Alerts to Setup

- Analysis duration > 30 seconds
- SSRF blocks > 10/hour
- Analyzer failures > 5%
- Bundle fetch timeout rate > 2%
- Memory usage > 512MB

### Logging Levels

```
DEBUG - Detailed information for diagnosing problems
INFO  - Confirmation that everything works as expected
WARN  - Warning about something that might be a problem (SSRF, timeouts)
ERROR - Serious problems, operation failed
```

## 10. Maintainability Checklist

- [ ] No hardcoded values (use config)
- [ ] All URLs sanitized in logs
- [ ] Error messages are informative
- [ ] Async operations have timeouts
- [ ] External calls are validated
- [ ] Duplicate code uses base classes
- [ ] Configuration is centralized
- [ ] Logging is structured
- [ ] New features use existing patterns
- [ ] Code follows existing conventions

---

## Quick Reference

### Import Patterns

```javascript
// Base classes
import { Analyzer } from "./base/Analyzer.js";
import { RuleAnalyzer } from "./base/RuleAnalyzer.js";
import { GenericExtractor } from "./base/GenericExtractor.js";

// Configuration
import { config } from "../config/index.js";

// Security
import { validateUrlForSSRF, validateResponse } from "../utils/security.js";

// Error handling
import {
  retryWithBackoff,
  CircuitBreaker,
  executeWithRecovery,
} from "../utils/errorHandling.js";

// Logging
import {
  logger,
  auditLogger,
  metrics,
  PerformanceMonitor,
} from "../utils/logging.js";

// Analyzers
import { AnalyzerRegistry } from "../services/AnalyzerRegistry.js";
```

---

**Last Updated**: 2026-06-12  
**Version**: 1.0
