"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import type { Course, Category, CourseType, Instructor, Institution, ContentTopic } from "@/lib/types";
import { SafeImage } from "@/components/safe-image";
import { Upload, X, Plus, Trash2 } from "lucide-react";
import { nanoid } from "nanoid";

interface CourseFormProps {
  course?: Course;
  categories: Category[];
  courseTypes: CourseType[];
  instructors: Instructor[];
  institutions: Institution[];
}

export function CourseForm({
  course,
  categories,
  courseTypes,
  instructors,
  institutions,
}: CourseFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: course?.title || "",
    titleEn: course?.titleEn || "",
    description: course?.description || "",
    learningOutcomes: course?.learningOutcomes || "",
    targetAudience: course?.targetAudience || "",
    prerequisites: course?.prerequisites || "",
    tags: course?.tags || "",
    assessmentCriteria: course?.assessmentCriteria || "",
    courseUrl: course?.courseUrl || "",
    videoUrl: course?.videoUrl || "",
    institutionId: course?.institutionId || "",
    imageId: course?.imageId || "",
    bannerImageId: course?.bannerImageId || "",
    level: course?.level || "Beginner",
    teachingLanguage: course?.teachingLanguage || "",
    durationHours: course?.durationHours || 0,
    hasCertificate: course?.hasCertificate || false,
  });

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    course?.categoryIds || []
  );

  const [selectedCourseTypes, setSelectedCourseTypes] = useState<string[]>(
    course?.courseTypeIds || []
  );

  const [selectedInstructors, setSelectedInstructors] = useState<string[]>(() => {
    const initial = course?.instructorId ? [course.instructorId] : [];
    console.log('Initial instructors:', initial, 'course.instructorId:', course?.instructorId);
    return initial;
  });

  const [instructorSearch, setInstructorSearch] = useState("");

  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [bannerPreview, setBannerPreview] = useState<string>("");

  // Parse learning outcomes from JSON string to array
  const parseLearningOutcomes = (outcomeString: string): string[] => {
    if (!outcomeString) return [];
    try {
      return JSON.parse(outcomeString);
    } catch {
      return [];
    }
  };

  // Parse content structure from JSON string to array
  const parseContentStructure = (structureString: string): ContentTopic[] => {
    if (!structureString) return [];
    try {
      return JSON.parse(structureString);
    } catch {
      return [];
    }
  };

  const [contentTopics, setContentTopics] = useState<ContentTopic[]>(
    parseContentStructure(course?.contentStructure || "")
  );

  const [learningOutcomes, setLearningOutcomes] = useState<string[]>(
    parseLearningOutcomes(course?.learningOutcomes || "")
  );

  // Get current image URLs from course data
  const getCurrentThumbnail = () => {
    if (thumbnailPreview) return thumbnailPreview;
    if (formData.imageId && isValidImageUrl(formData.imageId)) return formData.imageId;
    return "";
  };

  const getCurrentBanner = () => {
    if (bannerPreview) return bannerPreview;
    if (formData.bannerImageId && isValidImageUrl(formData.bannerImageId)) return formData.bannerImageId;
    return "";
  };

  // Helper function to check if a string is a valid URL
  const isValidImageUrl = (url: string | null | undefined): boolean => {
    if (!url) return false;
    return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = course
        ? `/api/courses/${course.id}`
        : "/api/courses";
      const method = course ? "PATCH" : "POST";

      // Prepare data with learning outcomes and content structure as JSON string
      const submitData = {
        ...formData,
        instructorId: selectedInstructors.length > 0 ? selectedInstructors[0] : "",
        instructorIds: selectedInstructors,
        learningOutcomes: learningOutcomes.length > 0 ? JSON.stringify(learningOutcomes) : "",
        contentStructure: contentTopics.length > 0 ? JSON.stringify(contentTopics) : "",
        categoryIds: selectedCategories,
        courseTypeIds: selectedCourseTypes,
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save course");
      }

      router.push("/admin/courses");
      router.refresh();
    } catch (error) {
      console.error("Error saving course:", error);
      alert(error instanceof Error ? error.message : "Failed to save course. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    field: string,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Upload failed:", errorData);
        throw new Error(errorData.error || "Failed to upload image");
      }

      const data = await response.json();
      setThumbnailPreview(data.url);
      handleChange("imageId", data.url);
    } catch (error) {
      console.error("Upload error:", error);
      alert(error instanceof Error ? error.message : "Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBannerUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Banner upload failed:", errorData);
        throw new Error(errorData.error || "Failed to upload banner image");
      }

      const data = await response.json();
      setBannerPreview(data.url);
      handleChange("bannerImageId", data.url);
    } catch (error) {
      console.error("Banner upload error:", error);
      alert(error instanceof Error ? error.message : "Failed to upload banner image. Please try again.");
    } finally {
      setBannerUploading(false);
    }
  };

  const removeThumbnail = () => {
    setThumbnailPreview("");
    handleChange("imageId", "");
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = "";
    }
  };

  const removeBanner = () => {
    setBannerPreview("");
    handleChange("bannerImageId", "");
    if (bannerInputRef.current) {
      bannerInputRef.current.value = "";
    }
  };

  // Learning Outcomes handlers
  const addLearningOutcome = () => {
    setLearningOutcomes([...learningOutcomes, ""]);
  };

  const updateLearningOutcome = (index: number, value: string) => {
    const updated = [...learningOutcomes];
    updated[index] = value;
    setLearningOutcomes(updated);
  };

  const removeLearningOutcome = (index: number) => {
    setLearningOutcomes(learningOutcomes.filter((_, i) => i !== index));
  };

  // Category handlers
  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Course Type handlers
  const toggleCourseType = (courseTypeId: string) => {
    setSelectedCourseTypes((prev) =>
      prev.includes(courseTypeId)
        ? prev.filter((id) => id !== courseTypeId)
        : [...prev, courseTypeId]
    );
  };

  // Instructor handlers
  const addInstructor = (instructorId: string) => {
    if (!selectedInstructors.includes(instructorId)) {
      setSelectedInstructors([...selectedInstructors, instructorId]);
      setInstructorSearch("");
    }
  };

  const removeInstructor = (instructorId: string) => {
    setSelectedInstructors(selectedInstructors.filter((id) => id !== instructorId));
  };

  const filteredInstructors = instructors.filter((instructor) =>
    instructor.name.toLowerCase().includes(instructorSearch.toLowerCase()) ||
    instructor.nameEn.toLowerCase().includes(instructorSearch.toLowerCase())
  );

  // Content Structure handlers
  const addMainTopic = () => {
    setContentTopics([
      ...contentTopics,
      {
        id: `topic-${nanoid(10)}`,
        title: "",
        subtopics: [],
      },
    ]);
  };

  const removeMainTopic = (index: number) => {
    setContentTopics(contentTopics.filter((_, i) => i !== index));
  };

  const updateMainTopic = (index: number, title: string) => {
    const updated = [...contentTopics];
    updated[index].title = title;
    setContentTopics(updated);
  };

  const addSubtopic = (topicIndex: number) => {
    const updated = [...contentTopics];
    updated[topicIndex].subtopics.push("");
    setContentTopics(updated);
  };

  const removeSubtopic = (topicIndex: number, subIndex: number) => {
    const updated = [...contentTopics];
    updated[topicIndex].subtopics = updated[topicIndex].subtopics.filter(
      (_, i) => i !== subIndex
    );
    setContentTopics(updated);
  };

  const updateSubtopic = (topicIndex: number, subIndex: number, value: string) => {
    const updated = [...contentTopics];
    updated[topicIndex].subtopics[subIndex] = value;
    setContentTopics(updated);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title (TH) *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="titleEn">Title (EN) *</Label>
                <Input
                  id="titleEn"
                  value={formData.titleEn}
                  onChange={(e) => handleChange("titleEn", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={4}
                required
              />
            </div>

            {/* Learning Outcomes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Learning Outcomes (วัตถุประสงค์การเรียนรู้)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addLearningOutcome}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Outcome
                </Button>
              </div>
              {learningOutcomes.length > 0 && (
                <div className="space-y-2 border rounded-lg p-4 bg-gray-50">
                  {learningOutcomes.map((outcome, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <div className="flex-shrink-0 w-8 pt-2 text-sm text-gray-500">
                        {index + 1}.
                      </div>
                      <Input
                        value={outcome}
                        onChange={(e) => updateLearningOutcome(index, e.target.value)}
                        placeholder="Enter learning outcome..."
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLearningOutcome(index)}
                        className="flex-shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Categories Checkboxes */}
            <div className="space-y-2">
              <Label>Categories (หมวดหมู่) *</Label>
              <div className="grid grid-cols-3 gap-4 border rounded-lg p-4 bg-gray-50">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`category-${category.id}`}
                      checked={selectedCategories.includes(category.id)}
                      onChange={() => toggleCategory(category.id)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label
                      htmlFor={`category-${category.id}`}
                      className="cursor-pointer font-normal"
                    >
                      {category.name}
                    </Label>
                  </div>
                ))}
              </div>
              {selectedCategories.length === 0 && (
                <p className="text-sm text-red-500">Please select at least one category</p>
              )}
            </div>

            {/* Course Types */}
            <div className="space-y-2">
              <Label>ประเภทรายวิชา (Course Types)</Label>
              <div className="grid grid-cols-3 gap-4 mt-2">
                {courseTypes.map((courseType) => (
                  <div key={courseType.id} className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      id={`courseType-${courseType.id}`}
                      checked={selectedCourseTypes.includes(courseType.id)}
                      onChange={() => toggleCourseType(courseType.id)}
                      className="h-4 w-4 mt-1 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label
                      htmlFor={`courseType-${courseType.id}`}
                      className="text-sm cursor-pointer"
                    >
                      {courseType.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Level and Teaching Language */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="level">Level *</Label>
                <Select
                  value={formData.level}
                  onValueChange={(value) => handleChange("level", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="teachingLanguage">Teaching Language (ภาษาที่ใช้สอน)</Label>
                <Input
                  id="teachingLanguage"
                  value={formData.teachingLanguage}
                  onChange={(e) => handleChange("teachingLanguage", e.target.value)}
                  placeholder="e.g., Thai, English, Thai/English"
                />
              </div>
            </div>

            {/* Duration and Recommended Media Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="durationHours">Duration (Hours) *</Label>
                <Input
                  id="durationHours"
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.durationHours}
                  onChange={(e) => handleChange("durationHours", parseFloat(e.target.value) || 0)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recommendedMediaDuration">
                  จำนวนสื่อที่เหมาะสม (Recommended Media Duration)
                </Label>
                <Input
                  id="recommendedMediaDuration"
                  type="text"
                  value={`${(formData.durationHours * 0.65).toFixed(2)} hours`}
                  disabled
                  className="bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  คำนวณจาก Duration × 65%
                </p>
              </div>
            </div>

            {/* Target Audience and Prerequisites */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetAudience">กลุ่มผู้เรียนเป้าหมาย (Target Audience)</Label>
                <Textarea
                  id="targetAudience"
                  value={formData.targetAudience}
                  onChange={(e) => handleChange("targetAudience", e.target.value)}
                  rows={3}
                  placeholder="เช่น นักศึกษา, ผู้ทำงาน, ผู้สนใจทั่วไป"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prerequisites">ความรู้พื้นฐานที่ร้องขอ (Prerequisites)</Label>
                <Textarea
                  id="prerequisites"
                  value={formData.prerequisites}
                  onChange={(e) => handleChange("prerequisites", e.target.value)}
                  rows={3}
                  placeholder="เช่น ความรู้พื้นฐานทางคณิตศาสตร์, ไม่ต้องมีความรู้มาก่อน"
                />
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">TAG</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => handleChange("tags", e.target.value)}
                placeholder="เช่น Programming, Web Development, Machine Learning (คั่นด้วย comma)"
              />
              <p className="text-xs text-gray-500 mt-1">
                แยก tags ด้วยเครื่องหมาย comma (,)
              </p>
            </div>

            {/* Assessment Criteria and Has Certificate */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assessmentCriteria">เกณฑ์การประเมิน</Label>
                <Input
                  id="assessmentCriteria"
                  value={formData.assessmentCriteria}
                  onChange={(e) => handleChange("assessmentCriteria", e.target.value)}
                  placeholder="เช่น 70%, 80% (คั่นด้วย comma)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  ระดับของคะแนนที่ผ่าน เช่น 70% เป็นต้น (แยก tags ด้วย comma)
                </p>
              </div>

              <div className="space-y-2">
                <Label>&nbsp;</Label>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="hasCertificate" className="text-base">
                      Has Certificate
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      เปิดใช้งานใบประกาศนียบัตรสำหรับรายวิชานี้
                    </p>
                  </div>
                  <Switch
                    id="hasCertificate"
                    checked={formData.hasCertificate}
                    onCheckedChange={(checked) => handleChange("hasCertificate", checked)}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="institutionId">Institution *</Label>
                <Select
                  value={formData.institutionId}
                  onValueChange={(value) => handleChange("institutionId", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select institution" />
                  </SelectTrigger>
                  <SelectContent>
                    {institutions.map((institution) => (
                      <SelectItem key={institution.id} value={institution.id}>
                        {institution.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Instructors *</Label>

                {/* Selected Instructors */}
                {selectedInstructors.length > 0 && (
                  <div className="space-y-2 border rounded-lg p-3 bg-gray-50">
                    {selectedInstructors.map((instructorId) => {
                      const instructor = instructors.find((i) => i.id === instructorId);
                      if (!instructor) return null;
                      return (
                        <div key={instructorId} className="flex items-center justify-between bg-white rounded-md p-2 border">
                          <span className="text-sm font-medium">{instructor.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeInstructor(instructorId)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Search and Add Instructor */}
                <div className="space-y-2">
                  <Input
                    placeholder="ค้นหา Instructor..."
                    value={instructorSearch}
                    onChange={(e) => setInstructorSearch(e.target.value)}
                  />
                  {instructorSearch && (
                    <div className="border rounded-lg max-h-48 overflow-y-auto">
                      {filteredInstructors.length > 0 ? (
                        filteredInstructors.map((instructor) => (
                          <button
                            key={instructor.id}
                            type="button"
                            onClick={() => addInstructor(instructor.id)}
                            disabled={selectedInstructors.includes(instructor.id)}
                            className={`w-full text-left px-3 py-2 hover:bg-gray-100 border-b last:border-b-0 ${
                              selectedInstructors.includes(instructor.id)
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : ""
                            }`}
                          >
                            <div className="text-sm font-medium">{instructor.name}</div>
                            <div className="text-xs text-gray-500">{instructor.nameEn}</div>
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-gray-500">ไม่พบ Instructor</div>
                      )}
                    </div>
                  )}
                </div>
                {selectedInstructors.length === 0 && (
                  <p className="text-sm text-red-500">Please select at least one instructor</p>
                )}
              </div>
            </div>

            {/* Course URL and Video URL */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="courseUrl">Course URL</Label>
                <Input
                  id="courseUrl"
                  type="url"
                  value={formData.courseUrl}
                  onChange={(e) => handleChange("courseUrl", e.target.value)}
                  placeholder="https://example.com/course"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="videoUrl">Video URL</Label>
                <Input
                  id="videoUrl"
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => handleChange("videoUrl", e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Structure */}
        <Card>
          <CardHeader>
            <CardTitle>โครงสร้างเนื้อหา (Content Structure)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {contentTopics.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                ยังไม่มีโครงสร้างเนื้อหา คลิกปุ่มด้านล่างเพื่อเพิ่มหัวข้อหลัก
              </p>
            ) : (
              <div className="space-y-6">
                {contentTopics.map((topic, topicIndex) => (
                  <div
                    key={topic.id}
                    className="border rounded-lg p-4 space-y-3 bg-gray-50"
                  >
                    {/* Main Topic */}
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <Label htmlFor={`topic-${topic.id}`}>
                          หัวข้อหลัก {topicIndex + 1}
                        </Label>
                        <div className="flex gap-2 mt-2">
                          <Input
                            id={`topic-${topic.id}`}
                            value={topic.title}
                            onChange={(e) =>
                              updateMainTopic(topicIndex, e.target.value)
                            }
                            placeholder="เช่น บทที่ 1: Introduction to Programming"
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeMainTopic(topicIndex)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Subtopics */}
                    {topic.subtopics.length > 0 && (
                      <div className="ml-6 space-y-2">
                        <Label className="text-sm text-muted-foreground">
                          หัวข้อย่อย
                        </Label>
                        {topic.subtopics.map((subtopic, subIndex) => (
                          <div key={subIndex} className="flex gap-2">
                            <Input
                              value={subtopic}
                              onChange={(e) =>
                                updateSubtopic(topicIndex, subIndex, e.target.value)
                              }
                              placeholder={`หัวข้อย่อยที่ ${subIndex + 1}`}
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => removeSubtopic(topicIndex, subIndex)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Subtopic Button */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addSubtopic(topicIndex)}
                      className="ml-6"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      เพิ่มหัวข้อย่อย
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Main Topic Button */}
            <Button
              type="button"
              variant="outline"
              onClick={addMainTopic}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              เพิ่มหัวข้อหลัก
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Course Thumbnail */}
            <div className="space-y-2">
              <Label>Course Thumbnail (16:9 ratio) *</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 max-w-md">
                {getCurrentThumbnail() ? (
                  <div className="relative">
                    <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden bg-gray-100">
                      <SafeImage
                        src={getCurrentThumbnail()}
                        alt="Course thumbnail"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={removeThumbnail}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => thumbnailInputRef.current?.click()}
                        disabled={uploading}
                      >
                        {uploading ? "Uploading..." : "Upload Thumbnail"}
                      </Button>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      PNG, JPG, WebP up to 10MB (Recommended: 1920x1080px)
                    </p>
                  </div>
                )}
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Banner Image */}
            <div className="space-y-2">
              <Label>Banner Course (21:9 ratio)</Label>
              <p className="text-sm text-gray-500">Optional - Large banner image displayed on course detail page</p>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                {getCurrentBanner() ? (
                  <div className="relative">
                    <div className="relative w-full aspect-[21/9] rounded-lg overflow-hidden bg-gray-100">
                      <SafeImage
                        src={getCurrentBanner()}
                        alt="Course banner"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={removeBanner}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => bannerInputRef.current?.click()}
                        disabled={bannerUploading}
                      >
                        {bannerUploading ? "Uploading..." : "Upload Banner"}
                      </Button>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      PNG, JPG, WebP up to 10MB (Recommended: 2560x1097px)
                    </p>
                  </div>
                )}
                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBannerUpload}
                  className="hidden"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || uploading || bannerUploading || selectedCategories.length === 0 || selectedInstructors.length === 0}
          >
            {loading ? "Saving..." : course ? "Update Course" : "Create Course"}
          </Button>
        </div>
      </div>
    </form>
  );
}
