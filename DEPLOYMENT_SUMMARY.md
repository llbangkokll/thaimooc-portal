# 🎉 Thai MOOC - สรุปการ Deploy

โปรเจค Thai MOOC พร้อม Deploy แล้ว! ✅

---

## 📦 Package ที่พร้อมใช้งาน

**ไฟล์:** `thai-mooc-standalone-20251020-223231.tar.gz`
- **ขนาด:** 21 MB
- **ประเภท:** Standalone (ไม่ต้องรัน npm install)
- **รองรับ:** ทุก Node.js hosting ที่มี Node.js 18+ และ MySQL

---

## 🚀 วิธี Deploy แบบย่อ

### สำหรับ CloudPanel (แนะนำ)

1. **Upload package** ไปยัง server
2. **Extract** ไฟล์
3. **สร้าง database** และ import `database-schema.sql`
4. **แก้ไข .env** (ใส่ database credentials)
5. **เริ่มต้น app** ด้วย PM2 หรือผ่าน CloudPanel UI
6. **ตั้งค่า SSL** ผ่าน CloudPanel

**อ่านคู่มือเต็ม:** `DEPLOYMENT_CLOUDPANEL.md`

### สำหรับ Hosting อื่น ๆ

**อ่านคู่มือ:**
- `DEPLOYMENT_NO_NPM_ACCESS.md` - สำหรับ hosting ที่ไม่มี npm
- `NODEJS_HOSTING_DEPLOYMENT.md` - สำหรับ hosting ทั่วไป

---

## 📚 เอกสารทั้งหมด

| ไฟล์ | คำอธิบาย |
|------|----------|
| `DEPLOYMENT_CLOUDPANEL.md` | คู่มือ Deploy บน CloudPanel (ละเอียดสุด) |
| `DEPLOYMENT_NO_NPM_ACCESS.md` | คู่มือสำหรับ hosting ที่ไม่มี npm access |
| `NODEJS_HOSTING_DEPLOYMENT.md` | คู่มือทั่วไปสำหรับ Node.js hosting |
| `MYSQL_DIRECT_CONNECTION.md` | คู่มือการใช้ Direct MySQL (ไม่ผ่าน Prisma) |
| `package-standalone.sh` | สคริปต์สร้าง package (Mac/Linux) |
| `package-standalone.bat` | สคริปต์สร้าง package (Windows) |

---

## 🎯 สิ่งที่เปลี่ยนแปลงจากเดิม

### ✅ ลบ Prisma ออกแล้ว

- ❌ ไม่มี `@prisma/client` แล้ว
- ❌ ไม่มี `prisma` CLI แล้ว
- ❌ ไม่ต้องรัน `npx prisma generate` แล้ว
- ✅ ใช้ Direct MySQL connection แทน (mysql2)
- ✅ ขนาดเล็กลง ~50MB

### ✅ ข้อดีของ Direct MySQL

- 🚀 Deploy ง่ายขึ้น - ไม่ต้อง generate Prisma Client
- 💪 ควบคุม SQL เต็มที่ - เขียน query ซับซ้อนได้
- ⚡ Performance ดีขึ้น - Connection pooling
- 🔧 เหมาะกับ Shared Hosting - ไม่ต้องการ CLI tools

---

## 📋 Database Schema

**ตาราง:**
- `admin_users` - ผู้ดูแลระบบ
- `categories` - หมวดหมู่คอร์ส
- `course_types` - ประเภทคอร์ส
- `institutions` - สถาบัน
- `instructors` - ผู้สอน
- `courses` - คอร์สเรียน
- `course_categories` - ความสัมพันธ์ course-category
- `course_course_types` - ความสัมพันธ์ course-coursetype
- `course_instructors` - ความสัมพันธ์ course-instructor
- `news` - ข่าวสาร
- `banners` - แบนเนอร์
- `webapp_settings` - การตั้งค่าเว็บ
- `image_placeholders` - รูปภาพ placeholder

**Default Admin:**
- Username: `admin`
- Password: `admin123`
- ⚠️ **เปลี่ยนทันทีหลัง login!**

---

## 🔧 ไฟล์สำคัญใน Package

