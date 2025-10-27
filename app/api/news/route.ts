import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/mysql-direct";
import { apiCache } from "@/lib/api-cache";

const CACHE_KEY = 'news:all';

export async function GET() {
  try {
    // Check cache first
    const cachedData = apiCache.get(CACHE_KEY);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    const news = await query(
      'SELECT * FROM news ORDER BY createdAt DESC'
    );

    const response = {
      success: true,
      data: news,
      count: news.length,
    };

    // Cache for 2 minutes (news updates moderately often)
    apiCache.set(CACHE_KEY, response, 2 * 60 * 1000);

    return NextResponse.json(response);
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

    // Clear cache when new news is added
    apiCache.delete(CACHE_KEY);

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
