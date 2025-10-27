import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/mysql-direct";
import { apiCache } from "@/lib/api-cache";

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
  courseCategories?: { categoryId: string }[];
  courseCourseTypes?: { courseTypeId: string }[];
  courseInstructors?: { instructorId: string }[];
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get("categoryId");
    const institutionId = searchParams.get("institutionId");
    const level = searchParams.get("level");

    // Create cache key
    const cacheKey = `courses:${categoryId || 'all'}:${institutionId || 'all'}:${level || 'all'}`;

    // Check cache first
    const cachedData = apiCache.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

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

    // Fetch courses - OPTIMIZED: Single query
    const courses = await query<Course>(
      `SELECT * FROM courses c ${whereClause} ORDER BY c.createdAt DESC`,
      params
    );

    if (courses.length === 0) {
      const response = {
        success: true,
        data: [],
        count: 0,
      };
      apiCache.set(cacheKey, response);
      return NextResponse.json(response);
    }

    // Get all course IDs
    const courseIds = courses.map(c => c.id);
    const placeholders = courseIds.map(() => '?').join(',');

    // OPTIMIZED: Fetch all relations in 3 queries instead of N queries
    const [allCategories, allCourseTypes, allInstructors] = await Promise.all([
      query<{ courseId: string; categoryId: string }>(
        `SELECT courseId, categoryId FROM course_categories WHERE courseId IN (${placeholders})`,
        courseIds
      ),
      query<{ courseId: string; courseTypeId: string }>(
        `SELECT courseId, courseTypeId FROM course_course_types WHERE courseId IN (${placeholders})`,
        courseIds
      ),
      query<{ courseId: string; instructorId: string }>(
        `SELECT courseId, instructorId FROM course_instructors WHERE courseId IN (${placeholders})`,
        courseIds
      ),
    ]);

    // Group relations by courseId
    const categoriesMap = new Map<string, { categoryId: string }[]>();
    const courseTypesMap = new Map<string, { courseTypeId: string }[]>();
    const instructorsMap = new Map<string, { instructorId: string }[]>();

    allCategories.forEach(item => {
      if (!categoriesMap.has(item.courseId)) {
        categoriesMap.set(item.courseId, []);
      }
      categoriesMap.get(item.courseId)!.push({ categoryId: item.categoryId });
    });

    allCourseTypes.forEach(item => {
      if (!courseTypesMap.has(item.courseId)) {
        courseTypesMap.set(item.courseId, []);
      }
      courseTypesMap.get(item.courseId)!.push({ courseTypeId: item.courseTypeId });
    });

    allInstructors.forEach(item => {
      if (!instructorsMap.has(item.courseId)) {
        instructorsMap.set(item.courseId, []);
      }
      instructorsMap.get(item.courseId)!.push({ instructorId: item.instructorId });
    });

    // Attach relations to courses
    for (const course of courses) {
      (course as any).courseCategories = categoriesMap.get(course.id) || [];
      (course as any).courseCourseTypes = courseTypesMap.get(course.id) || [];
      (course as any).courseInstructors = instructorsMap.get(course.id) || [];
    }

    const response = {
      success: true,
      data: courses,
      count: courses.length,
    };

    // Cache the response
    apiCache.set(cacheKey, response);

    return NextResponse.json(response);
  } catch (error) {
    console.error('API Error:', error);
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

    const courseId = `course-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
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

    // Clear cache when new course is added
    apiCache.clearPattern('courses:*');

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
    console.error('API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create course",
      },
      { status: 500 }
    );
  }
}
