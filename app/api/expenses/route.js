import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import { NextResponse } from "next/server";

/*
  GET  -> fetch expenses
  POST -> create expense
*/

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
      SELECT
        e.id,
        e.amount,
        e.description,
        e.expense_date,
        e.created_at,

        c.name  AS category,
        c.color,
        c.icon

      FROM expenses e

      LEFT JOIN categories c
        ON c.id = e.category_id

      WHERE e.user_id = $1

      ORDER BY e.expense_date DESC
      `,
      [userId]
    );

    return NextResponse.json({
      success: true,
      expenses: result.rows,
    });
  } catch (err) {
    console.error("Expenses GET Error:", err);

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

export async function POST(req) {
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

    const body = await req.json();

    const {
      category_id,
      amount,
      description,
      expense_date,
    } = body;

    // Validation
    if (!amount || !category_id) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        {
          status: 400,
        }
      );
    }

    const result = await query(
      `
      INSERT INTO expenses (
        user_id,
        category_id,
        amount,
        description,
        expense_date
      )

      VALUES ($1, $2, $3, $4, $5)

      RETURNING *
      `,
      [
        userId,
        category_id,
        amount,
        description || null,
        expense_date || new Date(),
      ]
    );

    return NextResponse.json({
      success: true,
      expense: result.rows[0],
    });
  } catch (err) {
    console.error("Expenses POST Error:", err);

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