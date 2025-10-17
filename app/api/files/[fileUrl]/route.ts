import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ fileUrl: string }> }
) {
  try {
    const { fileUrl } = await params;
    const decodedUrl = decodeURIComponent(fileUrl);

    console.log("Delete file request:", decodedUrl);

    // Only allow deleting files from /uploads/ directory
    if (!decodedUrl.startsWith('/uploads/')) {
      return NextResponse.json(
        { success: false, error: "Can only delete files from /uploads/ directory" },
        { status: 400 }
      );
    }

    // Construct the file path
    const filePath = path.join(process.cwd(), 'public', decodedUrl);

    console.log("Attempting to delete file:", filePath);

    // Delete the file
    try {
      await unlink(filePath);
      console.log("File deleted successfully:", filePath);
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        console.log("File not found, already deleted:", filePath);
      } else {
        throw err;
      }
    }

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete file" },
      { status: 500 }
    );
  }
}
