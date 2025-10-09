// tests/api/health.test.js
import { GET, HEAD } from '../../app/api/health/route.js';

// Mock Prisma
jest.mock('../../lib/database-config.js', () => ({
  getPrismaClient: jest.fn()
}));

// Mock Redis
jest.mock('redis', () => ({
  createClient: jest.fn()
}));

describe('/api/health', () => {
  let mockPrisma;
  let mockRedisClient;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Prisma client
    mockPrisma = {
      $queryRaw: jest.fn()
    };

    // Mock Redis client
    mockRedisClient = {
      connect: jest.fn(),
      ping: jest.fn(),
      quit: jest.fn()
    };

    const { getPrismaClient } = require('../../lib/database-config.js');
    const redis = require('redis');

    getPrismaClient.mockResolvedValue(mockPrisma);
    redis.createClient.mockReturnValue(mockRedisClient);
  });

  describe('GET /api/health', () => {
    test('should return healthy status when all checks pass', async () => {
      // Mock successful database check
      mockPrisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

      // Mock successful Redis check
      mockRedisClient.connect.mockResolvedValue();
      mockRedisClient.ping.mockResolvedValue('PONG');
      mockRedisClient.quit.mockResolvedValue();

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('ok');
      expect(data.checks.database.status).toBe('ok');
      expect(data.checks.redis.status).toBe('ok');
      expect(data).toHaveProperty('timestamp');
      expect(data).toHaveProperty('uptime');
      expect(data).toHaveProperty('environment');
      expect(data).toHaveProperty('version');
    });

    test('should return error status when database check fails', async () => {
      // Mock failed database check
      mockPrisma.$queryRaw.mockRejectedValue(
        new Error('Database connection failed')
      );

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.status).toBe('error');
      expect(data.checks.database.status).toBe('error');
      expect(data.checks.database.error).toBe('Database connection failed');
    });

    test('should return warning status when Redis is not configured', async () => {
      // Mock successful database check
      mockPrisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

      // Remove Redis URL from environment
      const originalRedisUrl = process.env.REDIS_URL;
      delete process.env.REDIS_URL;

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('warning');
      expect(data.checks.database.status).toBe('ok');
      expect(data.checks.redis).toBeUndefined();

      // Restore environment
      process.env.REDIS_URL = originalRedisUrl;
    });

    test('should return warning status when email service is not configured', async () => {
      // Mock successful database check
      mockPrisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

      // Remove email configuration
      const originalSendGridKey = process.env.SENDGRID_API_KEY;
      const originalSmtpHost = process.env.SMTP_HOST;
      delete process.env.SENDGRID_API_KEY;
      delete process.env.SMTP_HOST;

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('warning');
      expect(data.checks.email.status).toBe('warning');
      expect(data.checks.email.message).toBe('No email service configured');

      // Restore environment
      process.env.SENDGRID_API_KEY = originalSendGridKey;
      process.env.SMTP_HOST = originalSmtpHost;
    });

    test('should include performance metrics', async () => {
      // Mock successful database check
      mockPrisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

      const response = await GET();
      const data = await response.json();

      expect(data.metrics).toHaveProperty('responseTime');
      expect(data.metrics).toHaveProperty('memoryUsage');
      expect(data.metrics).toHaveProperty('cpuUsage');
      expect(typeof data.metrics.responseTime).toBe('number');
      expect(typeof data.metrics.memoryUsage).toBe('object');
      expect(typeof data.metrics.cpuUsage).toBe('object');
    });

    test('should include system information', async () => {
      // Mock successful database check
      mockPrisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

      const response = await GET();
      const data = await response.json();

      expect(data.system).toHaveProperty('platform');
      expect(data.system).toHaveProperty('arch');
      expect(data.system).toHaveProperty('nodeVersion');
      expect(data.system).toHaveProperty('pid');
    });

    test('should handle Redis connection failure gracefully', async () => {
      // Mock successful database check
      mockPrisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

      // Mock failed Redis check
      mockRedisClient.connect.mockRejectedValue(
        new Error('Redis connection failed')
      );

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.status).toBe('error');
      expect(data.checks.redis.status).toBe('error');
      expect(data.checks.redis.error).toBe('Redis connection failed');
    });

    test('should set appropriate cache headers', async () => {
      // Mock successful database check
      mockPrisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

      const response = await GET();

      expect(response.headers.get('Cache-Control')).toBe(
        'no-cache, no-store, must-revalidate'
      );
      expect(response.headers.get('Pragma')).toBe('no-cache');
      expect(response.headers.get('Expires')).toBe('0');
    });

    test('should handle unexpected errors', async () => {
      // Mock Prisma to throw unexpected error
      const { getPrismaClient } = require('../../lib/database-config.js');
      getPrismaClient.mockRejectedValue(new Error('Unexpected error'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.status).toBe('error');
      expect(data.error).toBe('Unexpected error');
    });
  });

  describe('HEAD /api/health', () => {
    test('should return 200 status for liveness probe', async () => {
      const response = await HEAD();

      expect(response.status).toBe(200);
      expect(response.headers.get('Cache-Control')).toBe(
        'no-cache, no-store, must-revalidate'
      );
      expect(response.headers.get('Pragma')).toBe('no-cache');
      expect(response.headers.get('Expires')).toBe('0');
    });
  });
});


