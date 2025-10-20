# Thai MOOC Platform - Docker Deployment Guide

## 📦 Docker Images บน Docker Hub

โปรเจคนี้ถูก push ขึ้น Docker Hub แล้ว:

- **Webapp**: `lifeskill/thai-mooc-webapp:latest` (รองรับ linux/amd64 และ linux/arm64)
- **MySQL Database**: `mysql:8.0` (ใช้ official image - รองรับทั้ง Windows และ Mac)

⚠️ **สำคัญ**: อย่าใช้ `lifeskill/thai-mooc-mysql:8.0` เพราะเป็น ARM64 เท่านั้น!

### 🪟 สำหรับผู้ใช้ Windows

ดูคู่มือเฉพาะ Windows ได้ที่: [WINDOWS_SETUP.md](WINDOWS_SETUP.md) หรือ [README.WINDOWS.txt](README.WINDOWS.txt)

## 🚀 วิธีการ Deploy

### ตัวเลือก 1: ใช้ Docker Compose (แนะนำ)

#### 1.1 สร้างไฟล์ `.env`

```bash
# คัดลอกจาก .env.docker
cp .env.docker .env

# แก้ไขค่าต่างๆ ตามความต้องการ
nano .env
```

#### 1.2 เริ่มต้น Services

```bash
# Pull และ start services
docker-compose up -d

# ดู logs
docker-compose logs -f

# ตรวจสอบสถานะ
docker-compose ps
```

#### 1.3 เข้าถึง Application

- **Website**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin/login
- **MySQL**: localhost:3307

### ตัวเลือก 2: ใช้ Docker Commands โดยตรง

#### 2.1 สร้าง Network

```bash
docker network create thai-mooc-network
```

#### 2.2 เริ่มต้น MySQL

```bash
docker run -d \
  --name thai-mooc-mysql \
  --network thai-mooc-network \
  -e MYSQL_ROOT_PASSWORD=rootpassword \
  -e MYSQL_DATABASE=thai_mooc \
  -e MYSQL_USER=thaimooc \
  -e MYSQL_PASSWORD=thaimoocpassword \
  -p 3307:3306 \
  -v mysql_data:/var/lib/mysql \
  lifeskill/thai-mooc-mysql:8.0
```

#### 2.3 เริ่มต้น Webapp

```bash
docker run -d \
  --name thai-mooc-webapp \
  --network thai-mooc-network \
  -e DATABASE_URL="mysql://thaimooc:thaimoocpassword@thai-mooc-mysql:3306/thai_mooc" \
  -e NEXT_PUBLIC_BASE_URL="http://localhost:3000" \
  -e JWT_SECRET="your-secret-key-change-in-production" \
  -p 3000:3000 \
  lifeskill/thai-mooc-webapp:latest
```

### ตัวเลือก 3: Deploy บน Server อื่น

#### 3.1 Pull Images จาก Docker Hub

```bash
# Pull webapp image
docker pull lifeskill/thai-mooc-webapp:latest

# Pull MySQL image (optional - ใช้ official ได้)
docker pull mysql:8.0
```

#### 3.2 ใช้ docker-compose.yml

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_DATABASE}
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
    ports:
      - "3307:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  webapp:
    image: lifeskill/thai-mooc-webapp:latest
    restart: always
    environment:
      DATABASE_URL: mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@mysql:3306/${MYSQL_DATABASE}
      NEXT_PUBLIC_BASE_URL: ${NEXT_PUBLIC_BASE_URL}
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "3000:3000"
    depends_on:
      - mysql

volumes:
  mysql_data:
```

## ⚙️ การตั้งค่า Environment Variables

### ค่าพื้นฐาน (จำเป็น)

```env
# Database
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=thai_mooc
MYSQL_USER=thaimooc
MYSQL_PASSWORD=thaimoocpassword
MYSQL_PORT=3307

# Application
APP_PORT=3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Security (เปลี่ยนในการใช้งานจริง!)
JWT_SECRET=your-very-long-random-secret-key-here
```

### ค่าสำหรับ Production

```env
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
JWT_SECRET=$(openssl rand -base64 32)
```

## 🔧 คำสั่งที่มีประโยชน์

### ดู Logs

```bash
# Logs ทั้งหมด
docker-compose logs -f

# Logs เฉพาะ webapp
docker-compose logs -f webapp

