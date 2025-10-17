import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const courseType = await prisma.course_types.findUnique({
      where: { id },
    });

    if (!courseType) {
      return NextResponse.json(
        {
          success: false,
          error: "Course type not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: courseType,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch course type",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updatedCourseType = await prisma.course_types.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.nameEn && { nameEn: body.nameEn }),
        ...(body.icon !== undefined && { icon: body.icon }),
        ...(body.description !== undefined && { description: body.description }),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedCourseType,
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        {
          success: false,
          error: "Course type not found",
        },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update course type",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.course_types.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Course type deleted successfully",
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        {
          success: false,
          error: "Course type not found",
        },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete course type",
      },
      { status: 500 }
    );
  }
}
