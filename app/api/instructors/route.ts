import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/mysql-direct";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const institutionId = searchParams.get("institutionId");

    let sql = 'SELECT * FROM instructors';
    const params: any[] = [];

    if (institutionId) {
      sql += ' WHERE institutionId = ?';
      params.push(institutionId);
    }

    sql += ' ORDER BY createdAt DESC';

    const instructors = await query(sql, params);

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
    const now = new Date();

    await execute(
      `INSERT INTO instructors (id, name, nameEn, title, institutionId, bio, imageUrl, email, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        body.name,
        body.nameEn,
        body.title,
        body.institutionId,
        body.bio || null,
        body.imageUrl || null,
        body.email || null,
        now,
        now
      ]
    );

    const newInstructor = await query(
      'SELECT * FROM instructors WHERE id = ?',
      [id]
    );

    return NextResponse.json(
      {
        success: true,
        data: newInstructor[0],
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
