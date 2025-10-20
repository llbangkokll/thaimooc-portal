# Thai MOOC Platform - คู่มือติดตั้งบน Windows

## 🪟 คำแนะนำสำหรับ Windows

### ⚠️ ข้อควรระวัง

**ไม่ต้องใช้** `lifeskill/thai-mooc-mysql:8.0` เพราะเป็น ARM64 image!

ใช้ **MySQL official image** แทน: `mysql:8.0` (รองรับทั้ง Windows และ Mac)

---

## 🚀 วิธีติดตั้งบน Windows

### ขั้นตอนที่ 1: ติดตั้ง Docker Desktop

1. ดาวน์โหลด Docker Desktop สำหรับ Windows: https://www.docker.com/products/docker-desktop/
2. ติดตั้งและเปิดใช้งาน WSL 2 backend (แนะนำ)
3. เปิด Docker Desktop

### ขั้นตอนที่ 2: เตรียม Docker Compose Files

**ตัวเลือก 1: ดาวน์โหลดไฟล์จาก GitHub**

```powershell
# Clone repository (ถ้ามี) หรือสร้างโฟลเดอร์ใหม่
mkdir thai-mooc
cd thai-mooc
```

**ตัวเลือก 2: สร้างไฟล์เอง**

สร้างไฟล์ `docker-compose.yml`:

```yaml
version: '3.8'

services:
  # MySQL Database - ใช้ official image (รองรับ Windows)
  mysql:
    image: mysql:8.0
    container_name: thai-mooc-mysql
    restart: always
    platform: linux/amd64
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD:-rootpassword}
      MYSQL_DATABASE: ${MYSQL_DATABASE:-thai_mooc}
      MYSQL_USER: ${MYSQL_USER:-thaimooc}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD:-thaimoocpassword}
    ports:
      - "3307:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p$$MYSQL_ROOT_PASSWORD"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Next.js Web Application
  webapp:
    image: lifeskill/thai-mooc-webapp:latest
    container_name: thai-mooc-webapp
    restart: always
    platform: linux/amd64
    environment:
      DATABASE_URL: mysql://${MYSQL_USER:-thaimooc}:${MYSQL_PASSWORD:-thaimoocpassword}@mysql:3306/${MYSQL_DATABASE:-thai_mooc}
      NEXT_PUBLIC_BASE_URL: ${NEXT_PUBLIC_BASE_URL:-http://localhost:3000}
      JWT_SECRET: ${JWT_SECRET:-your-secret-key-change-in-production}
      NODE_ENV: production
    ports:
      - "3000:3000"
    depends_on:
      mysql:
        condition: service_healthy
    command: >
      sh -c "
        echo 'Waiting for database to be ready...' &&
        sleep 10 &&
        echo 'Running Prisma migrations...' &&
        npx prisma db push --skip-generate &&
        echo 'Seeding database...' &&
        npx prisma db seed || true &&
        echo 'Starting application...' &&
        node server.js
      "

volumes:
  mysql_data:
    driver: local
```

สร้างไฟล์ `.env`:

```env
# MySQL Configuration
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=thai_mooc
MYSQL_USER=thaimooc
MYSQL_PASSWORD=thaimoocpassword

# Application Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
JWT_SECRET=change-this-to-a-very-long-random-string-in-production
```

### ขั้นตอนที่ 3: เริ่มต้นใช้งาน

เปิด **PowerShell** หรือ **Command Prompt**:

```powershell
# เข้าไปที่โฟลเดอร์โปรเจค
cd thai-mooc

# Pull images
docker pull lifeskill/thai-mooc-webapp:latest
docker pull mysql:8.0

# ตรวจสอบว่า pull สำเร็จ
docker images

# เริ่มต้น services
docker-compose up -d

# ดู logs
docker-compose logs -f
```

### ขั้นตอนที่ 4: เข้าใช้งาน

เปิดเบราว์เซอร์:
- **เว็บไซต์**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin/login

---

## 🔧 คำสั่งที่มีประโยชน์บน Windows

### ดูสถานะ Containers

```powershell
docker ps
docker-compose ps
```

### ดู Logs

```powershell
# Logs ทั้งหมด
docker-compose logs -f

# Logs เฉพาะ webapp
docker-compose logs -f webapp

# Logs เฉพาะ MySQL
docker-compose logs -f mysql
```

### หยุด/เริ่ม Services

```powershell
# หยุด services
docker-compose stop

# เริ่ม services
docker-compose start

# Restart services
docker-compose restart

# หยุดและลบ containers
docker-compose down
```

### เข้าไปใน Container

```powershell
# เข้าไปใน webapp container
docker exec -it thai-mooc-webapp sh

# เข้าไปใน MySQL container
docker exec -it thai-mooc-mysql bash

# เชื่อมต่อ MySQL
docker exec -it thai-mooc-mysql mysql -u thaimooc -pthaimoocpassword thai_mooc
```

### ลบ Images เก่า (ถ้า Pull ผิด)

```powershell
# ลบ ARM64 MySQL image ที่ผิด
docker rmi lifeskill/thai-mooc-mysql:8.0

# ลบ containers ทั้งหมด
docker-compose down

# ลบ volumes (ระวัง! จะลบข้อมูลในฐานข้อมูล)
docker-compose down -v

# ทำความสะอาด images ที่ไม่ใช้
docker image prune -a
```

