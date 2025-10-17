"use client";

import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminAuthGuard } from "@/components/admin-auth-guard";

export function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // ตรวจสอบว่าเป็นหน้า login หรือไม่
  const isLoginPage = pathname === "/admin/login";

  // ถ้าเป็นหน้า login ให้แสดงเฉพาะ children (ไม่มี sidebar)
  if (isLoginPage) {
    return <>{children}</>;
  }

  // ถ้าไม่ใช่หน้า login ให้ใช้ layout ปกติพร้อม auth guard และ sidebar
  return (
    <AdminAuthGuard>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 bg-gray-50">
          <div className="p-8">{children}</div>
        </main>
      </div>
    </AdminAuthGuard>
  );
}
