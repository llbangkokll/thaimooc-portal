import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.webapp_settings.findFirst();

    if (!settings) {
      // Return default settings if none exist
      return NextResponse.json({
        siteName: "Thai MOOC",
        siteLogo: "",
        contactEmail: "contact@thaimooc.ac.th",
        contactPhone: "02-123-4567",
        address: "กรุงเทพมหานคร ประเทศไทย",
        facebookUrl: null,
        twitterUrl: null,
        youtubeUrl: null,
        instagramUrl: null,
        lineUrl: null,
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch settings",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Try to find existing settings
    let settings = await prisma.webapp_settings.findFirst();

    if (!settings) {
      // Create new settings if none exist
      settings = await prisma.webapp_settings.create({
        data: {
          id: `settings-${Date.now()}`,
          siteName: body.siteName || "Thai MOOC",
          siteLogo: body.siteLogo || "",
          contactEmail: body.contactEmail || "contact@thaimooc.ac.th",
          contactPhone: body.contactPhone || "02-123-4567",
          address: body.address || "กรุงเทพมหานคร ประเทศไทย",
          facebookUrl: body.facebookUrl || null,
          twitterUrl: body.twitterUrl || null,
          youtubeUrl: body.youtubeUrl || null,
          instagramUrl: body.instagramUrl || null,
          lineUrl: body.lineUrl || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    } else {
      // Update existing settings
      settings = await prisma.webapp_settings.update({
        where: { id: settings.id },
        data: {
          ...(body.siteName !== undefined && { siteName: body.siteName }),
          ...(body.siteLogo !== undefined && { siteLogo: body.siteLogo }),
          ...(body.contactEmail !== undefined && { contactEmail: body.contactEmail }),
          ...(body.contactPhone !== undefined && { contactPhone: body.contactPhone }),
          ...(body.address !== undefined && { address: body.address }),
          ...(body.facebookUrl !== undefined && { facebookUrl: body.facebookUrl }),
          ...(body.twitterUrl !== undefined && { twitterUrl: body.twitterUrl }),
          ...(body.youtubeUrl !== undefined && { youtubeUrl: body.youtubeUrl }),
          ...(body.instagramUrl !== undefined && { instagramUrl: body.instagramUrl }),
          ...(body.lineUrl !== undefined && { lineUrl: body.lineUrl }),
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update settings",
      },
      { status: 500 }
    );
  }
}
