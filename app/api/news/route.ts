import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/mysql-direct";

export async function GET() {
  try {
    const news = await query(
      'SELECT * FROM news ORDER BY createdAt DESC'
    );

    return NextResponse.json({
      success: true,
      data: news,
      count: news.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch news",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.title || !body.content || !body.imageId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: title, content, imageId",
        },
        { status: 400 }
      );
    }

    const id = `news-${Date.now()}`;
    const now = new Date();

    await execute(
      'INSERT INTO news (id, title, content, imageId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
      [id, body.title, body.content, body.imageId, now, now]
    );

    const newNews = await query(
      'SELECT * FROM news WHERE id = ?',
      [id]
    );

    return NextResponse.json(
      {
        success: true,
        data: newNews[0],
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create news",
      },
      { status: 500 }
    );
  }
}
