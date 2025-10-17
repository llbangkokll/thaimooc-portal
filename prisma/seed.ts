import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Seed Image Placeholders
  console.log('📸 Seeding image placeholders...');
  await prisma.image_placeholders.createMany({
    data: [
      { id: "img-1", url: "https://images.unsplash.com/photo-1516397281156-ca07cf9746fc", title: "Computer Science", category: "course" },
      { id: "img-2", url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085", title: "Programming", category: "course" },
      { id: "img-3", url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40", title: "Business", category: "course" },
      { id: "img-4", url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d", title: "Health", category: "course" },
      { id: "img-5", url: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952", title: "Engineering", category: "course" },
      { id: "img-6", url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f", title: "Arts", category: "course" },
      { id: "img-7", url: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d", title: "Language", category: "course" },
      { id: "img-8", url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d", title: "Science", category: "course" },
      { id: "img-9", url: "https://images.unsplash.com/photo-1509062522246-3755977927d7", title: "Social Science", category: "course" },
      { id: "img-10", url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644", title: "Education Banner", category: "banner" },
      { id: "img-11", url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c", title: "Technology", category: "course" },
      { id: "img-12", url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f", title: "Teamwork", category: "course" },
      { id: "img-13", url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173", title: "Online Learning", category: "banner" },
      { id: "img-14", url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b", title: "Mathematics", category: "course" },
      { id: "img-15", url: "https://images.unsplash.com/photo-1507413245164-6160d8298b31", title: "News Event", category: "news" },
      { id: "img-16", url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655", title: "Graduation", category: "news" },
      { id: "img-17", url: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846", title: "Marketing", category: "course" },
      { id: "img-18", url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6", title: "Book Learning", category: "course" },
      { id: "img-19", url: "https://images.unsplash.com/photo-1531482615713-2afd69097998", title: "Innovation", category: "banner" },
      { id: "img-20", url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c", title: "University Life", category: "news" },
      { id: "img-21", url: "https://images.unsplash.com/photo-1551836022-d5d88e9218df", title: "Data Science", category: "course" },
      { id: "img-22", url: "https://images.unsplash.com/photo-1485217988980-11786ced9454", title: "Professor", category: "instructor" },
    ],
    skipDuplicates: true,
  });

  // Seed Categories
  console.log('📂 Seeding categories...');
  const categories = await Promise.all([
    prisma.categories.upsert({
      where: { id: 'cat-1' },
      update: {},
      create: { id: 'cat-1', name: 'สุขภาพและการแพทย์', nameEn: 'Health and Medicine', icon: 'HeartIcon', createdAt: new Date(), updatedAt: new Date() },
    }),
    prisma.categories.upsert({
      where: { id: 'cat-2' },
      update: {},
      create: { id: 'cat-2', name: 'คณิตศาสตร์และวิทยาศาสตร์', nameEn: 'Math and Science', icon: 'CalculatorIcon', createdAt: new Date(), updatedAt: new Date() },
    }),
    prisma.categories.upsert({
      where: { id: 'cat-3' },
      update: {},
      create: { id: 'cat-3', name: 'วิศวกรรมศาสตร์', nameEn: 'Engineering', icon: 'CogIcon', createdAt: new Date(), updatedAt: new Date() },
    }),
    prisma.categories.upsert({
      where: { id: 'cat-4' },
      update: {},
      create: { id: 'cat-4', name: 'ศิลปะและการออกแบบ', nameEn: 'Arts and Design', icon: 'PaintbrushIcon', createdAt: new Date(), updatedAt: new Date() },
    }),
    prisma.categories.upsert({
      where: { id: 'cat-5' },
      update: {},
      create: { id: 'cat-5', name: 'ธุรกิจและการจัดการ', nameEn: 'Business and Management', icon: 'BriefcaseIcon', createdAt: new Date(), updatedAt: new Date() },
    }),
    prisma.categories.upsert({
      where: { id: 'cat-6' },
      update: {},
      create: { id: 'cat-6', name: 'คอมพิวเตอร์และเทคโนโลยี', nameEn: 'Computer and Technology', icon: 'ComputerDesktopIcon', createdAt: new Date(), updatedAt: new Date() },
    }),
    prisma.categories.upsert({
      where: { id: 'cat-7' },
      update: {},
      create: { id: 'cat-7', name: 'ภาษาและวรรณกรรม', nameEn: 'Language and Literature', icon: 'LanguageIcon', createdAt: new Date(), updatedAt: new Date() },
    }),
    prisma.categories.upsert({
      where: { id: 'cat-8' },
      update: {},
      create: { id: 'cat-8', name: 'สังคมศาสตร์', nameEn: 'Social Sciences', icon: 'UserGroupIcon', createdAt: new Date(), updatedAt: new Date() },
    }),
    prisma.categories.upsert({
      where: { id: 'cat-9' },
      update: {},
      create: { id: 'cat-9', name: 'การศึกษา', nameEn: 'Education', icon: 'AcademicCapIcon', createdAt: new Date(), updatedAt: new Date() },
    }),
    prisma.categories.upsert({
      where: { id: 'cat-10' },
      update: {},
      create: { id: 'cat-10', name: 'กฎหมาย', nameEn: 'Law', icon: 'ScaleIcon', createdAt: new Date(), updatedAt: new Date() },
    }),
    prisma.categories.upsert({
      where: { id: 'cat-11' },
      update: {},
      create: { id: 'cat-11', name: 'การเกษตร', nameEn: 'Agriculture', icon: 'BeakerIcon', createdAt: new Date(), updatedAt: new Date() },
    }),
    prisma.categories.upsert({
      where: { id: 'cat-12' },
      update: {},
      create: { id: 'cat-12', name: 'อื่นๆ', nameEn: 'Others', icon: 'EllipsisHorizontalCircleIcon', createdAt: new Date(), updatedAt: new Date() },
    }),
  ]);

  // Seed Institutions
  console.log('🏛️ Seeding institutions...');
  const institutions = await Promise.all([
    prisma.institutions.upsert({
      where: { id: 'inst-1' },
      update: {},
      create: {
        id: 'inst-1',
        name: 'จุฬาลงกรณ์มหาวิทยาลัย',
        nameEn: 'Chulalongkorn University',
        abbreviation: 'CU',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/th/9/94/Chulalongkorn_University_seal.svg',
        website: 'https://www.chula.ac.th',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),
    prisma.institutions.upsert({
      where: { id: 'inst-2' },
      update: {},
      create: {
        id: 'inst-2',
        name: 'มหาวิทยาลัยธรรมศาสตร์',
        nameEn: 'Thammasat University',
        abbreviation: 'TU',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/th/e/ea/Thammasat_University_Emblem.svg',
        website: 'https://www.tu.ac.th',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),
    prisma.institutions.upsert({
      where: { id: 'inst-3' },
      update: {},
      create: {
        id: 'inst-3',
        name: 'มหาวิทยาลัยมหิดล',
        nameEn: 'Mahidol University',
        abbreviation: 'MU',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/th/8/86/Mahidol_U_Seal.svg',
        website: 'https://www.mahidol.ac.th',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),
    prisma.institutions.upsert({
      where: { id: 'inst-4' },
      update: {},
      create: {
        id: 'inst-4',
        name: 'มหาวิทยาลัยเกษตรศาสตร์',
        nameEn: 'Kasetsart University',
        abbreviation: 'KU',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/th/f/f5/Ku-seal-color.svg',
        website: 'https://www.ku.ac.th',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),
    prisma.institutions.upsert({
      where: { id: 'inst-5' },
      update: {},
      create: {
        id: 'inst-5',
        name: 'มหาวิทยาลัยขอนแก่น',
        nameEn: 'Khon Kaen University',
        abbreviation: 'KKU',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/th/9/9d/KKU-seal-color.svg',
        website: 'https://www.kku.ac.th',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),
  ]);

  // Seed Instructors
  console.log('👨‍🏫 Seeding instructors...');
  const instructors = await Promise.all([
    prisma.instructors.upsert({
      where: { id: 'instr-1' },
      update: {},
      create: {
        id: 'instr-1',
        name: 'ศ. ดร. สมชาย ใจดี',
        nameEn: 'Prof. Dr. Somchai Jaidee',
        title: 'Professor',
        institutionId: institutions[0].id,
        bio: 'ผู้เชี่ยวชาญด้านวิทยาศาสตร์คอมพิวเตอร์',
        imageUrl: 'img-22',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),
    prisma.instructors.upsert({
      where: { id: 'instr-2' },
      update: {},
      create: {
        id: 'instr-2',
        name: 'ผศ. ดร. สมหญิง รักการเรียน',
        nameEn: 'Asst. Prof. Dr. Somying Rakgarean',
        title: 'Assistant Professor',
        institutionId: institutions[1].id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),
    prisma.instructors.upsert({
      where: { id: 'instr-3' },
      update: {},
      create: {
        id: 'instr-3',
        name: 'รศ. ดร. วิชัย สุขสันต์',
        nameEn: 'Assoc. Prof. Dr. Wichai Suksan',
        title: 'Associate Professor',
        institutionId: institutions[2].id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),
    prisma.instructors.upsert({
      where: { id: 'instr-4' },
      update: {},
      create: {
        id: 'instr-4',
        name: 'อ. ดร. ประยุทธ เก่งกาจ',
        nameEn: 'Dr. Prayut Kengkaj',
        title: 'Lecturer',
        institutionId: institutions[3].id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),
    prisma.instructors.upsert({
      where: { id: 'instr-5' },
      update: {},
      create: {
        id: 'instr-5',
        name: 'ผศ. ดร. สุดารัตน์ มีความสุข',
        nameEn: 'Asst. Prof. Dr. Sudarat Meekwamsuk',
        title: 'Assistant Professor',
        institutionId: institutions[4].id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),
  ]);

  // Seed Courses
  console.log('📚 Seeding courses...');
  await prisma.courses.createMany({
    data: [
      {
        id: 'course-1',
        title: 'การเขียนโปรแกรมพื้นฐาน',
        titleEn: 'Introduction to Programming',
        description: 'เรียนรู้พื้นฐานการเขียนโปรแกรมด้วย Python',
        institutionId: institutions[0].id,
        instructorId: instructors[0].id,
        imageId: 'img-2',
        level: 'Beginner',
        durationHours: 40,
        hasCertificate: true,
        enrollCount: 1250,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'course-2',
        title: 'การจัดการธุรกิจยุคดิจิทัล',
        titleEn: 'Digital Business Management',
        description: 'เรียนรู้การบริหารจัดการธุรกิจในยุคดิจิทัล',
        institutionId: institutions[1].id,
        instructorId: instructors[1].id,
        imageId: 'img-3',
        level: 'Intermediate',
        durationHours: 30,
        hasCertificate: true,
        enrollCount: 890,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'course-3',
        title: 'สุขภาพและโภชนาการ',
        titleEn: 'Health and Nutrition',
        description: 'ความรู้พื้นฐานเกี่ยวกับสุขภาพและโภชนาการ',
        institutionId: institutions[2].id,
        instructorId: instructors[2].id,
        imageId: 'img-4',
        level: 'Beginner',
        durationHours: 25,
        hasCertificate: false,
        enrollCount: 2100,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'course-4',
        title: 'วิศวกรรมซอฟต์แวร์',
        titleEn: 'Software Engineering',
        description: 'หลักการพัฒนาซอฟต์แวร์แบบมืออาชีพ',
        institutionId: institutions[0].id,
        instructorId: instructors[0].id,
        imageId: 'img-5',
        level: 'Advanced',
        durationHours: 60,
        hasCertificate: true,
        enrollCount: 750,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'course-5',
        title: 'ศิลปะการออกแบบ',
        titleEn: 'Art and Design',
        description: 'พื้นฐานการออกแบบและทฤษฎีสี',
        institutionId: institutions[1].id,
        instructorId: instructors[1].id,
        imageId: 'img-6',
        level: 'Beginner',
        durationHours: 35,
        hasCertificate: true,
        enrollCount: 1500,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'course-6',
        title: 'ภาษาอังกฤษเพื่อการสื่อสาร',
        titleEn: 'English for Communication',
        description: 'พัฒนาทักษะการใช้ภาษาอังกฤษในชีวิตประจำวัน',
        institutionId: institutions[3].id,
        instructorId: instructors[3].id,
        imageId: 'img-7',
        level: 'Intermediate',
        durationHours: 45,
        hasCertificate: true,
        enrollCount: 3200,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'course-7',
        title: 'คณิตศาสตร์สำหรับวิทยาศาสตร์ข้อมูล',
        titleEn: 'Mathematics for Data Science',
        description: 'คณิตศาสตร์พื้นฐานสำหรับการวิเคราะห์ข้อมูล',
        institutionId: institutions[4].id,
        instructorId: instructors[4].id,
        imageId: 'img-14',
        level: 'Intermediate',
        durationHours: 50,
        hasCertificate: true,
        enrollCount: 980,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'course-8',
        title: 'จิตวิทยาเบื้องต้น',
        titleEn: 'Introduction to Psychology',
        description: 'ความรู้พื้นฐานทางจิตวิทยา',
        institutionId: institutions[2].id,
        instructorId: instructors[2].id,
        imageId: 'img-9',
        level: 'Beginner',
        durationHours: 30,
        hasCertificate: false,
        enrollCount: 1800,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'course-9',
        title: 'หลักกฎหมายมหาชน',
        titleEn: 'Public Law Principles',
        description: 'พื้นฐานกฎหมายมหาชนไทย',
        institutionId: institutions[1].id,
        instructorId: instructors[1].id,
        imageId: 'img-3',
        level: 'Intermediate',
        durationHours: 40,
        hasCertificate: true,
        enrollCount: 650,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'course-10',
        title: 'เทคโนโลยีการเกษตรสมัยใหม่',
        titleEn: 'Modern Agricultural Technology',
        description: 'เทคโนโลยีและนวัตกรรมในการเกษตร',
        institutionId: institutions[3].id,
        instructorId: instructors[3].id,
        imageId: 'img-5',
        level: 'Intermediate',
        durationHours: 35,
        hasCertificate: true,
        enrollCount: 520,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'course-11',
        title: 'การพัฒนาเว็บแอปพลิเคชัน',
        titleEn: 'Web Application Development',
        description: 'สร้างเว็บแอปพลิเคชันด้วย React และ Node.js',
        institutionId: institutions[0].id,
        instructorId: instructors[0].id,
        imageId: 'img-11',
        level: 'Advanced',
        durationHours: 70,
        hasCertificate: true,
        enrollCount: 2400,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'course-12',
        title: 'การตลาดดิจิทัล',
        titleEn: 'Digital Marketing',
        description: 'กลยุทธ์การตลาดออนไลน์และโซเชียลมีเดีย',
        institutionId: institutions[1].id,
        instructorId: instructors[1].id,
        imageId: 'img-17',
        level: 'Beginner',
        durationHours: 25,
        hasCertificate: true,
        enrollCount: 2800,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    skipDuplicates: true,
  });

  // Seed News
  console.log('📰 Seeding news...');
  await prisma.news.createMany({
    data: [
      {
        id: 'news-1',
        title: 'เปิดรับสมัครคอร์สเรียนออนไลน์ใหม่',
        content: 'ขอเชิญชวนผู้สนใจเข้าร่วมคอร์สเรียนออนไลน์ใหม่...',
        imageId: 'img-15',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'news-2',
        title: 'ประกาศผลการแข่งขันพัฒนาซอฟต์แวร์',
        content: 'ขอแสดงความยินดีกับผู้ชนะการแข่งขัน...',
        imageId: 'img-16',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'news-3',
        title: 'อัพเดทฟีเจอร์ใหม่ของแพลตฟอร์ม',
        content: 'เรามีฟีเจอร์ใหม่ที่น่าสนใจมากมาย...',
        imageId: 'img-20',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'news-4',
        title: 'เชิญร่วมงานสัมมนาออนไลน์',
        content: 'งานสัมมนาออนไลน์เรื่องการศึกษายุคดิจิทัล...',
        imageId: 'img-13',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    skipDuplicates: true,
  });

  // Seed Banners
  console.log('🎨 Seeding banners...');
  await prisma.banners.createMany({
    data: [
      {
        id: 'banner-1',
        title: 'เรียนรู้ได้ทุกที่ ทุกเวลา',
        titleEn: 'Learn Anywhere, Anytime',
        subtitle: 'เข้าถึงคอร์สเรียนคุณภาพจากมหาวิทยาลัยชั้นนำ',
        subtitleEn: 'Access quality courses from leading universities',
        imageId: 'img-10',
        createdAt: new Date(),
        updatedAt: new Date(),
        order: 1,
        isActive: true,
      },
      {
        id: 'banner-2',
        title: 'พัฒนาทักษะของคุณ',
        titleEn: 'Develop Your Skills',
        subtitle: 'คอร์สเรียนหลากหลายสาขา',
        subtitleEn: 'Diverse courses across multiple fields',
        imageId: 'img-13',
        createdAt: new Date(),
        updatedAt: new Date(),
        order: 2,
        isActive: true,
      },
      {
        id: 'banner-3',
        title: 'รับใบประกาศนียบัตร',
        titleEn: 'Get Certified',
        subtitle: 'ใบประกาศนียบัตรที่ได้รับการยอมรับ',
        subtitleEn: 'Recognized certificates',
        imageId: 'img-19',
        createdAt: new Date(),
        updatedAt: new Date(),
        order: 3,
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  // Seed WebApp Settings
  console.log('⚙️ Seeding settings...');
  await prisma.webapp_settings.upsert({
    where: { id: 'settings-1' },
    update: {},
    create: {
      id: 'settings-1',
      siteName: 'Thai MOOC',
      siteLogo: '',
      contactEmail: 'contact@thaimooc.ac.th',
      contactPhone: '02-123-4567',
      address: 'กรุงเทพมหานคร ประเทศไทย',
      facebookUrl: '',
      twitterUrl: '',
      youtubeUrl: '',
      instagramUrl: '',
      lineUrl: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
