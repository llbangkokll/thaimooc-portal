# 🚨 แก้ไข Error 502 Bad Gateway

Error 502 แสดงว่า **Nginx ติดต่อ Node.js app ไม่ได้**

---

## 🔍 ขั้นตอนการแก้ไข

### ขั้นตอนที่ 1: ตรวจสอบว่า Node.js App ทำงานหรือไม่

**SSH เข้า server แล้วรันคำสั่ง:**

```bash
# ตรวจสอบ PM2 process
pm2 status

# หรือ
pm2 list
```

**ควรเห็น:**
```
┌─────┬────────────┬─────────┬─────────┬─────────┐
│ id  │ name       │ status  │ cpu     │ memory  │
├─────┼────────────┼─────────┼─────────┼─────────┤
│ 0   │ thai-mooc  │ online  │ 0%      │ 45.2mb  │
└─────┴────────────┴─────────┴─────────┴─────────┘
```

**ถ้า status เป็น "errored" หรือ "stopped":**

---

### ขั้นตอนที่ 2: ดู Error Logs

```bash
# ดู logs ของ PM2
pm2 logs thai-mooc --lines 50

# หรือเฉพาะ error
pm2 logs thai-mooc --err --lines 50
```

**Error ที่พบบ่อย:**

#### Error A: "Cannot find module"

```
Error: Cannot find module 'mysql2'
```

**แก้ไข:**
```bash
cd ~/htdocs/yourdomain.com
npm install mysql2 --save
pm2 restart thai-mooc
```

#### Error B: "Cannot connect to MySQL"

```
Error: connect ECONNREFUSED 127.0.0.1:3306
# หรือ
Error: Access denied for user
```

**แก้ไข:**

1. **ตรวจสอบ MySQL ทำงานหรือไม่:**
```bash
systemctl status mysql
# หรือ
systemctl status mariadb
```

2. **ถ้าไม่ทำงาน เริ่มต้น:**
```bash
sudo systemctl start mysql
# หรือ
sudo systemctl start mariadb
```

3. **ตรวจสอบ credentials ใน .env:**
```bash
cd ~/htdocs/yourdomain.com
cat .env | grep DB_
```

4. **ทดสอบ connection:**
```bash
mysql -u YOUR_DB_USER -p -h localhost YOUR_DB_NAME
# ใส่ password ตามที่ใน .env
```

#### Error C: "Port 3000 already in use"

```
Error: listen EADDRINUSE: address already in use :::3000
```

**แก้ไข:**

```bash
# หา process ที่ใช้ port 3000
lsof -i :3000
# หรือ
netstat -tulpn | grep 3000

# Kill process
kill -9 PID_NUMBER

# หรือ kill ทุก node process
pkill -f node

# Start ใหม่
pm2 start server.js --name thai-mooc
```

#### Error D: "Module build failed"

```
Module build failed: Error: ENOENT: no such file or directory
```

**แก้ไข:**

ไฟล์ไม่ครบ ให้ upload ใหม่:

```bash
# Backup เดิม
cd ~/htdocs/yourdomain.com
tar -czf backup-before-reupload.tar.gz .

# ลบไฟล์เดิม
rm -rf *

# Upload package ใหม่และ extract
tar -xzf ~/thai-mooc-standalone-*.tar.gz --strip-components=1

# Copy .env กลับมา (ถ้ามี)
cp ~/backup/.env .

# Start
pm2 start server.js --name thai-mooc
```

---

### ขั้นตอนที่ 3: ตรวจสอบว่า App รันบน Port 3000

```bash
# ตรวจสอบว่า port 3000 เปิดหรือไม่
curl http://localhost:3000

# ถ้าได้ HTML response = App ทำงาน
# ถ้า error = App ไม่ทำงาน
```

**ถ้า App ไม่ทำงาน:**

```bash
# เข้าไปยังโฟลเดอร์
cd ~/htdocs/yourdomain.com

# ลบ PM2 process เดิม
pm2 delete thai-mooc

# Start ใหม่
pm2 start server.js --name thai-mooc

# ดู logs real-time
pm2 logs thai-mooc
```

---

### ขั้นตอนที่ 4: ตรวจสอบ Nginx Configuration

```bash
# ดู Nginx config
cat /etc/nginx/sites-enabled/yourdomain.com.conf
# หรือ
cat /etc/nginx/conf.d/yourdomain.com.conf
```

**Config ที่ถูกต้องควรมี:**

```nginx
location / {
    proxy_pass http://127.0.0.1:3000;  # ต้องตรงกับ port ที่ app รัน
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

**ถ้าไม่ถูกต้อง:**

1. **ผ่าน CloudPanel UI:**
   - Sites → เลือก site → Vhost
   - แก้ไข config
   - Save

2. **ผ่าน Command Line:**
```bash
sudo nano /etc/nginx/sites-enabled/yourdomain.com.conf
# แก้ไข proxy_pass ให้ตรงกับ port

# ทดสอบ config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

### ขั้นตอนที่ 5: ตรวจสอบ Firewall

