import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

/*
  GET  -> fetch budgets
  POST -> create budget
*/

export async function GET() {
  try {
    // Session
    const session = await getServerSession(
      authOptions
    );

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

    // Current month/year
    const currentDate = new Date();

    const currentMonth =
      currentDate.getMonth() + 1;

    const currentYear =
      currentDate.getFullYear();

    // Fetch budgets
    const result = await query(
      `
      SELECT
        b.id,
        b.monthly_limit,

        c.name AS category,
        c.color,
        c.icon,

        COALESCE(SUM(e.amount), 0)::float AS spent

      FROM budgets b

      JOIN categories c
        ON c.id = b.category_id

      LEFT JOIN expenses e
        ON e.category_id = b.category_id
        AND e.user_id = b.user_id
        AND EXTRACT(MONTH FROM e.expense_date) = b.month
        AND EXTRACT(YEAR FROM e.expense_date) = b.year

      WHERE
        b.user_id = $1
        AND b.month = $2
        AND b.year = $3

      GROUP BY
        b.id,
        b.monthly_limit,
        c.name,
        c.color,
        c.icon

      ORDER BY spent DESC
      `,
      [
        userId,
        currentMonth,
        currentYear,
      ]
    );

    // Transform response
    const budgets = result.rows.map(
      (budget) => {
        const limit = Number(
          budget.monthly_limit
        );

        const spent = Number(
          budget.spent
        );

        const remaining =
          limit - spent;

        const percentage = Math.min(
          (spent / limit) * 100,
          100
        );

        return {
          id: budget.id,

          category: budget.category,

          color: budget.color,

          icon: budget.icon,

          limit,

          spent,

          remaining,

          percentage,

          isOverBudget:
            spent > limit,
        };
      }
    );

    return NextResponse.json({
      success: true,
      budgets,
    });
  } catch (error) {
    console.error(
      "Budgets GET Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(req) {
  try {
    // Session
    const session = await getServerSession(
      authOptions
    );

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

    // Body
    const body = await req.json();

    const {
      category_id,
      monthly_limit,
    } = body;

    // Validation
    if (
      !category_id ||
      !monthly_limit
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields",
        },
        {
          status: 400,
        }
      );
    }

    // Current month/year
    const currentDate = new Date();

    const currentMonth =
      currentDate.getMonth() + 1;

    const currentYear =
      currentDate.getFullYear();

    // Prevent duplicate budget
    const existingBudget =
      await query(
        `
        SELECT *
        FROM budgets

        WHERE
          user_id = $1
          AND category_id = $2
          AND month = $3
          AND year = $4
        `,
        [
          userId,
          category_id,
          currentMonth,
          currentYear,
        ]
      );

    if (
      existingBudget.rows.length > 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Budget already exists for this category this month",
        },
        {
          status: 400,
        }
      );
    }

    // Create budget
    const result = await query(
      `
      INSERT INTO budgets (
        user_id,
        category_id,
        monthly_limit,
        month,
        year
      )

      VALUES ($1, $2, $3, $4, $5)

      RETURNING *
      `,
      [
        userId,
        category_id,
        monthly_limit,
        currentMonth,
        currentYear,
      ]
    );

    return NextResponse.json({
      success: true,
      budget: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Budgets POST Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}