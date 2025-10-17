"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import type { Banner } from "@/lib/types";

interface BannerDisplayProps {
  banners: Banner[];
  language: "th" | "en";
}

export function BannerDisplay({ banners, language }: BannerDisplayProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const activeBanners = banners.filter((b) => b.isActive);

  useEffect(() => {
    if (activeBanners.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [activeBanners.length]);

  if (activeBanners.length === 0) return null;

  const currentBanner = activeBanners[currentIndex];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  return (
    <section className="relative h-[500px] overflow-hidden">
      {activeBanners.map((banner, index) => {
        const isSplit = banner.templateId === "hero-split";

        return (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
            style={{
              background: banner.backgroundColor?.includes("gradient")
                ? banner.backgroundColor
                : banner.backgroundColor || "#667eea",
            }}
          >
            {isSplit ? (
              // Split Layout: Text left, Image right (รูปภาพชิดขอบบน ล่าง ขวา)
              <div className="relative h-full flex items-stretch">
                <div className="container mx-auto grid md:grid-cols-2 gap-0 w-full">
                  {/* Left: Content */}
                  <div className="flex items-center px-4">
                    <div>
                      <h1
                        className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
                        style={{ color: banner.textColor || "#ffffff" }}
                      >
                        {language === "th" ? banner.title : banner.titleEn}
                      </h1>

                      {(banner.subtitle || banner.subtitleEn) && (
                        <p
                          className="text-lg md:text-xl mb-4"
                          style={{ color: banner.textColor || "#ffffff" }}
                        >
                          {language === "th" ? banner.subtitle : banner.subtitleEn}
                        </p>
                      )}

                      {(banner.description || banner.descriptionEn) && (
                        <p
                          className="text-base mb-6 opacity-90"
                          style={{ color: banner.textColor || "#ffffff" }}
                        >
                          {language === "th" ? banner.description : banner.descriptionEn}
                        </p>
                      )}

                      {banner.linkUrl && (banner.buttonText || banner.buttonTextEn) && (
                        <Button
                          asChild
                          size="lg"
                          className="text-lg px-8"
                          style={{
                            backgroundColor: banner.accentColor || "#fbbf24",
                            color: banner.textColor || "#ffffff",
                            borderRadius: "5px",
                          }}
                        >
                          <Link href={banner.linkUrl}>
                            {language === "th"
                              ? (banner.buttonText || "เรียนรู้เพิ่มเติม")
                              : (banner.buttonTextEn || "Learn More")}
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Right: Image (ชิดขอบบน ล่าง ขวา ไม่มีโค้งมน) */}
                  {banner.imageId && (
                    <div className="relative h-full">
                      <Image
                        src={getImageUrl(banner.imageId)}
                        alt={language === "th" ? banner.title : banner.titleEn}
                        fill
                        className="object-cover"
                        priority={index === 0}
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Centered Layout (default)
              <>
                {/* Background Image (if exists) */}
                {banner.imageId && (
                  <div className="absolute inset-0">
                    <Image
                      src={getImageUrl(banner.imageId)}
                      alt={language === "th" ? banner.title : banner.titleEn}
                      fill
                      className="object-cover"
                      priority={index === 0}
                    />
                    <div className="absolute inset-0 bg-black/40" />
                  </div>
                )}

                {/* Content */}
                <div className="relative h-full flex items-center">
                  <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                      <h1
                        className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
                        style={{ color: banner.textColor || "#ffffff" }}
                      >
                        {language === "th" ? banner.title : banner.titleEn}
                      </h1>

                      {(banner.subtitle || banner.subtitleEn) && (
                        <p
                          className="text-xl md:text-2xl mb-4"
                          style={{ color: banner.textColor || "#ffffff" }}
                        >
                          {language === "th" ? banner.subtitle : banner.subtitleEn}
                        </p>
                      )}

                      {(banner.description || banner.descriptionEn) && (
                        <p
                          className="text-base md:text-lg mb-6 opacity-90"
                          style={{ color: banner.textColor || "#ffffff" }}
                        >
                          {language === "th" ? banner.description : banner.descriptionEn}
                        </p>
                      )}

                      {banner.linkUrl && (banner.buttonText || banner.buttonTextEn) && (
                        <Button
                          asChild
                          size="lg"
                          className="text-lg px-8"
                          style={{
                            backgroundColor: banner.accentColor || "#fbbf24",
                            color: banner.textColor || "#ffffff",
                            borderRadius: "5px",
                          }}
                        >
                          <Link href={banner.linkUrl}>
                            {language === "th"
                              ? (banner.buttonText || "เรียนรู้เพิ่มเติม")
                              : (banner.buttonTextEn || "Learn More")}
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        );
      })}

      {/* Navigation Arrows */}
      {activeBanners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-all z-10"
            aria-label="Previous banner"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-all z-10"
            aria-label="Next banner"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Indicators */}
      {activeBanners.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {activeBanners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "bg-white w-8"
                  : "bg-white/50 hover:bg-white/75 w-2"
              }`}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