---

## 🐛 แก้ไขปัญหาบน Windows

### ปัญหา: Cannot pull MySQL image หรือ Architecture mismatch

**สาเหตุ**: Pull image ARM64 โดยไม่ตั้งใจ

**วิธีแก้**:

```powershell
# ลบ image เก่า
docker rmi lifeskill/thai-mooc-mysql:8.0

# Pull MySQL official image
docker pull --platform linux/amd64 mysql:8.0

# ใช้ docker-compose.yml ที่มี platform: linux/amd64
docker-compose up -d
```

### ปัญหา: Port already in use

**สาเหตุ**: Port 3000 หรือ 3307 ถูกใช้งานอยู่

**วิธีแก้**:

แก้ไขไฟล์ `.env`:

```env
APP_PORT=3001
MYSQL_PORT=3308
```

หรือหยุด process ที่ใช้ port อยู่:

```powershell
# ดู process ที่ใช้ port 3000
netstat -ano | findstr :3000

# Kill process (เปลี่ยน PID เป็นเลขที่ได้)
taskkill /PID <PID> /F
```

### ปัญหา: Database connection error

**สาเหตุ**: MySQL ยังไม่พร้อม

**วิธีแก้**:

```powershell
# ตรวจสอบว่า MySQL container รันอยู่
docker ps | findstr mysql

# ดู MySQL logs
docker-compose logs mysql

# ทดสอบเชื่อมต่อ
docker exec -it thai-mooc-mysql mysqladmin ping -h localhost -u root -prootpassword
```

### ปัญหา: WSL 2 issues

**วิธีแก้**:

1. เปิด PowerShell แบบ Administrator
2. รันคำสั่ง:

```powershell
wsl --update
wsl --set-default-version 2
```

3. Restart Docker Desktop

### ปัญหา: Build failed หรือ slow performance

**วิธีแก้**:

1. เพิ่ม Resources ใน Docker Desktop:
   - Settings → Resources → Advanced
   - เพิ่ม CPUs และ Memory

2. Enable WSL 2 backend:
   - Settings → General
   - ✅ Use WSL 2 based engine

---

## 📊 ตรวจสอบว่า Platform ถูกต้อง

```powershell
# ตรวจสอบ platform ของ images
docker image inspect lifeskill/thai-mooc-webapp:latest | findstr Architecture
docker image inspect mysql:8.0 | findstr Architecture
```

**ผลลัพธ์ที่ถูกต้องบน Windows:**
```
"Architecture": "amd64"
```

---

## 🔒 Security สำหรับ Production

### 1. เปลี่ยน Passwords

แก้ไขไฟล์ `.env`:

```env
MYSQL_ROOT_PASSWORD=<strong-password-here>
MYSQL_PASSWORD=<strong-password-here>
JWT_SECRET=<generate-with-openssl-or-random-string>
```

### 2. ใช้ HTTPS

แนะนำให้ใช้ reverse proxy เช่น:
- Nginx
- Caddy
- Traefik

### 3. Backup Database

```powershell
# Backup
docker exec thai-mooc-mysql mysqldump -u root -prootpassword thai_mooc > backup.sql

# Restore
type backup.sql | docker exec -i thai-mooc-mysql mysql -u root -prootpassword thai_mooc
```

---

## 📝 Docker Compose สำหรับ Production

สร้างไฟล์ `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    platform: linux/amd64
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_DATABASE}
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - thai-mooc-network

  webapp:
    image: lifeskill/thai-mooc-webapp:latest
    platform: linux/amd64
    restart: always
    environment:
      DATABASE_URL: mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@mysql:3306/${MYSQL_DATABASE}
      NEXT_PUBLIC_BASE_URL: ${NEXT_PUBLIC_BASE_URL}
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: production
    depends_on:
      - mysql
    networks:
      - thai-mooc-network

  # Nginx Reverse Proxy (optional)
  nginx:
    image: nginx:alpine
    platform: linux/amd64
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - webapp
    networks:
      - thai-mooc-network

networks:
  thai-mooc-network:
    driver: bridge

volumes:
  mysql_data:
    driver: local
```

รัน production:

```powershell
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🎯 Quick Start (TL;DR)

```powershell
# 1. สร้างโฟลเดอร์
mkdir thai-mooc
cd thai-mooc

# 2. สร้าง docker-compose.yml และ .env (ตามตัวอย่างข้างบน)

# 3. Pull images
docker pull lifeskill/thai-mooc-webapp:latest
docker pull mysql:8.0

# 4. Start
docker-compose up -d

# 5. เปิดเบราว์เซอร์
# http://localhost:3000
```

---

## 📞 Support

หากพบปัญหา:
1. ตรวจสอบ logs: `docker-compose logs -f`
2. ตรวจสอบ platform: `docker image inspect <image> | findstr Architecture`
3. ลบและ pull ใหม่: `docker-compose down && docker-compose pull && docker-compose up -d`

---

## ⚡ Performance Tips

1. **ใช้ WSL 2**: เร็วกว่า Hyper-V มาก
2. **SSD**: ติดตั้ง Docker บน SSD
3. **Resources**: ให้ Docker Desktop ใช้ RAM อย่างน้อย 4GB
4. **Volume**: ใช้ named volumes แทน bind mounts เพื่อ performance ที่ดีกว่า
