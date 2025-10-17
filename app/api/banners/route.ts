import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const activeOnly = searchParams.get("active");

    const banners = await prisma.banners.findMany({
      where: activeOnly === "true" ? { isActive: true } : undefined,
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: banners,
      count: banners.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch banners",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.title || !body.titleEn) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: title, titleEn",
        },
        { status: 400 }
      );
    }

    // Generate unique banner ID
    const bannerId = `banner-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newBanner = await prisma.banners.create({
      data: {
        id: bannerId,
        title: body.title,
        titleEn: body.titleEn,
        subtitle: body.subtitle || null,
        subtitleEn: body.subtitleEn || null,
        description: body.description || null,
        descriptionEn: body.descriptionEn || null,
        buttonText: body.buttonText || null,
        buttonTextEn: body.buttonTextEn || null,
        imageId: body.imageId || "",
        overlayImageId: body.overlayImageId || null,
        linkUrl: body.linkUrl || null,
        backgroundColor: body.backgroundColor || null,
        textColor: body.textColor || null,
        accentColor: body.accentColor || null,
        isActive: body.isActive ?? true,
        order: body.order ?? 0,
        templateId: body.templateId || null,
      },
    });

    // Revalidate the cache for banner pages
    revalidatePath("/admin/banners");
    revalidatePath("/");

    return NextResponse.json(
      {
        success: true,
        data: newBanner,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating banner:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create banner",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
