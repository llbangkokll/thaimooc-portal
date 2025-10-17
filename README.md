# Thai MOOC Platform

แพลตฟอร์มการเรียนรู้ออนไลน์ (MOOC - Massive Open Online Course) สำหรับประเทศไทย

## 🚀 Features

### Public Features
- 📚 **Course Catalog** - แสดงรายการคอร์สเรียนทั้งหมด
- 🏫 **Institutions** - แสดงสถาบันการศึกษาที่ร่วมมือ
- 📰 **News & Announcements** - ข่าวสารและประกาศต่างๆ
- 📞 **Contact** - ช่องทางติดต่อ

### Admin Features
- 👥 **User Management** - จัดการผู้ใช้งานระบบ (Role-based: Admin & Super Admin)
- 📖 **Course Management** - จัดการคอร์สเรียน
- 🏷️ **Category Management** - จัดการหมวดหมู่
- 👨‍🏫 **Instructor Management** - จัดการผู้สอน
- 🏛️ **Institution Management** - จัดการสถาบัน
- 📢 **News Management** - จัดการข่าวสาร
- 🎨 **Banner Management** - จัดการแบนเนอร์
- ⚙️ **Settings** - ตั้งค่าระบบ (Super Admin only)

## 🛠️ Tech Stack

- **Framework**: Next.js 15.0.0
- **Language**: TypeScript
- **Database**: MySQL with Prisma ORM
- **UI**: Tailwind CSS + Radix UI
- **Authentication**: JWT with bcryptjs
- **State Management**: React Hooks

## 📋 Prerequisites

- Node.js 18+
- MySQL 5.7+ or MySQL 8+
- npm or yarn

## 🔧 Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd thai-mooc-clean
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# แก้ไข .env ให้ตรงกับ database ของคุณ
```

4. **Set up database**
```bash
# สร้าง database
mysql -u root -p -e "CREATE DATABASE thai_mooc;"

# Sync Prisma schema
npx prisma db push

# (Optional) Seed data
npx prisma db seed
```

5. **Run development server**
```bash
npm run dev
```

เปิดเบราว์เซอร์ที่ [http://localhost:3000](http://localhost:3000)

## 📦 Build for Production

```bash
npm run build
npm start
```

## 🔐 Admin Access

### Default Admin Account
- **URL**: `/admin/login`
- **Username**: `admin`
- **Password**: (ตั้งค่าในการ setup)

### Role-Based Permissions

#### Super Admin
- เข้าถึงได้ทุกฟีเจอร์
- จัดการ Admin Users
- จัดการ Settings

#### Admin
- จัดการ Content (Courses, News, etc.)
- ไม่สามารถจัดการ Admin Users
- ไม่สามารถแก้ไข Settings

## 📁 Project Structure

```
thai-mooc-clean/
├── app/                    # Next.js App Router
│   ├── (public)/          # Public pages
│   ├── admin/             # Admin pages
│   └── api/               # API routes
├── components/            # React components
│   ├── admin/            # Admin components
│   └── ui/               # UI components
├── lib/                   # Utilities & helpers
│   ├── auth.ts           # Authentication
│   ├── prisma.ts         # Prisma client
│   └── types.ts          # TypeScript types
├── prisma/               # Database schema
│   └── schema.prisma     # Prisma schema
└── public/               # Static files
```

## 🔒 Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT authentication
- ✅ Role-based access control (RBAC)
- ✅ API route protection
- ✅ Environment variable management

## 📝 Environment Variables

```env
# Database
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"

# Next.js
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# JWT (Optional - auto-generated if not set)
JWT_SECRET="your-secret-key"
```

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License

## 👨‍💻 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Next.js Team
- Prisma Team
- Radix UI Team
- Tailwind CSS Team
