# Thai MOOC - CloudPanel Deployment Guide

คู่มือการ Deploy โปรเจค Thai MOOC บน **CloudPanel** แบบละเอียด

---

## 📋 ข้อมูล CloudPanel

**CloudPanel** เป็น Control Panel ที่:
- ✅ รองรับ Node.js แบบ Native
- ✅ มี PM2 built-in สำหรับจัดการ Node.js apps
- ✅ มี MySQL/MariaDB พร้อมใช้งาน
- ✅ มี Nginx reverse proxy อัตโนมัติ
- ✅ มี SSL/HTTPS ฟรีจาก Let's Encrypt
- ✅ รองรับ multiple Node.js versions

---

## 🚀 ขั้นตอนการ Deploy แบบครบถ้วน

### ขั้นตอนที่ 1: เตรียม Package

**บนเครื่อง Local (Mac/Windows):**

```bash
# Clone โปรเจค (ถ้ายังไม่มี)
git clone https://github.com/YOUR_USERNAME/thai-mooc-clean.git
cd thai-mooc-clean

# Install dependencies
npm install

# Build production
npm run build

# สร้าง standalone package
chmod +x package-standalone.sh
./package-standalone.sh

# ได้ไฟล์: thai-mooc-standalone-[timestamp].tar.gz (~21MB)
```

---

### ขั้นตอนที่ 2: สร้าง Site บน CloudPanel

1. **Login เข้า CloudPanel**
   - เข้า `https://your-server-ip:8443`
   - Login ด้วย admin credentials

2. **สร้าง Site ใหม่**
   - คลิก **Sites** → **Add Site**
   - เลือก **Node.js**
   - ตั้งค่า:
     ```
     Domain Name: yourdomain.com (หรือ subdomain)
     Site User: thai-mooc (หรือชื่ออื่น)
     Node.js Version: 18.x หรือ 20.x
     ```
   - คลิก **Create**

3. **CloudPanel จะสร้าง:**
   - Site directory: `/home/thai-mooc/htdocs/yourdomain.com`
   - Database: สามารถสร้างได้จากเมนู Databases
   - SSL certificate: สามารถติดตั้งได้ฟรี

---

### ขั้นตอนที่ 3: สร้าง Database

1. **ไปที่เมนู Databases**
   - คลิก **Databases** → **Add Database**

2. **สร้าง Database:**
   ```
   Database Name: thai_mooc
   Database User: thai_mooc_user
   Password: [สร้าง password ที่แข็งแรง]
   ```

3. **บันทึกข้อมูล:**
   ```
   Database Host: localhost
   Database Port: 3306
   Database Name: thai_mooc
   Database User: thai_mooc_user
   Database Password: [password ที่สร้าง]
   ```

---

### ขั้นตอนที่ 4: Upload ไฟล์

#### วิธีที่ 1: ผ่าน SFTP (แนะนำ)

**ใช้ FileZilla หรือ WinSCP:**

1. **เชื่อมต่อ SFTP:**
   ```
   Host: your-server-ip
   Port: 22
   Username: thai-mooc (site user ที่สร้าง)
   Password: [ตามที่ CloudPanel กำหนด]
   ```

2. **Upload package:**
   - เข้าไปที่ `/home/thai-mooc/htdocs/yourdomain.com/`
   - ลบไฟล์เดิมออก (ถ้ามี)
   - Upload `thai-mooc-standalone-[timestamp].tar.gz`

#### วิธีที่ 2: ผ่าน SSH (เร็วกว่า)

```bash
# บนเครื่อง local
scp thai-mooc-standalone-*.tar.gz thai-mooc@your-server-ip:/home/thai-mooc/htdocs/yourdomain.com/

# หรือใช้ rsync (ถ้ามี)
rsync -avz thai-mooc-standalone-*.tar.gz thai-mooc@your-server-ip:/home/thai-mooc/htdocs/yourdomain.com/
```

---

### ขั้นตอนที่ 5: Extract และตั้งค่า

1. **SSH เข้าสู่ server:**
   ```bash
   ssh thai-mooc@your-server-ip
   ```

2. **เข้าไปยัง site directory:**
   ```bash
   cd ~/htdocs/yourdomain.com
   ```

