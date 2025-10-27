import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/mysql-direct";

export async function GET() {
  try {
    const courseTypes = await query(
      'SELECT * FROM course_types ORDER BY createdAt DESC'
    );

    return NextResponse.json({
      success: true,
      data: courseTypes,
      count: courseTypes.length,
    });
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
