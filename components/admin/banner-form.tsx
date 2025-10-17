"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import type { Banner } from "@/lib/types";

interface BannerFormProps {
  banner?: Banner;
  language: "th" | "en";
}

export function BannerForm({ banner, language }: BannerFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: banner?.title || "",
    titleEn: banner?.titleEn || "",
    subtitle: banner?.subtitle || "",
    subtitleEn: banner?.subtitleEn || "",
    description: banner?.description || "",
    descriptionEn: banner?.descriptionEn || "",
    buttonText: banner?.buttonText || "",
    buttonTextEn: banner?.buttonTextEn || "",
    imageId: banner?.imageId || "",
    linkUrl: banner?.linkUrl || "",
    backgroundColor: banner?.backgroundColor || "#667eea",
    textColor: banner?.textColor || "#ffffff",
    accentColor: banner?.accentColor || "#fbbf24",
    templateId: banner?.templateId || "hero-centered",
  });

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = banner ? `/api/banners/${banner.id}` : "/api/banners";
      const method = banner ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          isActive: true,
          order: 0,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Failed to save banner";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          const errorText = await response.text();
          errorMessage = errorText || `Server error: ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      router.push("/admin/banners");
      router.refresh();
    } catch (error) {
      console.error("Error saving banner:", error);
      alert(`Failed to save banner: ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {banner
              ? language === "th" ? "แก้ไข Banner" : "Edit Banner"
              : language === "th" ? "สร้าง Banner" : "Create Banner"}
          </h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/banners">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {language === "th" ? "กลับ" : "Back"}
            </Link>
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading
              ? language === "th" ? "กำลังบันทึก..." : "Saving..."
              : language === "th" ? "บันทึก" : "Save"}
          </Button>
        </div>
      </div>

      {/* Template Selection */}
      <Card>
        <CardHeader>
          <CardTitle>{language === "th" ? "เลือก Template" : "Select Template"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{language === "th" ? "รูปแบบ Banner" : "Banner Layout"}</Label>
            <div className="grid grid-cols-2 gap-4">
              <div
                onClick={() => handleChange("templateId", "hero-centered")}
                className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${
                  formData.templateId === "hero-centered"
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div
                    className={`w-4 h-4 rounded-full border-2 ${
                      formData.templateId === "hero-centered"
                        ? "border-primary bg-primary"
                        : "border-gray-300"
                    }`}
                  />
                  <span className="font-medium">
                    {language === "th" ? "Hero แบบกลาง" : "Centered Hero"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {language === "th"
                    ? "ข้อความอยู่กลาง เหมาะสำหรับประกาศสำคัญ"
                    : "Centered text, perfect for announcements"}
                </p>
              </div>

              <div
                onClick={() => handleChange("templateId", "hero-split")}
                className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${
                  formData.templateId === "hero-split"
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div
                    className={`w-4 h-4 rounded-full border-2 ${
                      formData.templateId === "hero-split"
                        ? "border-primary bg-primary"
                        : "border-gray-300"
                    }`}
                  />
                  <span className="font-medium">
                    {language === "th" ? "Hero แบบแบ่งครึ่ง" : "Split Hero"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {language === "th"
                    ? "ข้อความด้านซ้าย รูปภาพด้านขวา"
                    : "Text left, image right"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>{language === "th" ? "ตัวอย่าง" : "Preview"}</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-hidden">
          <section className="relative h-[500px] overflow-hidden">
            <div
              className="absolute inset-0"
              style={{
                background: formData.backgroundColor?.includes("gradient")
                  ? formData.backgroundColor
                  : formData.backgroundColor || "#667eea",
              }}
            >
              {formData.templateId === "hero-split" ? (
                // Split Layout: Text left, Image right (เหมือนหน้าหลัก)
                <div className="relative h-full flex items-stretch">
                  <div className="container mx-auto grid md:grid-cols-2 gap-0 w-full">
                    {/* Left: Content */}
                    <div className="flex items-center px-4">
                      <div>
                        <h1
                          className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
                          style={{ color: formData.textColor || "#ffffff" }}
                        >
                          {language === "th" ? (formData.title || "หัวข้อ") : (formData.titleEn || "Title")}
                        </h1>

                        {(formData.subtitle || formData.subtitleEn) && (
                          <p
                            className="text-lg md:text-xl mb-4"
                            style={{ color: formData.textColor || "#ffffff" }}
                          >
                            {language === "th" ? formData.subtitle : formData.subtitleEn}
                          </p>
                        )}

                        {(formData.description || formData.descriptionEn) && (
                          <p
                            className="text-base mb-6 opacity-90"
                            style={{ color: formData.textColor || "#ffffff" }}
                          >
                            {language === "th" ? formData.description : formData.descriptionEn}
                          </p>
                        )}

                        {(formData.buttonText || formData.buttonTextEn) && (
                          <button
                            type="button"
                            className="text-lg px-8 py-3 rounded-[5px] font-semibold inline-flex items-center"
                            style={{
                              backgroundColor: formData.accentColor || "#fbbf24",
                              color: formData.textColor || "#ffffff",
                            }}
                          >
                            {language === "th"
                              ? (formData.buttonText || "เรียนรู้เพิ่มเติม")
                              : (formData.buttonTextEn || "Learn More")}
                            <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Right: Image (ชิดขอบบน ล่าง ขวา ไม่มีโค้งมน) */}
                    {formData.imageId ? (
                      <div className="relative h-full">
                        <img
                          src={formData.imageId}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="relative h-full bg-gray-200 flex items-center justify-center">
                        <div className="text-gray-400 text-center">
                          <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-sm">{language === "th" ? "รูปภาพ" : "Image"}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Centered Layout (default)
                <>
                  {/* Background Image (if exists) */}
                  {formData.imageId && (
                    <div className="absolute inset-0">
                      <img
                        src={formData.imageId}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="relative h-full flex items-center">
                    <div className="container mx-auto px-4">
                      <div className="max-w-3xl mx-auto text-center">
                        <h1
                          className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
                          style={{ color: formData.textColor || "#ffffff" }}
                        >
                          {language === "th" ? (formData.title || "หัวข้อ") : (formData.titleEn || "Title")}
                        </h1>

                        {(formData.subtitle || formData.subtitleEn) && (
                          <p
                            className="text-xl md:text-2xl mb-4"
                            style={{ color: formData.textColor || "#ffffff" }}
                          >
                            {language === "th" ? formData.subtitle : formData.subtitleEn}
                          </p>
                        )}

                        {(formData.description || formData.descriptionEn) && (
                          <p
                            className="text-base md:text-lg mb-6 opacity-90"
                            style={{ color: formData.textColor || "#ffffff" }}
                          >
                            {language === "th" ? formData.description : formData.descriptionEn}
                          </p>
                        )}

                        {(formData.buttonText || formData.buttonTextEn) && (
                          <button
                            type="button"
                            className="text-lg px-8 py-3 rounded-[5px] font-semibold inline-flex items-center"
                            style={{
                              backgroundColor: formData.accentColor || "#fbbf24",
                              color: formData.textColor || "#ffffff",
                            }}
                          >
                            {language === "th"
                              ? (formData.buttonText || "เรียนรู้เพิ่มเติม")
                              : (formData.buttonTextEn || "Learn More")}
                            <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>
        </CardContent>
      </Card>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>{language === "th" ? "ข้อมูลพื้นฐาน" : "Basic Information"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">{language === "th" ? "หัวข้อ (ไทย)" : "Title (Thai)"} *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="titleEn">{language === "th" ? "หัวข้อ (อังกฤษ)" : "Title (English)"} *</Label>
              <Input
                id="titleEn"
                value={formData.titleEn}
                onChange={(e) => handleChange("titleEn", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subtitle">{language === "th" ? "หัวข้อรอง (ไทย)" : "Subtitle (Thai)"}</Label>
              <Input
                id="subtitle"
                value={formData.subtitle}
                onChange={(e) => handleChange("subtitle", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subtitleEn">{language === "th" ? "หัวข้อรอง (อังกฤษ)" : "Subtitle (English)"}</Label>
              <Input
                id="subtitleEn"
                value={formData.subtitleEn}
                onChange={(e) => handleChange("subtitleEn", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description">{language === "th" ? "รายละเอียด (ไทย)" : "Description (Thai)"}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descriptionEn">{language === "th" ? "รายละเอียด (อังกฤษ)" : "Description (English)"}</Label>
              <Textarea
                id="descriptionEn"
                value={formData.descriptionEn}
                onChange={(e) => handleChange("descriptionEn", e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageId">{language === "th" ? "URL รูปภาพ" : "Image URL"}</Label>
            <div className="flex gap-2">
              <Input
                id="imageId"
                value={formData.imageId}
                onChange={(e) => handleChange("imageId", e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                disabled={uploading}
                onClick={async () => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*";
                  input.onchange = async (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      setUploading(true);
                      try {
                        const formData = new FormData();
                        formData.append("file", file);

                        const response = await fetch("/api/upload", {
                          method: "POST",
                          body: formData,
                        });

                        if (!response.ok) {
                          throw new Error("Upload failed");
                        }

                        const data = await response.json();
                        if (data.success && data.url) {
                          handleChange("imageId", data.url);
                        } else {
                          throw new Error(data.error || "Upload failed");
                        }
                      } catch (error) {
                        console.error("Upload error:", error);
                        alert(
                          language === "th"
                            ? "ไม่สามารถอัพโหลดไฟล์ได้ กรุณาลองใหม่อีกครั้ง"
                            : "Failed to upload file. Please try again."
                        );
                      } finally {
                        setUploading(false);
                      }
                    }
                  };
                  input.click();
                }}
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                {uploading
                  ? (language === "th" ? "กำลังอัพโหลด..." : "Uploading...")
                  : (language === "th" ? "อัพโหลด" : "Upload")}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {language === "th"
                ? "สำหรับ Hero แบบแบ่งครึ่ง: รูปภาพจะแสดงด้านขวา | สำหรับ Hero แบบกลาง: รูปภาพจะเป็น background"
                : "For Split Hero: Image shows on right | For Centered Hero: Image as background"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Button Settings */}
      <Card>
        <CardHeader>
          <CardTitle>{language === "th" ? "การตั้งค่าปุ่ม" : "Button Settings"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="buttonText">{language === "th" ? "ข้อความปุ่ม (ไทย)" : "Button Text (Thai)"}</Label>
              <Input
                id="buttonText"
                value={formData.buttonText}
                onChange={(e) => handleChange("buttonText", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buttonTextEn">{language === "th" ? "ข้อความปุ่ม (อังกฤษ)" : "Button Text (English)"}</Label>
              <Input
                id="buttonTextEn"
                value={formData.buttonTextEn}
                onChange={(e) => handleChange("buttonTextEn", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkUrl">{language === "th" ? "ลิงก์ปุ่ม" : "Button Link"}</Label>
            <Input
              id="linkUrl"
              value={formData.linkUrl}
              onChange={(e) => handleChange("linkUrl", e.target.value)}
              placeholder="https://example.com"
            />
          </div>
        </CardContent>
      </Card>

      {/* Colors */}
      <Card>
        <CardHeader>
          <CardTitle>{language === "th" ? "สีและรูปแบบ" : "Colors & Style"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="backgroundColor">{language === "th" ? "สีพื้นหลัง" : "Background Color"}</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={formData.backgroundColor?.includes("gradient") ? "#667eea" : formData.backgroundColor}
                  onChange={(e) => handleChange("backgroundColor", e.target.value)}
                  className="w-16 h-10"
                />
                <Input
                  value={formData.backgroundColor}
                  onChange={(e) => handleChange("backgroundColor", e.target.value)}
                  placeholder="#ffffff or gradient"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="textColor">{language === "th" ? "สีข้อความ" : "Text Color"}</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={formData.textColor}
                  onChange={(e) => handleChange("textColor", e.target.value)}
                  className="w-16 h-10"
                />
                <Input
                  value={formData.textColor}
                  onChange={(e) => handleChange("textColor", e.target.value)}
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accentColor">{language === "th" ? "สีเน้น (ปุ่ม)" : "Accent Color (Button)"}</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={formData.accentColor}
                  onChange={(e) => handleChange("accentColor", e.target.value)}
                  className="w-16 h-10"
                />
                <Input
                  value={formData.accentColor}
                  onChange={(e) => handleChange("accentColor", e.target.value)}
                  placeholder="#ff0000"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
