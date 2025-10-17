"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getImagePlaceholder } from "@/lib/data";
import type { Course, Category, Instructor, Institution } from "@/lib/types";
import {
  Eye,
  Clock,
  Award,
  BarChart,
  Globe,
  Calendar,
  Users,
  BookOpen,
  Target,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Facebook,
  Twitter,
  Instagram,
  MessageCircle,
  Play,
  Library,
} from "lucide-react";

export default function CourseDetailsPage() {
  const params = useParams();
  const courseId = params.id as string;
  const { language, t } = useLanguage();

  const [course, setCourse] = useState<Course | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"description" | "content">("description");
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());

  // Increment enroll count on mount
  const incrementViewCount = async (courseId: string) => {
    try {
      const courseRes = await fetch(`/api/courses/${courseId}`).then(r => r.json());
      if (courseRes.data) {
        await fetch(`/api/courses/${courseId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            enrollCount: (courseRes.data.enrollCount || 0) + 1,
          }),
        });
      }
    } catch (error) {
      console.error("Failed to increment enroll count:", error);
    }
  };

  useEffect(() => {
    async function loadCourseData() {
      try {
        setLoading(true);
        const courseRes = await fetch(`/api/courses/${courseId}`).then(r => r.json());

        if (!courseRes.data) {
          setLoading(false);
          return;
        }

        const courseData = {
          ...courseRes.data,
          createdAt: new Date(courseRes.data.createdAt),
          updatedAt: new Date(courseRes.data.updatedAt),
          learningOutcomes: courseRes.data.learningOutcomes
            ? (typeof courseRes.data.learningOutcomes === 'string'
                ? JSON.parse(courseRes.data.learningOutcomes)
                : courseRes.data.learningOutcomes)
            : [],
          contentStructure: courseRes.data.contentStructure
            ? (typeof courseRes.data.contentStructure === 'string'
                ? JSON.parse(courseRes.data.contentStructure)
                : courseRes.data.contentStructure)
            : [],
          tags: courseRes.data.tags
            ? (typeof courseRes.data.tags === 'string'
                ? courseRes.data.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag)
                : courseRes.data.tags)
            : [],
        };

        setCourse(courseData);

        // Load related data
        const [categoryRes, instructorRes, institutionRes] = await Promise.all([
          fetch(`/api/categories`).then(r => r.json()),
          fetch(`/api/instructors`).then(r => r.json()),
          fetch(`/api/institutions`).then(r => r.json()),
        ]);

        const allCategories = (categoryRes.data || []).map((c: any) => ({
          ...c,
          createdAt: new Date(c.createdAt),
          updatedAt: new Date(c.updatedAt),
        }));

        const categoryData = (categoryRes.data || []).find((c: any) => c.id === courseData.categoryId);

        // Get instructors - support both single instructor and multiple instructors
        let instructorDataList: Instructor[] = [];
        if (courseData.courseInstructors && courseData.courseInstructors.length > 0) {
          // Multiple instructors from course_instructors table
          instructorDataList = courseData.courseInstructors
            .map((ci: any) => {
              const inst = (instructorRes.data || []).find((i: any) => i.id === ci.instructorId);
              return inst ? {
                ...inst,
                createdAt: new Date(inst.createdAt),
                updatedAt: new Date(inst.updatedAt),
              } : null;
            })
            .filter(Boolean);
        } else if (courseData.instructorId) {
          // Single instructor fallback
          const instructorData = (instructorRes.data || []).find((i: any) => i.id === courseData.instructorId);
          if (instructorData) {
            instructorDataList = [{
              ...instructorData,
              createdAt: new Date(instructorData.createdAt),
              updatedAt: new Date(instructorData.updatedAt),
            }];
          }
        }

        const institutionData = (institutionRes.data || []).find((i: any) => i.id === courseData.institutionId);

        setCategories(allCategories);
        setCategory(categoryData ? {
          ...categoryData,
          createdAt: new Date(categoryData.createdAt),
          updatedAt: new Date(categoryData.updatedAt),
        } : null);
        setInstructors(instructorDataList);
        setInstitution(institutionData ? {
          ...institutionData,
          createdAt: new Date(institutionData.createdAt),
          updatedAt: new Date(institutionData.updatedAt),
        } : null);

        // Increment view count
        await incrementViewCount(courseId);
      } catch (error) {
        console.error("Error loading course data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadCourseData();
  }, [courseId]);

  const toggleTopic = (topicId: string) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(topicId)) {
      newExpanded.delete(topicId);
    } else {
      newExpanded.add(topicId);
    }
    setExpandedTopics(newExpanded);
  };

  const getLevelLabel = (level: string | null | undefined) => {
    if (!level) return language === "th" ? "ไม่ระบุ" : "Not specified";
    const labels = {
      beginner: language === "th" ? "เริ่มต้น" : "Beginner",
      intermediate: language === "th" ? "ปานกลาง" : "Intermediate",
      advanced: language === "th" ? "สูง" : "Advanced",
    };
    return labels[level as keyof typeof labels] || level;
  };

  const getLanguageLabel = (lang: string) => {
    return lang === "th"
      ? language === "th"
        ? "ภาษาไทย"
        : "Thai"
      : language === "th"
      ? "ภาษาอังกฤษ"
      : "English";
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = course ? (language === "th" ? course.title : course.titleEn) : "";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {t("กำลังโหลด...", "Loading...")}
          </p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            {t("ไม่พบคอร์สที่ค้นหา", "Course Not Found")}
          </h1>
          <Button asChild>
            <Link href="/courses">
              {t("กลับไปหน้าคอร์ส", "Back to Courses")}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Get course image URL - support both URL and placeholder ID
  const getCourseImageUrl = () => {
    if (!course.imageId) return '/placeholder.png';
    if (course.imageId.startsWith('http://') || course.imageId.startsWith('https://') || course.imageId.startsWith('/')) {
      return course.imageId;
    }
    const placeholder = getImagePlaceholder(course.imageId);
    return placeholder?.url || '/placeholder.png';
  };

  // Get instructor image URL - support both URL and placeholder ID
  const getInstructorImageUrl = (imageUrl?: string | null) => {
    if (!imageUrl) return '/placeholder.png';
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('/')) {
      return imageUrl;
    }
    const placeholder = getImagePlaceholder(imageUrl);
    return placeholder?.url || '/placeholder.png';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Course Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                {category && (
                  <Badge variant="secondary" className="text-sm">
                    {language === "th" ? category.name : category.nameEn}
                  </Badge>
                )}
                <Badge variant="outline" className="text-sm">
                  {getLevelLabel(course.level)}
                </Badge>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {language === "th" ? course.title : course.titleEn}
              </h1>

              {institution && (
                <p className="text-lg text-muted-foreground mb-2">
                  {language === "th" ? institution.name : institution.nameEn}
                </p>
              )}

              {(() => {
                const courseCategories = (course as any).courseCategories || [];
                const categoryNames = courseCategories
                  .map((cc: any) => {
                    const cat = categories.find(c => c.id === cc.categoryId);
                    return cat ? (language === "th" ? cat.name : cat.nameEn) : null;
                  })
                  .filter(Boolean)
                  .join(", ");

                if (!categoryNames) return null;

                return (
                  <p className="text-sm text-muted-foreground mb-6">
                    {categoryNames}
                  </p>
                );
              })()}

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span>{(course.enrollCount || 0).toLocaleString()} {t("ครั้ง", "views")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{course.durationHours} {t("ชั่วโมง", "hours")}</span>
                </div>
                {course.hasCertificate && (
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span>{t("มีใบรับรอง", "Certificate")}</span>
                  </div>
                )}
              </div>

              {/* CTA Button */}
              <Button asChild size="lg" className="w-full md:w-auto" style={{ borderRadius: '9px' }}>
                <a href={(course as any).courseUrl || '#'} target="_blank" rel="noopener noreferrer">
                  {t("ไปยังคอร์สเรียน", "Go to Course")}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>

            {/* Course Image */}
            <div className="lg:col-span-1">
              <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-lg group">
                <Image
                  src={getCourseImageUrl()}
                  alt={language === "th" ? course.title : course.titleEn}
                  fill
                  className="object-cover"
                  priority
                />
                {/* Video Play Button */}
                {(course as any).videoUrl && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                    <button
                      onClick={() => window.open((course as any).videoUrl, '_blank')}
                      className="w-20 h-20 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-all hover:scale-110"
                      aria-label={t("เล่นวิดีโอ", "Play Video")}
                    >
                      <Play className="h-10 w-10 text-primary ml-1" fill="currentColor" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Course Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex border-b">
                  <button
                    onClick={() => setActiveTab("description")}
                    className={`px-4 py-2 font-semibold transition-colors ${
                      activeTab === "description"
                        ? "border-b-2 border-primary text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t("รายละเอียดคอร์ส", "Course Description")}
                  </button>
                  <button
                    onClick={() => setActiveTab("content")}
                    className={`px-4 py-2 font-semibold transition-colors ${
                      activeTab === "content"
                        ? "border-b-2 border-primary text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t("เนื้อหาคอร์ส", "Course Content")}
                  </button>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                {activeTab === "description" ? (
                  <div className="space-y-6">
                    {/* Long Description */}
                    <div>
                      <h3 className="text-xl font-semibold mb-3">
                        {t("เกี่ยวกับคอร์สนี้", "About This Course")}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {(course as any).longDescription || course.description}
                      </p>
                    </div>

                    {/* Learning Outcomes */}
                    <div>
                      <h3 className="text-xl font-semibold mb-3">
                        {t("ผลการเรียนรู้", "Learning Outcomes")}
                      </h3>
                      <ul className="space-y-2">
                        {((course as any).learningOutcomes || []).map((outcome: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span className="text-muted-foreground">{outcome}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold mb-4">
                      {t("โครงสร้างเนื้อหา", "Content Structure")}
                    </h3>
                    {((course as any).contentStructure || []).map((topic: any, index: number) => (
                      <div key={topic.id} className="border rounded-lg">
                        <button
                          onClick={() => toggleTopic(topic.id)}
                          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-primary">
                              {index + 1}
                            </span>
                            <span className="font-semibold text-left">
                              {topic.title}
                            </span>
                          </div>
                          {expandedTopics.has(topic.id) ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </button>
                        {expandedTopics.has(topic.id) && (
                          <div className="px-4 pb-4 border-t bg-gray-50">
                            <ul className="space-y-2 mt-4">
                              {(topic.subtopics || []).map((subtopic: string, subIndex: number) => (
                                <li
                                  key={subIndex}
                                  className="flex items-start gap-2 text-sm"
                                >
                                  <span className="text-muted-foreground mt-1">
                                    -
                                  </span>
                                  <span className="text-muted-foreground">
                                    {subtopic}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Instructor Card */}
            {instructors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {t("ผู้สอน", instructors.length > 1 ? "Instructors" : "Instructor")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={instructors.length > 1 ? "grid grid-cols-2 gap-4" : ""}>
                    {instructors.map((instructor) => (
                      <div key={instructor.id} className="flex items-center gap-4 mb-4 last:mb-0">
                        <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                          <Image
                            src={getInstructorImageUrl(instructor.imageUrl)}
                            alt={instructor.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold truncate">
                            {language === "th" ? instructor.name : instructor.nameEn}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {instructor.title}
                          </p>
                          {instructor.email && (
                            <p className="text-xs text-muted-foreground truncate">
                              {instructor.email}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("แท็ก", "Tags")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {((course as any).tags || []).map((tag: string) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Course Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("ภาพรวมคอร์ส", "Course Overview")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-muted-foreground" />
                    <p className="text-sm font-medium">
                      {t("จำนวนผู้เข้าชม", "View Count")}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {(course.enrollCount || 0).toLocaleString()} {t("ครั้ง", "times")}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Library className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <p className="text-sm font-medium">
                      {t("หมวดหมู่รายวิชา", "Category")}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground text-right">
                    {(() => {
                      const courseCategories = (course as any).courseCategories || [];
                      const categoryNames = courseCategories
                        .map((cc: any) => {
                          const cat = categories.find(c => c.id === cc.categoryId);
                          return cat ? (language === "th" ? cat.name : cat.nameEn) : null;
                        })
                        .filter(Boolean)
                        .join(", ");
                      return categoryNames || t("ไม่ระบุ", "Not specified");
                    })()}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <BarChart className="h-5 w-5 text-muted-foreground" />
                    <p className="text-sm font-medium">
                      {t("ระดับ", "Level")}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {getLevelLabel(course.level)}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <p className="text-sm font-medium">
                      {t("ภาษา", "Language")}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {getLanguageLabel((course as any).language || 'th')}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <p className="text-sm font-medium">
                      {t("ระยะเวลา", "Duration")}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {course.durationHours} {t("ชั่วโมง", "hours")}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <p className="text-sm font-medium">
                      {t("ปีที่พัฒนา", "Development Year")}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {(course as any).developmentYear || new Date().getFullYear()}
                  </p>
                </div>

                {course.hasCertificate && (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-muted-foreground" />
                      <p className="text-sm font-medium">
                        {t("ใบรับรอง", "Certificate")}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t("มีใบรับรอง", "Available")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* For Students */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("สำหรับผู้เรียน", "For Students")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">
                      {t("กลุ่มเป้าหมาย", "Target Audience")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {(course as any).targetAudience || t('ทุกคน', 'Everyone')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <BookOpen className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">
                      {t("ความรู้พื้นฐาน", "Prerequisites")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {(course as any).prerequisites || t('ไม่มี', 'None')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">
                      {t("เกณฑ์การประเมิน", "Assessment Criteria")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {(course as any).assessmentCriteria || t("ไม่ระบุ", "Not specified")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Share */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("แชร์คอร์สนี้", "Share This Course")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.open(
                        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                          shareUrl
                        )}`,
                        "_blank"
                      )
                    }
                  >
                    <Facebook className="h-4 w-4 mr-2" />
                    Facebook
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.open(
                        `https://twitter.com/intent/tweet?url=${encodeURIComponent(
                          shareUrl
                        )}&text=${encodeURIComponent(shareTitle)}`,
                        "_blank"
                      )
                    }
                  >
                    <Twitter className="h-4 w-4 mr-2" />
                    X
                  </Button>
                  <Button variant="outline" size="sm">
                    <Instagram className="h-4 w-4 mr-2" />
                    Instagram
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.open(
                        `https://line.me/R/msg/text/?${encodeURIComponent(
                          `${shareTitle} ${shareUrl}`
                        )}`,
                        "_blank"
                      )
                    }
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Line
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
