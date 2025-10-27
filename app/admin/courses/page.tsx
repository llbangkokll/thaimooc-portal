"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Download } from "lucide-react";
import { CoursesList } from "@/components/admin/courses-list";
import { CourseImportDialog } from "@/components/admin/course-import-dialog";
import type { Course, CourseWithRelations, Category, Instructor, Institution } from "@/lib/types";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [coursesRes, categoriesRes, instructorsRes, institutionsRes] = await Promise.all([
          fetch('/api/courses').then(r => r.json()),
          fetch('/api/categories').then(r => r.json()),
          fetch('/api/instructors').then(r => r.json()),
          fetch('/api/institutions').then(r => r.json()),
        ]);

        setCourses(coursesRes.data || []);
        setCategories(categoriesRes.data || []);
        setInstructors(instructorsRes.data || []);
        setInstitutions(institutionsRes.data || []);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const exportToCSV = () => {
    // Prepare CSV headers
    const headers = [
      'ID',
      'Title (TH)',
      'Title (EN)',
      'Description',
      'Categories',
      'Learning Outcomes',
      'Target Audience',
      'Prerequisites',
      'Institution',
      'Instructor',
      'Level',
      'Duration (Hours)',
      'Teaching Language',
      'Has Certificate',
      'Enroll Count',
      'Image URL',
      'Banner Image URL',
      'Video URL',
      'Course URL',
      'Tags',
      'Created At',
      'Updated At'
    ];

    // Prepare CSV rows
    const rows = courses.map(course => {
      const institution = institutions.find(i => i.id === course.institutionId);
      const instructor = instructors.find(i => i.id === course.instructorId);

      // Get category IDs for this course
      const courseWithRelations = course as CourseWithRelations;
      const courseCategories = courseWithRelations.courseCategories || [];
      const categoryIds = courseCategories
        .map((cc) => cc.categoryId)
        .filter(Boolean)
        .join(',');

      return [
        course.id,
        `"${(course.title || '').replace(/"/g, '""')}"`,
        `"${(course.titleEn || '').replace(/"/g, '""')}"`,
        `"${(course.description || '').replace(/"/g, '""')}"`,
        categoryIds || '',
        `"${(course.learningOutcomes || '').replace(/"/g, '""')}"`,
        `"${(course.targetAudience || '').replace(/"/g, '""')}"`,
        `"${(course.prerequisites || '').replace(/"/g, '""')}"`,
        `"${institution ? institution.name : ''}"`,
        `"${instructor ? instructor.name : ''}"`,
        course.level || '',
        course.durationHours || 0,
        course.teachingLanguage || '',
        course.hasCertificate ? 'Yes' : 'No',
        course.enrollCount || 0,
        course.imageId || '',
        course.bannerImageId || '',
        course.videoUrl || '',
        course.courseUrl || '',
        `"${(course.tags || '').replace(/"/g, '""')}"`,
        new Date(course.createdAt).toISOString(),
        new Date(course.updatedAt).toISOString()
      ].join(',');
    });

    // Combine headers and rows
    const csv = [headers.join(','), ...rows].join('\n');

    // Create blob and download
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `courses_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up to prevent memory leak
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Courses</h1>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Courses</h1>
          <p className="text-muted-foreground">Manage all courses</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={exportToCSV}
            disabled={courses.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
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
