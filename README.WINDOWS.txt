========================================
Thai MOOC Platform - คู่มือใช้งานบน Windows
========================================

⚠️ สำคัญ: อย่าใช้ lifeskill/thai-mooc-mysql:8.0 เพราะเป็น ARM64!
✅ ใช้ mysql:8.0 official image แทน (รองรับ Windows)

========================================
วิธีติดตั้ง (Quick Start)
========================================

1. เปิด PowerShell หรือ Command Prompt

2. สร้างโฟลเดอร์โปรเจค:
   mkdir thai-mooc
   cd thai-mooc

3. ดาวน์โหลดไฟล์จาก Docker Hub:
   - docker-compose.windows.yml
   - .env.docker

4. เปลี่ยนชื่อไฟล์:
   copy .env.docker .env
   copy docker-compose.windows.yml docker-compose.yml

5. Pull images:
   docker pull lifeskill/thai-mooc-webapp:latest
   docker pull mysql:8.0

6. ตรวจสอบว่า platform ถูกต้อง:
   docker image inspect lifeskill/thai-mooc-webapp:latest | findstr Architecture

   ** ต้องเป็น "Architecture": "amd64" **

7. เริ่มต้นใช้งาน:
   docker-compose up -d

8. ดู logs:
   docker-compose logs -f

9. เปิดเบราว์เซอร์:
   http://localhost:3000

========================================
คำสั่งที่ใช้บ่อย
========================================

หยุด services:
  docker-compose stop

เริ่ม services:
  docker-compose start

Restart:
  docker-compose restart

ดู logs:
  docker-compose logs -f webapp
  docker-compose logs -f mysql

ลบ containers:
  docker-compose down

ดูสถานะ:
  docker ps

========================================
แก้ไขปัญหา
========================================

1. ถ้า MySQL รันไม่ได้:
   - ลบ image ARM64 ที่ผิด:
     docker rmi lifeskill/thai-mooc-mysql:8.0

   - Pull MySQL official:
     docker pull --platform linux/amd64 mysql:8.0

   - Restart:
     docker-compose down
     docker-compose up -d

2. ถ้า Port ถูกใช้งานอยู่:
   - แก้ไขไฟล์ .env:
     APP_PORT=3001
     MYSQL_PORT=3308

3. ถ้า Database connection error:
   - รอให้ MySQL พร้อม (ประมาณ 30 วินาที)
   - ตรวจสอบ logs:
     docker-compose logs mysql

========================================
ตรวจสอบว่าทำงานถูกต้อง
========================================

1. ตรวจสอบ containers:
   docker ps

   ** ต้องเห็น 2 containers: thai-mooc-webapp และ thai-mooc-mysql **

2. ทดสอบ MySQL:
   docker exec -it thai-mooc-mysql mysql -u thaimooc -pthaimoocpassword thai_mooc

3. ทดสอบ webapp:
   เปิด http://localhost:3000
   ถ้าเห็นหน้าเว็บ = สำเร็จ!

========================================
เข้าใช้งาน Admin
========================================

URL: http://localhost:3000/admin/login

Default admin (ถ้ามีการ seed database):
- Username: admin
- Password: (ตามที่ตั้งค่าไว้)

========================================
Backup Database
========================================

Backup:
  docker exec thai-mooc-mysql mysqldump -u root -prootpassword thai_mooc > backup.sql

Restore:
  type backup.sql | docker exec -i thai-mooc-mysql mysql -u root -prootpassword thai_mooc

========================================
ข้อมูลเพิ่มเติม
========================================

- คู่มือฉบับเต็ม: WINDOWS_SETUP.md
- Docker Hub: https://hub.docker.com/r/lifeskill/thai-mooc-webapp
- GitHub: (ใส่ URL ของคุณ)

========================================
