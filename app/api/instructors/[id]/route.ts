import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const instructor = await prisma.instructors.findUnique({
      where: { id },
    });

    if (!instructor) {
      return NextResponse.json(
        {
          success: false,
          error: "Instructor not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: instructor,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch instructor",
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

    const updatedInstructor = await prisma.instructors.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.nameEn && { nameEn: body.nameEn }),
        ...(body.title && { title: body.title }),
        ...(body.institutionId && { institutionId: body.institutionId }),
        ...(body.bio !== undefined && { bio: body.bio }),
        ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
        ...(body.email !== undefined && { email: body.email }),
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedInstructor,
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        {
          success: false,
          error: "Instructor not found",
        },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update instructor",
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

    // Check if instructor has any courses
    const coursesCount = await prisma.courses.count({
      where: { instructorId: id },
    });

    if (coursesCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `ไม่สามารถลบอาจารย์ได้ เนื่องจากมีรายวิชาที่สอนอยู่ ${coursesCount} รายวิชา`,
        },
        { status: 400 }
      );
    }

    await prisma.instructors.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Instructor deleted successfully",
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        {
          success: false,
          error: "Instructor not found",
        },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete instructor",
      },
      { status: 500 }
    );
  }
}
