# 🚀 Quick Deploy Guide - Thai MOOC

คู่มือย่อสำหรับ Deploy ไปยัง Google Cloud VM (ใช้เวลาประมาณ 30-45 นาที)

---

## ⚡ Pre-requirements

✅ มี Google Cloud VM instance (Ubuntu 22.04)
✅ มี External IP address
✅ เปิด Firewall ports 80 และ 443

---

## 📦 Step-by-Step Deployment

### 1️⃣ เตรียมไฟล์ก่อน Deploy (บนเครื่อง Local)

```bash
cd /Users/jira/thai-mooc-clean

# Export database
bash scripts/export-database-schema.sh

# ได้ไฟล์:
# - thai_mooc_schema.sql (โครงสร้างตาราง)
# - thai_mooc_full_backup.sql (ข้อมูลทั้งหมด)
```

### 2️⃣ SSH เข้า VM

```bash
gcloud compute ssh YOUR_VM_NAME --zone=asia-southeast1-b
```

### 3️⃣ ติดตั้ง Software (ครั้งเดียว)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install MySQL
sudo apt install -y mysql-server

# Install Nginx
sudo apt install -y nginx

# Install PM2
sudo npm install -g pm2

# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Configure Firewall
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

### 4️⃣ Setup MySQL

```bash
# Secure installation
sudo mysql_secure_installation
# ตั้งรหัสผ่าน root และตอบ YES ทุกคำถาม

# สร้าง database และ user
sudo mysql -u root -p

# รันคำสั่งนี้ใน MySQL:
CREATE DATABASE thai_mooc CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'thai_mooc_user'@'localhost' IDENTIFIED BY 'YourStrongPassword123!';
GRANT ALL PRIVILEGES ON thai_mooc.* TO 'thai_mooc_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 5️⃣ Upload โปรเจคและ Database

**จากเครื่อง Local:**

```bash
# อัดไฟล์โปรเจค
cd /Users/jira
tar -czf thai-mooc.tar.gz \
  --exclude=thai-mooc-clean/node_modules \
  --exclude=thai-mooc-clean/.next \
  --exclude=thai-mooc-clean/.git \
  thai-mooc-clean

# Upload ไป VM
gcloud compute scp thai-mooc.tar.gz YOUR_VM_NAME:/tmp/ --zone=asia-southeast1-b
gcloud compute scp thai-mooc-clean/thai_mooc_full_backup.sql YOUR_VM_NAME:/tmp/ --zone=asia-southeast1-b
```

**บน VM:**

```bash
# สร้าง directory
sudo mkdir -p /var/www/thai-mooc-clean
sudo chown -R $USER:$USER /var/www/thai-mooc-clean

# แตกไฟล์
cd /var/www
tar -xzf /tmp/thai-mooc.tar.gz

# Import database
mysql -u thai_mooc_user -p thai_mooc < /tmp/thai_mooc_full_backup.sql
```

### 6️⃣ ตั้งค่า Environment

```bash
cd /var/www/thai-mooc-clean

# สร้างไฟล์ .env
cat > .env << 'EOF'
NODE_ENV=production
PORT=3000
DATABASE_URL="mysql://thai_mooc_user:YourStrongPassword123!@localhost:3306/thai_mooc"
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=$(openssl rand -base64 32)
UPLOAD_DIR=/var/www/thai-mooc-clean/public/uploads
MAX_FILE_SIZE=10485760
EOF

# สร้าง directories
mkdir -p logs public/uploads
chmod 755 public/uploads
```

### 7️⃣ Deploy Application

```bash
cd /var/www/thai-mooc-clean

# Install dependencies
npm ci --production

# Build
npm run build

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
# คัดลอกคำสั่งที่ได้และรัน
```

### 8️⃣ ตั้งค่า Nginx

```bash
# แก้ไข domain ใน nginx.conf
sudo nano /var/www/thai-mooc-clean/nginx.conf
# เปลี่ยน yourdomain.com เป็น domain จริง

# Copy config
sudo cp /var/www/thai-mooc-clean/nginx.conf /etc/nginx/sites-available/thai-mooc

# Enable site
sudo ln -s /etc/nginx/sites-available/thai-mooc /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test & Restart
sudo nginx -t
sudo systemctl restart nginx
```

### 9️⃣ ติดตั้ง SSL (ถ้ามี Domain)

```bash
# ตรวจสอบว่า DNS ชี้มาที่ VM External IP แล้ว
# รอ 5-30 นาที

# ติดตั้ง SSL
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# ทดสอบ auto-renewal
sudo certbot renew --dry-run
```

---

## ✅ ตรวจสอบ

```bash
# ตรวจสอบ PM2
pm2 status
pm2 logs thai-mooc

# ตรวจสอบ Nginx
sudo systemctl status nginx

# ทดสอบเข้าเว็บ
curl http://localhost:3000
curl http://YOUR_EXTERNAL_IP
```

---

## 🔄 Update โปรเจค (ครั้งต่อไป)

```bash
# 1. Upload code ใหม่
# (จากเครื่อง local)
gcloud compute scp thai-mooc.tar.gz YOUR_VM_NAME:/tmp/ --zone=asia-southeast1-b

# 2. Deploy
# (บน VM)
cd /var/www/thai-mooc-clean
tar -xzf /tmp/thai-mooc.tar.gz --strip-components=1
npm ci --production
npm run build
pm2 restart thai-mooc
```

---

## 📊 ข้อมูล VM ของคุณ

กรอกข้อมูลนี้เพื่อใช้ในภายหลัง:

```
VM Name: ___________________________
Zone: ______________________________
External IP: _______________________
Domain: ____________________________

MySQL Root Password: _______________
Database Name: thai_mooc
Database User: thai_mooc_user
Database Password: _________________

NEXTAUTH_SECRET: ___________________
```

---

## 🆘 หากมีปัญหา

**Application ไม่ทำงาน:**
```bash
pm2 logs thai-mooc --err
pm2 restart thai-mooc
```

**502 Bad Gateway:**
```bash
pm2 status
sudo systemctl restart nginx
```

**Database Error:**
```bash
mysql -u thai_mooc_user -p thai_mooc
# ตรวจสอบ connection
```

---

## 🎉 เสร็จสิ้น!

✅ เข้าถึงเว็บไซต์: `https://yourdomain.com`
✅ Admin Panel: `https://yourdomain.com/admin`

สำหรับคู่มือฉบับเต็ม ดูที่: [DEPLOYMENT_GUIDE_GCP.md](DEPLOYMENT_GUIDE_GCP.md)
