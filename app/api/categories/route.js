import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const userId = session.user.id;

    const result = await query(
      `
      SELECT *
      FROM categories

      WHERE
        user_id = $1
        OR is_default = true

      ORDER BY name
      `,
      [userId]
    );

    return NextResponse.json({
      success: true,
      categories: result.rows,
    });
  } catch (err) {
    console.error("Categories API Error:", err);

    return NextResponse.json(
      {
        success: false,
        error: err.message,
      },
      {
        status: 500,
      }
    );
  }
}