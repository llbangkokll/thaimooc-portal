module.exports = {
  apps: [{
    name: 'thai-mooc',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/thai-mooc-clean',
    instances: 2, // จำนวน CPU cores ที่ต้องการใช้ หรือ 'max' เพื่อใช้ทั้งหมด
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/www/thai-mooc-clean/logs/err.log',
    out_file: '/var/www/thai-mooc-clean/logs/out.log',
    log_file: '/var/www/thai-mooc-clean/logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    autorestart: true,
    watch: false,
    // Delay between restart
    restart_delay: 4000,
    // Max restarts in 1 minute
    max_restarts: 10,
    min_uptime: '10s'
  }]
}
