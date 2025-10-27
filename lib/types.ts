// Data Models

export interface Course {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  learningOutcomes?: string | null;
  targetAudience?: string | null;
  prerequisites?: string | null;
  tags?: string | null;
  assessmentCriteria?: string | null;
  courseUrl?: string | null;
  videoUrl?: string | null;
  contentStructure?: string | null;
  categoryIds?: string[];
  courseTypeIds?: string[];
  institutionId?: string | null;
  instructorId?: string | null;
  imageId?: string | null;
  bannerImageId?: string | null;
  level?: string | null;
  teachingLanguage?: string | null;
  durationHours?: number | null;
  hasCertificate: boolean;
  enrollCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentTopic {
  id: string;
  title: string;
  subtopics: string[];
}

export interface Category {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseType {
  id: string;
  name: string;
  nameEn: string;
  icon?: string | null;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Instructor {
  id: string;
  name: string;
  nameEn: string;
  title: string;
  institutionId: string;
  bio?: string | null;
  imageUrl?: string | null;
  email?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Institution {
  id: string;
  name: string;
  nameEn: string;
  abbreviation: string;
  logoUrl: string;
  website?: string | null;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface News {
  id: string;
  title: string;
  content: string;
  imageId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Banner {
  id: string;
  title: string;
  titleEn: string;
  subtitle?: string | null;
  subtitleEn?: string | null;
  description?: string | null;
  descriptionEn?: string | null;
  buttonText?: string | null;
  buttonTextEn?: string | null;
  imageId: string;
  backgroundImageId?: string | null;
  overlayImageId?: string | null;
  linkUrl?: string | null;
  backgroundColor?: string | null;
  textColor?: string | null;
  accentColor?: string | null;
  isActive: boolean;
  order: number;
  templateId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface WebAppSettings {
  id: string;
  siteName: string;
  siteLogo: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  aboutUs?: string | null;
  aboutUsEn?: string | null;
  mapUrl?: string | null;
  facebookUrl?: string | null;
  twitterUrl?: string | null;
  youtubeUrl?: string | null;
  instagramUrl?: string | null;
  lineUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ImagePlaceholder {
  id: string;
  url: string;
  title: string;
  category: "course" | "banner" | "news" | "instructor" | "institution" | "general";
}

export interface Popup {
  id: string;
  title: string;
  titleEn: string;
  description?: string | null;
  descriptionEn?: string | null;
  imageId: string;
  linkUrl?: string | null;
  buttonText?: string | null;
  buttonTextEn?: string | null;
  isActive: boolean;
  startDate?: Date | null;
  endDate?: Date | null;
  displayOrder: number;
  showOnce: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type Language = "th" | "en";
