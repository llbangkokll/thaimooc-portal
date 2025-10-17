import { getCourseById, getCategories, getCourseTypes, getInstructors, getInstitutions } from "@/lib/data";
import { notFound } from "next/navigation";
import { CourseForm } from "@/components/admin/course-form";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [course, categories, courseTypes, instructors, institutions] = await Promise.all([
    getCourseById(id),
    getCategories(),
    getCourseTypes(),
    getInstructors(),
    getInstitutions(),
  ]);

  if (!course) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Course</h1>
        <p className="text-muted-foreground">Update course information</p>
      </div>

      <CourseForm
        course={course}
        categories={categories}
        courseTypes={courseTypes}
        instructors={instructors}
        institutions={institutions}
      />
    </div>
  );
}
