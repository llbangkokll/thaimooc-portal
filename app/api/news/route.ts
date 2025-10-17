import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const news = await prisma.news.findMany({
      orderBy: { createdAt: 'desc' },
    });

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

    const newNews = await prisma.news.create({
      data: {
        id: `news-${Date.now()}`,
        title: body.title,
        content: body.content,
        imageId: body.imageId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: newNews,
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
