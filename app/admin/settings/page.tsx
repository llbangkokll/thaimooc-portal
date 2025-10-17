"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Upload, X } from "lucide-react";
import type { WebAppSettings } from "@/lib/types";
import Image from "next/image";

export default function AdminSettingsPage() {
  const [formData, setFormData] = useState<WebAppSettings>({
    id: "",
    siteName: "",
    siteLogo: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    aboutUs: "",
    aboutUsEn: "",
    mapUrl: "",
    facebookUrl: "",
    twitterUrl: "",
    youtubeUrl: "",
    instagramUrl: "",
    lineUrl: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    async function checkAccess() {
      try {
        const response = await fetch("/api/auth/session");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            setUserRole(data.user.role);
            if (data.user.role !== 'super_admin') {
              setAccessDenied(true);
              setLoading(false);
              return;
            }
          }
        }
      } catch (error) {
        console.error("Failed to check access:", error);
      }
    }

    async function loadSettings() {
      try {
        const response = await fetch("/api/settings");
        const data = await response.json();
        setFormData(data);
        setLogoPreview(data.siteLogo);
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setLoading(false);
      }
    }

    checkAccess().then(() => {
      if (!accessDenied) {
        loadSettings();
      }
    });
  }, [accessDenied]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("File size must be less than 2MB");
      return;
    }

    setUploading(true);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append("file", file);

      // Upload to API
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      const imageUrl = data.url;

      // Update form data and preview
      setFormData((prev) => ({ ...prev, siteLogo: imageUrl }));
      setLogoPreview(imageUrl);

      alert("Logo uploaded successfully!");
    } catch (error) {
      console.error("Failed to upload logo:", error);
      alert("Failed to upload logo. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    setFormData((prev) => ({ ...prev, siteLogo: "" }));
    setLogoPreview("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Settings saved successfully!");
      } else {
        alert("Failed to save settings");
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              คุณไม่มีสิทธิ์เข้าถึงหน้านี้ เฉพาะ Super Admin เท่านั้นที่สามารถจัดการ Settings ได้
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Your role: <span className="font-medium">{userRole === 'admin' ? 'Admin' : userRole}</span>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage web application settings</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={formData.siteName}
                onChange={(e) =>
                  setFormData({ ...formData, siteName: e.target.value })
                }
                placeholder="ThaiMOOC - แพลตฟอร์มการเรียนรู้ออนไลน์"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="siteLogo">Site Logo</Label>

              {logoPreview && (
                <div className="relative w-48 h-24 border rounded-lg overflow-hidden bg-gray-50">
                  <Image
                    src={logoPreview}
                    alt="Logo Preview"
                    fill
                    className="object-contain p-2"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  id="logoFile"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={uploading}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploading}
                  onClick={() => document.getElementById("logoFile")?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
              </div>

              <Input
                id="siteLogo"
                value={formData.siteLogo}
                onChange={(e) =>
                  setFormData({ ...formData, siteLogo: e.target.value })
                }
                placeholder="/logo.png or image URL"
                className="text-xs"
              />
              <p className="text-xs text-muted-foreground">
                Upload an image or enter a URL manually
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) =>
                  setFormData({ ...formData, contactEmail: e.target.value })
                }
                placeholder="contact@thaimooc.org"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                value={formData.contactPhone}
                onChange={(e) =>
                  setFormData({ ...formData, contactPhone: e.target.value })
                }
                placeholder="02-123-4567"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="เลขที่ 123 ถนนพญาไท เขตปทุมวัน กรุงเทพมหานคร 10330"
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="aboutUs">About Us (Thai)</Label>
              <Textarea
                id="aboutUs"
                value={formData.aboutUs || ""}
                onChange={(e) =>
                  setFormData({ ...formData, aboutUs: e.target.value })
                }
                placeholder="Thai MOOC เป็นแพลตฟอร์มการเรียนรู้ออนไลน์..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="aboutUsEn">About Us (English)</Label>
              <Textarea
                id="aboutUsEn"
                value={formData.aboutUsEn || ""}
                onChange={(e) =>
                  setFormData({ ...formData, aboutUsEn: e.target.value })
                }
                placeholder="Thai MOOC is an online learning platform..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mapUrl">Map URL (Google Maps Embed)</Label>
              <Input
                id="mapUrl"
                value={formData.mapUrl || ""}
                onChange={(e) =>
                  setFormData({ ...formData, mapUrl: e.target.value })
                }
                placeholder="https://www.google.com/maps/embed?pb=..."
              />
              <p className="text-xs text-muted-foreground">
                Get embed URL from Google Maps: Share → Embed a map → Copy HTML
              </p>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Social Media</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="facebookUrl">Facebook URL</Label>
              <Input
                id="facebookUrl"
                value={formData.facebookUrl || ""}
                onChange={(e) =>
                  setFormData({ ...formData, facebookUrl: e.target.value })
                }
                placeholder="https://facebook.com/thaimooc"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitterUrl">Twitter (X) URL</Label>
              <Input
                id="twitterUrl"
                value={formData.twitterUrl || ""}
                onChange={(e) =>
                  setFormData({ ...formData, twitterUrl: e.target.value })
                }
                placeholder="https://twitter.com/thaimooc"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="youtubeUrl">YouTube URL</Label>
              <Input
                id="youtubeUrl"
                value={formData.youtubeUrl || ""}
                onChange={(e) =>
                  setFormData({ ...formData, youtubeUrl: e.target.value })
                }
                placeholder="https://youtube.com/@thaimooc"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagramUrl">Instagram URL</Label>
              <Input
                id="instagramUrl"
                value={formData.instagramUrl || ""}
                onChange={(e) =>
                  setFormData({ ...formData, instagramUrl: e.target.value })
                }
                placeholder="https://instagram.com/thaimooc"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lineUrl">LINE URL</Label>
              <Input
                id="lineUrl"
                value={formData.lineUrl || ""}
                onChange={(e) =>
                  setFormData({ ...formData, lineUrl: e.target.value })
                }
                placeholder="https://line.me/ti/p/@thaimooc"
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