# Logs เฉพาะ database
docker-compose logs -f mysql
```

### Restart Services

```bash
# Restart ทั้งหมด
docker-compose restart

# Restart เฉพาะ webapp
docker-compose restart webapp
```

### Stop/Start Services

```bash
# Stop
docker-compose stop

# Start
docker-compose start

# Stop และลบ containers
docker-compose down

# Stop และลบทั้ง volumes (ระวัง! จะลบข้อมูลในฐานข้อมูล)
docker-compose down -v
```

### เข้าไปใน Container

```bash
# เข้าไปใน webapp container
docker exec -it thai-mooc-webapp sh

# เข้าไปใน MySQL container
docker exec -it thai-mooc-mysql bash

# เชื่อมต่อ MySQL
docker exec -it thai-mooc-mysql mysql -u thaimooc -p thai_mooc
```

### ดู Resource Usage

```bash
docker stats
```

## 🗄️ Database Management

### Backup Database

```bash
# Backup database ไปยังไฟล์
docker exec thai-mooc-mysql mysqldump -u root -prootpassword thai_mooc > backup.sql

# หรือใช้ docker-compose
docker-compose exec mysql mysqldump -u root -prootpassword thai_mooc > backup.sql
```

### Restore Database

```bash
# Restore จากไฟล์ backup
docker exec -i thai-mooc-mysql mysql -u root -prootpassword thai_mooc < backup.sql

# หรือใช้ docker-compose
docker-compose exec -T mysql mysql -u root -prootpassword thai_mooc < backup.sql
```

### Run Migrations และ Seed

```bash
# เข้าไปใน webapp container
docker exec -it thai-mooc-webapp sh

# Run Prisma migrations
npx prisma db push

# Seed database
npx prisma db seed
```

## 🔒 Security Best Practices

### 1. เปลี่ยน Passwords และ Secrets

```bash
# Generate strong JWT secret
openssl rand -base64 32

# Generate strong MySQL password
openssl rand -base64 16
```

### 2. ใช้ HTTPS ใน Production

แนะนำให้ใช้ reverse proxy เช่น:
- Nginx
- Traefik
- Caddy

### 3. Firewall Rules

```bash
# อนุญาตเฉพาะ ports ที่จำเป็น
# Port 3000 (webapp) - เฉพาะจาก reverse proxy
# Port 3307 (MySQL) - เฉพาะจาก localhost หรือ trusted networks
```

## 📊 Monitoring

### Health Checks

```bash
# Check webapp health
curl http://localhost:3000/api/health

# Check MySQL connection
docker exec thai-mooc-mysql mysqladmin ping -h localhost -u root -prootpassword
```

### Resource Monitoring

```bash
# Real-time stats
docker stats

# Container inspection
docker inspect thai-mooc-webapp
docker inspect thai-mooc-mysql
```

## 🐛 Troubleshooting

### Container ไม่ start

```bash
# ดู logs
docker-compose logs webapp
docker-compose logs mysql

# ตรวจสอบ configuration
docker-compose config
```

### Database Connection Error

1. ตรวจสอบว่า MySQL container รันอยู่
2. ตรวจสอบ DATABASE_URL
3. ตรวจสอบว่า MySQL พร้อมรับ connection

```bash
# Wait for MySQL to be ready
docker-compose exec mysql mysqladmin ping -h localhost -u root -prootpassword
```

### Port Already in Use

```bash
# เปลี่ยน port ใน docker-compose.yml หรือ .env
APP_PORT=3001
MYSQL_PORT=3308
```

## 📝 Update และ Rebuild

### Pull Latest Images

```bash
# Pull latest images จาก Docker Hub
docker-compose pull

# Restart services
docker-compose up -d
```

### Build ใหม่จาก Source Code

```bash
# Build local image
docker build -t lifeskill/thai-mooc-webapp:latest .

# Restart services
docker-compose up -d --build
```

## 🔗 Links

- **Docker Hub Webapp**: https://hub.docker.com/r/lifeskill/thai-mooc-webapp
- **Docker Hub MySQL**: https://hub.docker.com/r/lifeskill/thai-mooc-mysql
- **GitHub Repository**: [Your GitHub URL]

## 📞 Support

หากพบปัญหาหรือมีคำถาม:
1. ตรวจสอบ logs ด้วย `docker-compose logs -f`
2. ดู troubleshooting section ด้านบน
3. เปิด issue บน GitHub repository
