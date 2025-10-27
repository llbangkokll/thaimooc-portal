# 🧪 คู่มือการใช้ Test Server

ไฟล์สำหรับทดสอบว่า Node.js บน server ทำงานได้หรือไม่

---

## 📦 ไฟล์ที่ใช้

**ไฟล์:** `test-server.js`
- **ขนาด:** ~6 KB
- **Dependencies:** ไม่มี (ใช้ built-in Node.js modules เท่านั้น)
- **Port:** 3000 (หรือตาม environment variable PORT)

---

## 🚀 วิธีการใช้งาน

### ขั้นตอนที่ 1: Upload ไฟล์ไปยัง Server

**ผ่าน SFTP:**
```bash
# จากเครื่อง local
scp test-server.js user@your-server:/home/user/htdocs/yourdomain.com/
```

**หรือ Upload ผ่าน CloudPanel File Manager**

---

### ขั้นตอนที่ 2: เข้า SSH และทดสอบ

```bash
# SSH เข้า server
ssh user@your-server

# เข้าไปยังโฟลเดอร์
cd ~/htdocs/yourdomain.com

# รัน test server
node test-server.js
```

**ถ้าเห็นข้อความนี้ = สำเร็จ:**
```
========================================
🚀 Node.js Test Server Started!
========================================
✅ Server running at http://0.0.0.0:3000/
📅 Started at: 21/10/2025 08:00:00
🖥️  Node.js: v18.x.x
💻 Platform: linux

Available Routes:
  • http://localhost:3000/       - Home page
  • http://localhost:3000/api    - API test
  • http://localhost:3000/test   - Route test

To stop: Press Ctrl+C or run "pm2 delete test-server"
========================================
```

---

### ขั้นตอนที่ 3: ทดสอบจาก Browser

เปิด browser ไปที่:
```
https://yourdomain.com
```

**ควรเห็น:**
- ✅ หน้าเว็บสวยงามพร้อม checkmark สีเขียว
- ✅ ข้อมูล Node.js version
- ✅ Server time
- ✅ Memory usage

---

### ขั้นตอนที่ 4: ทดสอบ API

เปิด browser ไปที่:
```
https://yourdomain.com/api
```

**ควรได้ JSON response:**
```json
{
  "success": true,
  "message": "API ทำงานได้",
  "timestamp": "2025-10-21T01:00:00.000Z",
  "nodeVersion": "v18.x.x",
  "platform": "linux",
  "uptime": 10,
  "memory": {
    "used": "25 MB",
    "total": "50 MB"
  }
}
```

---

## 🔧 วิธีรันด้วย PM2

### เริ่มต้น Test Server

```bash
# Start with PM2
pm2 start test-server.js --name test-server

# ดูสถานะ
pm2 status

# ดู logs
pm2 logs test-server
```

### หยุด Test Server

```bash
# หยุดและลบ
pm2 delete test-server

# หรือแค่หยุด
pm2 stop test-server
```

---

## 📋 การทดสอบแบบละเอียด

### ทดสอบจาก Command Line

```bash
# ทดสอบ homepage
curl http://localhost:3000

# ทดสอบ API
curl http://localhost:3000/api

# ทดสอบ route อื่น
curl http://localhost:3000/test
```

### ทดสอบจาก External

```bash
# ทดสอบจากเครื่อง local
curl https://yourdomain.com
curl https://yourdomain.com/api
```

---

## ✅ ผลลัพธ์ที่คาดหวัง

### สถานการณ์ที่ 1: สำเร็จ ✅

**เห็น:**
- ✅ หน้าเว็บโหลดได้
- ✅ แสดง Node.js version
- ✅ API ตอบกลับ JSON

**ความหมาย:**
- ✅ Node.js ทำงานได้ปกติ
- ✅ Server configuration ถูกต้อง
- ✅ Nginx reverse proxy ทำงาน
- ✅ **พร้อม deploy Thai MOOC แล้ว!**

---

### สถานการณ์ที่ 2: ไม่สำเร็จ ❌

#### ปัญหา A: 502 Bad Gateway

**สาเหตุ:**
- App ไม่ได้รัน
- Port ไม่ตรงกัน

