"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  BookOpen,
  FolderTree,
  Users,
  Building2,
  Newspaper,
  Image as ImageIcon,
  Settings,
  FileText,
  Layers,
  Tag,
  LogOut,
  UserCog,
  Shield,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const menuItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    requireSuperAdmin: false,
  },
  {
    title: "Courses",
    href: "/admin/courses",
    icon: BookOpen,
    requireSuperAdmin: false,
  },
  {
    title: "Categories",
    href: "/admin/categories",
    icon: FolderTree,
    requireSuperAdmin: false,
  },
  {
    title: "Course Types",
    href: "/admin/course-types",
    icon: Tag,
    requireSuperAdmin: false,
  },
  {
    title: "Instructors",
    href: "/admin/instructors",
    icon: Users,
    requireSuperAdmin: false,
  },
  {
    title: "Institutions",
    href: "/admin/institutions",
    icon: Building2,
    requireSuperAdmin: false,
  },
  {
    title: "News",
    href: "/admin/news",
    icon: Newspaper,
    requireSuperAdmin: false,
  },
  {
    title: "Banners",
    href: "/admin/banners",
    icon: Layers,
    requireSuperAdmin: false,
  },
  {
    title: "Files",
    href: "/admin/files",
    icon: ImageIcon,
    requireSuperAdmin: false,
  },
  {
    title: "Admin Users",
    href: "/admin/users",
    icon: UserCog,
    requireSuperAdmin: true, // Only Super Admin
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
    requireSuperAdmin: true, // Only Super Admin
  },
  {
    title: "Structure",
    href: "/admin/structure",
    icon: FileText,
    requireSuperAdmin: false,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch("/api/auth/session");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            setUserRole(data.user.role);
            setUserName(data.user.name);
          }
        }
      } catch (error) {
        console.error("Error fetching session:", error);
      }
    };

    fetchSession();
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        router.push("/admin/login");
        router.refresh();
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4 flex flex-col">
      <div className="mb-8">
        <Link href="/admin" className="flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-gray-900">Admin Panel</span>
        </Link>
      </div>

      <nav className="space-y-1 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          // Hide menu if it requires Super Admin and user is not Super Admin
          if (item.requireSuperAdmin && userRole !== 'super_admin') {
            return null;
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                isActive
                  ? "bg-primary text-white"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 pt-4 border-t border-gray-200 space-y-2">
        {userName && (
          <div className="px-3 py-2 bg-gray-50 rounded-md">
            <div className="text-sm font-medium text-gray-900">{userName}</div>
            <div className="flex items-center gap-1 mt-1">
              {userRole === 'super_admin' ? (
                <>
                  <ShieldCheck className="h-3 w-3 text-red-600" />
                  <span className="text-xs text-red-600 font-medium">Super Admin</span>
                </>
              ) : (
                <>
                  <Shield className="h-3 w-3 text-blue-600" />
                  <span className="text-xs text-blue-600 font-medium">Admin</span>
                </>
              )}
            </div>
          </div>
        )}

        <Link
          href="/"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm px-3 py-2"
        >
          ← Back to Website
        </Link>

        <Button
          onClick={handleLogout}
          disabled={isLoggingOut}
          variant="outline"
          className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut className="h-5 w-5" />
          <span>{isLoggingOut ? "กำลังออกจากระบบ..." : "ออกจากระบบ"}</span>
        </Button>
      </div>
    </aside>
  );
}
