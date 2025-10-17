import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const banner = await prisma.banners.findUnique({
      where: { id },
    });

    if (!banner) {
      return NextResponse.json(
        {
          success: false,
          error: "Banner not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: banner,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch banner",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updatedBanner = await prisma.banners.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.titleEn !== undefined && { titleEn: body.titleEn }),
        ...(body.subtitle !== undefined && { subtitle: body.subtitle || null }),
        ...(body.subtitleEn !== undefined && { subtitleEn: body.subtitleEn || null }),
        ...(body.description !== undefined && { description: body.description || null }),
        ...(body.descriptionEn !== undefined && { descriptionEn: body.descriptionEn || null }),
        ...(body.buttonText !== undefined && { buttonText: body.buttonText || null }),
        ...(body.buttonTextEn !== undefined && { buttonTextEn: body.buttonTextEn || null }),
        ...(body.imageId !== undefined && { imageId: body.imageId || "" }),
        ...(body.overlayImageId !== undefined && { overlayImageId: body.overlayImageId || null }),
        ...(body.linkUrl !== undefined && { linkUrl: body.linkUrl || null }),
        ...(body.backgroundColor !== undefined && { backgroundColor: body.backgroundColor || null }),
        ...(body.textColor !== undefined && { textColor: body.textColor || null }),
        ...(body.accentColor !== undefined && { accentColor: body.accentColor || null }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.order !== undefined && { order: body.order }),
        ...(body.templateId !== undefined && { templateId: body.templateId || null }),
      },
    });

    // Revalidate the cache for banner pages
    revalidatePath("/admin/banners");
    revalidatePath(`/admin/banners/${id}`);
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      data: updatedBanner,
    });
  } catch (error: any) {
    console.error("Error updating banner:", error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        {
          success: false,
          error: "Banner not found",
        },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update banner",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.banners.delete({
      where: { id },
    });

    // Revalidate the cache for banner pages
    revalidatePath("/admin/banners");
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        {
          success: false,
          error: "Banner not found",
        },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete banner",
      },
      { status: 500 }
    );
  }
}