**แก้ไข:**
```bash
# ตรวจสอบ PM2
pm2 status

# Restart
pm2 restart test-server

# ดู logs
pm2 logs test-server
```

#### ปัญหา B: Connection Refused

**สาเหตุ:**
- Firewall block
- App ไม่ได้รัน

**แก้ไข:**
```bash
# ตรวจสอบว่า app รันหรือไม่
lsof -i :3000

# Start app
pm2 start test-server.js --name test-server
```

#### ปัญหา C: Port Already in Use

**Error:**
```
Port 3000 is already in use!
```

**แก้ไข:**
```bash
# หา process ที่ใช้ port 3000
lsof -i :3000

# Kill process
kill -9 PID

# หรือ kill ทุก node process
pkill -f node

# Start ใหม่
pm2 start test-server.js --name test-server
```

---

## 🎯 เมื่อ Test สำเร็จแล้ว

### ขั้นตอนต่อไป:

1. **หยุด Test Server:**
   ```bash
   pm2 delete test-server
   ```

2. **Upload Thai MOOC Package:**
   ```bash
   scp thai-mooc-standalone-*.tar.gz user@server:~/htdocs/yourdomain.com/
   ```

3. **Extract และ Deploy:**
   ```bash
   cd ~/htdocs/yourdomain.com
   rm test-server.js  # ลบ test file
   tar -xzf thai-mooc-standalone-*.tar.gz --strip-components=1
   ```

4. **Setup และ Start:**
   ```bash
   cp .env.example .env
   nano .env  # แก้ไข credentials
   mysql -u user -p database < database-schema.sql
   pm2 start server.js --name thai-mooc
   pm2 save
   ```

5. **เปิดเว็บ:**
   ```
   https://yourdomain.com
   ```

---

## 📊 ข้อมูลที่ Test Server แสดง

| ข้อมูล | คำอธิบาย |
|--------|----------|
| Node.js Version | เวอร์ชัน Node.js ที่ติดตั้ง (ควรเป็น 18.x+) |
| Platform | ระบบปฏิบัติการ (linux/darwin/win32) |
| Server Time | เวลาปัจจุบันของ server |
| Memory Usage | RAM ที่ใช้โดย Node.js process |
| URL Path | URL ที่กำลังเข้าถึง |
| Server Port | Port ที่ server กำลังรัน (ควรเป็น 3000) |

---

## 💡 Tips

### ทดสอบหลาย ๆ Port

```bash
# ทดสอบ port 3001
PORT=3001 node test-server.js

# ทดสอบ port 8080
PORT=8080 node test-server.js
```

### ทดสอบ Performance

```bash
# ใช้ Apache Bench
ab -n 1000 -c 10 http://localhost:3000/

# ใช้ curl loop
for i in {1..10}; do curl http://localhost:3000/ && echo "Request $i"; done
```

### Debug Mode

เพิ่ม console.log ใน test-server.js:

```javascript
server.on('request', (req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
});
```

---

## 🆘 ต้องการความช่วยเหลือ?

**ถ้า Test Server ไม่ทำงาน:**

1. **ตรวจสอบ Node.js version:**
   ```bash
   node --version
   # ควรเป็น v18.x.x หรือสูงกว่า
   ```

2. **ตรวจสอบ permissions:**
   ```bash
   chmod +x test-server.js
   ls -la test-server.js
   ```

3. **รัน Manual (ไม่ผ่าน PM2):**
   ```bash
   node test-server.js
   # ดู error ที่แสดง
   ```

4. **ตรวจสอบ Nginx:**
   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   ```

---

## ✨ สรุป

**ไฟล์ test-server.js ช่วยให้คุณ:**
- ✅ ทดสอบว่า Node.js ทำงานได้
- ✅ ทดสอบว่า Nginx reverse proxy ถูกต้อง
- ✅ ทดสอบว่า SSL/HTTPS ทำงาน
- ✅ ทดสอบว่า Port configuration ถูกต้อง
- ✅ **มั่นใจก่อน deploy Thai MOOC จริง!**

---

**หากทดสอบสำเร็จ = พร้อม deploy Thai MOOC แล้ว! 🎉**
