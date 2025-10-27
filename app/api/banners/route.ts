import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { query, execute } from "@/lib/mysql-direct";
import { apiCache } from "@/lib/api-cache";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const activeOnly = searchParams.get("active");

    // Cache key based on filter
    const cacheKey = `banners:${activeOnly === 'true' ? 'active' : 'all'}`;

    // Check cache first
    const cachedData = apiCache.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    let sql = 'SELECT * FROM banners';
    const params: any[] = [];

    if (activeOnly === "true") {
      sql += ' WHERE isActive = ?';
      params.push(true);
    }

    sql += ' ORDER BY `order` ASC';

    const banners = await query(sql, params);

    const response = {
      success: true,
      data: banners,
      count: banners.length,
    };

    // Cache for 3 minutes (banners change occasionally)
    apiCache.set(cacheKey, response, 3 * 60 * 1000);

    return NextResponse.json(response);
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
    const now = new Date();

    await execute(
      `INSERT INTO banners (
        id, title, titleEn, subtitle, subtitleEn, description, descriptionEn,
        buttonText, buttonTextEn, imageId, backgroundImageId, overlayImageId, linkUrl,
        backgroundColor, textColor, accentColor, isActive, \`order\`, templateId,
        createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        bannerId,
        body.title,
        body.titleEn,
        body.subtitle || null,
        body.subtitleEn || null,
        body.description || null,
        body.descriptionEn || null,
        body.buttonText || null,
        body.buttonTextEn || null,
        body.imageId || "",
        body.backgroundImageId || null,
        body.overlayImageId || null,
        body.linkUrl || null,
        body.backgroundColor || null,
        body.textColor || null,
        body.accentColor || null,
        body.isActive ?? true,
        body.order ?? 0,
        body.templateId || null,
        now,
        now
      ]
    );

    const newBanner = await query(
      'SELECT * FROM banners WHERE id = ?',
      [bannerId]
    );

    // Clear cache when new banner is added
    apiCache.clearPattern('banners:*');

    // Revalidate the cache for banner pages
    revalidatePath("/admin/banners");
    revalidatePath("/");

    return NextResponse.json(
      {
        success: true,
        data: newBanner[0],
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
