import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const institutions = await prisma.institutions.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: institutions,
      count: institutions.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch institutions",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.nameEn || !body.abbreviation || !body.logoUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: name, nameEn, abbreviation, logoUrl",
        },
        { status: 400 }
      );
    }

    // Generate ID: YYNNN format (e.g., 25001)
    const year = new Date().getFullYear().toString().slice(-2); // Get last 2 digits of year
    const lastInstitution = await prisma.institutions.findFirst({
      orderBy: { id: 'desc' },
    });

    let sequence = 1;
    if (lastInstitution && lastInstitution.id.startsWith(year)) {
      const lastSequence = parseInt(lastInstitution.id.slice(-3));
      sequence = lastSequence + 1;
    }

    const id = `${year}${sequence.toString().padStart(3, '0')}`;

    const newInstitution = await prisma.institutions.create({
      data: {
        id,
        name: body.name,
        nameEn: body.nameEn,
        abbreviation: body.abbreviation,
        logoUrl: body.logoUrl,
        website: body.website || null,
        description: body.description || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: newInstitution,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create institution",
      },
      { status: 500 }
    );
  }
}
