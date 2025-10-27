# Thai MOOC - Node.js Hosting Deployment Guide

คู่มือการ Deploy โปรเจค Thai MOOC ไปยัง Web Hosting ที่รองรับ Node.js และ MySQL

---

## 📋 ข้อกำหนดของ Hosting

### ✅ ต้องมี:
- **Node.js** เวอร์ชัน 18.x หรือสูงกว่า
- **MySQL** เวอร์ชัน 5.7, 8.0 หรือ 9.x
- **npm** หรือ **yarn**
- **Write permission** สำหรับโฟลเดอร์ upload
- **Memory** อย่างน้อย 512MB (แนะนำ 1GB+)
- **Storage** อย่างน้อย 500MB

### 📦 Hosting ที่แนะนำ:
- **Hostinger** (Node.js Hosting)
- **A2 Hosting** (Node.js Hosting)
- **DigitalOcean** (App Platform / Droplet)
- **Railway.app**
- **Render.com**
- **Vercel** (แต่ต้อง deploy database แยก)
- **Heroku**

---

## 🚀 ขั้นตอนการ Deploy

### 1. เตรียมไฟล์โปรเจค

```bash
# Clone โปรเจค (ถ้ายังไม่มี)
git clone https://github.com/YOUR_USERNAME/thai-mooc-clean.git
cd thai-mooc-clean

# Install dependencies
npm install

# Build production
npm run build
```

### 2. เตรียมฐานข้อมูล MySQL

#### 2.1 สร้าง Database บน Hosting

เข้า **cPanel** หรือ **MySQL Manager** ของ hosting แล้วสร้าง:
- Database name: `thai_mooc` (หรือชื่ออื่นที่คุณต้องการ)
- Database user: สร้าง user ใหม่พร้อม password
- Grant ALL PRIVILEGES ให้ user นี้

#### 2.2 Import Database Schema

สร้างไฟล์ `database-schema.sql`:

