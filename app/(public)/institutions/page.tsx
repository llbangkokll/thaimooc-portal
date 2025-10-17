"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useLanguage } from "@/lib/language-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Institution, Course, Instructor } from "@/lib/types";
import { Building2, BookOpen, Users } from "lucide-react";

export default function InstitutionsPage() {
  const { language, t } = useLanguage();
  const router = useRouter();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);

  useEffect(() => {
    async function loadData() {
      const [institutionsRes, coursesRes, instructorsRes] = await Promise.all([
        fetch('/api/institutions').then(r => r.json()),
        fetch('/api/courses').then(r => r.json()),
        fetch('/api/instructors').then(r => r.json()),
      ]);

      const institutionsData = (institutionsRes.data || []).map((i: any) => ({
        ...i,
        createdAt: new Date(i.createdAt),
        updatedAt: new Date(i.updatedAt),
      }));

      const coursesData = (coursesRes.data || []).map((c: any) => ({
        ...c,
        createdAt: new Date(c.createdAt),
        updatedAt: new Date(c.updatedAt),
      }));

      const instructorsData = (instructorsRes.data || []).map((i: any) => ({
        ...i,
        createdAt: new Date(i.createdAt),
        updatedAt: new Date(i.updatedAt),
      }));

      setInstitutions(institutionsData);
      setCourses(coursesData);
      setInstructors(instructorsData);
    }
    loadData();
  }, []);

  const getCoursesCount = (institutionId: string) => {
    return courses.filter(course => course.institutionId === institutionId).length;
  };

  const getInstructorsCount = (institutionId: string) => {
    return instructors.filter(instructor => instructor.institutionId === institutionId).length;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Building2 className="h-10 w-10 text-primary" />
        <h1 className="font-bold" style={{ fontSize: "1.25rem" }}>
          {t("สถาบันการศึกษาพันธมิตร", "Partner Institutions")}
        </h1>
      </div>

      <p className="text-lg text-muted-foreground mb-12">
        {t(
          "เรามีความร่วมมือกับสถาบันการศึกษาชั้นนำทั่วประเทศ เพื่อนำเสนอคอร์สเรียนคุณภาพสูงให้กับผู้เรียน",
          "We partner with leading educational institutions nationwide to offer high-quality courses to learners."
        )}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {institutions.map((institution) => (
          <a
            key={institution.id}
            href={`/courses?institution=${institution.id}`}
          >
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardContent className="flex flex-col items-center p-6">
                <div className="relative w-24 h-24 mb-4 rounded-full overflow-hidden bg-gray-100">
                  <Image
                    src={institution.logoUrl}
                    alt={language === "th" ? institution.name : institution.nameEn}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardTitle className="text-center text-base mb-1">
                  {language === "th" ? institution.name : institution.nameEn}
                </CardTitle>
                <p className="text-xs text-muted-foreground text-center mb-4">
                  {institution.abbreviation}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{getCoursesCount(institution.id)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{getInstructorsCount(institution.id)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}
