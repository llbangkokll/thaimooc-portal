"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/lib/language-context";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { News } from "@/lib/types";
import { Newspaper } from "lucide-react";
import { getImageUrl } from "@/lib/utils";

export default function NewsPage() {
  const { language, t } = useLanguage();
  const [news, setNews] = useState<News[]>([]);

  useEffect(() => {
    async function loadData() {
      const newsRes = await fetch('/api/news').then(r => r.json());
      const data = (newsRes.data || []).map((n: any) => ({
        ...n,
        createdAt: new Date(n.createdAt),
        updatedAt: new Date(n.updatedAt),
      }));
      setNews(data);
    }
    loadData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Newspaper className="h-10 w-10 text-primary" />
        <h1 className="text-[1.5rem] font-bold">
          {t("ข่าวสารและประกาศ", "News & Announcements")}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {news.map((item) => (
          <Link key={item.id} href={`/news/${item.id}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full overflow-hidden">
              <div className="relative h-56">
                <Image
                  src={getImageUrl(item.imageId)}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle className="line-clamp-2 text-lg">
                  {item.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  {new Date(item.createdAt).toLocaleDateString(
                    language === "th" ? "th-TH" : "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </p>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
