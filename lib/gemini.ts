import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Skill domains definition
export const HARD_SKILL_DOMAINS = {
  H1: "Data Science & AI Fluency",
  H2: "Digital Development & Security",
  H3: "Technical Project & Process Mgmt",
  H4: "Financial & Strategic Modeling",
  H5: "Specialized Technical Operations",
  H6: "Regulatory & Compliance Skills",
};

export const SOFT_SKILL_DOMAINS = {
  S1: "Analytical & Critical Thinking",
  S2: "Communication & Collaboration",
  S3: "Leadership & Social Influence",
  S4: "Adaptability & Resilience",
  S5: "Creativity & Initiative",
  S6: "Customer & Service Orientation",
};

export interface SkillAnalysis {
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

export interface CourseData {
  title: string;
  titleEn: string;
  description: string;
  learningOutcomes?: string;
  contentStructure?: string;
  prerequisites?: string;
  targetAudience?: string;
  categories?: string[];
  courseTypes?: string[];
}

/**
 * Analyze course content using Gemini AI to extract skill domains
 */
export async function analyzeCourseSkills(
  courseData: CourseData
): Promise<SkillAnalysis> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
คุณเป็นผู้เชี่ยวชาญด้านการวิเคราะห์หลักสูตรและทักษะ วิเคราะห์รายวิชาต่อไปนี้และให้คะแนนทักษะในแต่ละด้าน (0-100):

# ข้อมูลรายวิชา:
**ชื่อ:** ${courseData.title}
**ชื่อภาษาอังกฤษ:** ${courseData.titleEn}
**คำอธิบาย:** ${courseData.description}
${courseData.learningOutcomes ? `**วัตถุประสงค์การเรียนรู้:** ${courseData.learningOutcomes}` : ""}
${courseData.contentStructure ? `**โครงสร้างเนื้อหา:** ${courseData.contentStructure}` : ""}
${courseData.prerequisites ? `**ความรู้เบื้องต้น:** ${courseData.prerequisites}` : ""}
${courseData.targetAudience ? `**กลุ่มเป้าหมาย:** ${courseData.targetAudience}` : ""}
${courseData.categories && courseData.categories.length > 0 ? `**หมวดหมู่:** ${courseData.categories.join(", ")}` : ""}
${courseData.courseTypes && courseData.courseTypes.length > 0 ? `**ประเภทคอร์ส:** ${courseData.courseTypes.join(", ")}` : ""}

# Hard Skill Domains (ให้คะแนน 0-100):
- **H1: Data Science & AI Fluency** - ทักษะด้านวิทยาศาสตร์ข้อมูล, AI, Machine Learning, Data Analytics
- **H2: Digital Development & Security** - การพัฒนาซอฟต์แวร์, Web/Mobile Development, Cybersecurity
- **H3: Technical Project & Process Mgmt** - การจัดการโครงการเทคนิค, Agile, DevOps, System Design
- **H4: Financial & Strategic Modeling** - การวิเคราะห์ทางการเงิน, Strategic Planning, Business Intelligence
- **H5: Specialized Technical Operations** - ทักษะเฉพาะทาง เช่น IoT, Blockchain, Cloud Computing
- **H6: Regulatory & Compliance Skills** - กฎหมาย, มาตรฐาน, Compliance, Governance

# Soft Skill Domains (ให้คะแนน 0-100):
- **S1: Analytical & Critical Thinking** - การคิดวิเคราะห์, Problem Solving, Decision Making
- **S2: Communication & Collaboration** - การสื่อสาร, ทำงานเป็นทีม, Presentation Skills
- **S3: Leadership & Social Influence** - ความเป็นผู้นำ, การจูงใจ, การบริหารคน
- **S4: Adaptability & Resilience** - การปรับตัว, ความยืดหยุ่น, การรับมือกับความเปลี่ยนแปลง
- **S5: Creativity & Initiative** - ความคิดสร้างสรรค์, นวัตกรรม, การริเริ่ม
- **S6: Customer & Service Orientation** - การบริการ, Customer Focus, UX/UI Thinking

# คำแนะนำการให้คะแนน:
- 0-20: ไม่เกี่ยวข้องหรือแทบไม่มีเนื้อหา
- 21-40: เกี่ยวข้องเล็กน้อย มีการกล่าวถึงผิวเผิน
- 41-60: เกี่ยวข้องปานกลาง มีเนื้อหาบางส่วน
- 61-80: เกี่ยวข้องมาก มีเนื้อหาที่ครอบคลุม
- 81-100: เป็นหัวใจหลักของคอร์ส มีเนื้อหาเชิงลึก

**สำคัญ:** ตอบในรูปแบบ JSON เท่านั้น ดังนี้:

{
  "hardSkills": {
    "H1": <number 0-100>,
    "H2": <number 0-100>,
    "H3": <number 0-100>,
    "H4": <number 0-100>,
    "H5": <number 0-100>,
    "H6": <number 0-100>
  },
  "softSkills": {
    "S1": <number 0-100>,
    "S2": <number 0-100>,
    "S3": <number 0-100>,
    "S4": <number 0-100>,
    "S5": <number 0-100>,
    "S6": <number 0-100>
  },
  "reasoning": "<สรุปเหตุผลการให้คะแนนแต่ละด้านสั้นๆ>"
}

ตอบเป็น JSON เท่านั้น ไม่ต้องมีข้อความอื่นนอกเหนือจาก JSON
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid JSON response from Gemini");
    }

    const analysis: SkillAnalysis = JSON.parse(jsonMatch[0]);

    // Validate scores are within range
    const validateScores = (scores: Record<string, number>) => {
      Object.keys(scores).forEach((key) => {
        if (scores[key] < 0) scores[key] = 0;
        if (scores[key] > 100) scores[key] = 100;
      });
    };

    validateScores(analysis.hardSkills);
    validateScores(analysis.softSkills);

    return analysis;
  } catch (error) {
    console.error("Error analyzing course skills with Gemini:", error);
    throw error;
  }
}

/**
 * Get mock skill analysis for testing (when API key not available)
 */
export function getMockSkillAnalysis(): SkillAnalysis {
  return {
    hardSkills: {
      H1: 75,
      H2: 60,
      H3: 45,
      H4: 30,
      H5: 50,
      H6: 25,
    },
    softSkills: {
      S1: 80,
      S2: 65,
      S3: 40,
      S4: 70,
      S5: 55,
      S6: 45,
    },
    reasoning: "Mock data for testing purposes",
  };
}
