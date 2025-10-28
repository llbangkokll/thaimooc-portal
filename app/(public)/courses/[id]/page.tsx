import { Metadata } from "next";
import { notFound } from "next/navigation";
import { query } from "@/lib/mysql-direct";
import { CourseSkillsSidebar } from "@/components/course/course-skills-sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Clock, Award, Users, BookOpen } from "lucide-react";
import Image from "next/image";

interface Course {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  institutionId: string;
  imageId: string;
  level: string;
  durationHours: number | null;
  hasCertificate: boolean;
  enrollCount: number;
  learningOutcomes: string | null;
  prerequisites: string | null;
  targetAudience: string | null;
  courseUrl: string | null;
  videoUrl: string | null;
  contentStructure: string | null;
}

interface Institution {
  id: string;
  name: string;
  logoUrl: string;
}

interface Category {
  id: string;
  name: string;
}

interface Instructor {
  id: string;
  name: string;
  title: string;
  imageUrl: string | null;
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const courses = await query<Course>("SELECT * FROM courses WHERE id = ?", [
    params.id,
  ]);

  if (courses.length === 0) {
    return {
      title: "ไม่พบรายวิชา",
    };
  }

  const course = courses[0];

  return {
    title: `${course.title} | Thai MOOC`,
    description: course.description,
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // Fetch course
  const courses = await query<Course>("SELECT * FROM courses WHERE id = ?", [
    params.id,
  ]);

  if (courses.length === 0) {
    notFound();
  }

  const course = courses[0];

  // Fetch institution
  const institutions = await query<Institution>(
    "SELECT * FROM institutions WHERE id = ?",
    [course.institutionId]
  );
  const institution = institutions[0];

  // Fetch categories
  const categories = await query<Category>(
    `SELECT c.* FROM categories c
     INNER JOIN course_categories cc ON c.id = cc.categoryId
     WHERE cc.courseId = ?`,
    [course.id]
  );

  // Fetch instructors
  const instructors = await query<Instructor>(
    `SELECT i.* FROM instructors i
     INNER JOIN course_instructors ci ON i.id = ci.instructorId
     WHERE ci.courseId = ?`,
    [course.id]
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <Card className="p-6">
              <div className="flex items-start gap-4 mb-4">
                {institution?.logoUrl && (
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <Image
                      src={institution.logoUrl}
                      alt={institution.name}
                      fill
                      className="object-contain rounded"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{course.level}</Badge>
                    {course.hasCertificate && (
                      <Badge variant="outline" className="gap-1">
                        <Award className="h-3 w-3" />
                        ออกใบรับรอง
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
                  <p className="text-lg text-muted-foreground mb-2">
                    {course.titleEn}
                  </p>
                  {institution && (
                    <p className="text-sm text-muted-foreground">
                      {institution.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Categories */}
              {categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {categories.map((category) => (
                    <Badge key={category.id} variant="outline">
                      {category.name}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {course.durationHours && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{course.durationHours} ชั่วโมง</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{course.enrollCount.toLocaleString()} คนเรียน</span>
                </div>
              </div>

              {/* Action Buttons */}
              {course.courseUrl && (
                <div className="mt-6">
                  <Button asChild size="lg" className="w-full sm:w-auto">
                    <a
                      href={course.courseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gap-2"
                    >
                      <BookOpen className="h-4 w-4" />
                      เรียนรายวิชานี้
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              )}
            </Card>

            {/* Description */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">รายละเอียดรายวิชา</h2>
              <p className="text-muted-foreground whitespace-pre-line">
                {course.description}
              </p>
            </Card>

            {/* Learning Outcomes */}
            {course.learningOutcomes && (
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">
                  วัตถุประสงค์การเรียนรู้
                </h2>
                <div className="text-muted-foreground whitespace-pre-line">
                  {course.learningOutcomes}
                </div>
              </Card>
            )}

            {/* Content Structure */}
            {course.contentStructure && (
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">โครงสร้างเนื้อหา</h2>
                <div className="text-muted-foreground whitespace-pre-line">
                  {course.contentStructure}
                </div>
              </Card>
            )}

            {/* Prerequisites */}
            {course.prerequisites && (
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">ความรู้เบื้องต้น</h2>
                <div className="text-muted-foreground whitespace-pre-line">
                  {course.prerequisites}
                </div>
              </Card>
            )}

            {/* Target Audience */}
            {course.targetAudience && (
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">กลุ่มเป้าหมาย</h2>
                <div className="text-muted-foreground whitespace-pre-line">
                  {course.targetAudience}
                </div>
              </Card>
            )}

            {/* Instructors */}
            {instructors.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">ผู้สอน</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {instructors.map((instructor) => (
                    <div key={instructor.id} className="flex items-center gap-3">
                      {instructor.imageUrl ? (
                        <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                          <Image
                            src={instructor.imageUrl}
                            alt={instructor.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <span className="text-lg font-semibold text-muted-foreground">
                            {instructor.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-semibold">{instructor.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {instructor.title}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar with Skills Analysis */}
          <div className="lg:col-span-1">
            <CourseSkillsSidebar courseId={course.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
