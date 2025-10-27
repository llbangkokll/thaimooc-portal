# 🚀 CloudPanel - Node.js Setup Guide

คู่มือการตั้งค่า Node.js ใน CloudPanel ตั้งแต่เริ่มต้น

---

## ⚠️ อาการที่พบ: 502 Bad Gateway

**สาเหตุ:**
- CloudPanel ยังไม่ได้ติดตั้ง Node.js
- หรือยังไม่ได้สร้าง Node.js Site
- หรือ PM2 ยังไม่ได้รัน

---

## 📋 ขั้นตอนการตั้งค่า CloudPanel สำหรับ Node.js

### ขั้นตอนที่ 1: ตรวจสอบว่า CloudPanel รองรับ Node.js หรือไม่

**Login เข้า CloudPanel:**
```
https://YOUR_SERVER_IP:8443
```

**ตรวจสอบ:**
1. ไปที่เมนู **Sites**
2. คลิก **Add Site**
3. ดูว่ามีตัวเลือก **Node.js** หรือไม่

**ถ้าไม่มี Node.js:**
- CloudPanel รุ่นเก่าอาจไม่รองรับ Node.js
- ต้องติดตั้ง Node.js ด้วยตัวเอง (ดูขั้นตอนด้านล่าง)

**ถ้ามี Node.js:**
- ดีมาก! ข้ามไปขั้นตอนที่ 2

---

### ขั้นตอนที่ 2: สร้าง Node.js Site

1. **คลิก Sites → Add Site**

2. **เลือกประเภท Site:**
   - เลือก **Node.js** (ไม่ใช่ PHP!)

3. **กรอกข้อมูล:**
   ```
   Domain Name: yourdomain.com
   Site User: thaimooc (หรือชื่ออื่นที่คุณต้องการ)
   Site User Password: [สร้าง password]
   Node.js Version: 18.x หรือ 20.x (เลือกที่ใหม่สุด)
   ```

4. **คลิก Create**

5. **CloudPanel จะสร้าง:**
   - Site directory: `/home/thaimooc/htdocs/yourdomain.com`
   - Nginx vhost config
   - Node.js environment

---

### ขั้นตอนที่ 3: Upload test-server.js

**ผ่าน SFTP:**
```bash
# จากเครื่อง local
scp test-server.js thaimooc@YOUR_SERVER_IP:/home/thaimooc/htdocs/yourdomain.com/
```

**หรือผ่าน CloudPanel File Manager:**
1. Sites → เลือก site → File Manager
2. Upload test-server.js

---

### ขั้นตอนที่ 4: ตั้งค่า Node.js Application

1. **ใน CloudPanel:**
   - Sites → เลือก site → **Node.js** tab

2. **กรอกข้อมูล:**
   ```
   Node.js Version: 18.x หรือ 20.x
   App Port: 3000
   App Start Command: node test-server.js
   App Root: /home/thaimooc/htdocs/yourdomain.com
   ```

3. **Environment Variables (ถ้ามี):**
   - ไม่ต้องใส่ในตอนนี้

4. **คลิก Save**

5. **คลิกปุ่ม START**

---

### ขั้นตอนที่ 5: ตรวจสอบสถานะ

**ใน CloudPanel:**
- Node.js tab
- Status ควรเป็น **Running** (สีเขียว)

**ผ่าน SSH:**
```bash
# SSH เข้า server
ssh thaimooc@YOUR_SERVER_IP

# ตรวจสอบ PM2
pm2 status

# ควรเห็น:
┌─────┬──────────────────┬─────────┬─────────┐
│ id  │ name             │ status  │ cpu     │
├─────┼──────────────────┼─────────┼─────────┤
│ 0   │ test-server      │ online  │ 0%      │
└─────┴──────────────────┴─────────┴─────────┘
```

**ถ้า status เป็น "errored":**
```bash
# ดู logs
pm2 logs test-server
```

---

### ขั้นตอนที่ 6: ทดสอบ

**เปิด Browser:**
```
https://yourdomain.com
```

**ควรเห็น:**
- ✅ หน้าเว็บ test-server สวยงาม
- ✅ แสดง Node.js version
- ✅ ไม่มี 502 error

---

## 🔧 ถ้า CloudPanel ไม่มี Node.js Option

### วิธีที่ 1: Update CloudPanel

```bash
# SSH เข้า server as root
ssh root@YOUR_SERVER_IP

# Update CloudPanel
clpctl cloudpanel:update
```

### วิธีที่ 2: ติดตั้ง Node.js Manual

```bash
# SSH เข้า server as root
ssh root@YOUR_SERVER_IP

# ติดตั้ง Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# ตรวจสอบ
node --version
npm --version

# ติดตั้ง PM2
npm install -g pm2

# ตรวจสอบ PM2
pm2 --version
```

