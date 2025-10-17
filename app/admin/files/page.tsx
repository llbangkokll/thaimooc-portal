"use client";

import { useEffect, useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { SafeImage } from "@/components/safe-image";

interface FileItem {
  id: string;
  url: string;
  title: string;
  category: string;
}

export default function AdminFilesPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const [placeholdersRes, coursesRes, instructorsRes, newsRes, bannersRes] = await Promise.all([
        fetch('/api/image-placeholders').then(r => r.json()),
        fetch('/api/courses').then(r => r.json()),
        fetch('/api/instructors').then(r => r.json()),
        fetch('/api/news').then(r => r.json()),
        fetch('/api/banners').then(r => r.json()),
      ]);

      const placeholders = placeholdersRes.data || [];
      const courses = coursesRes.data || [];
      const instructors = instructorsRes.data || [];
      const news = newsRes.data || [];
      const banners = bannersRes.data || [];

      // Collect all uploaded files (actual URLs, not placeholders)
      const uploadedFiles: FileItem[] = [];

      // Helper function to check if it's an uploaded file (URL)
      const isUploadedFile = (url: string | null | undefined): boolean => {
        if (!url) return false;
        return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/uploads/');
      };

      // Collect Course Thumbnails
      courses.forEach((course: any) => {
        if (isUploadedFile(course.imageId)) {
          uploadedFiles.push({
            id: `course-thumb-${course.id}`,
            url: course.imageId,
            title: `Course Thumbnail: ${course.title}`,
            category: 'course-thumbnail',
          });
        }
        // Collect Course Banners
        if (isUploadedFile(course.bannerImageId)) {
          uploadedFiles.push({
            id: `course-banner-${course.id}`,
            url: course.bannerImageId!,
            title: `Course Banner: ${course.title}`,
            category: 'course-banner',
          });
        }
      });

      // Collect Instructor Images
      instructors.forEach((instructor: any) => {
        if (isUploadedFile(instructor.imageUrl)) {
          uploadedFiles.push({
            id: `instructor-${instructor.id}`,
            url: instructor.imageUrl!,
            title: `Instructor: ${instructor.name}`,
            category: 'instructor',
          });
        }
      });

      // Collect News Images
      news.forEach((newsItem: any) => {
        if (isUploadedFile(newsItem.imageId)) {
          uploadedFiles.push({
            id: `news-${newsItem.id}`,
            url: newsItem.imageId,
            title: `News: ${newsItem.title}`,
            category: 'news',
          });
        }
      });

      // Collect Banner Images
      banners.forEach((banner: any) => {
        if (isUploadedFile(banner.imageId)) {
          uploadedFiles.push({
            id: `banner-${banner.id}`,
            url: banner.imageId,
            title: `Banner: ${banner.title}`,
            category: 'banner',
          });
        }
      });

      // Combine placeholders and uploaded files
      const placeholderFiles: FileItem[] = placeholders.map((p: any) => ({
        id: p.id,
        url: p.url,
        title: p.title,
        category: p.category,
      }));

      setFiles([...placeholderFiles, ...uploadedFiles]);
    } catch (error) {
      console.error("Error loading files:", error);
      alert("Failed to load files");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (file: FileItem) => {
    if (!confirm(`Are you sure you want to delete "${file.title}"? This action cannot be undone.`)) {
      return;
    }

    setDeleting(file.id);
    try {
      if (file.url.startsWith('/uploads/')) {
        // Delete uploaded file
        const encodedUrl = encodeURIComponent(file.url);
        const response = await fetch(`/api/files/${encodedUrl}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to delete file');
        }
      } else {
        // Delete placeholder from database
        const response = await fetch(`/api/image-placeholders/${file.id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to delete placeholder');
        }
      }

      alert('File deleted successfully');
      // Reload files
      await loadFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete file');
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteAll = async () => {
    if (files.length === 0) {
      alert('No files to delete.');
      return;
    }

    if (!confirm(`Are you sure you want to delete ALL ${files.length} files? This action cannot be undone.`)) {
      return;
    }

    setDeleting('deleting-all');
    let successCount = 0;
    let errorCount = 0;

    for (const file of files) {
      try {
        if (file.url.startsWith('/uploads/')) {
          // Delete uploaded file
          const encodedUrl = encodeURIComponent(file.url);
          const response = await fetch(`/api/files/${encodedUrl}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
          }
        } else {
          // Delete placeholder from database
          const response = await fetch(`/api/image-placeholders/${file.id}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
          }
        }
      } catch (error) {
        console.error(`Error deleting ${file.title}:`, error);
        errorCount++;
      }
    }

    setDeleting(null);
    alert(`Deleted ${successCount} files successfully.${errorCount > 0 ? ` ${errorCount} files failed to delete.` : ''}`);

    // Reload files
    await loadFiles();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Files</h1>
            <p className="text-muted-foreground">Manage uploaded images and files</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <p>Loading files...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Files</h1>
          <p className="text-muted-foreground">Manage uploaded images and files</p>
        </div>
        <Button asChild>
          <Link href="/admin/files/new">
            <Plus className="h-4 w-4 mr-2" />
            Upload File
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            All Files ({files.length})
            {files.filter(f => f.url.startsWith('/uploads/')).length > 0 && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({files.filter(f => f.url.startsWith('/uploads/')).length} uploaded files)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Preview</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.map((file) => (
                <TableRow key={file.id}>
                  <TableCell>
                    <div className="w-24 h-16 relative rounded overflow-hidden bg-gray-100">
                      <SafeImage
                        src={file.url}
                        alt={file.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium max-w-xs">{file.title}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {file.id}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{file.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(file)}
                        disabled={deleting === file.id}
                      >
                        <Trash2 className={`h-4 w-4 ${deleting === file.id ? 'text-gray-400' : 'text-red-600'}`} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
