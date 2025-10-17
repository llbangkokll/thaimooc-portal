import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderTree, Globe, Server, Database, Layout, Code } from "lucide-react";

export default function AdminStructurePage() {
  const backendRoutes = [
    { path: "/admin", description: "Admin Dashboard" },
    { path: "/admin/courses", description: "Courses Management (with CSV Import/Export)" },
    { path: "/admin/courses/new", description: "Create New Course" },
    { path: "/admin/courses/[id]", description: "Edit Course" },
    { path: "/admin/categories", description: "Categories Management (with CSV Export)" },
    { path: "/admin/categories/new", description: "Create New Category" },
    { path: "/admin/categories/[id]", description: "Edit Category" },
    { path: "/admin/course-types", description: "Course Types Management" },
    { path: "/admin/course-types/new", description: "Create New Course Type" },
    { path: "/admin/course-types/[id]", description: "Edit Course Type" },
    { path: "/admin/instructors", description: "Instructors Management (with CSV Import)" },
    { path: "/admin/instructors/new", description: "Create New Instructor" },
    { path: "/admin/instructors/[id]", description: "Edit Instructor" },
    { path: "/admin/institutions", description: "Institutions Management (with CSV Import/Export)" },
    { path: "/admin/institutions/new", description: "Create New Institution" },
    { path: "/admin/institutions/[id]", description: "Edit Institution" },
    { path: "/admin/news", description: "News Management" },
    { path: "/admin/news/new", description: "Create New News" },
    { path: "/admin/news/[id]", description: "Edit News" },
    { path: "/admin/banners", description: "Banners Management" },
    { path: "/admin/banners/new", description: "Create New Banner" },
    { path: "/admin/banners/[id]", description: "Edit Banner" },
    { path: "/admin/files", description: "Files Management" },
    { path: "/admin/settings", description: "Web Application Settings" },
    { path: "/admin/structure", description: "Application Structure (Current)" },
  ];

  const frontendRoutes = [
    { path: "/", description: "Homepage (หน้าหลัก)" },
    { path: "/courses", description: "Courses Listing (รายวิชาทั้งหมด)" },
    { path: "/courses/[id]", description: "Course Detail Page" },
    { path: "/institutions", description: "Institutions Listing (สถาบันผู้พัฒนา)" },
    { path: "/institutions/[id]", description: "Institution Detail Page" },
    { path: "/news", description: "News Listing (ข่าวประชาสัมพันธ์)" },
    { path: "/news/[id]", description: "News Detail Page" },
    { path: "/contact", description: "Contact Page (ติดต่อเรา)" },
  ];

  const apiRoutes = [
    { path: "/api/courses", description: "GET, POST - Courses CRUD (includes courseCategories, courseCourseTypes)" },
    { path: "/api/courses/[id]", description: "GET, PATCH, DELETE - Single Course" },
    { path: "/api/courses/import", description: "POST - CSV Import Courses" },
    { path: "/api/categories", description: "GET, POST - Categories CRUD (2-digit ID)" },
    { path: "/api/categories/[id]", description: "GET, PUT, DELETE - Single Category" },
    { path: "/api/course-types", description: "GET, POST - Course Types CRUD (with icon)" },
    { path: "/api/course-types/[id]", description: "GET, PUT, DELETE - Single Course Type" },
    { path: "/api/instructors", description: "GET, POST - Instructors CRUD (with title, email)" },
    { path: "/api/instructors/[id]", description: "GET, PUT, DELETE - Single Instructor" },
    { path: "/api/instructors/import", description: "POST - CSV Import Instructors" },
    { path: "/api/institutions", description: "GET, POST - Institutions CRUD (YYNNN ID format)" },
    { path: "/api/institutions/[id]", description: "GET, PUT, DELETE - Single Institution" },
    { path: "/api/institutions/import", description: "POST - CSV Import Institutions" },
    { path: "/api/news", description: "GET, POST - News CRUD" },
    { path: "/api/news/[id]", description: "GET, PUT, DELETE - Single News" },
    { path: "/api/banners", description: "GET, POST - Banners CRUD" },
    { path: "/api/banners/[id]", description: "GET, PUT, DELETE - Single Banner" },
    { path: "/api/image-placeholders", description: "GET - Image Placeholders" },
    { path: "/api/settings", description: "GET, PUT - Web App Settings" },
  ];

  const dataModels = [
    {
      name: "courses",
      fields: [
        "id (CUID), title, titleEn, description",
        "learningOutcomes (JSON), targetAudience, prerequisites",
        "tags (JSON), courseUrl, videoUrl, contentStructure (JSON)",
        "institutionId, instructorId, imageId",
        "level, teachingLanguage, durationHours",
        "hasCertificate, enrollCount, createdAt, updatedAt",
      ],
    },
    {
      name: "categories",
      fields: [
        "id (2-digit: 01-12), name, nameEn",
        "icon (Lucide), description, createdAt, updatedAt",
      ],
    },
    {
      name: "course_types",
      fields: [
        "id (CUID), name, nameEn, icon (Lucide)",
        "description, createdAt, updatedAt",
      ],
    },
    {
      name: "instructors",
      fields: [
        "id (CUID), name, nameEn, title, email",
        "institutionId, imageId, description",
        "createdAt, updatedAt",
      ],
    },
    {
      name: "institutions",
      fields: [
        "id (YYNNN: 25001-25999), name, nameEn",
        "abbreviation, logoId, website, description",
        "createdAt, updatedAt",
      ],
    },
    {
      name: "news",
      fields: [
        "id (CUID), title, content, imageId",
        "createdAt, updatedAt",
      ],
    },
    {
      name: "banners",
      fields: [
        "id (CUID), title, description, imageId",
        "linkUrl, isActive, createdAt, updatedAt",
      ],
    },
    {
      name: "course_categories",
      fields: ["courseId, categoryId (Many-to-Many Junction)"],
    },
    {
      name: "course_course_types",
      fields: ["courseId, courseTypeId (Many-to-Many Junction)"],
    },
    {
      name: "image_placeholders",
      fields: [
        "id (CUID), name, imageUrl, entityType",
        "createdAt, updatedAt",
      ],
    },
  ];

  const techStack = [
    { name: "Framework", value: "Next.js 15.5.4 (App Router)" },
    { name: "Language", value: "TypeScript" },
    { name: "Database", value: "MySQL with Prisma ORM" },
    { name: "Styling", value: "Tailwind CSS" },
    { name: "Icons", value: "Lucide React (Dynamic Loading)" },
    { name: "UI Components", value: "shadcn/ui + Radix UI" },
    { name: "CSV Processing", value: "Papa Parse (UTF-8 BOM Support)" },
    { name: "Image Handling", value: "Next.js Image + Image Placeholders API" },
    { name: "Color Scheme", value: "Blue-Slate (#093ea8 primary)" },
    { name: "Border Radius", value: "0.2rem" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Application Structure</h1>
        <p className="text-muted-foreground">
          Complete overview of ThaiMOOC WebApp architecture
        </p>
      </div>

      {/* Tech Stack */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            <CardTitle>Technology Stack</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {techStack.map((tech) => (
              <div key={tech.name} className="space-y-1">
                <div className="text-sm font-semibold text-muted-foreground">
                  {tech.name}
                </div>
                <div className="text-sm font-medium">{tech.value}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Backend Routes */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" />
            <CardTitle>Backend Routes (Admin Panel)</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {backendRoutes.map((route) => (
              <div
                key={route.path}
                className="flex items-start gap-3 py-2 border-b last:border-0"
              >
                <code className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono flex-shrink-0">
                  {route.path}
                </code>
                <span className="text-sm text-muted-foreground">
                  {route.description}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Frontend Routes */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <CardTitle>Frontend Routes (Public Pages)</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {frontendRoutes.map((route) => (
              <div
                key={route.path}
                className="flex items-start gap-3 py-2 border-b last:border-0"
              >
                <code className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-mono flex-shrink-0">
                  {route.path}
                </code>
                <span className="text-sm text-muted-foreground">
                  {route.description}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* API Routes */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Layout className="h-5 w-5 text-primary" />
            <CardTitle>API Routes</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {apiRoutes.map((route) => (
              <div
                key={route.path}
                className="flex items-start gap-3 py-2 border-b last:border-0"
              >
                <code className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded font-mono flex-shrink-0">
                  {route.path}
                </code>
                <span className="text-sm text-muted-foreground">
                  {route.description}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Models */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <CardTitle>Data Models</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dataModels.map((model) => (
              <div key={model.name} className="space-y-2">
                <h3 className="font-semibold text-sm bg-slate-100 px-3 py-2 rounded">
                  {model.name}
                </h3>
                <div className="pl-3 space-y-1">
                  {model.fields.map((field, idx) => (
                    <div key={idx} className="text-xs text-muted-foreground font-mono">
                      {field}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* File Structure */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FolderTree className="h-5 w-5 text-primary" />
            <CardTitle>Key Directory Structure</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="font-mono text-xs space-y-1">
            <div>📁 thai-mooc/</div>
            <div className="pl-4">📁 app/</div>
            <div className="pl-8">📁 (public)/ - Frontend pages</div>
            <div className="pl-8">📁 admin/ - Backend admin pages</div>
            <div className="pl-8">📁 api/ - API routes</div>
            <div className="pl-4">📁 components/</div>
            <div className="pl-8">📁 admin/ - Admin components</div>
            <div className="pl-8">📁 ui/ - shadcn/ui components</div>
            <div className="pl-4">📁 lib/</div>
            <div className="pl-8">📄 data.ts - Mock data & functions</div>
            <div className="pl-8">📄 types.ts - TypeScript interfaces</div>
            <div className="pl-8">📄 icon-map.tsx - Heroicons mapping</div>
            <div className="pl-8">📄 language-context.tsx - i18n (TH/EN)</div>
            <div className="pl-4">📄 globals.css - Tailwind + custom styles</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
