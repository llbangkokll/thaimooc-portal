# Thai MOOC - Deployment Guide (No NPM Access on Hosting)

คู่มือการ Deploy สำหรับ Web Hosting ที่**ไม่สามารถรัน npm install ได้**

---

## 📋 สถานการณ์

Hosting ของคุณมีข้อจำกัด:
- ❌ ไม่สามารถรัน `npm install` ได้
- ❌ ไม่มี Node.js CLI access
- ❌ ไม่มี SSH หรือมีแต่ไม่มีสิทธิ์
- ✅ แต่มี Node.js runtime (เช่น cPanel Node.js App)
- ✅ แต่สามารถ upload ไฟล์ผ่าน FTP/SFTP ได้

---

## 🚀 วิธีแก้ไข: Build บน Local แล้ว Upload

### ขั้นตอนที่ 1: Build โปรเจคบนเครื่อง Local

```bash
# Clone โปรเจค (ถ้ายังไม่มี)
git clone https://github.com/YOUR_USERNAME/thai-mooc-clean.git
cd thai-mooc-clean

# Install dependencies
npm install

# Build สำหรับ production
npm run build
```

**หมายเหตุ**: การ build จะสร้างโฟลเดอร์ `.next/` ที่มีไฟล์ที่ compile แล้ว

---

### ขั้นตอนที่ 2: สร้าง Production Package

สร้างสคริปต์สำหรับ package ไฟล์:

**สร้างไฟล์ `package-for-hosting.sh` (สำหรับ Mac/Linux):**

```bash
#!/bin/bash

echo "📦 Creating production package for hosting..."

# สร้างโฟลเดอร์ temp
mkdir -p thai-mooc-production
cd thai-mooc-production

# Copy ไฟล์ที่จำเป็น
echo "📁 Copying necessary files..."

# 1. Copy built files
cp -r ../.next ./.next
cp -r ../public ./public
cp -r ../node_modules ./node_modules

# 2. Copy source files ที่จำเป็น
cp -r ../app ./app
cp -r ../lib ./lib
cp -r ../components ./components

# 3. Copy config files
cp ../package.json ./package.json
cp ../next.config.js ./next.config.js
cp ../.env.production ./.env || cp ../.env ./.env

# 4. สร้าง server.js (ถ้ายังไม่มี)
cat > server.js << 'EOF'
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || '0.0.0.0';
const port = process.env.PORT || 3000;

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  }).listen(port, hostname, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
EOF

# 5. Compress เป็นไฟล์ zip
cd ..
echo "🗜️  Compressing files..."
tar -czf thai-mooc-production.tar.gz thai-mooc-production/

echo "✅ Done! Package created: thai-mooc-production.tar.gz"
echo "📦 Size: $(du -h thai-mooc-production.tar.gz | cut -f1)"
```

**สำหรับ Windows, สร้างไฟล์ `package-for-hosting.bat`:**

```batch
@echo off
echo Creating production package for hosting...

:: สร้างโฟลเดอร์ temp
mkdir thai-mooc-production
cd thai-mooc-production

:: Copy ไฟล์ที่จำเป็น
echo Copying necessary files...

xcopy /E /I /Y ..\.next .\.next
xcopy /E /I /Y ..\public .\public
xcopy /E /I /Y ..\node_modules .\node_modules
xcopy /E /I /Y ..\app .\app
xcopy /E /I /Y ..\lib .\lib
xcopy /E /I /Y ..\components .\components

copy ..\package.json .\package.json
copy ..\next.config.js .\next.config.js
copy ..\.env.production .\.env

:: สร้าง server.js
echo const { createServer } = require('http'); > server.js
echo const { parse } = require('url'); >> server.js
echo const next = require('next'); >> server.js
echo. >> server.js
echo const dev = process.env.NODE_ENV !== 'production'; >> server.js
echo const hostname = process.env.HOSTNAME ^|^| '0.0.0.0'; >> server.js
echo const port = process.env.PORT ^|^| 3000; >> server.js
echo. >> server.js
echo const app = next({ dev }); >> server.js
echo const handle = app.getRequestHandler(); >> server.js
echo. >> server.js
echo app.prepare().then(() =^> { >> server.js
echo   createServer(async (req, res) =^> { >> server.js
echo     try { >> server.js
echo       const parsedUrl = parse(req.url, true); >> server.js
echo       await handle(req, res, parsedUrl); >> server.js
echo     } catch (err) { >> server.js
echo       console.error('Error occurred handling', req.url, err); >> server.js
echo       res.statusCode = 500; >> server.js
echo       res.end('internal server error'); >> server.js
echo     } >> server.js
echo   }).listen(port, hostname, (err) =^> { >> server.js
echo     if (err) throw err; >> server.js
echo     console.log(`^> Ready on http://${hostname}:${port}`); >> server.js
echo   }); >> server.js
echo }); >> server.js

