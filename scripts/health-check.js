// scripts/health-check.js
const http = require('http');
const https = require('https');

// Health check configuration
const config = {
  timeout: 5000,
  retries: 3,
  endpoints: [
    {
      name: 'API Health',
      url: process.env.HEALTH_CHECK_URL || 'http://localhost:3000/api/health',
      expectedStatus: 200
    },
    {
      name: 'Database',
      url: process.env.DATABASE_URL,
      type: 'database'
    },
    {
      name: 'Redis',
      url: process.env.REDIS_URL,
      type: 'redis'
    }
  ]
};

// Health check results
const results = {
  overall: 'healthy',
  checks: {},
  timestamp: new Date().toISOString(),
  uptime: process.uptime()
};

// Check HTTP endpoint
async function checkHttpEndpoint(endpoint) {
  return new Promise(resolve => {
    const client = endpoint.url.startsWith('https') ? https : http;
    const url = new URL(endpoint.url);

    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: 'GET',
      timeout: config.timeout,
      headers: {
        'User-Agent': 'Health-Check/1.0'
      }
    };

    const req = client.request(options, res => {
      let data = '';

      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({
            status:
              res.statusCode === endpoint.expectedStatus
                ? 'healthy'
                : 'unhealthy',
            statusCode: res.statusCode,
            responseTime: Date.now() - startTime,
            data: response
          });
        } catch (error) {
          resolve({
            status: 'unhealthy',
            statusCode: res.statusCode,
            responseTime: Date.now() - startTime,
            error: 'Invalid JSON response'
          });
        }
      });
    });

    const startTime = Date.now();

    req.on('error', error => {
      resolve({
        status: 'unhealthy',
        error: error.message,
        responseTime: Date.now() - startTime
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        status: 'unhealthy',
        error: 'Request timeout',
        responseTime: config.timeout
      });
    });

    req.end();
  });
}

// Check database connection
async function checkDatabase(url) {
  return new Promise(resolve => {
    try {
      // This is a simplified check - in production, use proper database client
      const { Client } = require('pg');
      const client = new Client({ connectionString: url });

      const startTime = Date.now();

      client
        .connect()
        .then(() => {
          return client.query('SELECT 1');
        })
        .then(() => {
          client.end();
          resolve({
            status: 'healthy',
            responseTime: Date.now() - startTime,
            message: 'Database connection successful'
          });
        })
        .catch(error => {
          resolve({
            status: 'unhealthy',
            error: error.message,
            responseTime: Date.now() - startTime
          });
        });
    } catch (error) {
      resolve({
        status: 'unhealthy',
        error: error.message
      });
    }
  });
}

// Check Redis connection
async function checkRedis(url) {
  return new Promise(resolve => {
    try {
      const redis = require('redis');
      const client = redis.createClient({ url });

      const startTime = Date.now();

      client
        .connect()
        .then(() => {
          return client.ping();
        })
        .then(() => {
          client.quit();
          resolve({
            status: 'healthy',
            responseTime: Date.now() - startTime,
            message: 'Redis connection successful'
          });
        })
        .catch(error => {
          resolve({
            status: 'unhealthy',
            error: error.message,
            responseTime: Date.now() - startTime
          });
        });
    } catch (error) {
      resolve({
        status: 'unhealthy',
        error: error.message
      });
    }
  });
}

// Run all health checks
async function runHealthChecks() {
  console.log('🔍 Running health checks...');

  for (const endpoint of config.endpoints) {
    console.log(`Checking ${endpoint.name}...`);

    let result;

    if (endpoint.type === 'database') {
      result = await checkDatabase(endpoint.url);
    } else if (endpoint.type === 'redis') {
      result = await checkRedis(endpoint.url);
    } else {
      result = await checkHttpEndpoint(endpoint);
    }

    results.checks[endpoint.name] = {
      ...result,
      endpoint: endpoint.name,
      url: endpoint.url
    };

    console.log(
      `  ${result.status === 'healthy' ? '✅' : '❌'} ${endpoint.name}: ${result.status}`
    );
  }

  // Determine overall health
  const unhealthyChecks = Object.values(results.checks).filter(
    check => check.status !== 'healthy'
  );
  results.overall = unhealthyChecks.length === 0 ? 'healthy' : 'unhealthy';

  console.log(
    `\n📊 Overall Health: ${results.overall === 'healthy' ? '✅' : '❌'} ${results.overall}`
  );

  return results;
}

// Main execution
async function main() {
  try {
    const healthResults = await runHealthChecks();

    // Output results
    console.log('\n📋 Health Check Results:');
    console.log(JSON.stringify(healthResults, null, 2));

    // Exit with appropriate code
    process.exit(healthResults.overall === 'healthy' ? 0 : 1);
  } catch (error) {
    console.error('❌ Health check failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  runHealthChecks,
  checkHttpEndpoint,
  checkDatabase,
  checkRedis
};
