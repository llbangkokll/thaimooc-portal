import { NextRequest, NextResponse } from "next/server";
import { query, queryOne, execute } from "@/lib/mysql-direct";

export async function GET() {
  try {
    const categories = await query(
      'SELECT * FROM categories ORDER BY createdAt DESC'
    );

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
    const lastCategory = await queryOne<{ id: string }>(
      'SELECT id FROM categories ORDER BY id DESC LIMIT 1'
    );

    let sequence = 1;
    if (lastCategory && lastCategory.id.match(/^\d{2}$/)) {
      sequence = parseInt(lastCategory.id) + 1;
    }

    const id = sequence.toString().padStart(2, '0');
    const now = new Date();

    await execute(
      'INSERT INTO categories (id, name, nameEn, icon, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
      [id, body.name, body.nameEn, body.icon, now, now]
    );

    const newCategory = await queryOne(
      'SELECT * FROM categories WHERE id = ?',
      [id]
    );

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
