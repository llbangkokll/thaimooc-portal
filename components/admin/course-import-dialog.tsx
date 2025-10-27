"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Upload, Download, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function CourseImportDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      setResult(null);
    } else {
      alert("กรุณาเลือกไฟล์ CSV เท่านั้น");
    }
  };

  const handleImport = async () => {
    if (!file) {
      alert("กรุณาเลือกไฟล์ CSV");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Parse CSV file
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            // Send to API
            const response = await fetch("/api/courses/import", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                courses: results.data,
              }),
            });

            const data = await response.json();

            if (!response.ok) {
              throw new Error(data.error || "Failed to import courses");
            }

            setResult(data.results);
            router.refresh();
          } catch (error) {
            console.error("Error importing courses:", error);
            alert(
              error instanceof Error
                ? error.message
                : "เกิดข้อผิดพลาดในการ import รายวิชา"
            );
          } finally {
            setLoading(false);
          }
        },
        error: (error) => {
          console.error("Error parsing CSV:", error);
          alert("ไม่สามารถอ่านไฟล์ CSV ได้");
          setLoading(false);
        },
      });
    } catch (error) {
      console.error("Error:", error);
      alert("เกิดข้อผิดพลาด");
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `title,titleEn,description,categoryIds,learningOutcomes,targetAudience,prerequisites,institutionId,instructorId,level,durationHours,teachingLanguage,hasCertificate,imageId,bannerImageId,videoUrl,courseUrl,tags,courseTypeIds
"การเขียนโปรแกรม Python เบื้องต้น","Introduction to Python Programming","เรียนรู้พื้นฐานการเขียนโปรแกรม Python ตั้งแต่เริ่มต้น เหมาะสำหรับผู้ที่ไม่มีพื้นฐานการเขียนโปรแกรม","04,02","เข้าใจพื้นฐานภาษา Python,สามารถเขียนโปรแกรมเบื้องต้นได้,เข้าใจโครงสร้างข้อมูลพื้นฐาน","นักเรียน นักศึกษา ผู้ที่สนใจเรียนโปรแกรมมิ่ง","ไม่ต้องมีพื้นฐาน",inst-1759735226501-0,instr-1759751292316,beginner,40,Thai,true,https://thaimooc.ac.th/wp-content/uploads/2024/09/cropped-thaimooc-c-logo.png,,"https://youtube.com/watch?v=example","https://example.com/courses/python-intro","python,programming,beginner,coding","type-1759732232626,type-1759732234195"
"การพัฒนาเว็บด้วย React","Web Development with React","เรียนรู้การสร้างเว็บแอปพลิเคชันด้วย React.js แบบ step-by-step","04","สร้าง Web App ด้วย React ได้,เข้าใจ Component-based Architecture,ใช้งาน React Hooks ได้","นักศึกษาสายไอที นักพัฒนาเว็บ","พื้นฐาน HTML CSS JavaScript",inst-1759735226505-1,instr-1759751292316,intermediate,60,Thai,true,https://thaimooc.ac.th/wp-content/uploads/2024/09/cropped-thaimooc-c-logo.png,,"https://youtube.com/watch?v=example2","https://example.com/courses/react","react,web,javascript,frontend",type-1759732234195
"Data Science ด้วย Python","Data Science with Python","เรียนรู้การวิเคราะห์ข้อมูลและ Machine Learning ด้วย Python","04,02","วิเคราะห์ข้อมูลด้วย Pandas,สร้างโมเดล Machine Learning,Visualize ข้อมูลด้วย Matplotlib","นักวิเคราะห์ข้อมูล Data Scientist ผู้สนใจ AI","พื้นฐาน Python และ คณิตศาสตร์",inst-1759735226507-2,instr-1759751292316,advanced,80,English,false,https://thaimooc.ac.th/wp-content/uploads/2024/09/cropped-thaimooc-c-logo.png,,,"","python,datascience,ai,machinelearning",type-1759732232626`;

    // Add BOM for UTF-8 to ensure Thai characters display correctly in Excel
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "course-import-template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import Courses from CSV</DialogTitle>
          <DialogDescription>
            อัปโหลดไฟล์ CSV เพื่อนำเข้ารายวิชาหลายรายการพร้อมกัน
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              onClick={downloadTemplate}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              ดาวน์โหลดไฟล์ตัวอย่าง CSV
            </Button>
            <p className="text-sm text-muted-foreground">
              ดาวน์โหลดไฟล์ตัวอย่างเพื่อดูรูปแบบที่ถูกต้อง
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="csv-file"
              className="block text-sm font-medium text-gray-700"
            >
              เลือกไฟล์ CSV
            </label>
            <input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-primary file:text-primary-foreground
                hover:file:bg-primary/90"
            />
            {file && (
              <p className="text-sm text-muted-foreground">
                ไฟล์ที่เลือก: {file.name}
              </p>
            )}
          </div>

          {result && (
            <div className="space-y-2">
              <Alert variant={result.failed === 0 ? "default" : "destructive"}>
                <div className="flex items-start gap-2">
                  {result.failed === 0 ? (
                    <CheckCircle className="h-4 w-4 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-4 w-4 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <AlertDescription>
                      <div className="font-semibold mb-2">
                        นำเข้าสำเร็จ: {result.success} รายการ | ล้มเหลว:{" "}
                        {result.failed} รายการ
                      </div>
                      {result.errors.length > 0 && (
                        <div className="space-y-1">
                          <div className="font-medium text-sm">ข้อผิดพลาด:</div>
                          <ul className="list-disc list-inside text-sm space-y-0.5 max-h-40 overflow-y-auto">
                            {result.errors.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            </div>
          )}

          <div className="bg-muted p-4 rounded-md">
            <h4 className="text-sm font-semibold mb-2">คำแนะนำ:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground list-disc list-inside">
              <li>ไฟล์ CSV ต้องมี header ตรงกับตัวอย่าง (19 คอลัมน์)</li>
              <li>
                <strong>ฟิลด์ที่จำเป็น:</strong> title, titleEn, description เท่านั้น
              </li>
              <li>ฟิลด์อื่นๆ สามารถเว้นว่างได้ทั้งหมด</li>
              <li>
                <strong>categoryIds</strong> และ <strong>courseTypeIds</strong> แยกด้วยเครื่องหมายจุลภาค (เช่น cat-123,cat-456)
              </li>
              <li>
                <strong>hasCertificate</strong> ใช้ค่า true หรือ false
              </li>
              <li>
                <strong>institutionId</strong> และ <strong>instructorId</strong> ต้องเป็น ID ที่มีอยู่ในระบบ
              </li>
              <li>
                <strong>level</strong> ใช้ค่า: beginner, intermediate, advanced
              </li>
              <li>learningOutcomes, targetAudience แยกข้อความด้วยจุลภาค</li>
              <li>
                <strong>💡 Tip:</strong> ใช้ Export CSV เพื่อดูตัวอย่างข้อมูลที่ถูกต้อง
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            ปิด
          </Button>
          <Button onClick={handleImport} disabled={!file || loading}>
            {loading ? "กำลัง Import..." : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
