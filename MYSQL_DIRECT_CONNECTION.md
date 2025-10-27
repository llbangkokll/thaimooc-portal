# MySQL Direct Connection Guide

คู่มือการเชื่อม MySQL โดยตรง (ไม่ผ่าน Prisma) ในโปรเจค thai-mooc-clean

---

## 📦 ไฟล์ที่สร้างขึ้น

1. **`/lib/mysql-direct.ts`** - MySQL connection helper
2. **`/lib/mysql-examples.ts`** - ตัวอย่างการใช้งานครบถ้วน
3. **`/app/api/test-mysql/route.ts`** - API ทดสอบการเชื่อมต่อ

---

## 🔧 Configuration

### ไฟล์ `.env`

```env
# Direct MySQL Connection
DB_HOST="localhost"
DB_PORT="3306"
DB_USER="root"
DB_PASSWORD="KKiabkob"
DB_NAME="thai_mooc"
```

---

## 📖 วิธีใช้งาน

### 1. Import Functions

```typescript
import { query, queryOne, execute, transaction } from '@/lib/mysql-direct';
```

### 2. SELECT ข้อมูล (หลายแถว)

```typescript
// ดึงข้อมูลทั้งหมด
const courses = await query('SELECT * FROM courses');

// ดึงข้อมูลพร้อม WHERE clause
const results = await query(
  'SELECT * FROM courses WHERE level = ?',
  ['beginner']
);

// Query แบบ JOIN
const data = await query(`
  SELECT c.*, cat.name as categoryName
  FROM courses c
  LEFT JOIN course_categories cc ON c.id = cc.courseId
  LEFT JOIN categories cat ON cc.categoryId = cat.id
`);
```

### 3. SELECT ข้อมูล (แถวเดียว)

```typescript
// ดึงข้อมูล 1 แถว
const course = await queryOne(
  'SELECT * FROM courses WHERE id = ?',
  ['course-123']
);

if (course) {
  console.log(course.title);
}

// Aggregation
const stats = await queryOne(`
  SELECT COUNT(*) as total, SUM(enrollCount) as totalEnrollments
  FROM courses
`);
```

### 4. INSERT ข้อมูล

```typescript
const result = await execute(
  `INSERT INTO courses (id, title, titleEn, description, createdAt, updatedAt)
   VALUES (?, ?, ?, ?, NOW(), NOW())`,
  ['course-123', 'หลักสูตร A', 'Course A', 'รายละเอียด...']
);

console.log('Insert ID:', result.insertId);
console.log('Affected Rows:', result.affectedRows);
```

### 5. UPDATE ข้อมูล

```typescript
const result = await execute(
  'UPDATE courses SET enrollCount = enrollCount + 1, updatedAt = NOW() WHERE id = ?',
  ['course-123']
);

console.log('Updated:', result.affectedRows > 0);
```

### 6. DELETE ข้อมูล

```typescript
const result = await execute(
  'DELETE FROM courses WHERE id = ?',
  ['course-123']
);

console.log('Deleted:', result.affectedRows > 0);
```

### 7. Transaction

```typescript
import { transaction } from '@/lib/mysql-direct';

const result = await transaction(async (connection) => {
  // ทำหลายๆ query ภายใน transaction
  await connection.execute(
    'INSERT INTO enrollments (userId, courseId) VALUES (?, ?)',
    ['user-1', 'course-1']
  );

  await connection.execute(
    'UPDATE courses SET enrollCount = enrollCount + 1 WHERE id = ?',
    ['course-1']
  );

  return { success: true };
});
```

---

## 🎯 ตัวอย่างการใช้งานจริง

### API Route Example

```typescript
// app/api/courses/popular/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql-direct';

export async function GET() {
  try {
    const popularCourses = await query(`
      SELECT
        c.id,
        c.title,
        c.enrollCount,
        GROUP_CONCAT(cat.name) as categories
      FROM courses c
      LEFT JOIN course_categories cc ON c.id = cc.courseId
      LEFT JOIN categories cat ON cc.categoryId = cat.id
      GROUP BY c.id
      ORDER BY c.enrollCount DESC
      LIMIT 10
    `);

    return NextResponse.json({
      success: true,
      data: popularCourses,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

### Server Component Example

```typescript
// app/courses/popular/page.tsx
import { query } from '@/lib/mysql-direct';

