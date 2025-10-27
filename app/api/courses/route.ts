import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/mysql-direct";

interface Course {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  learningOutcomes: string | null;
  targetAudience: string | null;
  prerequisites: string | null;
  tags: string | null;
  assessmentCriteria: string | null;
  courseUrl: string | null;
  videoUrl: string | null;
  contentStructure: string | null;
  institutionId: string | null;
  instructorId: string | null;
  imageId: string | null;
  bannerImageId: string | null;
  level: string | null;
  teachingLanguage: string | null;
  durationHours: number | null;
  hasCertificate: boolean;
  enrollCount: number;
  createdAt: Date;
  updatedAt: Date;
  course_categories?: { categoryId: string }[];
  course_course_types?: { courseTypeId: string }[];
  course_instructors?: { instructorId: string }[];
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get("categoryId");
    const institutionId = searchParams.get("institutionId");
    const level = searchParams.get("level");

    // Build WHERE clause
    const whereConditions: string[] = [];
    const params: any[] = [];

    if (categoryId) {
      whereConditions.push('c.id IN (SELECT courseId FROM course_categories WHERE categoryId = ?)');
      params.push(categoryId);
    }
    if (institutionId) {
      whereConditions.push('c.institutionId = ?');
      params.push(institutionId);
    }
    if (level) {
      whereConditions.push('c.level = ?');
      params.push(level);
    }

    const whereClause = whereConditions.length > 0
      ? 'WHERE ' + whereConditions.join(' AND ')
      : '';

    // Fetch courses
    const courses = await query<Course>(
      `SELECT * FROM courses c ${whereClause} ORDER BY c.createdAt DESC`,
      params
    );

    // Fetch relations for each course
    for (const course of courses) {
      const categories = await query<{ categoryId: string }>(
        'SELECT categoryId FROM course_categories WHERE courseId = ?',
        [course.id]
      );
      (course as any).courseCategories = categories;

      const courseTypes = await query<{ courseTypeId: string }>(
        'SELECT courseTypeId FROM course_course_types WHERE courseId = ?',
        [course.id]
      );
      (course as any).courseCourseTypes = courseTypes;

      const instructors = await query<{ instructorId: string }>(
        'SELECT instructorId FROM course_instructors WHERE courseId = ?',
        [course.id]
      );
      (course as any).courseInstructors = instructors;
    }

    return NextResponse.json({
      success: true,
      data: courses,
      count: courses.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch courses",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.title || !body.titleEn || !body.description || !body.categoryIds ||
        !body.institutionId || !body.instructorId || !body.imageId || !body.level) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: title, titleEn, description, categoryIds, institutionId, instructorId, imageId, level",
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.categoryIds) || body.categoryIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "categoryIds must be a non-empty array",
        },
        { status: 400 }
      );
    }

    const { transaction } = await import("@/lib/mysql-direct");

    const courseId = `course-${Date.now()}`;
    const now = new Date();

    await transaction(async (execute) => {
      // Insert course
      await execute(
        `INSERT INTO courses (
          id, title, titleEn, description, learningOutcomes, targetAudience,
          prerequisites, tags, assessmentCriteria, courseUrl, videoUrl,
          contentStructure, institutionId, instructorId, imageId, bannerImageId,
          level, teachingLanguage, durationHours, hasCertificate, enrollCount,
          createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          courseId,
          body.title,
          body.titleEn,
          body.description,
          body.learningOutcomes || null,
          body.targetAudience || null,
          body.prerequisites || null,
          body.tags || null,
          body.assessmentCriteria || null,
          body.courseUrl || null,
          body.videoUrl || null,
          body.contentStructure || null,
          body.institutionId,
          body.instructorId,
          body.imageId,
          body.bannerImageId || null,
          body.level,
          body.teachingLanguage || null,
          body.durationHours || 0,
          body.hasCertificate || false,
          body.enrollCount || 0,
          now,
          now
        ]
      );

      // Insert course categories
      for (const categoryId of body.categoryIds) {
        await execute(
          'INSERT INTO course_categories (courseId, categoryId) VALUES (?, ?)',
          [courseId, categoryId]
        );
      }

      // Insert course types if provided
      if (body.courseTypeIds && Array.isArray(body.courseTypeIds) && body.courseTypeIds.length > 0) {
        for (const courseTypeId of body.courseTypeIds) {
          await execute(
            'INSERT INTO course_course_types (courseId, courseTypeId) VALUES (?, ?)',
            [courseId, courseTypeId]
          );
        }
      }

      // Insert course instructors
      if (body.instructorIds && Array.isArray(body.instructorIds) && body.instructorIds.length > 0) {
        for (const instructorId of body.instructorIds) {
          await execute(
            'INSERT INTO course_instructors (courseId, instructorId) VALUES (?, ?)',
            [courseId, instructorId]
          );
        }
      } else if (body.instructorId) {
        await execute(
          'INSERT INTO course_instructors (courseId, instructorId) VALUES (?, ?)',
          [courseId, body.instructorId]
        );
      }
    });

    const { queryOne } = await import("@/lib/mysql-direct");
    const newCourse = await queryOne<Course>(
      'SELECT * FROM courses WHERE id = ?',
      [courseId]
    );

    return NextResponse.json(
      {
        success: true,
        data: newCourse,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create course",
      },
      { status: 500 }
    );
  }
}
