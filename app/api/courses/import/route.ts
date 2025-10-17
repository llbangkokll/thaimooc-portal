import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface CSVCourseData {
  title: string;
  titleEn: string;
  description: string;
  institutionId: string;
  instructorId: string;
  imageId: string;
  level: string;
  durationHours: string;
  learningOutcomes?: string;
  targetAudience?: string;
  prerequisites?: string;
  tags?: string;
  courseUrl?: string;
  videoUrl?: string;
  teachingLanguage?: string;
  hasCertificate?: string;
  categoryIds?: string; // comma-separated
  courseTypeIds?: string; // comma-separated
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { courses } = body;

    if (!courses || !Array.isArray(courses)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid data format. Expected array of courses.",
        },
        { status: 400 }
      );
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (let i = 0; i < courses.length; i++) {
      const course = courses[i] as CSVCourseData;

      try {
        // Validate required fields (only title, titleEn, description)
        if (!course.title || !course.titleEn || !course.description) {
          results.failed++;
          results.errors.push(`Row ${i + 1}: Missing required fields (title, titleEn, description)`);
          continue;
        }

        // Check if institution exists (only if provided)
        if (course.institutionId) {
          const institution = await prisma.institutions.findUnique({
            where: { id: course.institutionId },
          });
          if (!institution) {
            results.failed++;
            results.errors.push(`Row ${i + 1}: Institution ID "${course.institutionId}" not found`);
            continue;
          }
        }

        // Check if instructor exists (only if provided)
        if (course.instructorId) {
          const instructor = await prisma.instructors.findUnique({
            where: { id: course.instructorId },
          });
          if (!instructor) {
            results.failed++;
            results.errors.push(`Row ${i + 1}: Instructor ID "${course.instructorId}" not found`);
            continue;
          }
        }

        // Generate ID
        const id = `course-${Date.now()}-${i}`;

        // Parse category IDs
        const categoryIds = course.categoryIds
          ? course.categoryIds.split(',').map(id => id.trim()).filter(id => id)
          : [];

        // Parse course type IDs
        const courseTypeIds = course.courseTypeIds
          ? course.courseTypeIds.split(',').map(id => id.trim()).filter(id => id)
          : [];

        // Parse learning outcomes (JSON array or comma-separated)
        let learningOutcomes = "";
        if (course.learningOutcomes) {
          try {
            // Try to parse as JSON first
            JSON.parse(course.learningOutcomes);
            learningOutcomes = course.learningOutcomes;
          } catch {
            // If not JSON, treat as comma-separated and convert to JSON
            const outcomes = course.learningOutcomes.split(',').map(o => o.trim()).filter(o => o);
            learningOutcomes = JSON.stringify(outcomes);
          }
        }

        // Create course
        await prisma.courses.create({
          data: {
            id,
            title: course.title,
            titleEn: course.titleEn,
            description: course.description,
            learningOutcomes: learningOutcomes || null,
            targetAudience: course.targetAudience || null,
            prerequisites: course.prerequisites || null,
            tags: course.tags || null,
            courseUrl: course.courseUrl || null,
            videoUrl: course.videoUrl || null,
            institutionId: course.institutionId || null,
            instructorId: course.instructorId || null,
            imageId: course.imageId || null,
            level: course.level || null,
            teachingLanguage: course.teachingLanguage || null,
            durationHours: course.durationHours ? parseInt(course.durationHours) : null,
            hasCertificate: course.hasCertificate?.toLowerCase() === 'true' || course.hasCertificate === '1',
            enrollCount: 0,
            updatedAt: new Date(),
          },
        });

        // Create category relations
        if (categoryIds.length > 0) {
          await prisma.course_categories.createMany({
            data: categoryIds.map(categoryId => ({
              courseId: id,
              categoryId,
            })),
            skipDuplicates: true,
          });
        }

        // Create course type relations
        if (courseTypeIds.length > 0) {
          await prisma.course_course_types.createMany({
            data: courseTypeIds.map(courseTypeId => ({
              courseId: id,
              courseTypeId,
            })),
            skipDuplicates: true,
          });
        }

        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push(`Row ${i + 1}: ${error.message || 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Import completed. Success: ${results.success}, Failed: ${results.failed}`,
      results,
    });
  } catch (error: any) {
    console.error("Error importing courses:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to import courses",
      },
      { status: 500 }
    );
  }
}
