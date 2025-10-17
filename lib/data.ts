import { prisma } from "./prisma";
import * as types from "./types";

// Categories
export async function getCategories(): Promise<types.Category[]> {
  return prisma.categories.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

// Course Types
export async function getCourseTypes(): Promise<types.CourseType[]> {
  return prisma.course_types.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function getCategoryById(id: string): Promise<types.Category | null> {
  return prisma.categories.findUnique({
    where: { id },
  });
}

export async function createCategory(data: Omit<types.Category, "id" | "createdAt" | "updatedAt">): Promise<types.Category> {
  return prisma.categories.create({
    data: {
      id: `cat-${Date.now()}`,
      name: data.name,
      nameEn: data.nameEn,
      icon: data.icon,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
}

export async function updateCategory(id: string, data: Partial<types.Category>): Promise<types.Category | null> {
  try {
    return await prisma.categories.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.nameEn && { nameEn: data.nameEn }),
        ...(data.icon && { icon: data.icon }),
      },
    });
  } catch (error: any) {
    if (error.code === 'P2025') return null;
    throw error;
  }
}

export async function deleteCategory(id: string): Promise<boolean> {
  try {
    await prisma.categories.delete({ where: { id } });
    return true;
  } catch (error: any) {
    if (error.code === 'P2025') return false;
    throw error;
  }
}

// Institutions
export async function getInstitutions(): Promise<types.Institution[]> {
  return prisma.institutions.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function getInstitutionById(id: string): Promise<types.Institution | null> {
  return prisma.institutions.findUnique({
    where: { id },
  });
}

export async function createInstitution(data: Omit<types.Institution, "id" | "createdAt" | "updatedAt">): Promise<types.Institution> {
  return prisma.institutions.create({
    data: {
      id: `inst-${Date.now()}`,
      name: data.name,
      nameEn: data.nameEn,
      abbreviation: data.abbreviation,
      logoUrl: data.logoUrl,
      website: data.website || null,
      description: data.description || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
}

export async function updateInstitution(id: string, data: Partial<types.Institution>): Promise<types.Institution | null> {
  try {
    return await prisma.institutions.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.nameEn && { nameEn: data.nameEn }),
        ...(data.abbreviation && { abbreviation: data.abbreviation }),
        ...(data.logoUrl && { logoUrl: data.logoUrl }),
        ...(data.website !== undefined && { website: data.website }),
        ...(data.description !== undefined && { description: data.description }),
      },
    });
  } catch (error: any) {
    if (error.code === 'P2025') return null;
    throw error;
  }
}

export async function deleteInstitution(id: string): Promise<boolean> {
  try {
    await prisma.institutions.delete({ where: { id } });
    return true;
  } catch (error: any) {
    if (error.code === 'P2025') return false;
    throw error;
  }
}

// Instructors
export async function getInstructors(): Promise<types.Instructor[]> {
  return prisma.instructors.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function getInstructorById(id: string): Promise<types.Instructor | null> {
  return prisma.instructors.findUnique({
    where: { id },
  });
}

export async function createInstructor(data: Omit<types.Instructor, "id" | "createdAt" | "updatedAt">): Promise<types.Instructor> {
  return prisma.instructors.create({
    data: {
      id: `instr-${Date.now()}`,
      name: data.name,
      nameEn: data.nameEn,
      title: data.title,
      institutionId: data.institutionId,
      bio: data.bio || null,
      imageUrl: data.imageUrl || null,
      email: data.email || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
}

export async function updateInstructor(id: string, data: Partial<types.Instructor>): Promise<types.Instructor | null> {
  try {
    return await prisma.instructors.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.nameEn && { nameEn: data.nameEn }),
        ...(data.title && { title: data.title }),
        ...(data.institutionId && { institutionId: data.institutionId }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
        ...(data.email !== undefined && { email: data.email }),
      },
    });
  } catch (error: any) {
    if (error.code === 'P2025') return null;
    throw error;
  }
}

export async function deleteInstructor(id: string): Promise<boolean> {
  try {
    await prisma.instructors.delete({ where: { id } });
    return true;
  } catch (error: any) {
    if (error.code === 'P2025') return false;
    throw error;
  }
}

// Courses
export async function getCourses(): Promise<types.Course[]> {
  return prisma.courses.findMany({
    include: {
      courseCategories: {
        select: {
          categoryId: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getCourseById(id: string): Promise<types.Course | null> {
  const course = await prisma.courses.findUnique({
    where: { id },
    include: {
      courseCategories: {
        select: {
          categoryId: true,
        },
      },
      courseCourseTypes: {
        select: {
          courseTypeId: true,
        },
      },
    },
  });

  if (!course) return null;

  // Transform to match Course type with categoryIds and courseTypeIds
  return {
    ...course,
    categoryIds: course.courseCategories.map((cc: any) => cc.categoryId),
    courseTypeIds: course.courseCourseTypes.map((cct: any) => cct.courseTypeId),
  } as types.Course;
}

export async function createCourse(data: Omit<types.Course, "id" | "createdAt" | "updatedAt">): Promise<types.Course> {
  return prisma.courses.create({
    data: {
      id: `course-${Date.now()}`,
      title: data.title,
      titleEn: data.titleEn,
      description: data.description,
      institutionId: data.institutionId || null,
      instructorId: data.instructorId || null,
      imageId: data.imageId || null,
      level: data.level || null,
      durationHours: data.durationHours || null,
      hasCertificate: data.hasCertificate || false,
      enrollCount: data.enrollCount || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
}

export async function updateCourse(id: string, data: Partial<types.Course>): Promise<types.Course | null> {
  try {
    return await prisma.courses.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.titleEn && { titleEn: data.titleEn }),
        ...(data.description && { description: data.description }),
        ...(data.institutionId !== undefined && { institutionId: data.institutionId }),
        ...(data.instructorId !== undefined && { instructorId: data.instructorId }),
        ...(data.imageId !== undefined && { imageId: data.imageId }),
        ...(data.level !== undefined && { level: data.level }),
        ...(data.durationHours !== undefined && { durationHours: data.durationHours }),
        ...(data.hasCertificate !== undefined && { hasCertificate: data.hasCertificate }),
        ...(data.enrollCount !== undefined && { enrollCount: data.enrollCount }),
      },
    });
  } catch (error: any) {
    if (error.code === 'P2025') return null;
    throw error;
  }
}

export async function deleteCourse(id: string): Promise<boolean> {
  try {
    await prisma.courses.delete({ where: { id } });
    return true;
  } catch (error: any) {
    if (error.code === 'P2025') return false;
    throw error;
  }
}

// News
export async function getNews(): Promise<types.News[]> {
  return prisma.news.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function getNewsById(id: string): Promise<types.News | null> {
  return prisma.news.findUnique({
    where: { id },
  });
}

export async function createNews(data: Omit<types.News, "id" | "createdAt" | "updatedAt">): Promise<types.News> {
  return prisma.news.create({
    data: {
      id: `news-${Date.now()}`,
      title: data.title,
      content: data.content,
      imageId: data.imageId,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
}

export async function updateNews(id: string, data: Partial<types.News>): Promise<types.News | null> {
  try {
    return await prisma.news.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.content && { content: data.content }),
        ...(data.imageId && { imageId: data.imageId }),
      },
    });
  } catch (error: any) {
    if (error.code === 'P2025') return null;
    throw error;
  }
}

export async function deleteNews(id: string): Promise<boolean> {
  try {
    await prisma.news.delete({ where: { id } });
    return true;
  } catch (error: any) {
    if (error.code === 'P2025') return false;
    throw error;
  }
}

// Banners
export async function getBanners(): Promise<types.Banner[]> {
  return prisma.banners.findMany({
    orderBy: { order: 'asc' },
  });
}

export async function getBannerById(id: string): Promise<types.Banner | null> {
  return prisma.banners.findUnique({
    where: { id },
  });
}

export async function createBanner(data: Omit<types.Banner, "id" | "createdAt" | "updatedAt">): Promise<types.Banner> {
  return prisma.banners.create({
    data: {
      id: `banner-${Date.now()}`,
      title: data.title,
      titleEn: data.titleEn,
      subtitle: data.subtitle || null,
      subtitleEn: data.subtitleEn || null,
      imageId: data.imageId,
      linkUrl: data.linkUrl || null,
      isActive: data.isActive ?? true,
      order: data.order ?? 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
}

export async function updateBanner(id: string, data: Partial<types.Banner>): Promise<types.Banner | null> {
  try {
    return await prisma.banners.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.titleEn && { titleEn: data.titleEn }),
        ...(data.subtitle !== undefined && { subtitle: data.subtitle }),
        ...(data.subtitleEn !== undefined && { subtitleEn: data.subtitleEn }),
        ...(data.imageId && { imageId: data.imageId }),
        ...(data.linkUrl !== undefined && { linkUrl: data.linkUrl }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.order !== undefined && { order: data.order }),
      },
    });
  } catch (error: any) {
    if (error.code === 'P2025') return null;
    throw error;
  }
}

export async function deleteBanner(id: string): Promise<boolean> {
  try {
    await prisma.banners.delete({ where: { id } });
    return true;
  } catch (error: any) {
    if (error.code === 'P2025') return false;
    throw error;
  }
}

// Settings
export async function getSettings(): Promise<types.WebAppSettings> {
  const settings = await prisma.webapp_settings.findFirst();

  if (!settings) {
    // Return default settings
    return {
      id: "",
      siteName: "Thai MOOC",
      siteLogo: "",
      contactEmail: "contact@thaimooc.ac.th",
      contactPhone: "02-123-4567",
      address: "กรุงเทพมหานคร ประเทศไทย",
      aboutUs: null,
      aboutUsEn: null,
      mapUrl: null,
      facebookUrl: null,
      twitterUrl: null,
      youtubeUrl: null,
      instagramUrl: null,
      lineUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  return settings;
}

export async function updateSettings(data: Partial<types.WebAppSettings>): Promise<types.WebAppSettings> {
  let settings = await prisma.webapp_settings.findFirst();

  if (!settings) {
    // Create new settings
    settings = await prisma.webapp_settings.create({
      data: {
        id: `settings-${Date.now()}`,
        siteName: data.siteName || "Thai MOOC",
        siteLogo: data.siteLogo || "",
        contactEmail: data.contactEmail || "contact@thaimooc.ac.th",
        contactPhone: data.contactPhone || "02-123-4567",
        address: data.address || "กรุงเทพมหานคร ประเทศไทย",
        aboutUs: data.aboutUs || null,
        aboutUsEn: data.aboutUsEn || null,
        mapUrl: data.mapUrl || null,
        facebookUrl: data.facebookUrl || null,
        twitterUrl: data.twitterUrl || null,
        youtubeUrl: data.youtubeUrl || null,
        instagramUrl: data.instagramUrl || null,
        lineUrl: data.lineUrl || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  } else {
    // Update existing settings
    settings = await prisma.webapp_settings.update({
      where: { id: settings.id },
      data: {
        ...(data.siteName !== undefined && { siteName: data.siteName }),
        ...(data.siteLogo !== undefined && { siteLogo: data.siteLogo }),
        ...(data.contactEmail !== undefined && { contactEmail: data.contactEmail }),
        ...(data.contactPhone !== undefined && { contactPhone: data.contactPhone }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.aboutUs !== undefined && { aboutUs: data.aboutUs }),
        ...(data.aboutUsEn !== undefined && { aboutUsEn: data.aboutUsEn }),
        ...(data.mapUrl !== undefined && { mapUrl: data.mapUrl }),
        ...(data.facebookUrl !== undefined && { facebookUrl: data.facebookUrl }),
        ...(data.twitterUrl !== undefined && { twitterUrl: data.twitterUrl }),
        ...(data.youtubeUrl !== undefined && { youtubeUrl: data.youtubeUrl }),
        ...(data.instagramUrl !== undefined && { instagramUrl: data.instagramUrl }),
        ...(data.lineUrl !== undefined && { lineUrl: data.lineUrl }),
      },
    });
  }

  return settings;
}

// Image Placeholders
export async function getImagePlaceholders(): Promise<types.ImagePlaceholder[]> {
  const placeholders = await prisma.image_placeholders.findMany();
  return placeholders as types.ImagePlaceholder[];
}

export async function getImagePlaceholderById(id: string): Promise<types.ImagePlaceholder | null> {
  const placeholder = await prisma.image_placeholders.findUnique({
    where: { id },
  });
  return placeholder as types.ImagePlaceholder | null;
}

// Sync version for utils
export function getImagePlaceholder(imageId: string): types.ImagePlaceholder | null {
  // This is a synchronous placeholder lookup
  // In a real app, you'd want to cache this or use a different approach
  // For now, return null and let the caller handle the fallback
  return null;
}