---

## 🎯 Setup แบบ Manual (ถ้าไม่มี CloudPanel Node.js)

### 1. สร้าง Site แบบ Static/PHP (ใช้เป็นฐาน)

1. CloudPanel → Sites → Add Site
2. เลือก **Static HTML** หรือ **PHP**
3. สร้าง site ตามปกติ

### 2. SSH เข้า server และ Setup Node.js

```bash
# SSH เข้าในฐานะ site user
ssh thaimooc@YOUR_SERVER_IP

# เข้าโฟลเดอร์ site
cd ~/htdocs/yourdomain.com

# Upload test-server.js มาที่นี่

# Start ด้วย PM2
pm2 start test-server.js --name test-server

# Save PM2 config
pm2 save

# Setup auto-start
pm2 startup
# ทำตามคำสั่งที่แสดง (อาจต้องรันด้วย sudo)
```

### 3. แก้ไข Nginx Config

```bash
# SSH as root
ssh root@YOUR_SERVER_IP

# แก้ไข Nginx vhost
nano /etc/nginx/sites-enabled/yourdomain.com.conf
```

**เพิ่ม location block:**

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # ... SSL config ...

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

**ทดสอบและ reload:**

```bash
# ทดสอบ config
nginx -t

# ถ้าไม่มี error
systemctl reload nginx
```

---

## 🐛 Troubleshooting

### ปัญหา: ไม่เห็น Node.js tab ใน CloudPanel

**สาเหตุ:** CloudPanel รุ่นเก่า

**แก้ไข:**
1. Update CloudPanel: `clpctl cloudpanel:update`
2. หรือใช้วิธี Manual Setup ด้านบน

---

### ปัญหา: Node.js Version เก่า

**ตรวจสอบ:**
```bash
node --version
```

**ต้องการ:** v18.x.x หขึ้นไป

**แก้ไข:**
```bash
# ติดตั้ง Node.js ใหม่
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# ตรวจสอบอีกครั้ง
node --version
```

---

### ปัญหา: PM2 ไม่มี

**ตรวจสอบ:**
```bash
pm2 --version
```

**แก้ไข:**
```bash
sudo npm install -g pm2
pm2 --version
```

---

### ปัญหา: Permission Denied

**Error:**
```
Error: EACCES: permission denied
```

**แก้ไข:**
```bash
# ตรวจสอบ owner
ls -la ~/htdocs/yourdomain.com/

# แก้ไข owner
sudo chown -R thaimooc:thaimooc ~/htdocs/yourdomain.com/

# แก้ไข permissions
chmod -R 755 ~/htdocs/yourdomain.com/
```

---

## 📋 Checklist การ Setup

- [ ] CloudPanel ติดตั้งแล้ว
- [ ] สร้าง Node.js Site แล้ว (หรือ Static Site + Manual setup)
- [ ] Node.js ติดตั้งแล้ว (v18+)
- [ ] PM2 ติดตั้งแล้ว
- [ ] Upload test-server.js แล้ว
- [ ] Start app ด้วย PM2
- [ ] Nginx config ถูกต้อง
- [ ] ทดสอบจาก browser สำเร็จ

---

## 🎬 Quick Commands

```bash
# ตรวจสอบ Node.js
node --version

# ตรวจสอบ PM2
pm2 status

# Start test server
pm2 start test-server.js --name test-server

# ดู logs
pm2 logs test-server

# Restart
pm2 restart test-server

# Stop
pm2 stop test-server

# Delete
pm2 delete test-server

# Reload Nginx
sudo systemctl reload nginx
```

---

## 📞 ต้องการความช่วยเหลือ?

**ส่งข้อมูลเหล่านี้:**

```bash
# 1. CloudPanel version
clpctl --version

# 2. Node.js version
node --version

# 3. PM2 status
pm2 status

# 4. Nginx test
sudo nginx -t

# 5. Site structure
ls -la ~/htdocs/yourdomain.com/
```

---

## ✅ เมื่อ Setup สำเร็จ

**คุณจะเห็น:**
- ✅ test-server.js แสดงหน้าเว็บได้
- ✅ ไม่มี 502 error
- ✅ pm2 status แสดง "online"

**ขั้นตอนต่อไป:**
1. หยุด test-server: `pm2 delete test-server`
2. Deploy Thai MOOC แบบเต็ม
3. สนุกกับการใช้งาน! 🎉

---

**หมายเหตุ:** ถ้า CloudPanel ไม่รองรับ Node.js แนะนำให้ใช้ VPS ธรรมดา (Ubuntu/Debian) แทน แล้วติดตั้ง Node.js + PM2 + Nginx เอง จะง่ายกว่า!
