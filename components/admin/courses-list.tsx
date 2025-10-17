"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Pencil, Trash2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Course, Category, Instructor, Institution } from "@/lib/types";

interface CoursesListProps {
  initialCourses: Course[];
  categories: Category[];
  instructors: Instructor[];
  institutions: Institution[];
}

export function CoursesList({
  initialCourses,
  categories,
  instructors,
  institutions,
}: CoursesListProps) {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const getCategoryName = (courseCategories: any[]) => {
    if (!courseCategories || courseCategories.length === 0) return "-";
    const categoryId = courseCategories[0].categoryId;
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || "Unknown";
  };

  const getInstructorName = (id: string | null | undefined) => {
    if (!id) return "Unknown";
    const instructor = instructors.find((i) => i.id === id);
    return instructor?.name || "Unknown";
  };

  const getInstitutionName = (id: string | null | undefined) => {
    if (!id) return "Unknown";
    const institution = institutions.find((i) => i.id === id);
    return institution?.abbreviation || "Unknown";
  };

  const getLevelBadge = (level: string | null | undefined) => {
    if (!level) return "default";
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      beginner: "default",
      intermediate: "secondary",
      advanced: "destructive",
    };
    return variants[level.toLowerCase()] || "default";
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`คุณต้องการลบรายวิชา "${title}" หรือไม่?`)) {
      return;
    }

    setDeletingId(id);

    try {
      const response = await fetch(`/api/courses/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete course");
      }

      // Remove from local state
      setCourses(courses.filter((course) => course.id !== id));

      // Refresh the page data
      router.refresh();
    } catch (error) {
      console.error("Error deleting course:", error);
      alert(
        error instanceof Error
          ? error.message
          : "ไม่สามารถลบรายวิชาได้ กรุณาลองใหม่อีกครั้ง"
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Instructor</TableHead>
          <TableHead>Institution</TableHead>
          <TableHead>Level</TableHead>
          <TableHead>Views</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {courses.map((course) => (
          <TableRow key={course.id}>
            <TableCell className="font-medium">
              <div>
                <div>{course.title}</div>
                <div className="text-sm text-muted-foreground">
                  {course.titleEn}
                </div>
              </div>
            </TableCell>
            <TableCell>{getCategoryName((course as any).courseCategories)}</TableCell>
            <TableCell>{getInstructorName(course.instructorId)}</TableCell>
            <TableCell>{getInstitutionName(course.institutionId)}</TableCell>
            <TableCell>
              <Badge variant={getLevelBadge(course.level)}>
                {course.level || "N/A"}
              </Badge>
            </TableCell>
            <TableCell>{(course.enrollCount || 0).toLocaleString()}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/courses/${course.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/admin/courses/${course.id}`}>
                    <Pencil className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(course.id, course.title)}
                  disabled={deletingId === course.id}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