3. **Extract package:**
   ```bash
   tar -xzf thai-mooc-standalone-*.tar.gz

   # เข้าไปในโฟลเดอร์ที่ extract
   cd thai-mooc-standalone-*

   # ย้ายไฟล์ทั้งหมดขึ้นมาที่ root
   mv * ../
   mv .* ../ 2>/dev/null
   cd ..

   # ลบโฟลเดอร์ว่างและไฟล์ tar.gz
   rm -rf thai-mooc-standalone-*
   rm -f *.tar.gz
   ```

4. **ตรวจสอบไฟล์:**
   ```bash
   ls -la
   # ต้องเห็น: server.js, package.json, .next/, public/, node_modules/
   ```

---

### ขั้นตอนที่ 6: สร้างไฟล์ .env

```bash
# สร้าง .env จาก .env.example
cp .env.example .env

# แก้ไข .env
nano .env
```

**เนื้อหาในไฟล์ .env:**

```env
# Database Connection
DB_HOST=localhost
DB_PORT=3306
DB_USER=thai_mooc_user
DB_PASSWORD=YOUR_DATABASE_PASSWORD_HERE
DB_NAME=thai_mooc

DATABASE_URL="mysql://thai_mooc_user:YOUR_DATABASE_PASSWORD_HERE@localhost:3306/thai_mooc"

# JWT Secret - สร้าง random string ที่ยาว
JWT_SECRET=your-super-long-random-secret-key-change-this-123456789

# Production Settings
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://yourdomain.com
PORT=3000
HOSTNAME=0.0.0.0
```

**บันทึก:** กด `Ctrl+O`, `Enter`, `Ctrl+X`

---

### ขั้นตอนที่ 7: Import Database Schema

#### วิธีที่ 1: ผ่าน CloudPanel (ง่ายที่สุด)

1. **เข้า CloudPanel → Databases**
2. **คลิก database `thai_mooc`**
3. **คลิก phpMyAdmin**
4. **เลือก database `thai_mooc`**
5. **คลิก Import tab**
6. **เลือกไฟล์ `database-schema.sql`** (อยู่ในโฟลเดอร์โปรเจค)
7. **คลิก Go**

#### วิธีที่ 2: ผ่าน Command Line

```bash
# อยู่ในโฟลเดอร์โปรเจค
mysql -u thai_mooc_user -p thai_mooc < database-schema.sql

# ใส่ password เมื่อถูกถาม
```

#### ตรวจสอบ Database:

```bash
mysql -u thai_mooc_user -p thai_mooc -e "SHOW TABLES;"

# ต้องเห็นตาราง:
# admin_users, categories, courses, institutions, etc.
```

---

### ขั้นตอนที่ 8: ตั้งค่า Node.js App ใน CloudPanel

1. **กลับไปที่ CloudPanel**
2. **เข้า Sites → เลือก site ของคุณ**
3. **คลิก Node.js tab**

4. **ตั้งค่า Application:**
   ```
   Node.js Version: 18.x (หรือ 20.x)
   App Port: 3000
   App Start Command: node server.js
   App Root: /home/thai-mooc/htdocs/yourdomain.com
   ```

5. **Environment Variables (ถ้าต้องการ):**
   - เพิ่ม environment variables จากไฟล์ .env
   - หรือปล่อยให้อ่านจากไฟล์ .env ก็ได้

6. **คลิก Save**

---

### ขั้นตอนที่ 9: เริ่มต้น Application

#### ผ่าน CloudPanel UI:

1. **ที่ Node.js settings**
2. **คลิกปุ่ม "Start"**
3. **รอสักครู่ จนสถานะเป็น "Running"**

#### ผ่าน SSH (ถ้า UI ไม่ทำงาน):

```bash
# เข้าไปยังโฟลเดอร์โปรเจค
cd ~/htdocs/yourdomain.com

# เริ่มด้วย PM2 (CloudPanel ใช้ PM2)
pm2 start server.js --name thai-mooc

# บันทึก config
pm2 save

# ตั้งค่าให้เริ่มอัตโนมัติ
pm2 startup
```

---

### ขั้นตอนที่ 10: ตั้งค่า SSL (HTTPS)

1. **เข้า CloudPanel → Sites → เลือก site**
2. **คลิก SSL/TLS tab**
3. **คลิก "New Let's Encrypt Certificate"**
4. **ใส่ email address**
5. **คลิก Create**
6. **รอ 1-2 นาที จนได้ SSL certificate**

