import { NextRequest, NextResponse } from "next/server";
import { query, queryOne, execute } from "@/lib/mysql-direct";

export async function GET() {
  try {
    const institutions = await query(
      'SELECT * FROM institutions ORDER BY createdAt DESC'
    );

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
    const lastInstitution = await queryOne<{ id: string }>(
      'SELECT id FROM institutions ORDER BY id DESC LIMIT 1'
    );

    let sequence = 1;
    if (lastInstitution && lastInstitution.id.startsWith(year)) {
      const lastSequence = parseInt(lastInstitution.id.slice(-3));
      sequence = lastSequence + 1;
    }

    const id = `${year}${sequence.toString().padStart(3, '0')}`;
    const now = new Date();

    await execute(
      `INSERT INTO institutions (id, name, nameEn, abbreviation, logoUrl, website, description, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        body.name,
        body.nameEn,
        body.abbreviation,
        body.logoUrl,
        body.website || null,
        body.description || null,
        now,
        now
      ]
    );

    const newInstitution = await queryOne(
      'SELECT * FROM institutions WHERE id = ?',
      [id]
    );

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
