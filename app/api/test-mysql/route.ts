/**
 * API ทดสอบการเชื่อมต่อ MySQL โดยตรง
 *
 * GET /api/test-mysql - ทดสอบ query ต่างๆ
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, execute } from '@/lib/mysql-direct';

export async function GET(request: NextRequest) {
  try {
    // ===================================
    // ทดสอบ 1: แสดงตารางทั้งหมด
    // ===================================
    const tables = await query('SHOW TABLES');

    // ===================================
    // ทดสอบ 2: นับข้อมูลในแต่ละตาราง
    // ===================================
    const stats = await query(`
      SELECT
        'courses' as tableName,
        COUNT(*) as count
      FROM courses
      UNION ALL
      SELECT 'categories', COUNT(*) FROM categories
      UNION ALL
      SELECT 'instructors', COUNT(*) FROM instructors
      UNION ALL
      SELECT 'institutions', COUNT(*) FROM institutions
      UNION ALL
      SELECT 'news', COUNT(*) FROM news
      UNION ALL
      SELECT 'banners', COUNT(*) FROM banners
    `);

    // ===================================
    // ทดสอบ 3: ดึงข้อมูล courses ล่าสุด 5 รายการ
    // ===================================
    const latestCourses = await query(`
      SELECT
        id,
        title,
        titleEn,
        enrollCount,
        createdAt
      FROM courses
      ORDER BY createdAt DESC
      LIMIT 5
    `);

    // ===================================
    // ทดสอบ 4: Query แบบมี JOIN
    // ===================================
    const coursesWithCategories = await query(`
      SELECT
        c.id,
        c.title,
        GROUP_CONCAT(cat.name SEPARATOR ', ') as categories
      FROM courses c
      LEFT JOIN course_categories cc ON c.id = cc.courseId
      LEFT JOIN categories cat ON cc.categoryId = cat.id
      GROUP BY c.id, c.title
      LIMIT 5
    `);

    // ===================================
    // ทดสอบ 5: Aggregation
    // ===================================
    const summary = await queryOne(`
      SELECT
        (SELECT COUNT(*) FROM courses) as totalCourses,
        (SELECT COUNT(*) FROM categories) as totalCategories,
        (SELECT COUNT(*) FROM instructors) as totalInstructors,
        (SELECT COUNT(*) FROM institutions) as totalInstitutions,
        (SELECT COUNT(*) FROM news) as totalNews,
        (SELECT SUM(enrollCount) FROM courses) as totalEnrollments
    `);

    // ===================================
    // ทดสอบ 6: Database version และ status
    // ===================================
    const version = await queryOne('SELECT VERSION() as version');
    const status = await query('SHOW STATUS LIKE "Threads_connected"');

    return NextResponse.json({
      success: true,
      message: 'เชื่อมต่อ MySQL โดยตรงสำเร็จ!',
      data: {
        databaseInfo: {
          version: version,
          status: status,
        },
        tables: tables,
        statistics: stats,
        summary: summary,
        latestCourses: latestCourses,
        coursesWithCategories: coursesWithCategories,
      },
    });
  } catch (error: any) {
    console.error('MySQL Test Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
      },
      { status: 500 }
    );
  }
}

// ===================================
// POST: ทดสอบ INSERT ข้อมูล
// ===================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // ตัวอย่าง: Insert test data
    const result = await execute(
      `INSERT INTO courses
       (id, title, titleEn, description, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [
        `test_${Date.now()}`,
        body.title || 'Test Course',
        body.titleEn || 'Test Course EN',
        body.description || 'This is a test course',
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'เพิ่มข้อมูลสำเร็จ',
      data: {
        insertId: result.insertId,
        affectedRows: result.affectedRows,
      },
    });
  } catch (error: any) {
    console.error('MySQL Insert Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
