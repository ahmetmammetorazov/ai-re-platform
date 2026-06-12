/**
 * Logging and Observability Utilities
 * Structured logging for better monitoring and debugging
 */

import { config } from "../config/index.js";

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const LEVEL_NAMES = {
  0: "DEBUG",
  1: "INFO",
  2: "WARN",
  3: "ERROR",
};

/**
 * Logger class for structured logging
 */
export class Logger {
  constructor(context = {}) {
    this.context = {
      service: "ai-re-platform",
      ...context,
    };
    this.minLevel = LOG_LEVELS[config.logging.level?.toUpperCase() || "INFO"];
  }

  /**
   * Format log message
   */
  _format(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const levelName = LEVEL_NAMES[level];

    if (config.logging.format === "json") {
      return JSON.stringify({
        timestamp,
        level: levelName,
        message,
        ...this.context,
        ...data,
      });
    } else {
      // Text format
      const dataStr =
        Object.keys(data).length > 0 ? ` ${JSON.stringify(data)}` : "";
      return `[${timestamp}] ${levelName} ${message}${dataStr}`;
    }
  }

  /**
   * Log at level
   */
  _log(level, message, data = {}) {
    if (level < this.minLevel) {
      return;
    }

    const formatted = this._format(level, message, data);

    if (level === LOG_LEVELS.ERROR) {
      console.error(formatted);
    } else if (level === LOG_LEVELS.WARN) {
      console.warn(formatted);
    } else {
      console.log(formatted);
    }
  }

  debug(message, data = {}) {
    this._log(LOG_LEVELS.DEBUG, message, data);
  }

  info(message, data = {}) {
    this._log(LOG_LEVELS.INFO, message, data);
  }

  warn(message, data = {}) {
    this._log(LOG_LEVELS.WARN, message, data);
  }

  error(message, error = null, data = {}) {
    const errorData = error
      ? {
          errorName: error.name,
          errorMessage: error.message,
          ...data,
        }
      : data;

    this._log(LOG_LEVELS.ERROR, message, errorData);

    // In debug mode, include stack trace
    if (config.logging.level === "debug" && error && error.stack) {
      console.error(error.stack);
    }
  }

  /**
   * Log with request/response context
   */
  logRequest(method, url, status, durationMs, data = {}) {
    const logData = {
      method,
      url: config.logging.redactSensitiveData ? this._sanitizeUrl(url) : url,
      status,
      durationMs,
      ...data,
    };

    const level = status >= 400 ? LOG_LEVELS.WARN : LOG_LEVELS.INFO;
    this._log(level, "HTTP Request", logData);
  }

  /**
   * Log analyzer execution
   */
  logAnalyzer(name, duration, count, error = null) {
    const logData = {
      analyzer: name,
      durationMs: duration,
      count,
    };

    if (error) {
      this.error(`Analyzer failed: ${name}`, error, logData);
    } else {
      this.info(`Analyzer completed: ${name}`, logData);
    }
  }

  /**
   * Sanitize URL for logging
   */
  _sanitizeUrl(url) {
    try {
      const parsed = new URL(url);
      return `${parsed.protocol}//${parsed.hostname}${parsed.pathname}`;
    } catch {
      return "[invalid-url]";
    }
  }

  /**
   * Create child logger with additional context
   */
  createChild(additionalContext = {}) {
    return new Logger({
      ...this.context,
      ...additionalContext,
    });
  }
}

/**
 * Global logger instance
 */
export const logger = new Logger({
  service: "ai-re-platform",
});

/**
 * Performance monitoring utility
 */
export class PerformanceMonitor {
  constructor(name) {
    this.name = name;
    this.startTime = Date.now();
    this.marks = {};
  }

  /**
   * Mark a point in time
   */
  mark(label) {
    this.marks[label] = Date.now() - this.startTime;
    return this;
  }

  /**
   * Measure time between marks
   */
  measure(fromLabel, toLabel) {
    if (!this.marks[fromLabel] || !this.marks[toLabel]) {
      return null;
    }
    return this.marks[toLabel] - this.marks[fromLabel];
  }

  /**
   * Get total duration
   */
  duration() {
    return Date.now() - this.startTime;
  }

  /**
   * Log performance summary
   */
  log() {
    const total = this.duration();
    logger.info(`Performance: ${this.name}`, {
      totalMs: total,
      marks: this.marks,
    });
  }

  /**
   * Get summary object
   */
  getSummary() {
    return {
      name: this.name,
      totalMs: this.duration(),
      marks: this.marks,
    };
  }
}

/**
 * Audit logging for sensitive operations
 */
export class AuditLogger {
  constructor() {
    this.logger = new Logger({ component: "audit" });
  }

  /**
   * Log analysis operation
   */
  logAnalysis(url, technologies, routeCount, status = "success", error = null) {
    this.logger.info("Analysis Operation", {
      url: config.logging.redactSensitiveData ? this._sanitize(url) : url,
      technologyCount: technologies.length,
      routeCount,
      status,
      error: error ? error.message : null,
    });
  }

  /**
   * Log security event
   */
  logSecurityEvent(type, details) {
    this.logger.warn("Security Event", {
      type,
      ...details,
    });
  }

  /**
   * Log access
   */
  logAccess(clientIP, endpoint, status) {
    this.logger.info("Access Log", {
      ip: clientIP,
      endpoint,
      status,
    });
  }

  _sanitize(value) {
    try {
      const url = new URL(value);
      return `${url.protocol}//${url.hostname}`;
    } catch {
      return "[sanitized]";
    }
  }
}

export const auditLogger = new AuditLogger();

/**
 * Metrics collection
 */
export class Metrics {
  constructor() {
    this.counters = {};
    this.histograms = {};
  }

  /**
   * Increment counter
   */
  increment(name, value = 1) {
    this.counters[name] = (this.counters[name] || 0) + value;
  }

  /**
   * Record histogram value
   */
  recordHistogram(name, value) {
    if (!this.histograms[name]) {
      this.histograms[name] = [];
    }
    this.histograms[name].push(value);
  }

  /**
   * Get counter value
   */
  getCounter(name) {
    return this.counters[name] || 0;
  }

  /**
   * Calculate histogram statistics
   */
  getHistogramStats(name) {
    const values = this.histograms[name] || [];
    if (values.length === 0) return null;

    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / values.length;
    const median = sorted[Math.floor(sorted.length / 2)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    const p99 = sorted[Math.floor(sorted.length * 0.99)];

    return {
      count: values.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      mean,
      median,
      p95,
      p99,
    };
  }

  /**
   * Get all metrics
   */
  getAll() {
    const histogramStats = {};
    for (const name of Object.keys(this.histograms)) {
      histogramStats[name] = this.getHistogramStats(name);
    }

    return {
      counters: this.counters,
      histograms: histogramStats,
    };
  }

  /**
   * Reset metrics
   */
  reset() {
    this.counters = {};
    this.histograms = {};
  }
}

export const metrics = new Metrics();

/**
 * Decorator for automatic logging and metrics
 */
export function logged(target, propertyKey, descriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args) {
    const startTime = Date.now();
    const methodName = `${target.constructor.name}.${propertyKey}`;

    try {
      logger.debug(`Method called: ${methodName}`);
      const result = await originalMethod.apply(this, args);
      const duration = Date.now() - startTime;

      logger.debug(`Method completed: ${methodName}`, { durationMs: duration });
      metrics.recordHistogram(`method_duration_${methodName}`, duration);

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`Method failed: ${methodName}`, error, {
        durationMs: duration,
      });
      throw error;
    }
  };

  return descriptor;
}
