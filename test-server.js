/**
 * Simple Node.js Test Server
 * ไฟล์ทดสอบ Node.js อย่างง่าย
 *
 * วิธีใช้:
 * 1. Upload ไฟล์นี้ไปยัง server
 * 2. รัน: node test-server.js
 * 3. เปิดเบราว์เซอร์: http://your-domain.com
 */

const http = require('http');

const PORT = process.env.PORT || 3000;
const HOSTNAME = process.env.HOSTNAME || '0.0.0.0';

const server = http.createServer((req, res) => {
  // Set headers
  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  // HTML Response
  const html = `
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Node.js Test Server</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 600px;
            width: 100%;
            text-align: center;
        }
        h1 {
            color: #667eea;
            margin-bottom: 20px;
            font-size: 2.5em;
        }
        .success {
            color: #10b981;
            font-size: 4em;
            margin: 20px 0;
        }
        .info {
            background: #f3f4f6;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            text-align: left;
        }
        .info-item {
            padding: 10px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .info-item:last-child {
            border-bottom: none;
        }
        .label {
            font-weight: bold;
            color: #6b7280;
            display: inline-block;
            width: 150px;
        }
        .value {
            color: #1f2937;
        }
        .button {
            background: #667eea;
            color: white;
            padding: 12px 30px;
            border-radius: 8px;
            text-decoration: none;
            display: inline-block;
            margin: 10px;
            transition: all 0.3s;
        }
        .button:hover {
            background: #5568d3;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }
        .footer {
            margin-top: 30px;
            color: #6b7280;
            font-size: 0.9em;
        }
        code {
            background: #f3f4f6;
            padding: 2px 8px;
            border-radius: 4px;
            color: #dc2626;
            font-family: 'Courier New', monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="success">✅</div>
        <h1>Node.js ทำงานได้แล้ว!</h1>
        <p style="color: #6b7280; margin-bottom: 20px;">
            Server กำลังทำงานปกติ
        </p>

        <div class="info">
            <div class="info-item">
                <span class="label">Node.js Version:</span>
                <span class="value">${process.version}</span>
            </div>
            <div class="info-item">
                <span class="label">Platform:</span>
                <span class="value">${process.platform}</span>
            </div>
            <div class="info-item">
                <span class="label">Server Time:</span>
                <span class="value">${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}</span>
            </div>
            <div class="info-item">
                <span class="label">URL Path:</span>
                <span class="value">${req.url}</span>
            </div>
            <div class="info-item">
                <span class="label">Server Port:</span>
                <span class="value">${PORT}</span>
            </div>
            <div class="info-item">
                <span class="label">Memory Usage:</span>
                <span class="value">${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB</span>
            </div>
        </div>

        <div style="margin: 30px 0;">
            <a href="/api" class="button">ทดสอบ API</a>
            <a href="/test" class="button">ทดสอบ Route</a>
        </div>

        <div class="footer">
            <p><strong>ขั้นตอนต่อไป:</strong></p>
            <p style="margin-top: 10px;">
                1. หยุด server นี้: <code>pm2 delete test-server</code><br>
                2. Deploy Thai MOOC: <code>pm2 start server.js --name thai-mooc</code><br>
                3. ตรวจสอบสถานะ: <code>pm2 status</code>
            </p>
        </div>
    </div>
</body>
</html>
  `;

  // API Routes
  if (req.url === '/api') {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify({
      success: true,
      message: 'API ทำงานได้',
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      platform: process.platform,
      uptime: Math.floor(process.uptime()),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
      }
    }, null, 2));
  }
  // Test Route
  else if (req.url === '/test') {
    res.statusCode = 200;
    res.end('<h1>Test Route Works! ✅</h1><p><a href="/">Back to Home</a></p>');
  }
  // Default Route
  else {
    res.statusCode = 200;
    res.end(html);
  }
});

server.listen(PORT, HOSTNAME, () => {
  console.log('');
  console.log('========================================');
  console.log('🚀 Node.js Test Server Started!');
  console.log('========================================');
  console.log(`✅ Server running at http://${HOSTNAME}:${PORT}/`);
  console.log(`📅 Started at: ${new Date().toLocaleString('th-TH')}`);
  console.log(`🖥️  Node.js: ${process.version}`);
  console.log(`💻 Platform: ${process.platform}`);
  console.log('');
  console.log('Available Routes:');
  console.log('  • http://localhost:' + PORT + '/       - Home page');
  console.log('  • http://localhost:' + PORT + '/api    - API test');
  console.log('  • http://localhost:' + PORT + '/test   - Route test');
  console.log('');
  console.log('To stop: Press Ctrl+C or run "pm2 delete test-server"');
  console.log('========================================');
  console.log('');
});

// Handle errors
server.on('error', (err) => {
  console.error('❌ Server Error:', err.message);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use!`);
    console.error('Try: pkill -f node or use a different PORT');
  }
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('');
  console.log('🛑 Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('');
  console.log('🛑 Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
