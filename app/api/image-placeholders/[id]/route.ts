import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log("Delete placeholder request:", id);

    // Delete the placeholder from database
    await prisma.image_placeholders.delete({
      where: { id },
    });

    console.log("Placeholder deleted successfully:", id);

    return NextResponse.json({
      success: true,
      message: "Placeholder deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting placeholder:", error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: "Placeholder not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete placeholder" },
      { status: 500 }
    );
  }
}
