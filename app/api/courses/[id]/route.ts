import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const course = await prisma.courses.findUnique({
      where: { id },
      include: {
        course_instructors: true,
        course_categories: true,
        course_course_types: true,
      },
    });

    if (!course) {
      return NextResponse.json(
        {
          success: false,
          error: "Course not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: course,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch course",
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

    // Handle category and course type updates
    const updateData: any = {
      ...(body.title && { title: body.title }),
      ...(body.titleEn && { titleEn: body.titleEn }),
      ...(body.description && { description: body.description }),
      ...(body.learningOutcomes !== undefined && { learningOutcomes: body.learningOutcomes }),
      ...(body.targetAudience !== undefined && { targetAudience: body.targetAudience }),
      ...(body.prerequisites !== undefined && { prerequisites: body.prerequisites }),
      ...(body.tags !== undefined && { tags: body.tags }),
      ...(body.assessmentCriteria !== undefined && { assessmentCriteria: body.assessmentCriteria }),
      ...(body.courseUrl !== undefined && { courseUrl: body.courseUrl }),
      ...(body.videoUrl !== undefined && { videoUrl: body.videoUrl }),
      ...(body.contentStructure !== undefined && { contentStructure: body.contentStructure }),
      ...(body.institutionId && { institutionId: body.institutionId }),
      ...(body.instructorId && { instructorId: body.instructorId }),
      ...(body.imageId && { imageId: body.imageId }),
      ...(body.bannerImageId !== undefined && { bannerImageId: body.bannerImageId }),
      ...(body.level && { level: body.level }),
      ...(body.teachingLanguage !== undefined && { teachingLanguage: body.teachingLanguage }),
      ...(body.durationHours !== undefined && { durationHours: body.durationHours }),
      ...(body.hasCertificate !== undefined && { hasCertificate: body.hasCertificate }),
      ...(body.enrollCount !== undefined && { enrollCount: body.enrollCount }),
    };

    if (body.categoryIds && Array.isArray(body.categoryIds)) {
      updateData.courseCategories = {
        deleteMany: {},
        create: body.categoryIds.map((categoryId: string) => ({
          categoryId,
        })),
      };
    }

    if (body.courseTypeIds && Array.isArray(body.courseTypeIds)) {
      updateData.courseCourseTypes = {
        deleteMany: {},
        create: body.courseTypeIds.map((courseTypeId: string) => ({
          courseTypeId,
        })),
      };
    }

    // Handle instructor IDs - support array of instructors
    if (body.instructorIds && Array.isArray(body.instructorIds)) {
      updateData.courseInstructors = {
        deleteMany: {},
        create: body.instructorIds.map((instructorId: string) => ({
          instructorId,
        })),
      };
    } else if (body.instructorId) {
      // Fallback: single instructor - also add to courseInstructors table
      updateData.courseInstructors = {
        deleteMany: {},
        create: [{ instructorId: body.instructorId }],
      };
    }

    const updatedCourse = await prisma.courses.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: updatedCourse,
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        {
          success: false,
          error: "Course not found",
        },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update course",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Handle category and course type updates
    const updateData: any = {
      ...(body.title && { title: body.title }),
      ...(body.titleEn && { titleEn: body.titleEn }),
      ...(body.description && { description: body.description }),
      ...(body.learningOutcomes !== undefined && { learningOutcomes: body.learningOutcomes }),
      ...(body.targetAudience !== undefined && { targetAudience: body.targetAudience }),
      ...(body.prerequisites !== undefined && { prerequisites: body.prerequisites }),
      ...(body.tags !== undefined && { tags: body.tags }),
      ...(body.assessmentCriteria !== undefined && { assessmentCriteria: body.assessmentCriteria }),
      ...(body.courseUrl !== undefined && { courseUrl: body.courseUrl }),
      ...(body.videoUrl !== undefined && { videoUrl: body.videoUrl }),
      ...(body.contentStructure !== undefined && { contentStructure: body.contentStructure }),
      ...(body.institutionId && { institutionId: body.institutionId }),
      ...(body.instructorId && { instructorId: body.instructorId }),
      ...(body.imageId && { imageId: body.imageId }),
      ...(body.bannerImageId !== undefined && { bannerImageId: body.bannerImageId }),
      ...(body.level && { level: body.level }),
      ...(body.teachingLanguage !== undefined && { teachingLanguage: body.teachingLanguage }),
      ...(body.durationHours !== undefined && { durationHours: body.durationHours }),
      ...(body.hasCertificate !== undefined && { hasCertificate: body.hasCertificate }),
      ...(body.enrollCount !== undefined && { enrollCount: body.enrollCount }),
    };

    if (body.categoryIds && Array.isArray(body.categoryIds)) {
      updateData.courseCategories = {
        deleteMany: {},
        create: body.categoryIds.map((categoryId: string) => ({
          categoryId,
        })),
      };
    }

    if (body.courseTypeIds && Array.isArray(body.courseTypeIds)) {
      updateData.courseCourseTypes = {
        deleteMany: {},
        create: body.courseTypeIds.map((courseTypeId: string) => ({
          courseTypeId,
        })),
      };
    }

    // Handle instructor IDs - support array of instructors
    if (body.instructorIds && Array.isArray(body.instructorIds)) {
      updateData.courseInstructors = {
        deleteMany: {},
        create: body.instructorIds.map((instructorId: string) => ({
          instructorId,
        })),
      };
    } else if (body.instructorId) {
      // Fallback: single instructor - also add to courseInstructors table
      updateData.courseInstructors = {
        deleteMany: {},
        create: [{ instructorId: body.instructorId }],
      };
    }

    const updatedCourse = await prisma.courses.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: updatedCourse,
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        {
          success: false,
          error: "Course not found",
        },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update course",
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
    await prisma.courses.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        {
          success: false,
          error: "Course not found",
        },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete course",
      },
      { status: 500 }
    );
  }
}
