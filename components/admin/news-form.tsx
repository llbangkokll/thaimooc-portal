"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { News } from "@/lib/types";

interface NewsFormProps {
  news?: News;
}

export function NewsForm({ news }: NewsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: news?.title || "",
    content: news?.content || "",
    imageId: news?.imageId || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = news ? `/api/news/${news.id}` : "/api/news";
      const method = news ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to save news");
      }

      router.push("/admin/news");
      router.refresh();
    } catch (error) {
      console.error("Error saving news:", error);
      alert("Failed to save news. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>News Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleChange("content", e.target.value)}
                required
                rows={10}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageId">Image ID</Label>
              <Input
                id="imageId"
                value={formData.imageId}
                onChange={(e) => handleChange("imageId", e.target.value)}
                placeholder="image-id"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : news ? "Update News" : "Create News"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/news")}
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
}
