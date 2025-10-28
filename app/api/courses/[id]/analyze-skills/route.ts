import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/mysql-direct";
import { analyzeCourseSkills, getMockSkillAnalysis } from "@/lib/gemini";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = params.id;

    // Check if analysis already exists in cache
    const cached = await query<{
      id: string;
      courseId: string;
      hardSkills: string;
      softSkills: string;
      reasoning: string;
      createdAt: Date;
    }>(
      "SELECT * FROM course_skill_analysis WHERE courseId = ? ORDER BY createdAt DESC LIMIT 1",
      [courseId]
    );

    // Return cached result if exists and less than 7 days old
    if (cached.length > 0) {
      const cacheAge = Date.now() - new Date(cached[0].createdAt).getTime();
      const sevenDays = 7 * 24 * 60 * 60 * 1000;

      if (cacheAge < sevenDays) {
        return NextResponse.json({
          success: true,
          data: {
            hardSkills: JSON.parse(cached[0].hardSkills),
            softSkills: JSON.parse(cached[0].softSkills),
            reasoning: cached[0].reasoning,
          },
          cached: true,
          cacheAge: Math.floor(cacheAge / (24 * 60 * 60 * 1000)), // days
        });
      }
    }

    // Fetch course data
    const courses = await query<{
      id: string;
      title: string;
      titleEn: string;
      description: string;
      learningOutcomes: string | null;
      contentStructure: string | null;
      prerequisites: string | null;
      targetAudience: string | null;
    }>("SELECT * FROM courses WHERE id = ?", [courseId]);

    if (courses.length === 0) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    const course = courses[0];

    // Fetch categories
    const categories = await query<{ name: string }>(
      `SELECT c.name FROM categories c
       INNER JOIN course_categories cc ON c.id = cc.categoryId
       WHERE cc.courseId = ?`,
      [courseId]
    );

    // Fetch course types
    const courseTypes = await query<{ name: string }>(
      `SELECT ct.name FROM course_types ct
       INNER JOIN course_course_types cct ON ct.id = cct.courseTypeId
       WHERE cct.courseId = ?`,
      [courseId]
    );

    // Prepare course data for analysis
    const courseData = {
      title: course.title,
      titleEn: course.titleEn,
      description: course.description,
      learningOutcomes: course.learningOutcomes || undefined,
      contentStructure: course.contentStructure || undefined,
      prerequisites: course.prerequisites || undefined,
      targetAudience: course.targetAudience || undefined,
      categories: categories.map((c) => c.name),
      courseTypes: courseTypes.map((ct) => ct.name),
    };

    // Analyze skills using Gemini AI
    let analysis;
    try {
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_gemini_api_key_here") {
        // Use mock data if API key not configured
        console.log("Using mock skill analysis (no API key configured)");
        analysis = getMockSkillAnalysis();
      } else {
        analysis = await analyzeCourseSkills(courseData);
      }
    } catch (error) {
      console.error("Gemini API error, falling back to mock data:", error);
      analysis = getMockSkillAnalysis();
    }

    // Save to database for caching
    const analysisId = `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    await query(
      `INSERT INTO course_skill_analysis
       (id, courseId, hardSkills, softSkills, reasoning, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        analysisId,
        courseId,
        JSON.stringify(analysis.hardSkills),
        JSON.stringify(analysis.softSkills),
        analysis.reasoning || "",
        now,
        now,
      ]
    );

    return NextResponse.json({
      success: true,
      data: analysis,
      cached: false,
    });
  } catch (error) {
    console.error("Error analyzing course skills:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to analyze course skills",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// Force reanalysis
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = params.id;

    // Delete existing analysis
    await query("DELETE FROM course_skill_analysis WHERE courseId = ?", [
      courseId,
    ]);

    // Redirect to GET to perform new analysis
    return GET(request, { params });
  } catch (error) {
    console.error("Error forcing reanalysis:", error);
    return NextResponse.json(
      { success: false, error: "Failed to force reanalysis" },
      { status: 500 }
    );
  }
}
