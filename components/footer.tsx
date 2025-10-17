"use client";

import { useLanguage } from "@/lib/language-context";
import { BookOpen, Mail, Phone, MapPin, Facebook, Twitter, Youtube, Instagram } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { WebAppSettings } from "@/lib/types";

export function Footer() {
  const { t } = useLanguage();
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
    <footer className="border-t bg-gray-50 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
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
            </div>
            <p className="text-sm text-gray-600">
              {t(
                "แพลตฟอร์มการเรียนรู้ออนไลน์สำหรับคนไทย",
                "Online Learning Platform for Thai People"
              )}
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-[1.2rem]">{t("ลิงก์ด่วน", "Quick Links")}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/courses" className="text-gray-600 hover:text-primary">
                  {t("รายวิชาทั้งหมด", "Courses")}
                </Link>
              </li>
              <li>
                <Link href="/institutions" className="text-gray-600 hover:text-primary">
                  {t("สถาบันผู้พัฒนา", "Institutions")}
                </Link>
              </li>
              <li>
                <Link href="/news" className="text-gray-600 hover:text-primary">
                  {t("ข่าวประชาสัมพันธ์", "News")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-primary">
                  {t("ติดต่อเรา", "Contact Us")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-[1.2rem]">{t("ติดต่อเรา", "Contact Us")}</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{settings?.contactEmail || "contact@thaimooc.ac.th"}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{settings?.contactPhone || "02-123-4567"}</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{settings?.address || t("กรุงเทพมหานคร ประเทศไทย", "Bangkok, Thailand")}</span>
              </li>
            </ul>

            {/* Social Media Icons */}
            {(settings?.facebookUrl || settings?.twitterUrl || settings?.youtubeUrl || settings?.instagramUrl || settings?.lineUrl) && (
              <div className="mt-4">
                <h4 className="font-semibold mb-3 text-sm">{t("ติดตามเรา", "Follow Us")}</h4>
                <div className="flex gap-3">
                  {settings?.facebookUrl && (
                    <a
                      href={settings.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full bg-gray-200 hover:bg-primary hover:text-white transition-colors flex items-center justify-center"
                      aria-label="Facebook"
                    >
                      <Facebook className="h-4 w-4" />
                    </a>
                  )}
                  {settings?.twitterUrl && (
                    <a
                      href={settings.twitterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full bg-gray-200 hover:bg-primary hover:text-white transition-colors flex items-center justify-center"
                      aria-label="Twitter"
                    >
                      <Twitter className="h-4 w-4" />
                    </a>
                  )}
                  {settings?.youtubeUrl && (
                    <a
                      href={settings.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full bg-gray-200 hover:bg-primary hover:text-white transition-colors flex items-center justify-center"
                      aria-label="YouTube"
                    >
                      <Youtube className="h-4 w-4" />
                    </a>
                  )}
                  {settings?.instagramUrl && (
                    <a
                      href={settings.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full bg-gray-200 hover:bg-primary hover:text-white transition-colors flex items-center justify-center"
                      aria-label="Instagram"
                    >
                      <Instagram className="h-4 w-4" />
                    </a>
                  )}
                  {settings?.lineUrl && (
                    <a
                      href={settings.lineUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full bg-gray-200 hover:bg-primary hover:text-white transition-colors flex items-center justify-center"
                      aria-label="LINE"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t mt-8 pt-6">
          <p className="text-center text-sm text-gray-600">
            © 2025 {settings?.siteName || "Thai MOOC"}. {t("สงวนลิขสิทธิ์", "All rights reserved")}.
          </p>
        </div>
      </div>
    </footer>
  );
}
