import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import { NextResponse } from "next/server";


// =========================
// GET Categories
// =========================
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


// =========================
// CREATE Category
// =========================
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { name, color } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    const result = await query(
      `
      INSERT INTO categories
      (user_id, name, color, is_default)
      VALUES ($1, $2, $3, false)
      RETURNING *
      `,
      [
        session.user.id,
        name,
        color || "#22C55E",
      ]
    );

    return NextResponse.json({
      success: true,
      category: result.rows[0],
    });

  } catch (err) {
    console.error("Create Category Error:", err);

    return NextResponse.json(
      {
        error: err.message,
      },
      {
        status: 500,
      }
    );
  }
}