cd ..
echo Compressing files...
tar -czf thai-mooc-production.tar.gz thai-mooc-production

echo Done! Package created: thai-mooc-production.tar.gz
```

**รันสคริปต์:**

```bash
# Mac/Linux
chmod +x package-for-hosting.sh
./package-for-hosting.sh

# Windows
package-for-hosting.bat
```

---

### ขั้นตอนที่ 3: Upload ไฟล์ไปยัง Hosting

#### วิธีที่ 1: ผ่าน FTP/SFTP (แนะนำ)

**ใช้ FileZilla หรือ FTP Client อื่น ๆ:**

1. เชื่อมต่อกับ hosting ผ่าน FTP/SFTP
2. Upload ไฟล์ `thai-mooc-production.tar.gz`
3. ใช้ cPanel File Manager หรือ SSH (ถ้ามี) extract:
   ```bash
   tar -xzf thai-mooc-production.tar.gz
   ```

#### วิธีที่ 2: ผ่าน cPanel File Manager

1. เข้า **cPanel → File Manager**
2. Upload `thai-mooc-production.tar.gz`
3. Click ขวา → **Extract**
4. เลือก extract ไปที่ `public_html` หรือโฟลเดอร์ที่ต้องการ

#### วิธีที่ 3: Upload แบบไม่ Compress (ช้า แต่ทำได้แน่นอน)

Upload โฟลเดอร์ `thai-mooc-production/` ทั้งหมดผ่าน FTP:

**⚠️ คำเตือน**: การ upload `node_modules` อาจใช้เวลานาน (มีไฟล์หลักหมื่น)

**แนะนำ**: Upload เฉพาะไฟล์ที่จำเป็น แล้วใช้วิธี "Minimal Upload" ด้านล่าง

---

### ขั้นตอนที่ 4: ตั้งค่า Environment Variables

สร้างไฟล์ `.env` บน hosting:

```env
# Database Connection
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=thai_mooc

DATABASE_URL="mysql://your_db_user:your_db_password@localhost:3306/thai_mooc"

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this

# Production Settings
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://yourdomain.com
PORT=3000
HOSTNAME=0.0.0.0
```

---

### ขั้นตอนที่ 5: เริ่มต้นแอปพลิเคชันบน Hosting

#### วิธีที่ 1: ผ่าน cPanel Node.js App (แนะนำ)

1. เข้า **cPanel → Setup Node.js App**
2. คลิก **Create Application**
3. ตั้งค่า:
   - **Node.js version**: 18.x หรือสูงกว่า
   - **Application mode**: Production
   - **Application root**: `/home/username/thai-mooc-production`
   - **Application URL**: `https://yourdomain.com`
   - **Application startup file**: `server.js`
4. คลิก **Create**
5. รอให้ App เริ่มต้น
6. เปิด browser ไปที่ domain ของคุณ

#### วิธีที่ 2: ผ่าน SSH (ถ้ามี)

```bash
# เข้าไปในโฟลเดอร์
cd /home/username/thai-mooc-production

# เริ่มต้น app
node server.js

# หรือใช้ PM2 (ถ้ามี)
pm2 start server.js --name "thai-mooc"
pm2 save
```

---

## 🎯 วิธีที่ 2: Minimal Upload (แนะนำสำหรับ Hosting ที่ช้า)

หาก upload `node_modules` ใช้เวลานานเกินไป ให้ใช้วิธีนี้:

### 1. สร้าง Minimal Package

```bash
#!/bin/bash
echo "📦 Creating MINIMAL production package..."

mkdir -p thai-mooc-minimal
cd thai-mooc-minimal

# Copy เฉพาะไฟล์ที่จำเป็น
cp -r ../.next ./.next
cp -r ../public ./public
cp -r ../app ./app
cp -r ../lib ./lib
cp -r ../components ./components

cp ../package.json ./package.json
cp ../next.config.js ./next.config.js
cp ../.env.production ./.env

# สร้าง package-lock.json
cp ../package-lock.json ./package-lock.json

# สร้าง README สำหรับการติดตั้ง
cat > INSTALL.md << 'EOF'
# การติดตั้งบน Hosting

1. Upload ไฟล์ทั้งหมดไปยัง hosting
2. เข้า SSH หรือ Terminal ของ hosting
3. รันคำสั่ง:
   ```
   npm install --production --omit=dev
   ```
4. เริ่มต้น app:
   ```
   node server.js
   ```
EOF

cd ..
tar -czf thai-mooc-minimal.tar.gz thai-mooc-minimal/

echo "✅ Minimal package created!"
echo "📦 Size: $(du -h thai-mooc-minimal.tar.gz | cut -f1)"
echo ""
echo "⚠️  หลัง upload แล้ว ต้องรัน: npm install --production"
```

