import { NextRequest, NextResponse } from "next/server";
import { queryOne, execute } from "@/lib/mysql-direct";

export async function GET() {
  try {
    const settings = await queryOne(
      'SELECT * FROM webapp_settings LIMIT 1'
    );

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
    let settings = await queryOne<{ id: string }>(
      'SELECT id FROM webapp_settings LIMIT 1'
    );

    const now = new Date();

    if (!settings) {
      // Create new settings if none exist
      const id = `settings-${Date.now()}`;
      await execute(
        `INSERT INTO webapp_settings (
          id, siteName, siteLogo, contactEmail, contactPhone, address,
          aboutUs, aboutUsEn, mapUrl,
          facebookUrl, twitterUrl, youtubeUrl, instagramUrl, lineUrl,
          createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          body.siteName || "Thai MOOC",
          body.siteLogo || "",
          body.contactEmail || "contact@thaimooc.ac.th",
          body.contactPhone || "02-123-4567",
          body.address || "กรุงเทพมหานคร ประเทศไทย",
          body.aboutUs || null,
          body.aboutUsEn || null,
          body.mapUrl || null,
          body.facebookUrl || null,
          body.twitterUrl || null,
          body.youtubeUrl || null,
          body.instagramUrl || null,
          body.lineUrl || null,
          now,
          now
        ]
      );

      settings = await queryOne('SELECT * FROM webapp_settings WHERE id = ?', [id]);
    } else {
      // Update existing settings
      const updates: string[] = [];
      const values: any[] = [];

      if (body.siteName !== undefined) {
        updates.push('siteName = ?');
        values.push(body.siteName);
      }
      if (body.siteLogo !== undefined) {
        updates.push('siteLogo = ?');
        values.push(body.siteLogo);
      }
      if (body.contactEmail !== undefined) {
        updates.push('contactEmail = ?');
        values.push(body.contactEmail);
      }
      if (body.contactPhone !== undefined) {
        updates.push('contactPhone = ?');
        values.push(body.contactPhone);
      }
      if (body.address !== undefined) {
        updates.push('address = ?');
        values.push(body.address);
      }
      if (body.aboutUs !== undefined) {
        updates.push('aboutUs = ?');
        values.push(body.aboutUs);
      }
      if (body.aboutUsEn !== undefined) {
        updates.push('aboutUsEn = ?');
        values.push(body.aboutUsEn);
      }
      if (body.mapUrl !== undefined) {
        updates.push('mapUrl = ?');
        values.push(body.mapUrl);
      }
      if (body.facebookUrl !== undefined) {
        updates.push('facebookUrl = ?');
        values.push(body.facebookUrl);
      }
      if (body.twitterUrl !== undefined) {
        updates.push('twitterUrl = ?');
        values.push(body.twitterUrl);
      }
      if (body.youtubeUrl !== undefined) {
        updates.push('youtubeUrl = ?');
        values.push(body.youtubeUrl);
      }
      if (body.instagramUrl !== undefined) {
        updates.push('instagramUrl = ?');
        values.push(body.instagramUrl);
      }
      if (body.lineUrl !== undefined) {
        updates.push('lineUrl = ?');
        values.push(body.lineUrl);
      }

      updates.push('updatedAt = ?');
      values.push(now);

      values.push(settings.id);

      await execute(
        `UPDATE webapp_settings SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      settings = await queryOne('SELECT * FROM webapp_settings WHERE id = ?', [settings.id]);
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
