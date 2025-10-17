import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const institution = await prisma.institutions.findUnique({
      where: { id },
    });

    if (!institution) {
      return NextResponse.json(
        {
          success: false,
          error: "Institution not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: institution,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch institution",
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

    const updatedInstitution = await prisma.institutions.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.nameEn && { nameEn: body.nameEn }),
        ...(body.abbreviation && { abbreviation: body.abbreviation }),
        ...(body.logoUrl && { logoUrl: body.logoUrl }),
        ...(body.website !== undefined && { website: body.website }),
        ...(body.description !== undefined && { description: body.description }),
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedInstitution,
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        {
          success: false,
          error: "Institution not found",
        },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update institution",
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

    // Check if institution has any courses
    const coursesCount = await prisma.courses.count({
      where: { institutionId: id },
    });

    if (coursesCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `ไม่สามารถลบสถาบันได้ เนื่องจากมีรายวิชาที่สังกัดสถาบันนี้อยู่ ${coursesCount} รายวิชา`,
        },
        { status: 400 }
      );
    }

    // Check if institution has any instructors
    const instructorsCount = await prisma.instructors.count({
      where: { institutionId: id },
    });

    if (instructorsCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `ไม่สามารถลบสถาบันได้ เนื่องจากมีอาจารย์ที่สังกัดสถาบันนี้อยู่ ${instructorsCount} คน`,
        },
        { status: 400 }
      );
    }

    await prisma.institutions.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Institution deleted successfully",
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        {
          success: false,
          error: "Institution not found",
        },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete institution",
      },
      { status: 500 }
    );
  }
}
