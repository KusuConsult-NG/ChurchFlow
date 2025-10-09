// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'churchflow',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/churchflow',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      // Logging
      log_file: '/var/log/churchflow/combined.log',
      out_file: '/var/log/churchflow/out.log',
      error_file: '/var/log/churchflow/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      // Monitoring
      watch: false,
      ignore_watch: ['node_modules', 'logs'],

      // Restart policy
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 10,

      // Health check
      health_check_grace_period: 3000,

      // Advanced features
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 3000,

      // Environment variables
      env_file: '.env.production'
    }
  ],

  deploy: {
    production: {
      user: 'deploy',
      host: 'your-server.com',
      ref: 'origin/main',
      repo: 'https://github.com/your-org/churchflow.git',
      path: '/var/www/churchflow',
      'pre-deploy-local': '',
      'post-deploy':
        'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    },

    staging: {
      user: 'deploy',
      host: 'staging-server.com',
      ref: 'origin/develop',
      repo: 'https://github.com/your-org/churchflow.git',
      path: '/var/www/churchflow-staging',
      'post-deploy':
        'npm install && npm run build && pm2 reload ecosystem.config.js --env staging',
      env: {
        NODE_ENV: 'staging'
      }
    }
  }
};


