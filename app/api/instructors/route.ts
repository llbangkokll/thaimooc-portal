import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const institutionId = searchParams.get("institutionId");

    const instructors = await prisma.instructors.findMany({
      where: institutionId ? { institutionId } : undefined,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: instructors,
      count: instructors.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch instructors",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.nameEn || !body.title || !body.institutionId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: name, nameEn, title, institutionId",
        },
        { status: 400 }
      );
    }

    // Generate ID
    const id = `instr-${Date.now()}`;

    const newInstructor = await prisma.instructors.create({
      data: {
        id,
        name: body.name,
        nameEn: body.nameEn,
        title: body.title,
        institutionId: body.institutionId,
        bio: body.bio || null,
        imageUrl: body.imageUrl || null,
        email: body.email || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: newInstructor,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create instructor",
      },
      { status: 500 }
    );
  }
}