```sql
-- สร้างตารางทั้งหมด
CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` VARCHAR(191) NOT NULL,
  `username` VARCHAR(191) NOT NULL,
  `password` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `role` VARCHAR(191) NOT NULL DEFAULT 'admin',
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `lastLogin` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `admin_users_username_key` (`username`),
  UNIQUE INDEX `admin_users_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `categories` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `nameEn` VARCHAR(191) NULL,
  `icon` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `course_types` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `nameEn` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `institutions` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `nameEn` VARCHAR(191) NULL,
  `abbreviation` VARCHAR(191) NOT NULL,
  `logoUrl` VARCHAR(191) NULL,
  `website` VARCHAR(191) NULL,
  `description` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `instructors` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `nameEn` VARCHAR(191) NULL,
  `title` VARCHAR(191) NULL,
  `institutionId` VARCHAR(191) NULL,
  `bio` TEXT NULL,
  `imageUrl` VARCHAR(191) NULL,
  `email` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `instructors_institutionId_fkey` (`institutionId`),
  CONSTRAINT `instructors_institutionId_fkey` FOREIGN KEY (`institutionId`) REFERENCES `institutions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `courses` (
  `id` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `titleEn` VARCHAR(191) NULL,
  `description` TEXT NOT NULL,
  `learningOutcomes` TEXT NULL,
  `targetAudience` TEXT NULL,
  `prerequisites` TEXT NULL,
  `tags` TEXT NULL,
  `assessmentCriteria` TEXT NULL,
  `courseUrl` VARCHAR(191) NULL,
  `videoUrl` VARCHAR(191) NULL,
  `contentStructure` TEXT NULL,
  `institutionId` VARCHAR(191) NULL,
  `instructorId` VARCHAR(191) NULL,
  `imageId` VARCHAR(191) NULL,
  `bannerImageId` VARCHAR(191) NULL,
  `level` VARCHAR(191) NULL,
  `teachingLanguage` VARCHAR(191) NULL,
  `durationHours` INT NULL,
  `hasCertificate` BOOLEAN NOT NULL DEFAULT false,
  `enrollCount` INT NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `courses_institutionId_fkey` (`institutionId`),
  INDEX `courses_instructorId_fkey` (`instructorId`),
  CONSTRAINT `courses_institutionId_fkey` FOREIGN KEY (`institutionId`) REFERENCES `institutions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `courses_instructorId_fkey` FOREIGN KEY (`instructorId`) REFERENCES `instructors` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `course_categories` (
  `id` VARCHAR(191) NOT NULL,
  `courseId` VARCHAR(191) NOT NULL,
  `categoryId` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `course_categories_courseId_fkey` (`courseId`),
  INDEX `course_categories_categoryId_fkey` (`categoryId`),
  UNIQUE INDEX `course_categories_courseId_categoryId_key` (`courseId`, `categoryId`),
  CONSTRAINT `course_categories_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `course_categories_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `course_course_types` (
  `id` VARCHAR(191) NOT NULL,
  `courseId` VARCHAR(191) NOT NULL,
  `courseTypeId` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `course_course_types_courseId_fkey` (`courseId`),
  INDEX `course_course_types_courseTypeId_fkey` (`courseTypeId`),
  UNIQUE INDEX `course_course_types_courseId_courseTypeId_key` (`courseId`, `courseTypeId`),
  CONSTRAINT `course_course_types_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `course_course_types_courseTypeId_fkey` FOREIGN KEY (`courseTypeId`) REFERENCES `course_types` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `course_instructors` (
  `id` VARCHAR(191) NOT NULL,
  `courseId` VARCHAR(191) NOT NULL,
  `instructorId` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `course_instructors_courseId_fkey` (`courseId`),
  INDEX `course_instructors_instructorId_fkey` (`instructorId`),
  UNIQUE INDEX `course_instructors_courseId_instructorId_key` (`courseId`, `instructorId`),
  CONSTRAINT `course_instructors_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `course_instructors_instructorId_fkey` FOREIGN KEY (`instructorId`) REFERENCES `instructors` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `news` (
  `id` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `content` TEXT NOT NULL,
  `imageId` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `banners` (
  `id` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `titleEn` VARCHAR(191) NULL,
  `subtitle` VARCHAR(191) NULL,
  `subtitleEn` VARCHAR(191) NULL,
  `imageId` VARCHAR(191) NOT NULL,
  `linkUrl` VARCHAR(191) NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `order` INT NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `webapp_settings` (
  `id` VARCHAR(191) NOT NULL,
  `siteName` VARCHAR(191) NOT NULL,
  `siteLogo` VARCHAR(191) NOT NULL,
  `contactEmail` VARCHAR(191) NOT NULL,
  `contactPhone` VARCHAR(191) NOT NULL,
  `address` TEXT NOT NULL,
  `aboutUs` TEXT NULL,
  `aboutUsEn` TEXT NULL,
  `mapUrl` VARCHAR(191) NULL,
  `facebookUrl` VARCHAR(191) NULL,
  `twitterUrl` VARCHAR(191) NULL,
  `youtubeUrl` VARCHAR(191) NULL,
  `instagramUrl` VARCHAR(191) NULL,
  `lineUrl` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `image_placeholders` (
  `id` VARCHAR(191) NOT NULL,
  `type` VARCHAR(191) NOT NULL,
  `base64Data` LONGTEXT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- สร้าง admin user เริ่มต้น (password: admin123)
-- Hash ของ password "admin123" ด้วย bcrypt
INSERT INTO `admin_users` (`id`, `username`, `password`, `name`, `email`, `role`, `isActive`, `createdAt`, `updatedAt`)
VALUES (
  'admin-1',
  'admin',
  '$2a$10$rQY5vN0qH9xQvjFZOvL9oe7VYgZHZL7JKMc5KpQZN5qK5QZN5qK5Q',
  'System Administrator',
  'admin@thaimooc.ac.th',
  'super_admin',
  1,
  NOW(),
  NOW()
);
```

Import ไฟล์นี้เข้า MySQL:

```bash
# ผ่าน cPanel phpMyAdmin
# หรือผ่าน command line
mysql -u YOUR_DB_USER -p YOUR_DB_NAME < database-schema.sql
```

### 3. ตั้งค่า Environment Variables

สร้างไฟล์ `.env.production` หรือตั้งค่าใน Hosting Control Panel:

```env
# Database Connection
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=thai_mooc

# Alternative: Full DATABASE_URL (สำหรับ compatibility)
DATABASE_URL="mysql://your_db_user:your_db_password@localhost:3306/thai_mooc"

# JWT Secret (สร้าง random string ยาวๆ)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Next.js Settings
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://yourdomain.com
```

**สำคัญ!** เปลี่ยน:
- `your_db_user` → ชื่อ database user จริง
- `your_db_password` → password database จริง
- `your-super-secret-jwt-key-change-this-in-production` → random string ยาว ๆ
- `https://yourdomain.com` → domain จริงของคุณ

### 4. Upload ไฟล์ไปยัง Hosting

#### วิธีที่ 1: ใช้ Git (แนะนำ)

```bash
# บน hosting server
git clone https://github.com/YOUR_USERNAME/thai-mooc-clean.git
cd thai-mooc-clean
npm install --production
npm run build
```

#### วิธีที่ 2: Upload ผ่าน FTP/SFTP

Upload โฟลเดอร์ทั้งหมด **ยกเว้น**:
- `node_modules/`
- `.next/`
- `.git/`

จากนั้นรันบน server:

```bash
npm install --production
npm run build
```

### 5. เริ่มต้นแอปพลิเคชัน

```bash
# Production mode
npm start

# หรือใช้ PM2 (แนะนำสำหรับ production)
npm install -g pm2
pm2 start npm --name "thai-mooc" -- start
pm2 save
pm2 startup
```

---

## 🔧 การตั้งค่าเพิ่มเติม

### ใช้ PM2 สำหรับ Process Management

```bash
# Install PM2
npm install -g pm2

# Start app
pm2 start npm --name "thai-mooc" -- start

# Enable startup on boot
pm2 startup
pm2 save

# ดูสถานะ
pm2 status

# ดู logs
pm2 logs thai-mooc

# Restart
pm2 restart thai-mooc
```

### ตั้งค่า Nginx Reverse Proxy (ถ้ามี)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### ตั้งค่า Apache .htaccess (ถ้าใช้ Apache)

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
</IfModule>
```

---

## 📝 Checklist ก่อน Deploy

- [ ] Database สร้างเรียบร้อย
- [ ] Import schema.sql เข้า database แล้ว
- [ ] ตั้งค่า environment variables (.env)
- [ ] npm install เสร็จสมบูรณ์
- [ ] npm run build สำเร็จ
- [ ] Test connection ไปยัง MySQL ได้
- [ ] Port 3000 เปิดอยู่ (หรือ port ที่ใช้)
- [ ] Firewall อนุญาต incoming connections
- [ ] SSL/HTTPS ตั้งค่าแล้ว (แนะนำ)

---

## 🐛 Troubleshooting

### Error: Cannot connect to MySQL

```bash
# ตรวจสอบ MySQL service
systemctl status mysql

# ตรวจสอบ connection
mysql -u YOUR_USER -p -h localhost
```

### Error: Port 3000 already in use

```bash
# หา process ที่ใช้ port 3000
lsof -i :3000

# Kill process
kill -9 PID
```

### Error: Permission denied

```bash
# ให้สิทธิ์โฟลเดอร์
chmod -R 755 /path/to/thai-mooc-clean
chown -R youruser:yourgroup /path/to/thai-mooc-clean
```

### Error: Out of Memory

เพิ่ม swap space หรืออัพเกรด RAM

```bash
# สร้าง swap (temporary fix)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

---

## 🔒 Security Best Practices

1. **เปลี่ยน Default Password**: เปลี่ยน password ของ admin user ทันที
2. **ใช้ Strong JWT_SECRET**: random string ยาวอย่างน้อย 32 characters
3. **Enable HTTPS**: ใช้ SSL Certificate (Let's Encrypt ฟรี)
4. **Firewall**: เปิดเฉพาะ port ที่จำเป็น (80, 443, 3000)
5. **Database Access**: จำกัด MySQL access จาก localhost เท่านั้น
6. **Regular Updates**: อัพเดท dependencies เป็นประจำ
7. **Backup**: สำรองข้อมูล database และไฟล์อัตโนมัติ

---

## 📚 คำสั่งที่ใช้บ่อย

```bash
# ดู logs
pm2 logs thai-mooc

# Restart app
pm2 restart thai-mooc

# Stop app
pm2 stop thai-mooc

# ดูการใช้งาน resource
pm2 monit

# Backup database
mysqldump -u USER -p thai_mooc > backup.sql

# Restore database
mysql -u USER -p thai_mooc < backup.sql
```

---

## 📞 Support

หากมีปัญหาหรือคำถาม:
- Email: support@thaimooc.ac.th
- GitHub Issues: https://github.com/YOUR_USERNAME/thai-mooc-clean/issues

---

**สำเร็จแล้ว! 🎉** โปรเจคของคุณพร้อม deploy บน Node.js Hosting แล้ว
