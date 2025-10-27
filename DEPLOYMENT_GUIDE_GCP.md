# 🚀 Thai MOOC - Google Cloud VM Deployment Guide

คู่มือการ Deploy โปรเจค Thai MOOC ไปยัง Google Cloud VM Instance

---

## 📋 สิ่งที่ต้องเตรียม

### 1. Google Cloud VM Instance
```yaml
Recommended Specs:
  Machine Type: n2-standard-2 (2 vCPU, 8 GB RAM)
  Boot Disk: 50 GB SSD
  OS: Ubuntu 22.04 LTS
  Region: asia-southeast1 (Singapore)
```

### 2. Firewall Rules
```bash
# เปิด HTTP (port 80)
gcloud compute firewall-rules create allow-http \
  --allow=tcp:80 \
  --target-tags=http-server

# เปิด HTTPS (port 443)
gcloud compute firewall-rules create allow-https \
  --allow=tcp:443 \
  --target-tags=https-server
```

### 3. Domain Name (ถ้ามี)
- ตั้งค่า A record ชี้ไปที่ External IP ของ VM

---

## 🔧 การติดตั้ง (ครั้งแรก)

### Step 1: SSH เข้า VM

```bash
# ผ่าน gcloud CLI
gcloud compute ssh YOUR_VM_NAME --zone=asia-southeast1-b

# หรือผ่าน Console (คลิก SSH button)
```

### Step 2: รัน Setup Script

```bash
# สร้างไฟล์ setup script
cat > vm-setup.sh << 'EOF'
[คัดลอกเนื้อหาจาก scripts/vm-setup.sh มาวางที่นี่]
EOF

# ให้สิทธิ์ execute
chmod +x vm-setup.sh

# รัน script
bash vm-setup.sh
```

### Step 3: Secure MySQL

```bash
sudo mysql_secure_installation

# ตอบคำถามตามนี้:
# - Set root password: YES (ตั้งรหัสผ่านที่แข็งแรง)
# - Remove anonymous users: YES
# - Disallow root login remotely: YES
# - Remove test database: YES
# - Reload privilege tables: YES
```

### Step 4: สร้าง Database และ User

```bash
# สร้างไฟล์ setup-database.sh
cat > setup-database.sh << 'EOF'
[คัดลอกเนื้อหาจาก scripts/setup-database.sh มาวางที่นี่]
EOF

chmod +x setup-database.sh
bash setup-database.sh

# กรอกข้อมูล:
# - MySQL root password: (รหัสที่ตั้งไว้ใน step 3)
# - Database name: thai_mooc (หรือชื่ออื่นที่ต้องการ)
# - Database user: thai_mooc_user
# - Database password: (ตั้งรหัสผ่านที่แข็งแรง)
```

**⚠️ IMPORTANT:** เก็บ DATABASE_URL ที่ได้ไว้ใช้ใน .env

### Step 5: Import Database Schema

```bash
# วิธีที่ 1: ถ้ามีไฟล์ SQL dump
mysql -u thai_mooc_user -p thai_mooc < thai_mooc_schema.sql

# วิธีที่ 2: สร้างตารางด้วยสคริปต์
# (คุณต้องสร้างไฟล์ .sql สำหรับสร้างตารางทั้งหมด)
```

**สร้างตารางทั้งหมด:**
```bash
# เชื่อมต่อ MySQL
mysql -u thai_mooc_user -p thai_mooc

# รันคำสั่งสร้างตารางทั้งหมด (ดูจาก schema)
# หรือ import จากไฟล์ backup
```

### Step 6: Upload โปรเจค

**วิธีที่ 1: ใช้ Git (แนะนำ)**

```bash
cd /var/www/thai-mooc-clean

# ถ้าโปรเจคอยู่บน GitHub/GitLab
git clone YOUR_REPOSITORY_URL .

# ถ้าเป็น private repository
git clone https://username:token@github.com/username/repo.git .
```

**วิธีที่ 2: Upload ผ่าน gcloud**

```bash
# จากเครื่องของคุณ
cd /Users/jira/thai-mooc-clean

# อัดไฟล์โปรเจค (ไม่รวม node_modules)
tar -czf thai-mooc.tar.gz \
  --exclude=node_modules \
  --exclude=.next \
  --exclude=.git \
  --exclude=logs \
  .

# Upload ไปยัง VM
gcloud compute scp thai-mooc.tar.gz YOUR_VM_NAME:/tmp/ --zone=asia-southeast1-b

# SSH เข้า VM และแตกไฟล์
gcloud compute ssh YOUR_VM_NAME --zone=asia-southeast1-b
cd /var/www/thai-mooc-clean
tar -xzf /tmp/thai-mooc.tar.gz
```

### Step 7: ตั้งค่า Environment Variables

```bash
cd /var/www/thai-mooc-clean

# คัดลอกจาก example
cp .env.production.example .env

# แก้ไขค่าต่างๆ
nano .env
```

**แก้ไขค่าเหล่านี้:**
```env
NODE_ENV=production
PORT=3000

# ใช้ DATABASE_URL ที่ได้จาก Step 4
DATABASE_URL="mysql://thai_mooc_user:YOUR_PASSWORD@localhost:3306/thai_mooc"

# สร้าง secret ใหม่
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=$(openssl rand -base64 32)

UPLOAD_DIR=/var/www/thai-mooc-clean/public/uploads
MAX_FILE_SIZE=10485760
```

