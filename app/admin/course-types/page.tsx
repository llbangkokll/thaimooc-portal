import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { CourseTypesList } from "@/components/admin/course-types-list";

async function getCourseTypes() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/course-types`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.data || [];
}

export default async function CourseTypesPage() {
  const courseTypes = await getCourseTypes();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">ประเภทรายวิชา (Course Types)</h1>
          <p className="text-muted-foreground">
            จัดการประเภทรายวิชาออนไลน์
          </p>
        </div>
        <Link href="/admin/course-types/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            เพิ่มประเภทรายวิชา
          </Button>
        </Link>
      </div>

      <CourseTypesList initialCourseTypes={courseTypes} />
    </div>
  );
}
