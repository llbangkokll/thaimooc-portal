"use client";

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface SkillData {
  H1?: number;
  H2?: number;
  H3?: number;
  H4?: number;
  H5?: number;
  H6?: number;
  S1?: number;
  S2?: number;
  S3?: number;
  S4?: number;
  S5?: number;
  S6?: number;
}

interface SkillSpiderGraphProps {
  hardSkills?: SkillData;
  softSkills?: SkillData;
  type: 'hard' | 'soft';
}

const HARD_SKILL_LABELS = {
  H1: "Data Science & AI",
  H2: "Digital Dev & Security",
  H3: "Project & Process Mgmt",
  H4: "Financial Modeling",
  H5: "Technical Operations",
  H6: "Regulatory & Compliance",
};

const SOFT_SKILL_LABELS = {
  S1: "Analytical Thinking",
  S2: "Communication",
  S3: "Leadership",
  S4: "Adaptability",
  S5: "Creativity",
  S6: "Service Orientation",
};

export function SkillSpiderGraph({ hardSkills, softSkills, type }: SkillSpiderGraphProps) {
  // Prepare data based on type
  const skillData = type === 'hard' ? hardSkills : softSkills;
  const labels = type === 'hard' ? HARD_SKILL_LABELS : SOFT_SKILL_LABELS;

  if (!skillData) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>ไม่มีข้อมูลการวิเคราะห์ทักษะ</p>
      </div>
    );
  }

  // Transform data for Recharts
  const chartData = Object.entries(labels).map(([key, label]) => ({
    skill: label,
    value: skillData[key as keyof SkillData] || 0,
    fullMark: 100,
  }));

  const color = type === 'hard' ? '#3b82f6' : '#10b981';
  const fillColor = type === 'hard' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)';

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={350}>
        <RadarChart data={chartData}>
          <PolarGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <PolarAngleAxis
            dataKey="skill"
            tick={{ fill: '#6b7280', fontSize: 11 }}
            tickLine={false}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: '#9ca3af', fontSize: 10 }}
            tickCount={6}
          />
          <Radar
            name={type === 'hard' ? 'Hard Skills' : 'Soft Skills'}
            dataKey="value"
            stroke={color}
            fill={fillColor}
            fillOpacity={0.6}
            strokeWidth={2}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              padding: '0.5rem',
            }}
            formatter={(value: number) => [`${value}%`, 'คะแนน']}
          />
        </RadarChart>
      </ResponsiveContainer>

      {/* Legend with scores */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        {Object.entries(labels).map(([key, label]) => {
          const value = skillData[key as keyof SkillData] || 0;
          return (
            <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-gray-700 truncate flex-1">{label}</span>
              <span
                className="font-semibold ml-2"
                style={{
                  color: value > 70 ? '#059669' : value > 40 ? '#f59e0b' : '#dc2626'
                }}
              >
                {value}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
