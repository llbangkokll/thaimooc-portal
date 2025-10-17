import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { requireSuperAdmin } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Only Super Admin can access
    await requireSuperAdmin();

    const { id } = await params;
    const user = await prisma.admin_users.findUnique({
      where: { id },
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
      }
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error fetching admin user:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch admin user",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Only Super Admin can update users
    await requireSuperAdmin();

    const { id } = await params;
    const body = await request.json();

    // Check if user exists
    const existingUser = await prisma.admin_users.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    // Check if username is being changed and already exists
    if (body.username && body.username !== existingUser.username) {
      const usernameExists = await prisma.admin_users.findUnique({
        where: { username: body.username },
      });

      if (usernameExists) {
        return NextResponse.json(
          {
            success: false,
            error: "Username already exists",
          },
          { status: 400 }
        );
      }
    }

    // Check if email is being changed and already exists
    if (body.email && body.email !== existingUser.email) {
      const emailExists = await prisma.admin_users.findUnique({
        where: { email: body.email },
      });

      if (emailExists) {
        return NextResponse.json(
          {
            success: false,
            error: "Email already exists",
          },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};

    if (body.username) updateData.username = body.username;
    if (body.name) updateData.name = body.name;
    if (body.email) updateData.email = body.email;
    if (body.role) updateData.role = body.role;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    // Hash new password if provided
    if (body.password) {
      updateData.password = await bcrypt.hash(body.password, 10);
    }

    // Update user
    const updatedUser = await prisma.admin_users.update({
      where: { id },
      data: updateData,
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
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating admin user:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update admin user",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Only Super Admin can delete users
    await requireSuperAdmin();

    const { id } = await params;

    // Check if user exists
    const existingUser = await prisma.admin_users.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    // Delete user
    await prisma.admin_users.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting admin user:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete admin user",
      },
      { status: 500 }
    );
  }
}
