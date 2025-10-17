import { getInstructors, getInstitutions } from "@/lib/data";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { InstructorsList } from "@/components/admin/instructors-list";
import { InstructorImportDialog } from "@/components/admin/instructor-import-dialog";

export default async function AdminInstructorsPage() {
  const [instructors, institutions] = await Promise.all([
    getInstructors(),
    getInstitutions(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Instructors</h1>
          <p className="text-muted-foreground">Manage instructors</p>
        </div>
        <div className="flex gap-2">
          <InstructorImportDialog />
          <Button asChild>
            <Link href="/admin/instructors/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Instructor
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Instructors ({instructors.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <InstructorsList
            initialInstructors={instructors}
            institutions={institutions}
          />
        </CardContent>
      </Card>
    </div>
  );
}
