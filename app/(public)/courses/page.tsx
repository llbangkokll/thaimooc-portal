"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/lib/language-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { Course, Category, Institution, CourseType } from "@/lib/types";
import { Search } from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import { getIconComponent } from "@/lib/icon-map";

function CoursesPageContent() {
  const { language, t } = useLanguage();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const institutionParam = searchParams.get("institution");

  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [courseTypes, setCourseTypes] = useState<CourseType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || "");
  const [selectedInstitution, setSelectedInstitution] = useState(institutionParam || "");
  const [selectedCourseType, setSelectedCourseType] = useState("");

  // Load data once
  useEffect(() => {
    async function loadData() {
      const [coursesRes, catsRes, instsRes, typesRes] = await Promise.all([
        fetch('/api/courses').then(r => r.json()),
        fetch('/api/categories').then(r => r.json()),
        fetch('/api/institutions').then(r => r.json()),
        fetch('/api/course-types').then(r => r.json()),
      ]);

      const courses = (coursesRes.data || []).map((c: any) => ({
        ...c,
        createdAt: new Date(c.createdAt),
        updatedAt: new Date(c.updatedAt),
      }));

      const cats = (catsRes.data || []).map((c: any) => ({
        ...c,
        createdAt: new Date(c.createdAt),
        updatedAt: new Date(c.updatedAt),
      }));

      const insts = (instsRes.data || []).map((i: any) => ({
        ...i,
        createdAt: new Date(i.createdAt),
        updatedAt: new Date(i.updatedAt),
      }));

      const types = (typesRes.data || []).map((t: any) => ({
        ...t,
        createdAt: new Date(t.createdAt),
        updatedAt: new Date(t.updatedAt),
      }));

      setAllCourses(courses);
      setFilteredCourses(courses);
      setCategories(cats);
      setInstitutions(insts);
      setCourseTypes(types);
    }
    loadData();
  }, []);

  // Update filters when URL params change
  useEffect(() => {
    setSelectedCategory(categoryParam || "");
    setSelectedInstitution(institutionParam || "");
  }, [categoryParam, institutionParam]);

  useEffect(() => {
    let filtered = [...allCourses];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(query) ||
          course.titleEn.toLowerCase().includes(query) ||
          course.description.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(
        (course) => (course as any).courseCategories?.some((cc: any) => cc.categoryId === selectedCategory)
      );
    }

    // Filter by institution
    if (selectedInstitution) {
      filtered = filtered.filter(
        (course) => course.institutionId === selectedInstitution
      );
    }

    // Filter by course type
    if (selectedCourseType) {
      filtered = filtered.filter(
        (course) => (course as any).courseCourseTypes?.some((ct: any) => ct.courseTypeId === selectedCourseType)
      );
    }

    setFilteredCourses(filtered);
  }, [searchQuery, selectedCategory, selectedInstitution, selectedCourseType, allCourses]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("ค้นหาและกรองคอร์ส", "Search & Filter")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div>
                <Label htmlFor="search">
                  {t("ค้นหาชื่อคอร์ส", "Search Course Title")}
                </Label>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder={t("ค้นหา...", "Search...")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <Label>
                  {t("หมวดหมู่", "Category")}
                </Label>
                <div className="mt-2 space-y-1">
                  <button
                    onClick={() => setSelectedCategory("")}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedCategory === ""
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent"
                    }`}
                  >
                    {t("ทั้งหมด", "All")}
                  </button>
                  {categories?.map((cat) => {
                    const IconComponent = getIconComponent(cat.icon);
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                          selectedCategory === cat.id
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent"
                        }`}
                      >
                        <IconComponent className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">
                          {language === "th" ? cat.name : cat.nameEn}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Institution Filter */}
              <div>
                <Label htmlFor="institution">
                  {t("สถาบันการศึกษา", "Institution")}
                </Label>
                <Select
                  value={selectedInstitution || "all"}
                  onValueChange={(value) => setSelectedInstitution(value === "all" ? "" : value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder={t("ทั้งหมด", "All")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("ทั้งหมด", "All")}</SelectItem>
                    {institutions?.map((inst) => (
                      <SelectItem key={inst.id} value={inst.id}>
                        {language === "th" ? inst.name : inst.nameEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Course Type Filter */}
              <div>
                <Label>
                  {t("ประเภทรายวิชา", "Course Type")}
                </Label>
                <div className="mt-2 space-y-1">
                  <button
                    onClick={() => setSelectedCourseType("")}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedCourseType === ""
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent"
                    }`}
                  >
                    {t("ทั้งหมด", "All")}
                  </button>
                  {courseTypes?.map((type) => {
                    const IconComponent = getIconComponent(type.icon || "BookOpen");
                    return (
                      <button
                        key={type.id}
                        onClick={() => setSelectedCourseType(type.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                          selectedCourseType === type.id
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent"
                        }`}
                      >
                        <IconComponent className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">
                          {language === "th" ? type.name : type.nameEn}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Clear Filters */}
              {(searchQuery || selectedCategory || selectedInstitution || selectedCourseType) && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("");
                    setSelectedInstitution("");
                    setSelectedCourseType("");
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  {t("ล้างตัวกรอง", "Clear Filters")}
                </button>
              )}
            </CardContent>
          </Card>
        </aside>

        {/* Course Grid */}
        <div className="lg:col-span-3">
          <div className="mb-4 text-sm text-muted-foreground">
            {t(
              `แสดง ${filteredCourses.length} จาก ${allCourses.length} คอร์ส`,
              `Showing ${filteredCourses.length} of ${allCourses.length} courses`
            )}
          </div>

          {filteredCourses.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-lg text-muted-foreground">
                {t(
                  "ไม่พบคอร์สที่ตรงกับเงื่อนไขการค้นหา",
                  "No courses found matching your criteria"
                )}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCourses?.map((course) => (
                <Link key={course.id} href={`/courses/${course.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <div className="relative h-48">
                      <Image
                        src={getImageUrl(course.imageId)}
                        alt={language === "th" ? course.title : course.titleEn}
                        fill
                        className="object-cover rounded-t-lg"
                      />
                      {/* Course Type Icons */}
                      {(course as any).courseCourseTypes && (course as any).courseCourseTypes.length > 0 && courseTypes.length > 0 && (() => {
                        const courseTypesToShow = (course as any).courseCourseTypes.slice(0, 3);
                        const icons = courseTypesToShow.map((ct: any) => {
                          const courseType = courseTypes.find(t => t.id === ct.courseTypeId);
                          if (!courseType || !courseType.icon) return null;
                          const IconComponent = getIconComponent(courseType.icon);
                          return { IconComponent, name: language === "th" ? courseType.name : courseType.nameEn };
                        }).filter(Boolean);

                        if (icons.length === 0) return null;

                        return (
                          <div className="absolute top-2 right-2 flex gap-1">
                            {icons.map((item: any, index: number) => (
                              <div
                                key={index}
                                className="bg-primary/90 text-white backdrop-blur-sm rounded-full p-2 flex items-center justify-center"
                                title={item.name}
                              >
                                <item.IconComponent className="h-4 w-4" />
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-2 text-base">
                        {language === "th" ? course.title : course.titleEn}
                      </CardTitle>
                      {institutions?.find(inst => inst.id === course.institutionId) && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {language === "th"
                            ? institutions?.find(inst => inst.id === course.institutionId)?.name
                            : institutions?.find(inst => inst.id === course.institutionId)?.nameEn}
                        </p>
                      )}
                      {(() => {
                        const courseCategories = (course as any).courseCategories || [];
                        const categoryNames = courseCategories
                          .map((cc: any) => {
                            const category = categories.find(c => c.id === cc.categoryId);
                            return category ? (language === "th" ? category.name : category.nameEn) : null;
                          })
                          .filter(Boolean)
                          .join(", ");

                        if (!categoryNames) return null;

                        return (
                          <p className="text-xs text-muted-foreground mt-1">
                            {categoryNames}
                          </p>
                        );
                      })()}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-xs">
                        <Badge variant="secondary">{course.level}</Badge>
                        <span className="text-muted-foreground">
                          {course.durationHours}{" "}
                          {language === "th" ? "ชั่วโมง" : "hours"}
                        </span>
                      </div>
                      {course.hasCertificate && (
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs">
                            {t("มีใบประกาศนียบัตร", "Certificate")}
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <CoursesPageContent />
    </Suspense>
  );
}
