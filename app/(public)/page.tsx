"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/lib/language-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Category, Course, News, Banner, Institution } from "@/lib/types";
import { ArrowRight, SquarePlus, ArrowUpSquare } from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import { getIconComponent } from "@/lib/icon-map";
import { BannerDisplay } from "@/components/public/banner-display";

export default function HomePage() {
  const { language, t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCourses, setNewCourses] = useState<Course[]>([]);
  const [popularCourses, setPopularCourses] = useState<Course[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [courseTypes, setCourseTypes] = useState<any[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    async function loadData() {
      // Fetch data from API endpoints instead of direct Prisma calls
      const [catsRes, coursesRes, newsRes, bannersRes, instsRes, courseTypesRes] = await Promise.all([
        fetch('/api/categories').then(r => r.json()),
        fetch('/api/courses').then(r => r.json()),
        fetch('/api/news').then(r => r.json()),
        fetch('/api/banners').then(r => r.json()),
        fetch('/api/institutions').then(r => r.json()),
        fetch('/api/course-types').then(r => r.json()),
      ]);

      const cats = catsRes.data || [];
      const courses = (coursesRes.data || []).map((c: any) => ({
        ...c,
        createdAt: new Date(c.createdAt),
        updatedAt: new Date(c.updatedAt),
      }));
      const newsItems = (newsRes.data || []).map((n: any) => ({
        ...n,
        createdAt: new Date(n.createdAt),
        updatedAt: new Date(n.updatedAt),
      }));
      const bannersData = (bannersRes.data || []).map((b: any) => ({
        ...b,
        createdAt: new Date(b.createdAt),
        updatedAt: new Date(b.updatedAt),
      }));
      const insts = instsRes.data || [];
      const types = courseTypesRes.data || [];

      // Sort categories by Thai name alphabetically
      const sortedCategories = [...cats].sort((a, b) =>
        a.name.localeCompare(b.name, 'th')
      );
      setCategories(sortedCategories);
      setInstitutions(insts);
      setCourseTypes(types);

      // Sort by createdAt for new courses
      const sortedByDate = [...courses].sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );
      setNewCourses(sortedByDate.slice(0, 4));

      // Sort by enrollCount for popular courses
      const sortedByViews = [...courses].sort(
        (a, b) => (b.enrollCount || 0) - (a.enrollCount || 0)
      );
      setPopularCourses(sortedByViews.slice(0, 4));

      setNews(newsItems.slice(0, 4));
      setBanners(bannersData.filter((b: Banner) => b.isActive));
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Carousel */}
      <BannerDisplay banners={banners} language={language} />

      {banners.length > 0 && false && (
        <section className="relative h-[400px] bg-gray-900 overflow-hidden">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentBanner ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={getImageUrl(banner.imageId)}
                alt={banner.title}
                fill
                className="object-cover"
                priority={index === 0}
              />
              <div className="absolute inset-0 bg-black/40" />
              <div className="container mx-auto px-4 h-full flex items-center">
                <div className="text-white max-w-2xl">
                  <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    {language === "th" ? banner.title : banner.titleEn}
                  </h1>
                  <p className="text-xl mb-6">
                    {language === "th" ? banner.subtitle : banner.subtitleEn}
                  </p>
                  {banner.linkUrl && (
                    <Button asChild size="lg">
                      <Link href={banner.linkUrl}>
                        {t("เรียนรู้เพิ่มเติม", "Learn More")}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Carousel indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBanner(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentBanner
                    ? "bg-white w-8"
                    : "bg-white/50 hover:bg-white/75"
                }`}
              />
            ))}
          </div>
        </section>
      )}

      {/* Browse by Category */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-[1.2rem] font-bold mb-8">
          {t("หมวดหมู่รายวิชา", "Browse by Category")}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => {
            const IconComponent = getIconComponent(category.icon);
            return (
              <Link key={category.id} href={`/courses?category=${category.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full group">
                  <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                      <IconComponent className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-sm">
                      {language === "th" ? category.name : category.nameEn}
                    </h3>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* New Courses */}
      <section className="container mx-auto px-4 py-12 bg-gray-50">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <SquarePlus className="h-6 w-6 text-primary" />
            <h2 className="text-[1.2rem] font-bold">
              {t("รายวิชาใหม่อัพเดท", "New Courses")}
            </h2>
          </div>
          <Button asChild variant="outline" style={{ borderRadius: '5px' }}>
            <Link href="/courses">
              {t("ดูทั้งหมด", "View All")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {newCourses.map((course) => (
            <CourseCard key={course.id} course={course} language={language} institutions={institutions} courseTypes={courseTypes} categories={categories} />
          ))}
        </div>
      </section>

      {/* Popular Courses */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <ArrowUpSquare className="h-6 w-6 text-primary" />
            <h2 className="text-[1.2rem] font-bold">
              {t("รายวิชาได้รับความนิยมสูงสุด", "Popular Courses")}
            </h2>
          </div>
          <Button asChild variant="outline" style={{ borderRadius: '5px' }}>
            <Link href="/courses">
              {t("ดูทั้งหมด", "View All")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularCourses.map((course) => (
            <CourseCard key={course.id} course={course} language={language} institutions={institutions} courseTypes={courseTypes} categories={categories} />
          ))}
        </div>
      </section>

      {/* News & Announcements */}
      <section className="container mx-auto px-4 py-12 bg-gray-50">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-[1.2rem] font-bold">
            {t("ข่าวประชาสัมพันธ์", "News & Announcements")}
          </h2>
          <Button asChild variant="outline" style={{ borderRadius: '5px' }}>
            <Link href="/news">
              {t("ดูทั้งหมด", "View All")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {news.map((item) => (
            <Link key={item.id} href={`/news/${item.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <div className="relative h-40">
                  <Image
                    src={getImageUrl(item.imageId)}
                    alt={item.title}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-2 text-base">{item.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString(
                      language === "th" ? "th-TH" : "en-US"
                    )}
                  </p>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function CourseCard({
  course,
  language,
  institutions,
  courseTypes = [],
  categories = [],
}: {
  course: Course;
  language: "th" | "en";
  institutions: Institution[];
  courseTypes?: any[];
  categories?: any[];
}) {
  const institution = institutions.find(inst => inst.id === course.institutionId);
  const courseCategories = (course as any).courseCategories || [];
  const categoryNames = courseCategories
    .map((cc: any) => {
      const category = categories.find(c => c.id === cc.categoryId);
      return category ? (language === "th" ? category.name : category.nameEn) : null;
    })
    .filter(Boolean)
    .join(", ");

  return (
    <Link href={`/courses/${course.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <div className="relative h-40">
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
          {institution && (
            <p className="text-xs text-muted-foreground mt-1">
              {language === "th" ? institution.name : institution.nameEn}
            </p>
          )}
          {categoryNames && (
            <p className="text-xs text-muted-foreground mt-1">
              {categoryNames}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-xs">
            <Badge variant="secondary">{course.level}</Badge>
            <span className="text-muted-foreground">
              {course.durationHours}{" "}
              {language === "th" ? "ชั่วโมง" : "hours"}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