---

### ขั้นตอนที่ 11: ตั้งค่า Nginx Reverse Proxy

CloudPanel ทำอัตโนมัติ แต่ถ้าต้องการปรับแต่ง:

1. **เข้า Sites → เลือก site → Vhost tab**
2. **แก้ไข Nginx config (ถ้าจำเป็น)**

**Config ที่ CloudPanel สร้างให้จะคล้ายนี้:**

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

### ขั้นตอนที่ 12: ทดสอบ

1. **เปิดเบราว์เซอร์:**
   ```
   https://yourdomain.com
   ```

2. **ตรวจสอบหน้าแรก:**
   - ต้องโหลดได้ปกติ
   - ดูว่ามี courses แสดงหรือไม่

3. **ทดสอบ API:**
   ```
   https://yourdomain.com/api/test-mysql
   ```
   - ต้องได้ JSON response

4. **Login Admin:**
   ```
   https://yourdomain.com/admin
   Username: admin
   Password: admin123

   ⚠️ เปลี่ยน password ทันที!
   ```

---

## 🔧 คำสั่งที่ใช้บ่อยบน CloudPanel

### ดู Logs

```bash
# PM2 logs
pm2 logs thai-mooc

# Nginx logs
tail -f /var/log/nginx/yourdomain.com_access.log
tail -f /var/log/nginx/yourdomain.com_error.log

# Node.js logs
pm2 logs thai-mooc --lines 100
```

### จัดการ Application

```bash
# ดูสถานะ
pm2 status

# Restart app
pm2 restart thai-mooc

# Stop app
pm2 stop thai-mooc

# Start app
pm2 start thai-mooc

# ลบ app จาก PM2
pm2 delete thai-mooc
```

### จัดการ Database

```bash
# Backup database
mysqldump -u thai_mooc_user -p thai_mooc > backup-$(date +%Y%m%d).sql

# Restore database
mysql -u thai_mooc_user -p thai_mooc < backup-20251020.sql

# เข้า MySQL console
mysql -u thai_mooc_user -p thai_mooc
```

### ตรวจสอบ Resource

```bash
# Memory usage
pm2 monit

# Disk space
df -h

# CPU และ Memory
htop
# หรือ
top
```

---

## 🐛 Troubleshooting

### ปัญหา: App ไม่เริ่มต้น

**ตรวจสอบ:**

```bash
# ดู logs
pm2 logs thai-mooc --lines 50

# ตรวจสอบ port
netstat -tulpn | grep 3000
# หรือ
lsof -i :3000
```

**แก้ไข:**

```bash
# Kill process ที่ใช้ port 3000
pkill -f "node.*3000"

# Restart app
pm2 restart thai-mooc
```

### ปัญหา: Cannot connect to MySQL

**ตรวจสอบ:**

```bash
# Test MySQL connection
mysql -u thai_mooc_user -p -h localhost thai_mooc
```

**แก้ไข:**

1. ตรวจสอบ `.env` ให้แน่ใจว่า credentials ถูกต้อง
2. ตรวจสอบว่า MySQL service ทำงาน:
   ```bash
   systemctl status mysql
   ```
3. ตรวจสอบ user permissions:
   ```sql
   GRANT ALL PRIVILEGES ON thai_mooc.* TO 'thai_mooc_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

### ปัญหา: 502 Bad Gateway

**สาเหตุ:** Node.js app ไม่ทำงาน

**แก้ไข:**

```bash
# ตรวจสอบว่า app ทำงานหรือไม่
pm2 status

# Start app
pm2 start server.js --name thai-mooc

# ตรวจสอบ Nginx config
nginx -t

# Restart Nginx
systemctl restart nginx
```

### ปัญหา: Out of Memory

**แก้ไข:**

```bash
# เพิ่ม Node.js memory limit
pm2 delete thai-mooc
pm2 start server.js --name thai-mooc --max-memory-restart 500M

# หรือแก้ใน ecosystem.config.js
```

### ปัญหา: SSL Certificate Error

**แก้ไข:**

```bash
# Renew certificate
certbot renew

