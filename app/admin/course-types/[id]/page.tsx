import { notFound } from "next/navigation";
import { CourseTypeForm } from "@/components/admin/course-type-form";

async function getCourseType(id: string) {
  if (id === "new") return null;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/course-types/${id}`,
    { cache: "no-store" }
  );

  if (!res.ok) return null;
  const data = await res.json();
  return data.data;
}

export default async function CourseTypePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const courseType = await getCourseType(id);

  if (id !== "new" && !courseType) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {courseType ? "แก้ไขประเภทรายวิชา" : "เพิ่มประเภทรายวิชา"}
        </h1>
        <p className="text-muted-foreground">
          {courseType ? "แก้ไขข้อมูลประเภทรายวิชา" : "สร้างประเภทรายวิชาใหม่"}
        </p>
      </div>

      <CourseTypeForm courseType={courseType} />
    </div>
  );
}
