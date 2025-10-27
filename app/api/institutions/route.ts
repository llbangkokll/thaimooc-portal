import { NextRequest, NextResponse } from "next/server";
import { query, queryOne, execute } from "@/lib/mysql-direct";
import { apiCache } from "@/lib/api-cache";

const CACHE_KEY = 'institutions:all';

export async function GET() {
  try {
    // Check cache first
    const cachedData = apiCache.get(CACHE_KEY);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    const institutions = await query(
      'SELECT * FROM institutions ORDER BY createdAt DESC'
    );

    const response = {
      success: true,
      data: institutions,
      count: institutions.length,
    };

    // Cache for 5 minutes (institutions don't change often)
    apiCache.set(CACHE_KEY, response, 5 * 60 * 1000);

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch institutions",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.nameEn || !body.abbreviation || !body.logoUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: name, nameEn, abbreviation, logoUrl",
        },
        { status: 400 }
      );
    }

    // Generate ID: YYNNN format (e.g., 25001)
    const year = new Date().getFullYear().toString().slice(-2); // Get last 2 digits of year
    const lastInstitution = await queryOne<{ id: string }>(
      'SELECT id FROM institutions ORDER BY id DESC LIMIT 1'
    );

    let sequence = 1;
    if (lastInstitution && lastInstitution.id.startsWith(year)) {
      const lastSequence = parseInt(lastInstitution.id.slice(-3));
      sequence = lastSequence + 1;
    }

    const id = `${year}${sequence.toString().padStart(3, '0')}`;
    const now = new Date();

    await execute(
      `INSERT INTO institutions (id, name, nameEn, abbreviation, logoUrl, website, description, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        body.name,
        body.nameEn,
        body.abbreviation,
        body.logoUrl,
        body.website || null,
        body.description || null,
        now,
        now
      ]
    );

    const newInstitution = await queryOne(
      'SELECT * FROM institutions WHERE id = ?',
      [id]
    );

    // Clear cache when new institution is added
    apiCache.delete(CACHE_KEY);

    return NextResponse.json(
      {
        success: true,
        data: newInstitution,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create institution",
      },
      { status: 500 }
    );
  }
}
