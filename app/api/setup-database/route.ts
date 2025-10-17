import { NextResponse } from 'next/server';

const PASSWORD = 'thaimooc2024'; // เปลี่ยนรหัสผ่านนี้ได้

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    // ตรวจสอบรหัสผ่าน
    if (password !== PASSWORD) {
      return NextResponse.json(
        { success: false, error: 'รหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      );
    }

    // Import setup function
    const { setupDatabase } = require('@/setup-web');

    // รัน setup
    const results = await setupDatabase();

    if (results.success) {
      return NextResponse.json({
        success: true,
        message: 'ตั้งค่าฐานข้อมูลเสร็จสมบูรณ์!',
        steps: results.steps,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'เกิดข้อผิดพลาดในการตั้งค่า',
          steps: results.steps,
          errors: results.errors,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Thai MOOC Database Setup API',
    method: 'POST',
    endpoint: '/api/setup-database',
    body: {
      password: 'your_password',
    },
  });
}
