import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.categories.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: categories,
      count: categories.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch categories",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.nameEn || !body.icon) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: name, nameEn, icon",
        },
        { status: 400 }
      );
    }

    // Generate ID: 2-digit format (01, 02, 03, ...)
    const lastCategory = await prisma.categories.findFirst({
      orderBy: { id: 'desc' },
    });

    let sequence = 1;
    if (lastCategory && lastCategory.id.match(/^\d{2}$/)) {
      sequence = parseInt(lastCategory.id) + 1;
    }

    const id = sequence.toString().padStart(2, '0');

    const newCategory = await prisma.categories.create({
      data: {
        id,
        name: body.name,
        nameEn: body.nameEn,
        icon: body.icon,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: newCategory,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create category",
      },
      { status: 500 }
    );
  }
}
