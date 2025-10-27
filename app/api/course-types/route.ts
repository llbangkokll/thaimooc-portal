import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/mysql-direct";
import { apiCache } from "@/lib/api-cache";

const CACHE_KEY = 'course-types:all';

export async function GET() {
  try {
    // Check cache first
    const cachedData = apiCache.get(CACHE_KEY);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    const courseTypes = await query(
      'SELECT * FROM course_types ORDER BY createdAt DESC'
    );

    const response = {
      success: true,
      data: courseTypes,
      count: courseTypes.length,
    };

    // Cache for 5 minutes (course types don't change often)
    apiCache.set(CACHE_KEY, response, 5 * 60 * 1000);

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch course types",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.nameEn) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: name, nameEn",
        },
        { status: 400 }
      );
    }

    const id = `ctype-${Date.now()}`;
    const now = new Date();

    await execute(
      `INSERT INTO course_types (id, name, nameEn, icon, description, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, body.name, body.nameEn, body.icon || null, body.description || null, now, now]
    );

    const newCourseType = await query(
      'SELECT * FROM course_types WHERE id = ?',
      [id]
    );

    // Clear cache when new course type is added
    apiCache.delete(CACHE_KEY);

    return NextResponse.json(
      {
        success: true,
        data: newCourseType[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating course type:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create course type",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
