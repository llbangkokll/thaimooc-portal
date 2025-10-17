import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { requireSuperAdmin } from "@/lib/auth";

export async function GET() {
  try {
    // Only Super Admin can access
    await requireSuperAdmin();

    const users = await prisma.admin_users.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        // Exclude password from response
      }
    });

    return NextResponse.json({
      success: true,
      data: users,
      count: users.length,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden: Super Admin access required",
        },
        { status: 403 }
      );
    }

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    console.error("Error fetching admin users:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch admin users",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Only Super Admin can create users
    await requireSuperAdmin();

    const body = await request.json();

    // Validate required fields
    if (!body.username || !body.password || !body.name || !body.email) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: username, password, name, email",
        },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUser = await prisma.admin_users.findUnique({
      where: { username: body.username },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Username already exists",
        },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingEmail = await prisma.admin_users.findUnique({
      where: { email: body.email },
    });

    if (existingEmail) {
      return NextResponse.json(
        {
          success: false,
          error: "Email already exists",
        },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 10);

    // Create new admin user
    const newUser = await prisma.admin_users.create({
      data: {
        username: body.username,
        password: hashedPassword,
        name: body.name,
        email: body.email,
        role: body.role || "admin",
        isActive: body.isActive !== undefined ? body.isActive : true,
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return NextResponse.json(
      {
        success: true,
        data: newUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating admin user:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create admin user",
      },
      { status: 500 }
    );
  }
}
