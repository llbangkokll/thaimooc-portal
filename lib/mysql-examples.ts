/**
 * ตัวอย่างการใช้งาน MySQL โดยตรง (ไม่ผ่าน Prisma)
 */

import { query, queryOne, execute, transaction } from './mysql-direct';

// ===================================
// ตัวอย่างที่ 1: SELECT ข้อมูล
// ===================================

interface Course {
  id: string;
  title: string;
  titleEn: string;
  enrollCount: number;
}

export async function getAllCourses(): Promise<Course[]> {
  const sql = 'SELECT * FROM courses ORDER BY createdAt DESC';
  return await query<Course>(sql);
}

export async function getCourseById(id: string): Promise<Course | null> {
  const sql = 'SELECT * FROM courses WHERE id = ?';
  return await queryOne<Course>(sql, [id]);
}

// ===================================
// ตัวอย่างที่ 2: INSERT ข้อมูล
// ===================================

export async function createCourse(data: {
  id: string;
  title: string;
  titleEn: string;
  description: string;
}) {
  const sql = `
    INSERT INTO courses (id, title, titleEn, description, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, NOW(), NOW())
  `;

  const result = await execute(sql, [
    data.id,
    data.title,
    data.titleEn,
    data.description,
  ]);

  return {
    insertId: result.insertId,
    affectedRows: result.affectedRows,
  };
}

// ===================================
// ตัวอย่างที่ 3: UPDATE ข้อมูล
// ===================================

export async function updateCourse(
  id: string,
  data: { title?: string; description?: string }
) {
  const updates: string[] = [];
  const values: any[] = [];

  if (data.title) {
    updates.push('title = ?');
    values.push(data.title);
  }

  if (data.description) {
    updates.push('description = ?');
    values.push(data.description);
  }

  updates.push('updatedAt = NOW()');
  values.push(id);

  const sql = `UPDATE courses SET ${updates.join(', ')} WHERE id = ?`;

  const result = await execute(sql, values);
  return result.affectedRows > 0;
}

// ===================================
// ตัวอย่างที่ 4: DELETE ข้อมูล
// ===================================

export async function deleteCourse(id: string) {
  const sql = 'DELETE FROM courses WHERE id = ?';
  const result = await execute(sql, [id]);
  return result.affectedRows > 0;
}

// ===================================
// ตัวอย่างที่ 5: JOIN Query
// ===================================

export async function getCoursesWithCategories() {
  const sql = `
    SELECT
      c.id,
      c.title,
      c.titleEn,
      c.enrollCount,
      GROUP_CONCAT(cat.name) as categories
    FROM courses c
    LEFT JOIN course_categories cc ON c.id = cc.courseId
    LEFT JOIN categories cat ON cc.categoryId = cat.id
    GROUP BY c.id, c.title, c.titleEn, c.enrollCount
    ORDER BY c.enrollCount DESC
    LIMIT 10
  `;

  return await query(sql);
}

// ===================================
// ตัวอย่างที่ 6: Complex Query with Parameters
// ===================================

export async function searchCourses(keyword: string, categoryId?: string) {
  let sql = `
    SELECT DISTINCT c.*
    FROM courses c
    LEFT JOIN course_categories cc ON c.id = cc.courseId
    WHERE (c.title LIKE ? OR c.titleEn LIKE ? OR c.description LIKE ?)
  `;

  const params: any[] = [
    `%${keyword}%`,
    `%${keyword}%`,
    `%${keyword}%`,
  ];

  if (categoryId) {
    sql += ' AND cc.categoryId = ?';
    params.push(categoryId);
  }

  sql += ' ORDER BY c.enrollCount DESC';

  return await query(sql, params);
}

// ===================================
// ตัวอย่างที่ 7: Aggregation Query
// ===================================

export async function getStatistics() {
  const sql = `
    SELECT
      (SELECT COUNT(*) FROM courses) as totalCourses,
      (SELECT COUNT(*) FROM categories) as totalCategories,
      (SELECT COUNT(*) FROM instructors) as totalInstructors,
      (SELECT COUNT(*) FROM institutions) as totalInstitutions,
      (SELECT SUM(enrollCount) FROM courses) as totalEnrollments
  `;

  return await queryOne(sql);
}

// ===================================
// ตัวอย่างที่ 8: Transaction
// ===================================

export async function enrollUserInCourse(userId: string, courseId: string) {
  return await transaction(async (connection) => {
    // 1. บันทึกการลงทะเบียน
    await connection(
      'INSERT INTO enrollments (userId, courseId, createdAt) VALUES (?, ?, NOW())',
      [userId, courseId]
    );

    // 2. เพิ่มจำนวนคนลงทะเบียน
    await connection(
      'UPDATE courses SET enrollCount = enrollCount + 1 WHERE id = ?',
      [courseId]
    );

    return { success: true };
  });
}

// ===================================
// ตัวอย่างที่ 9: Raw Query with Custom Logic
// ===================================

export async function getPopularCoursesByMonth() {
  const sql = `
    SELECT
      DATE_FORMAT(createdAt, '%Y-%m') as month,
      COUNT(*) as courseCount,
      SUM(enrollCount) as totalEnrollments
    FROM courses
    WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
    GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
    ORDER BY month DESC
  `;

  return await query(sql);
}

// ===================================
// ตัวอย่างที่ 10: Pagination
// ===================================

export async function getCoursesPaginated(page: number = 1, limit: number = 10) {
  const offset = (page - 1) * limit;

  const countSql = 'SELECT COUNT(*) as total FROM courses';
  const dataSql = `
    SELECT * FROM courses
    ORDER BY createdAt DESC
    LIMIT ? OFFSET ?
  `;

  const [countResult, courses] = await Promise.all([
    queryOne<{ total: number }>(countSql),
    query(dataSql, [limit, offset]),
  ]);

  return {
    data: courses,
    total: countResult?.total || 0,
    page,
    limit,
    totalPages: Math.ceil((countResult?.total || 0) / limit),
  };
}

// ===================================
// ตัวอย่างที่ 11: Bulk Insert
// ===================================

export async function bulkInsertCourses(courses: any[]) {
  if (courses.length === 0) return;

  const values = courses
    .map(
      () => '(?, ?, ?, ?, NOW(), NOW())'
    )
    .join(', ');

  const sql = `
    INSERT INTO courses (id, title, titleEn, description, createdAt, updatedAt)
    VALUES ${values}
  `;

  const params = courses.flatMap((c) => [
    c.id,
    c.title,
    c.titleEn,
    c.description,
  ]);

  return await execute(sql, params);
}

// ===================================
// ตัวอย่างที่ 12: Stored Procedure (ถ้ามี)
// ===================================

export async function callStoredProcedure(procedureName: string, params: any[]) {
  const placeholders = params.map(() => '?').join(', ');
  const sql = `CALL ${procedureName}(${placeholders})`;
  return await query(sql, params);
}