### Step 8: Deploy Application

```bash
cd /var/www/thai-mooc-clean
chmod +x scripts/deploy.sh
bash scripts/deploy.sh
```

### Step 9: ตั้งค่า Nginx

```bash
# คัดลอก Nginx config
sudo cp nginx.conf /etc/nginx/sites-available/thai-mooc

# แก้ไข domain name
sudo nano /etc/nginx/sites-available/thai-mooc
# เปลี่ยน yourdomain.com เป็น domain จริงของคุณ

# Enable site
sudo ln -s /etc/nginx/sites-available/thai-mooc /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 10: ติดตั้ง SSL Certificate (Let's Encrypt)

```bash
# ตั้งค่า domain ใน DNS ให้ชี้มาที่ VM External IP ก่อน
# รอ DNS propagate ประมาณ 5-30 นาที

# ติดตั้ง SSL
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# ทดสอบ auto-renewal
sudo certbot renew --dry-run
```

---

## ✅ ตรวจสอบการทำงาน

```bash
# 1. ตรวจสอบ PM2
pm2 status
pm2 logs thai-mooc

# 2. ตรวจสอบ Nginx
sudo nginx -t
sudo systemctl status nginx

# 3. ตรวจสอบ MySQL
sudo systemctl status mysql
mysql -u thai_mooc_user -p -e "SHOW DATABASES;"

# 4. ตรวจสอบ Firewall
sudo ufw status

# 5. ตรวจสอบ Application
curl http://localhost:3000
curl https://yourdomain.com
```

---

## 🔄 การ Update โปรเจค (ครั้งต่อไป)

```bash
# SSH เข้า VM
gcloud compute ssh YOUR_VM_NAME --zone=asia-southeast1-b

# ไปยัง project directory
cd /var/www/thai-mooc-clean

# Pull code ใหม่ (ถ้าใช้ Git)
git pull origin main

# หรือ upload ไฟล์ใหม่ผ่าน gcloud scp

# Deploy
bash scripts/deploy.sh
```

---

## 📊 การ Monitor

### PM2 Monitoring
```bash
# Status
pm2 status

# Logs (real-time)
pm2 logs thai-mooc

# Logs (specific lines)
pm2 logs thai-mooc --lines 100

# Monitor CPU & Memory
pm2 monit

# Web monitoring
pm2 plus
```

### Nginx Logs
```bash
# Access log
sudo tail -f /var/log/nginx/thai-mooc.access.log

# Error log
sudo tail -f /var/log/nginx/thai-mooc.error.log
```

### System Resources
```bash
# CPU & Memory
htop

# Disk space
df -h

# Network
sudo netstat -tuln
```

---

## 🔧 Troubleshooting

### Application ไม่ทำงาน
```bash
pm2 logs thai-mooc --err
pm2 restart thai-mooc
```

### Nginx 502 Bad Gateway
```bash
# ตรวจสอบว่า Next.js รันอยู่หรือไม่
pm2 status
curl http://localhost:3000

# Restart Nginx
sudo systemctl restart nginx
```

### Database Connection Error
```bash
# ตรวจสอบ MySQL
sudo systemctl status mysql

# ทดสอบการเชื่อมต่อ
mysql -u thai_mooc_user -p thai_mooc

# ตรวจสอบ .env
cat .env | grep DATABASE_URL
```

### Port Already in Use
```bash
# หา process ที่ใช้ port 3000
sudo lsof -i :3000

# Kill process
sudo kill -9 PID

# Restart application
pm2 restart thai-mooc
```

---

## 🗄️ Backup

### Database Backup
```bash
# Manual backup
mysqldump -u thai_mooc_user -p thai_mooc > backup_$(date +%Y%m%d).sql

# Backup ไปยัง Google Cloud Storage
gsutil cp backup_$(date +%Y%m%d).sql gs://your-backup-bucket/
```

### Files Backup
```bash
# Backup uploads folder
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz /var/www/thai-mooc-clean/public/uploads/

# Upload to Cloud Storage
gsutil cp uploads_backup_$(date +%Y%m%d).tar.gz gs://your-backup-bucket/
```

### Auto Backup (Cron)
```bash
# เพิ่ม cron job
crontab -e

# เพิ่มบรรทัดนี้ (backup ทุกวันเวลา 3:00 AM)
0 3 * * * /var/www/thai-mooc-clean/scripts/backup.sh
```

---

## 📞 Support

หากพบปัญหาในการ Deploy:
1. ตรวจสอบ logs ทั้งหมดตามที่ระบุ
2. ตรวจสอบ .env configuration
3. ตรวจสอบ firewall และ network settings
4. ตรวจสอบ file permissions

---

## 🎉 เสร็จสิ้น!

เมื่อ Deploy สำเร็จ คุณจะสามารถเข้าถึงเว็บไซต์ได้ที่:
- **HTTP**: http://YOUR_VM_EXTERNAL_IP
- **HTTPS**: https://yourdomain.com (ถ้าติดตั้ง SSL แล้ว)

Admin Panel: https://yourdomain.com/admin
