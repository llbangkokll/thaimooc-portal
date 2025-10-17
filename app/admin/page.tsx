import { getCourses, getCategories, getInstructors, getInstitutions, getNews, getBanners } from "@/lib/data";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  FolderTree,
  Users,
  Building2,
  Newspaper,
  Layers,
  Plus,
} from "lucide-react";

export default async function AdminDashboard() {
  const [courses, categories, instructors, institutions, news, banners] =
    await Promise.all([
      getCourses(),
      getCategories(),
      getInstructors(),
      getInstitutions(),
      getNews(),
      getBanners(),
    ]);

  const stats = [
    {
      title: "Total Courses",
      value: courses.length,
      icon: BookOpen,
      href: "/admin/courses",
      color: "text-blue-600",
    },
    {
      title: "Categories",
      value: categories.length,
      icon: FolderTree,
      href: "/admin/categories",
      color: "text-purple-600",
    },
    {
      title: "Instructors",
      value: instructors.length,
      icon: Users,
      href: "/admin/instructors",
      color: "text-green-600",
    },
    {
      title: "Institutions",
      value: institutions.length,
      icon: Building2,
      href: "/admin/institutions",
      color: "text-orange-600",
    },
    {
      title: "News Articles",
      value: news.length,
      icon: Newspaper,
      href: "/admin/news",
      color: "text-red-600",
    },
    {
      title: "Banners",
      value: banners.length,
      icon: Layers,
      href: "/admin/banners",
      color: "text-pink-600",
    },
  ];

  const shortcuts = [
    { title: "Add Course", href: "/admin/courses/new", icon: BookOpen },
    { title: "Add Category", href: "/admin/categories/new", icon: FolderTree },
    { title: "Add Instructor", href: "/admin/instructors/new", icon: Users },
    { title: "Add News", href: "/admin/news/new", icon: Newspaper },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to Thai MOOC Admin Panel
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.href} href={stat.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Shortcuts */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {shortcuts.map((shortcut) => {
              const Icon = shortcut.icon;
              return (
                <Button
                  key={shortcut.href}
                  asChild
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2"
                >
                  <Link href={shortcut.href}>
                    <Icon className="h-6 w-6" />
                    <span className="text-sm">{shortcut.title}</span>
                  </Link>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