### 2. ติดต่อ Hosting Support

บาง hosting อนุญาตให้รัน `npm install` ผ่าน:
- **cPanel Terminal** (ถ้ามี)
- **SSH access** (ร้องขอจาก support)
- **"Run Command" feature** ใน cPanel

ติดต่อ support และขอให้รันคำสั่ง:

```bash
cd /home/username/thai-mooc-minimal
npm install --production --omit=dev
```

---

## 🛠️ วิธีที่ 3: ใช้ Standalone Output (เบาที่สุด)

Next.js มีฟีเจอร์ **Standalone Output** ที่จะ bundle เฉพาะ dependencies ที่จำเป็น:

### 1. แก้ไข `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... config อื่น ๆ ...
  output: 'standalone', // ✅ เปิดใช้งานแล้ว
};

module.exports = nextConfig;
```

### 2. Build และ Package

```bash
npm run build

# หลัง build จะได้โฟลเดอร์ .next/standalone
cd .next/standalone

# Copy public และ static files
cp -r ../../public ./public
mkdir -p .next/static
cp -r ../.next/static ./.next/static

# สร้าง .env
cp ../../.env ./.env

# Package
tar -czf ../../thai-mooc-standalone.tar.gz .

cd ../..
echo "✅ Standalone package ready: thai-mooc-standalone.tar.gz"
```

### 3. Upload และรัน

Upload `thai-mooc-standalone.tar.gz` แล้วรัน:

```bash
# Extract
tar -xzf thai-mooc-standalone.tar.gz

# Run (ไม่ต้อง npm install!)
node server.js
```

**ขนาดไฟล์**: Standalone จะเล็กกว่ามาก (~50-100MB แทนที่จะเป็น 500MB+)

---

## 📊 เปรียบเทียบวิธีการ

| วิธี | ขนาดไฟล์ | ต้องรัน npm | ความเร็ว Upload | แนะนำ |
|------|----------|------------|----------------|-------|
| **Full Package** | ~500MB | ❌ ไม่ต้อง | 🐌 ช้ามาก | ❌ ไม่แนะนำ |
| **Minimal + npm install** | ~50MB | ✅ ต้อง | 🚀 เร็ว | ⭐ แนะนำ (ถ้ารัน npm ได้) |
| **Standalone** | ~80MB | ❌ ไม่ต้อง | 🚀 เร็ว | ⭐⭐ แนะนำที่สุด |

---

## ✅ Checklist การ Deploy

- [ ] Build โปรเจคบน local (`npm run build`)
- [ ] สร้าง production package (standalone แนะนำ)
- [ ] Upload ไฟล์ไปยัง hosting
- [ ] Extract ไฟล์บน hosting
- [ ] สร้าง/แก้ไข `.env` file
- [ ] Import database schema
- [ ] ตั้งค่า Node.js App ใน cPanel
- [ ] ทดสอบการเข้าถึงผ่าน browser
- [ ] ตรวจสอบ logs (ถ้ามี error)

---

## 🐛 Troubleshooting

### ปัญหา: "Module not found" หลัง Upload

**สาเหตุ**: ไม่ได้ upload `node_modules` หรือไฟล์ไม่ครบ

**แก้ไข**:
1. ตรวจสอบว่า upload ครบทุกไฟล์
2. ถ้าใช้ minimal package ต้องรัน `npm install --production`
3. ถ้าไม่สามารถรัน npm ได้ ให้ใช้ standalone method

### ปัญหา: "Cannot connect to MySQL"

**แก้ไข**:
1. ตรวจสอบ `.env` file
2. ตรวจสอบว่า database ถูกสร้างแล้ว
3. ตรวจสอบ MySQL user มี permission

### ปัญหา: "Port already in use"

**แก้ไข**:
```bash
# เปลี่ยน port ใน .env
PORT=3001
```

### ปัญหา: Upload ช้ามาก

**แก้ไข**:
1. ใช้ standalone method
2. Upload ผ่าน SSH/SCP (เร็วกว่า FTP)
3. Compress ก่อน upload

---

## 📞 Support

หากมีปัญหา:
1. ตรวจสอบ logs ของ hosting
2. ติดต่อ hosting support
3. อ่านเอกสารเพิ่มเติมใน `NODEJS_HOSTING_DEPLOYMENT.md`

---

**สำเร็จ! 🎉** คุณสามารถ deploy บน hosting ที่ไม่มี npm access ได้แล้ว
