// lib/database-config.js
const { PrismaClient } = require('@prisma/client');

// Database configuration for different environments
const databaseConfig = {
  development: {
    provider: 'sqlite',
    url: 'file:./dev.db',
    connectionLimit: 1
  },

  production: {
    provider: 'postgresql',
    url: process.env.DATABASE_URL,
    connectionLimit: 20,
    pool: {
      min: 2,
      max: 20,
      acquireTimeoutMillis: 60000,
      createTimeoutMillis: 30000,
      destroyTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 200
    }
  },

  test: {
    provider: 'sqlite',
    url: 'file:./test.db',
    connectionLimit: 1
  }
};

// Get current environment
const getCurrentEnvironment = () => {
  return process.env.NODE_ENV || 'development';
};

// Get database configuration for current environment
const getDatabaseConfig = () => {
  const env = getCurrentEnvironment();
  return databaseConfig[env] || databaseConfig.development;
};

// Database connection management
class DatabaseManager {
  constructor() {
    this.prisma = null;
    this.isConnected = false;
    this.connectionRetries = 0;
    this.maxRetries = 5;
  }

  async connect() {
    try {
      if (this.prisma && this.isConnected) {
        return this.prisma;
      }

      const config = getDatabaseConfig();

      // Create Prisma client with environment-specific configuration
      this.prisma = new PrismaClient({
        datasources: {
          db: {
            url: config.url
          }
        },
        log:
          process.env.NODE_ENV === 'development'
            ? ['query', 'error', 'warn']
            : ['error']
      });

      // Test connection
      await this.prisma.$connect();
      this.isConnected = true;
      this.connectionRetries = 0;

      console.log(`✅ Database connected (${config.provider})`);
      return this.prisma;
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      this.isConnected = false;
      this.connectionRetries++;

      if (this.connectionRetries < this.maxRetries) {
        console.log(
          `🔄 Retrying connection (${this.connectionRetries}/${this.maxRetries})...`
        );
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.connect();
      }

      throw error;
    }
  }

  async disconnect() {
    if (this.prisma) {
      await this.prisma.$disconnect();
      this.isConnected = false;
      console.log('🔌 Database disconnected');
    }
  }

  async healthCheck() {
    try {
      if (!this.prisma) {
        return { status: 'disconnected', message: 'No database connection' };
      }

      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'healthy', message: 'Database connection active' };
    } catch (error) {
      return { status: 'unhealthy', message: error.message };
    }
  }

  // Transaction wrapper with retry logic
  async transaction(operations, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await this.prisma.$transaction(operations);
      } catch (error) {
        if (attempt === retries) {
          throw error;
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        console.log(`🔄 Transaction retry ${attempt}/${retries}`);
      }
    }
  }

  // Connection pooling for PostgreSQL
  async getConnectionPool() {
    const config = getDatabaseConfig();

    if (config.provider === 'postgresql') {
      const { Pool } = require('pg');

      return new Pool({
        connectionString: config.url,
        max: config.pool.max,
        min: config.pool.min,
        acquireTimeoutMillis: config.pool.acquireTimeoutMillis,
        createTimeoutMillis: config.pool.createTimeoutMillis,
        destroyTimeoutMillis: config.pool.destroyTimeoutMillis,
        idleTimeoutMillis: config.pool.idleTimeoutMillis,
        reapIntervalMillis: config.pool.reapIntervalMillis,
        createRetryIntervalMillis: config.pool.createRetryIntervalMillis
      });
    }

    return null;
  }
}

// Singleton instance
const dbManager = new DatabaseManager();

// Export Prisma client getter
const getPrismaClient = async () => {
  return await dbManager.connect();
};

// Database migration utilities
const migrationUtils = {
  // Check if migration is needed
  async checkMigrationStatus() {
    const prisma = await getPrismaClient();

    try {
      // Check if we're using PostgreSQL
      const result = await prisma.$queryRaw`SELECT version()`;
      return {
        isPostgreSQL: true,
        version: result[0]?.version || 'Unknown'
      };
    } catch (error) {
      return {
        isPostgreSQL: false,
        error: error.message
      };
    }
  },

  // Backup current database
  async backupDatabase() {
    const config = getDatabaseConfig();

    if (config.provider === 'sqlite') {
      const fs = require('fs');
      const path = require('path');

      const backupPath = path.join(process.cwd(), `backup-${Date.now()}.db`);
      fs.copyFileSync(config.url.replace('file:', ''), backupPath);

      return { success: true, backupPath };
    }

    // PostgreSQL backup would require pg_dump
    return { success: false, message: 'PostgreSQL backup not implemented' };
  },

  // Migrate data from SQLite to PostgreSQL
  async migrateToPostgreSQL() {
    const config = getDatabaseConfig();

    if (config.provider !== 'sqlite') {
      throw new Error('Migration only supported from SQLite');
    }

    // This would require implementing data migration logic
    // For now, return a placeholder
    return {
      success: false,
      message: 'Data migration logic needs to be implemented'
    };
  }
};

// Database validation utilities
const validationUtils = {
  // Validate database schema
  async validateSchema() {
    const prisma = await getPrismaClient();

    try {
      // Check if all required tables exist
      const tables = await prisma.$queryRaw`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
      `;

      const requiredTables = [
        'User',
        'Account',
        'Session',
        'VerificationToken'
      ];
      const existingTables = tables.map(t => t.name);

      const missingTables = requiredTables.filter(
        table => !existingTables.includes(table)
      );

      return {
        valid: missingTables.length === 0,
        missingTables,
        existingTables
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  },

  // Check data integrity
  async checkDataIntegrity() {
    const prisma = await getPrismaClient();

    try {
      const issues = [];

      // Check for orphaned records
      const orphanedAccounts = await prisma.account.findMany({
        where: {
          user: null
        }
      });

      if (orphanedAccounts.length > 0) {
        issues.push(`Found ${orphanedAccounts.length} orphaned accounts`);
      }

      // Check for invalid email formats
      const invalidEmails = await prisma.user.findMany({
        where: {
          email: {
            not: {
              contains: '@'
            }
          }
        }
      });

      if (invalidEmails.length > 0) {
        issues.push(`Found ${invalidEmails.length} users with invalid emails`);
      }

      return {
        valid: issues.length === 0,
        issues
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }
};

// Export all functions and objects
module.exports = {
  databaseConfig,
  getCurrentEnvironment,
  getDatabaseConfig,
  dbManager,
  getPrismaClient,
  migrationUtils,
  validationUtils
};
