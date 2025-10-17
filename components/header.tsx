"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/lib/language-context";
import { Button } from "./ui/button";
import { BookOpen, Globe, Blocks } from "lucide-react";
import { useEffect, useState } from "react";
import type { WebAppSettings } from "@/lib/types";

export function Header() {
  const { language, setLanguage, t } = useLanguage();
  const [settings, setSettings] = useState<WebAppSettings | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch("/api/settings");
        const data = await response.json();
        setSettings(data);
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    }
    loadSettings();
  }, []);

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            {settings?.siteLogo ? (
              <div className="relative h-10 w-32">
                <Image
                  src={settings.siteLogo}
                  alt={settings.siteName || "Thai MOOC"}
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <>
                <BookOpen className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold">{settings?.siteName || "Thai MOOC"}</span>
              </>
            )}
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="text-[1rem] font-medium hover:text-primary transition-colors"
            >
              {t("หน้าหลัก", "Home")}
            </Link>
            <Link
              href="/courses"
              className="text-[1rem] font-medium hover:text-primary transition-colors"
            >
              {t("รายวิชาทั้งหมด", "Courses")}
            </Link>
            <Link
              href="/institutions"
              className="text-[1rem] font-medium hover:text-primary transition-colors"
            >
              {t("สถาบันผู้พัฒนา", "Institutions")}
            </Link>
            <Link
              href="/news"
              className="text-[1rem] font-medium hover:text-primary transition-colors"
            >
              {t("ข่าวประชาสัมพันธ์", "News")}
            </Link>
            <Link
              href="/contact"
              className="text-[1rem] font-medium hover:text-primary transition-colors"
            >
              {t("ติดต่อเรา", "Contact")}
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="default"
              size="sm"
              className="flex items-center gap-2"
              style={{ borderRadius: '5px' }}
            >
              <Link href="https://learn.thaimooc.ac.th/dashboard" target="_blank" rel="noopener noreferrer">
                <Blocks className="h-4 w-4" />
                {t("เข้าห้องเรียน", "My Classroom")}
              </Link>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setLanguage(language === "th" ? "en" : "th")}
              className="flex items-center gap-2"
              style={{ borderRadius: '5px' }}
            >
              <Globe className="h-4 w-4" />
              {language === "th" ? "EN" : "TH"}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