```
thai-mooc-standalone-[timestamp]/
├── server.js              # Entry point
├── package.json           # Dependencies list
├── .env.example          # ตัวอย่างการตั้งค่า
├── database-schema.sql   # SQL schema
├── README.txt            # คู่มือย่อ
├── .next/                # Built Next.js files
├── node_modules/         # Dependencies (standalone)
└── public/               # Static files
```

---

## 🌐 URL สำคัญหลัง Deploy

- **Homepage:** `https://yourdomain.com`
- **Admin Panel:** `https://yourdomain.com/admin`
- **Courses:** `https://yourdomain.com/courses`
- **API Test:** `https://yourdomain.com/api/test-mysql`
- **API Courses:** `https://yourdomain.com/api/courses`

---

## ⚙️ Environment Variables ที่ต้องตั้งค่า

```env
# Database (สำคัญที่สุด!)
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=thai_mooc

# Security (สร้างใหม่!)
JWT_SECRET=your-random-secret-key-at-least-32-characters

# Production
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://yourdomain.com
PORT=3000
```

---

## 🎬 Quick Start สำหรับ CloudPanel

```bash
# 1. Upload package
scp thai-mooc-standalone-*.tar.gz user@server:/home/user/htdocs/domain.com/

# 2. SSH เข้า server
ssh user@server

# 3. Extract
cd ~/htdocs/domain.com
tar -xzf thai-mooc-standalone-*.tar.gz --strip-components=1

# 4. Setup .env
cp .env.example .env
nano .env  # แก้ไข database credentials

# 5. Import database
mysql -u user -p database_name < database-schema.sql

# 6. Start app (ผ่าน CloudPanel UI หรือ)
pm2 start server.js --name thai-mooc
pm2 save

# 7. เปิดเว็บ
# https://yourdomain.com
```

---

## 📊 ขนาดและ Performance

| Metric | ค่า |
|--------|-----|
| Package Size | 21 MB |
| Node.js Version | 18.x+ |
| Memory Usage | ~200-500 MB |
| Build Time | ~3-5 วินาที |
| Cold Start | ~1-2 วินาที |
| Database | MySQL 5.7+ / 8.0 / 9.x |

---

## 🛡️ Security Checklist

- [ ] เปลี่ยน admin password จาก `admin123`
- [ ] เปลี่ยน `JWT_SECRET` เป็นค่าใหม่
- [ ] ใช้ Strong database password
- [ ] ติดตั้ง SSL certificate (HTTPS)
- [ ] จำกัด MySQL access เฉพาะ localhost
- [ ] ตั้งค่า firewall
- [ ] Enable automatic backups
- [ ] ตั้งค่า rate limiting (ถ้าจำเป็น)

---

## 📞 ติดต่อ/Support

- **GitHub:** https://github.com/YOUR_USERNAME/thai-mooc-clean
- **Issues:** https://github.com/YOUR_USERNAME/thai-mooc-clean/issues
- **Email:** support@thaimooc.ac.th

---

## ✅ Deployment Checklist

### Pre-deployment
- [x] Build production สำเร็จ
- [x] สร้าง standalone package
- [x] ทดสอบ local แล้ว
- [x] เตรียม database schema
- [x] เขียนคู่มือ deployment

### Deployment
- [ ] Upload package ไปยัง server
- [ ] Extract files
- [ ] สร้าง database
- [ ] Import schema
- [ ] ตั้งค่า .env
- [ ] เริ่มต้น application
- [ ] ตรวจสอบ logs

### Post-deployment
- [ ] ทดสอบ website ทำงาน
- [ ] ทดสอบ API endpoints
- [ ] Login admin panel
- [ ] เปลี่ยน default passwords
- [ ] ติดตั้ง SSL/HTTPS
- [ ] Setup monitoring
- [ ] Setup auto backup
- [ ] ตรวจสอบ performance

---

## 🎉 พร้อมแล้ว!

โปรเจค Thai MOOC พร้อม deploy บน:
- ✅ CloudPanel
- ✅ cPanel with Node.js
- ✅ Shared hosting ที่มี Node.js
- ✅ VPS (DigitalOcean, Linode, etc.)
- ✅ Cloud platforms (Railway, Render, Vercel)

**ขอให้ deployment สำเร็จครับ! 🚀**