export default async function PopularCoursesPage() {
  const courses = await query(`
    SELECT * FROM courses
    ORDER BY enrollCount DESC
    LIMIT 10
  `);

  return (
    <div>
      <h1>คอร์สยอดนิยม</h1>
      {courses.map((course: any) => (
        <div key={course.id}>
          <h2>{course.title}</h2>
          <p>ผู้เรียน: {course.enrollCount} คน</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 🔍 ตัวอย่าง Query ที่เป็นประโยชน์

### 1. Search with Full-Text

```typescript
const results = await query(
  `SELECT * FROM courses
   WHERE MATCH(title, titleEn, description) AGAINST(? IN BOOLEAN MODE)
   ORDER BY enrollCount DESC`,
  [searchKeyword]
);
```

### 2. Pagination

```typescript
async function getCoursesPaginated(page: number, limit: number) {
  const offset = (page - 1) * limit;

  const [total, courses] = await Promise.all([
    queryOne<{ total: number }>('SELECT COUNT(*) as total FROM courses'),
    query('SELECT * FROM courses LIMIT ? OFFSET ?', [limit, offset]),
  ]);

  return {
    data: courses,
    total: total?.total || 0,
    page,
    totalPages: Math.ceil((total?.total || 0) / limit),
  };
}
```

### 3. Complex Aggregation

```typescript
const stats = await query(`
  SELECT
    DATE_FORMAT(createdAt, '%Y-%m') as month,
    COUNT(*) as courseCount,
    SUM(enrollCount) as totalEnrollments,
    AVG(enrollCount) as avgEnrollments
  FROM courses
  WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
  GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
  ORDER BY month DESC
`);
```

### 4. Bulk Insert

```typescript
const courses = [
  { id: '1', title: 'Course 1', description: 'Desc 1' },
  { id: '2', title: 'Course 2', description: 'Desc 2' },
];

const values = courses.map(() => '(?, ?, ?, NOW(), NOW())').join(', ');
const params = courses.flatMap(c => [c.id, c.title, c.description]);

await execute(
  `INSERT INTO courses (id, title, description, createdAt, updatedAt)
   VALUES ${values}`,
  params
);
```

---

## ⚡ Performance Tips

### 1. ใช้ Connection Pool

```typescript
import { pool } from '@/lib/mysql-direct';

// Pool จัดการ connections อัตโนมัติ
// ไม่ต้องสร้าง/ปิด connection เอง
```

### 2. Prepare Statements

```typescript
// ใช้ ? placeholders เสมอเพื่อป้องกัน SQL Injection
const results = await query(
  'SELECT * FROM courses WHERE id = ? AND level = ?',
  [courseId, level]
);
```

### 3. Select เฉพาะ Columns ที่ต้องการ

```typescript
// ดี
await query('SELECT id, title, enrollCount FROM courses');

// ไม่ดี (ถ้าไม่ต้องการทุก columns)
await query('SELECT * FROM courses');
```

### 4. ใช้ Index

```sql
-- สร้าง index สำหรับ columns ที่ใช้ค้นหาบ่อย
CREATE INDEX idx_courses_level ON courses(level);
CREATE INDEX idx_courses_enrollCount ON courses(enrollCount);
```

---

## 🔒 Security

### 1. ใช้ Parameterized Queries เสมอ

```typescript
// ✅ ดี - ป้องกัน SQL Injection
await query('SELECT * FROM courses WHERE id = ?', [userId]);

// ❌ อันตราย - เสี่ยง SQL Injection
await query(`SELECT * FROM courses WHERE id = '${userId}'`);
```

### 2. Validate Input

```typescript
function isValidId(id: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(id);
}

if (!isValidId(courseId)) {
  throw new Error('Invalid course ID');
}
```

### 3. Limit Results

```typescript
// เพิ่ม LIMIT เสมอเพื่อป้องกัน query ที่ดึงข้อมูลมากเกินไป
await query('SELECT * FROM courses LIMIT 1000');
```

---

## 🧪 Testing

### ทดสอบ API

```bash
# GET - ดึงข้อมูล
curl http://localhost:3000/api/test-mysql

# POST - เพิ่มข้อมูล
curl -X POST http://localhost:3000/api/test-mysql \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Course", "description": "Test Description"}'
```

### ทดสอบใน Code

```typescript
import { query } from '@/lib/mysql-direct';

// ทดสอบการเชื่อมต่อ
try {
  const result = await query('SELECT 1');
  console.log('✅ MySQL Connected');
} catch (error) {
  console.error('❌ MySQL Connection Failed:', error);
}
```

---

## 📊 เมื่อไหร่ควรใช้ Direct MySQL vs Prisma

### ใช้ Direct MySQL เมื่อ:

- ✅ Query ซับซ้อนที่ Prisma ทำไม่ได้ หรือทำได้ยาก
- ✅ ต้องการ Performance สูงสุด (raw SQL เร็วกว่า)
- ✅ ใช้ Database-specific features (stored procedures, full-text search, etc.)
- ✅ Bulk operations ขนาดใหญ่
- ✅ Complex aggregations และ reporting

### ใช้ Prisma เมื่อ:

- ✅ CRUD operations ทั่วไป
- ✅ ต้องการ Type Safety
- ✅ Relations และ Nested queries
- ✅ Migrations และ Schema management
- ✅ Code ที่อ่านง่าย maintainable

### ใช้ทั้งสองแบบร่วมกัน:

```typescript
import { query } from '@/lib/mysql-direct';
import { prisma } from '@/lib/prisma';

// ใช้ Prisma สำหรับ CRUD ปกติ
const course = await prisma.courses.findUnique({ where: { id } });

// ใช้ Direct MySQL สำหรับ complex query
const stats = await query(`
  SELECT complex_calculation FROM ...
`);
```

---

## 🔗 Resources

- [mysql2 Documentation](https://github.com/sidorares/node-mysql2)
- [MySQL 9.4 Reference](https://dev.mysql.com/doc/refman/9.4/en/)
- [SQL Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)

---

## 📝 สรุป

ตอนนี้โปรเจค **thai-mooc-clean** สามารถเชื่อม MySQL ได้ 2 วิธี:

1. **Prisma ORM** - สำหรับ CRUD ทั่วไป (แนะนำสำหรับส่วนใหญ่)
2. **Direct MySQL** - สำหรับ query ซับซ้อนและ performance-critical operations

เลือกใช้ตามความเหมาะสมของแต่ละกรณีค่ะ! 🚀
