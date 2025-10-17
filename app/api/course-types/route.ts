import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const courseTypes = await prisma.course_types.findMany({
      orderBy: { createdAt: 'desc' },
    });

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

    const newCourseType = await prisma.course_types.create({
      data: {
        name: body.name,
        nameEn: body.nameEn,
        icon: body.icon || null,
        description: body.description || null,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: newCourseType,
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
