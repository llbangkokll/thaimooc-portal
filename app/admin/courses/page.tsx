import { getCourses, getCategories, getInstructors, getInstitutions } from "@/lib/data";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { CoursesList } from "@/components/admin/courses-list";
import { CourseImportDialog } from "@/components/admin/course-import-dialog";

export default async function AdminCoursesPage() {
  const [courses, categories, instructors, institutions] = await Promise.all([
    getCourses(),
    getCategories(),
    getInstructors(),
    getInstitutions(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Courses</h1>
          <p className="text-muted-foreground">Manage all courses</p>
        </div>
        <div className="flex gap-2">
          <CourseImportDialog />
          <Button asChild>
            <Link href="/admin/courses/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Course
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Courses ({courses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <CoursesList
            initialCourses={courses}
            categories={categories}
            instructors={instructors}
            institutions={institutions}
          />
        </CardContent>
      </Card>
    </div>
  );
}