# หรือผ่าน CloudPanel UI
# Sites → เลือก site → SSL/TLS → Renew
```

---

## 🔄 การอัพเดทแอปพลิเคชัน

เมื่อมีการแก้ไขโค้ด:

### 1. Build ใหม่บนเครื่อง Local

```bash
cd thai-mooc-clean
git pull  # ถ้าใช้ git
npm install  # ถ้ามี dependencies ใหม่
npm run build
./package-standalone.sh
```

### 2. Upload ไปยัง Server

```bash
scp thai-mooc-standalone-*.tar.gz thai-mooc@your-server-ip:~/
```

### 3. Deploy บน Server

```bash
# SSH เข้า server
ssh thai-mooc@your-server-ip

# Backup เดิม
cd ~/htdocs/yourdomain.com
tar -czf backup-before-update-$(date +%Y%m%d).tar.gz .

# Extract ใหม่
tar -xzf ~/thai-mooc-standalone-*.tar.gz -C ~/htdocs/yourdomain.com/ --strip-components=1

# Restart app
pm2 restart thai-mooc

# ตรวจสอบ
pm2 logs thai-mooc
```

---

## 📊 Monitoring และ Performance

### ตั้งค่า PM2 Monitoring

```bash
# Enable monitoring
pm2 monitor

# หรือใช้ PM2 Plus (ฟรี)
pm2 link [secret] [public]
```

### ตั้งค่า Auto Restart

```bash
# Restart เมื่อใช้ memory เกิน 500MB
pm2 start server.js --name thai-mooc --max-memory-restart 500M

# Restart เมื่อมี error
pm2 start server.js --name thai-mooc --max-restarts 10
```

### Logrotate (จัดการ Logs)

```bash
# ติดตั้ง PM2 logrotate
pm2 install pm2-logrotate

# ตั้งค่า
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## 🔒 Security Best Practices

### 1. เปลี่ยน Default Passwords

```bash
# เปลี่ยน admin password ในเว็บ
# Login → https://yourdomain.com/admin → User Settings

# เปลี่ยน MySQL password
mysql -u root -p
ALTER USER 'thai_mooc_user'@'localhost' IDENTIFIED BY 'NEW_STRONG_PASSWORD';
FLUSH PRIVILEGES;

# อย่าลืมอัพเดทใน .env ด้วย!
```

### 2. Firewall

```bash
# CloudPanel จัดการ UFW ให้อัตโนมัติแล้ว
# แต่ตรวจสอบได้ด้วย:
ufw status

# ควรเปิด: 22 (SSH), 80 (HTTP), 443 (HTTPS), 8443 (CloudPanel)
```

### 3. จำกัด MySQL Access

```bash
# MySQL ควร bind เฉพาะ localhost
# แก้ไขใน /etc/mysql/mysql.conf.d/mysqld.cnf
bind-address = 127.0.0.1
```

### 4. ตั้งค่า Rate Limiting (Nginx)

CloudPanel ตั้งค่าให้แล้ว แต่สามารถปรับแต่งได้ใน Vhost settings

---

## 📞 Support

**CloudPanel Documentation:**
- https://www.cloudpanel.io/docs/

**Thai MOOC Issues:**
- GitHub: https://github.com/YOUR_USERNAME/thai-mooc-clean/issues
- Email: support@thaimooc.ac.th

---

## ✅ Checklist สำหรับ Production

- [ ] Build และสร้าง standalone package สำเร็จ
- [ ] Upload package ไปยัง CloudPanel server
- [ ] Extract และ setup ไฟล์ครบถ้วน
- [ ] สร้าง Database และ import schema
- [ ] ตั้งค่า .env ถูกต้อง (database, JWT_SECRET)
- [ ] เริ่มต้น Node.js app ด้วย PM2
- [ ] ติดตั้ง SSL Certificate (Let's Encrypt)
- [ ] ทดสอบเว็บไซต์ผ่าน HTTPS
- [ ] ทดสอบ API endpoints
- [ ] Login admin และเปลี่ยน password
- [ ] Setup backup อัตโนมัติ
- [ ] Setup monitoring (PM2, logs)
- [ ] ทดสอบ performance และ load time

---

**สำเร็จ! 🎉** โปรเจค Thai MOOC พร้อมใช้งานบน CloudPanel แล้ว!

**URL สำหรับเข้าใช้งาน:**
- Frontend: `https://yourdomain.com`
- Admin: `https://yourdomain.com/admin`
- API Test: `https://yourdomain.com/api/test-mysql`
