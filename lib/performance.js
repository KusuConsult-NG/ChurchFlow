/**
 * Performance monitoring utilities
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.thresholds = {
      slowQuery: 1000, // 1 second
      slowApi: 2000, // 2 seconds
      slowPage: 3000 // 3 seconds
    };
  }

  startTimer(label) {
    const startTime = performance.now();
    return {
      end: () => {
        const duration = performance.now() - startTime;
        this.recordMetric(label, duration);
        return duration;
      }
    };
  }

  recordMetric(label, value) {
    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }

    const metrics = this.metrics.get(label);
    metrics.push({
      value,
      timestamp: Date.now()
    });

    // Keep only last 100 measurements
    if (metrics.length > 100) {
      metrics.shift();
    }

    // Log slow operations
    if (this.isSlowOperation(label, value)) {
      console.warn(`[PERFORMANCE] Slow ${label}: ${value.toFixed(2)}ms`);
    }
  }

  isSlowOperation(label, value) {
    if (label.includes('query') && value > this.thresholds.slowQuery)
      return true;
    if (label.includes('api') && value > this.thresholds.slowApi) return true;
    if (label.includes('page') && value > this.thresholds.slowPage) return true;
    return false;
  }

  getMetrics(label) {
    const metrics = this.metrics.get(label) || [];
    if (metrics.length === 0) return null;

    const values = metrics.map(m => m.value);
    return {
      count: values.length,
      average: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      p95: this.percentile(values, 0.95),
      p99: this.percentile(values, 0.99)
    };
  }

  percentile(values, p) {
    const sorted = values.sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[index];
  }

  getAllMetrics() {
    const result = {};
    for (const [label] of this.metrics) {
      result[label] = this.getMetrics(label);
    }
    return result;
  }

  reset() {
    this.metrics.clear();
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Higher-order function to measure API performance
 */
export function measureApiPerformance(handler) {
  return async (req, context) => {
    const timer = performanceMonitor.startTimer(`api-${req.nextUrl.pathname}`);

    try {
      const result = await handler(req, context);
      timer.end();
      return result;
    } catch (error) {
      timer.end();
      throw error;
    }
  };
}

/**
 * Higher-order function to measure database query performance
 */
export function measureQueryPerformance(queryName) {
  return function (target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args) {
      const timer = performanceMonitor.startTimer(`query-${queryName}`);

      try {
        const result = await originalMethod.apply(this, args);
        timer.end();
        return result;
      } catch (error) {
        timer.end();
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Memory usage monitoring
 */
export function getMemoryUsage() {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const usage = process.memoryUsage();
    return {
      rss: Math.round(usage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
      external: Math.round(usage.external / 1024 / 1024) // MB
    };
  }
  return null;
}

/**
 * Database connection monitoring
 */
export async function checkDatabaseHealth(prisma) {
  const startTime = performance.now();

  try {
    await prisma.$queryRaw`SELECT 1`;
    const responseTime = performance.now() - startTime;

    return {
      status: 'healthy',
      responseTime: Math.round(responseTime),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      responseTime: Math.round(performance.now() - startTime),
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * System resource monitoring
 */
export function getSystemMetrics() {
  return {
    uptime: process.uptime(),
    memory: getMemoryUsage(),
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    cpuUsage: process.cpuUsage(),
    timestamp: new Date().toISOString()
  };
}
