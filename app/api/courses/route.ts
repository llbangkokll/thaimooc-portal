import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get("categoryId");
    const institutionId = searchParams.get("institutionId");
    const level = searchParams.get("level");

    const courses = await prisma.courses.findMany({
      where: {
        ...(categoryId && {
          course_categories: {
            some: { categoryId }
          }
        }),
        ...(institutionId && { institutionId }),
        ...(level && { level }),
      },
      include: {
        course_categories: {
          select: {
            categoryId: true,
          },
        },
        course_course_types: {
          select: {
            courseTypeId: true,
          },
        },
        course_instructors: {
          select: {
            instructorId: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

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

    const newCourse = await prisma.courses.create({
      data: {
        title: body.title,
        titleEn: body.titleEn,
        description: body.description,
        learningOutcomes: body.learningOutcomes || null,
        targetAudience: body.targetAudience || null,
        prerequisites: body.prerequisites || null,
        tags: body.tags || null,
        assessmentCriteria: body.assessmentCriteria || null,
        courseUrl: body.courseUrl || null,
        videoUrl: body.videoUrl || null,
        contentStructure: body.contentStructure || null,
        institutionId: body.institutionId,
        instructorId: body.instructorId,
        imageId: body.imageId,
        bannerImageId: body.bannerImageId || null,
        level: body.level,
        teachingLanguage: body.teachingLanguage || null,
        durationHours: body.durationHours || 0,
        hasCertificate: body.hasCertificate || false,
        enrollCount: body.enrollCount || 0,
        course_categories: {
          create: body.categoryIds.map((categoryId: string) => ({
            categoryId,
          })),
        },
        ...(body.courseTypeIds && Array.isArray(body.courseTypeIds) && body.courseTypeIds.length > 0 && {
          course_course_types: {
            create: body.courseTypeIds.map((courseTypeId: string) => ({
              courseTypeId,
            })),
          },
        }),
        ...(body.instructorIds && Array.isArray(body.instructorIds) && body.instructorIds.length > 0 ? {
          course_instructors: {
            create: body.instructorIds.map((instructorId: string) => ({
              instructorId,
            })),
          },
        } : body.instructorId ? {
          course_instructors: {
            create: [{ instructorId: body.instructorId }],
          },
        } : {}),
      },
    });

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
