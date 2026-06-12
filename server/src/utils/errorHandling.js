/**
 * Error Handling and Recovery Utilities
 */

export class AnalyzerError extends Error {
  constructor(message, analyzerName, originalError = null) {
    super(message);
    this.name = "AnalyzerError";
    this.analyzerName = analyzerName;
    this.originalError = originalError;
  }
}

export class SSRFError extends Error {
  constructor(message, url) {
    super(message);
    this.name = "SSRFError";
    this.url = url;
  }
}

export class ValidationError extends Error {
  constructor(message, context = {}) {
    super(message);
    this.name = "ValidationError";
    this.context = context;
  }
}

/**
 * Retry mechanism with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {Object} options - Retry configuration
 * @returns {Promise}
 */
export async function retryWithBackoff(fn, options = {}) {
  const {
    maxRetries = 3,
    initialDelayMs = 100,
    maxDelayMs = 5000,
    backoffMultiplier = 2,
    shouldRetry = (error) => error.code !== "ENOTFOUND",
  } = options;

  let lastError;
  let delayMs = initialDelayMs;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delayMs));

      // Increase delay with backoff
      delayMs = Math.min(delayMs * backoffMultiplier, maxDelayMs);
    }
  }

  throw lastError;
}

/**
 * Timeout wrapper for promises
 * @param {Promise} promise - Promise to wrap
 * @param {number} timeoutMs - Timeout in milliseconds
 * @param {string} timeoutMessage - Error message
 * @returns {Promise}
 */
export async function withTimeout(
  promise,
  timeoutMs,
  timeoutMessage = "Operation timed out",
) {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs),
  );

  return Promise.race([promise, timeoutPromise]);
}

/**
 * Execute with fallback value on error
 * @param {Function} fn - Async function
 * @param {*} fallbackValue - Value to return on error
 * @param {Function} onError - Error handler
 * @returns {Promise}
 */
export async function executeWithFallback(
  fn,
  fallbackValue = null,
  onError = null,
) {
  try {
    return await fn();
  } catch (error) {
    if (onError) {
      onError(error);
    }
    return fallbackValue;
  }
}

/**
 * Execute multiple tasks with error recovery
 * @param {Array<{name: string, fn: Function}>} tasks
 * @param {Object} options - Execution options
 * @returns {Promise<{results: Object, errors: Object}>}
 */
export async function executeWithRecovery(tasks, options = {}) {
  const { parallel = true, stopOnError = false, timeout = null } = options;

  const results = {};
  const errors = {};

  const executeTask = async (task) => {
    try {
      let promise = task.fn();

      if (timeout) {
        promise = withTimeout(
          promise,
          timeout,
          `Task "${task.name}" timed out`,
        );
      }

      results[task.name] = await promise;
    } catch (error) {
      errors[task.name] = {
        message: error.message,
        stack: error.stack,
      };

      if (stopOnError) {
        throw error;
      }
    }
  };

  if (parallel) {
    await Promise.allSettled(tasks.map(executeTask));
  } else {
    for (const task of tasks) {
      await executeTask(task);
    }
  }

  return { results, errors };
}

/**
 * Circuit breaker pattern for reliability
 * Stops making requests after threshold of failures
 */
export class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 60000; // 1 minute
    this.state = "CLOSED"; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.lastFailureTime = null;
  }

  async execute(fn) {
    if (this.state === "OPEN") {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = "HALF_OPEN";
      } else {
        throw new Error("Circuit breaker is OPEN");
      }
    }

    try {
      const result = await fn();

      if (this.state === "HALF_OPEN") {
        this.close();
      }

      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  recordFailure() {
    this.failureCount += 1;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      this.open();
    }
  }

  open() {
    this.state = "OPEN";
  }

  close() {
    this.state = "CLOSED";
    this.failureCount = 0;
    this.lastFailureTime = null;
  }

  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
    };
  }
}

/**
 * Validation helper
 */
export class ResultValidator {
  constructor(schema = {}) {
    this.schema = schema;
  }

  validate(result) {
    const errors = [];

    for (const [field, validators] of Object.entries(this.schema)) {
      if (!validators) continue;

      const value = result[field];

      for (const validator of validators) {
        const error = validator(value);
        if (error) {
          errors.push(`${field}: ${error}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  static required = (value) => {
    return value === null || value === undefined ? "Required" : null;
  };

  static isArray = (value) => {
    return !Array.isArray(value) ? "Must be an array" : null;
  };

  static isObject = (value) => {
    return typeof value !== "object" || value === null
      ? "Must be an object"
      : null;
  };

  static minLength = (min) => (value) => {
    return value && value.length < min ? `Minimum length: ${min}` : null;
  };

  static maxLength = (max) => (value) => {
    return value && value.length > max ? `Maximum length: ${max}` : null;
  };
}

/**
 * Error aggregator for collecting errors from multiple operations
 */
export class ErrorAggregator {
  constructor() {
    this.errors = [];
  }

  add(category, message, context = null) {
    this.errors.push({
      category,
      message,
      context,
      timestamp: new Date().toISOString(),
    });
    return this;
  }

  addError(category, error) {
    return this.add(category, error.message, {
      name: error.name,
      stack: error.stack,
    });
  }

  getErrorsByCategory(category) {
    return this.errors.filter((e) => e.category === category);
  }

  hasErrors(category = null) {
    if (category) {
      return this.getErrorsByCategory(category).length > 0;
    }
    return this.errors.length > 0;
  }

  count(category = null) {
    if (category) {
      return this.getErrorsByCategory(category).length;
    }
    return this.errors.length;
  }

  getAll() {
    return this.errors;
  }

  clear() {
    this.errors = [];
    return this;
  }

  toJSON() {
    return {
      totalErrors: this.errors.length,
      errors: this.errors,
      categorized: this.errors.reduce((acc, err) => {
        acc[err.category] = (acc[err.category] || 0) + 1;
        return acc;
      }, {}),
    };
  }
}