```bash
# ตรวจสอบว่า port 3000 เปิดหรือไม่ (สำหรับ localhost)
sudo ufw status

# Port 3000 ไม่จำเป็นต้องเปิดจาก outside
# เพราะ Nginx จะ proxy จาก 80/443 ไป 3000
```

---

## 🔧 วิธีแก้แบบเร็ว (Quick Fix)

**รันคำสั่งนี้ทีละบรรทัด:**

```bash
# 1. เข้าโฟลเดอร์โปรเจค
cd ~/htdocs/yourdomain.com

# 2. ดูว่ามีไฟล์ server.js หรือไม่
ls -la server.js

# 3. ลบ PM2 process เดิม (ถ้ามี)
pm2 delete thai-mooc

# 4. Kill process ที่ค้างอยู่
pkill -f "node.*server.js"

# 5. Start app ใหม่
pm2 start server.js --name thai-mooc

# 6. Save PM2 list
pm2 save

# 7. ดู logs
pm2 logs thai-mooc --lines 20

# 8. ทดสอบจาก localhost
curl http://localhost:3000

# 9. ถ้าได้ HTML = สำเร็จ! Reload Nginx
sudo systemctl reload nginx

# 10. ทดสอบจาก browser
# เปิด https://yourdomain.com
```

---

## 🐛 Debug แบบละเอียด

### 1. ตรวจสอบ Environment Variables

```bash
cd ~/htdocs/yourdomain.com
cat .env
```

**ต้องมี:**
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=your_database
JWT_SECRET=some-long-random-string
NODE_ENV=production
PORT=3000
```

### 2. ทดสอบ MySQL Connection

```bash
mysql -u YOUR_DB_USER -p -h localhost YOUR_DB_NAME -e "SHOW TABLES;"
```

**ถ้า error "Access denied":**

```bash
# Login as root
mysql -u root -p

# สร้าง user ใหม่
CREATE USER 'thai_mooc_user'@'localhost' IDENTIFIED BY 'YOUR_PASSWORD';
GRANT ALL PRIVILEGES ON thai_mooc.* TO 'thai_mooc_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# อัพเดท .env
nano .env
# แก้ DB_USER และ DB_PASSWORD
```

### 3. ทดสอบรัน Manual (ไม่ผ่าน PM2)

```bash
cd ~/htdocs/yourdomain.com

# รัน manual เพื่อดู error
node server.js

# ถ้าเห็น "Ready on http://0.0.0.0:3000" = สำเร็จ
# กด Ctrl+C เพื่อหยุด

# แล้วรันด้วย PM2
pm2 start server.js --name thai-mooc
```

---

## 📋 Checklist การแก้ไข

- [ ] ตรวจสอบ `pm2 status` - ต้องเป็น "online"
- [ ] ดู `pm2 logs` - ไม่มี error
- [ ] ทดสอบ `curl http://localhost:3000` - ได้ response
- [ ] ตรวจสอบ MySQL connection - เชื่อมต่อได้
- [ ] ตรวจสอบ .env - credentials ถูกต้อง
- [ ] ตรวจสอบ Nginx config - proxy_pass ถูกต้อง
- [ ] Reload Nginx - `sudo systemctl reload nginx`
- [ ] ทดสอบจาก browser - ไม่มี 502

---

## 🎯 สาเหตุ 502 ที่พบบ่อยสุด

### 1. App ไม่ได้รัน (70%)
**แก้:** Start app ด้วย PM2

### 2. MySQL Connection Error (20%)
**แก้:** ตรวจสอบ .env และ database credentials

### 3. Port ไม่ตรงกัน (5%)
**แก้:** ตรวจสอบ Nginx config และ app port

### 4. ไฟล์ไม่ครบ (3%)
**แก้:** Upload package ใหม่

### 5. Permission Problem (2%)
**แก้:** `chmod +x server.js` และ `chown -R user:user .`

---

## 💡 Tips เพิ่มเติม

### Enable Debug Mode

แก้ไข .env:
```env
NODE_ENV=development  # เปลี่ยนชั่วคราว
```

Restart:
```bash
pm2 restart thai-mooc
pm2 logs thai-mooc
```

เปลี่ยนกลับเป็น production เมื่อแก้เสร็จ!

### Check CloudPanel Settings

1. เข้า **CloudPanel → Sites → เลือก site**
2. **Node.js tab:**
   - App Port: `3000`
   - App Start Command: `node server.js`
   - Status: **Running** (สีเขียว)
3. ถ้า Status = **Stopped** คลิก **Start**

---

## 📞 ยังแก้ไม่ได้?

**ส่งข้อมูลเหล่านี้มา:**

```bash
# 1. PM2 status
pm2 status

# 2. PM2 logs (20 บรรทัดล่าสุด)
pm2 logs thai-mooc --lines 20 --nostream

# 3. Nginx error logs
sudo tail -50 /var/log/nginx/error.log

# 4. Port status
lsof -i :3000

# 5. MySQL status
systemctl status mysql

# 6. .env file (ซ่อน password)
cat .env | sed 's/PASSWORD=.*/PASSWORD=***/'
```

---

**แนะนำ:** เริ่มจาก "วิธีแก้แบบเร็ว" ก่อน มักจะแก้ได้ 80% ของกรณี! 🎯
