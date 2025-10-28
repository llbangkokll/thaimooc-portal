"use client";

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SkillSpiderGraph } from './skill-spider-graph';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Sparkles, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SkillAnalysis {
  hardSkills: {
    H1: number;
    H2: number;
    H3: number;
    H4: number;
    H5: number;
    H6: number;
  };
  softSkills: {
    S1: number;
    S2: number;
    S3: number;
    S4: number;
    S5: number;
    S6: number;
  };
  reasoning?: string;
}

interface CourseSkillsSidebarProps {
  courseId: string;
}

export function CourseSkillsSidebar({ courseId }: CourseSkillsSidebarProps) {
  const [analysis, setAnalysis] = useState<SkillAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cached, setCached] = useState(false);
  const [reanalyzing, setReanalyzing] = useState(false);

  const fetchAnalysis = async (force = false) => {
    try {
      setLoading(true);
      setError(null);

      const endpoint = force
        ? `/api/courses/${courseId}/analyze-skills`
        : `/api/courses/${courseId}/analyze-skills`;

      const method = force ? 'POST' : 'GET';

      const response = await fetch(endpoint, { method });
      const data = await response.json();

      if (data.success) {
        setAnalysis(data.data);
        setCached(data.cached || false);
      } else {
        setError(data.error || 'ไม่สามารถวิเคราะห์ทักษะได้');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
      console.error('Error fetching skill analysis:', err);
    } finally {
      setLoading(false);
      setReanalyzing(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [courseId]);

  const handleReanalyze = () => {
    setReanalyzing(true);
    fetchAnalysis(true);
  };

  if (loading && !reanalyzing) {
    return (
      <Card className="p-6 sticky top-4">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">ภาพรวมคอร์ส</h3>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 sticky top-4">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">ภาพรวมคอร์ส</h3>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-4"
          onClick={() => fetchAnalysis()}
        >
          ลองใหม่อีกครั้ง
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6 sticky top-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">ภาพรวมคอร์ส</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReanalyze}
          disabled={reanalyzing}
          className="h-8 w-8 p-0"
          title="วิเคราะห์ใหม่"
        >
          <RefreshCw className={`h-4 w-4 ${reanalyzing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {cached && (
        <Alert className="mb-4">
          <AlertDescription className="text-xs">
            ข้อมูลวิเคราะห์จาก AI (แคช)
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="hard" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="hard">Hard Skills</TabsTrigger>
          <TabsTrigger value="soft">Soft Skills</TabsTrigger>
        </TabsList>

        <TabsContent value="hard" className="mt-4">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              ทักษะทางเทคนิคและความเชี่ยวชาญเฉพาะด้าน
            </p>
            {analysis && (
              <SkillSpiderGraph
                hardSkills={analysis.hardSkills}
                type="hard"
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="soft" className="mt-4">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              ทักษะด้านบุคลิกภาพและการทำงานร่วมกัน
            </p>
            {analysis && (
              <SkillSpiderGraph
                softSkills={analysis.softSkills}
                type="soft"
              />
            )}
          </div>
        </TabsContent>
      </Tabs>

      {analysis?.reasoning && (
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-xs font-semibold text-muted-foreground mb-1">
            คำอธิบายจาก AI:
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {analysis.reasoning}
          </p>
        </div>
      )}

      <div className="mt-4 pt-4 border-t text-xs text-muted-foreground text-center">
        วิเคราะห์โดย Gemini AI
      </div>
    </Card>
  );
}
