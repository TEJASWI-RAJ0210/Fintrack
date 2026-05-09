import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
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

    const now = new Date();

    const currentMonth =
      now.getMonth() + 1;

    const currentYear =
      now.getFullYear();

    /*
      MONTH TOTAL
    */
    const totalRes = await query(
      `
      SELECT
        COALESCE(SUM(amount),0)::float AS total

      FROM expenses

      WHERE
        user_id = $1
        AND EXTRACT(MONTH FROM expense_date) = $2
        AND EXTRACT(YEAR FROM expense_date) = $3
      `,
      [
        userId,
        currentMonth,
        currentYear,
      ]
    );

    /*
      CATEGORY REPORT
    */
    const categoryRes = await query(
      `
      SELECT
        c.name,
        c.color,

        COALESCE(SUM(e.amount),0)::float AS total

      FROM expenses e

      JOIN categories c
        ON c.id = e.category_id

      WHERE
        e.user_id = $1
        AND EXTRACT(MONTH FROM e.expense_date) = $2
        AND EXTRACT(YEAR FROM e.expense_date) = $3

      GROUP BY
        c.name,
        c.color

      ORDER BY total DESC
      `,
      [
        userId,
        currentMonth,
        currentYear,
      ]
    );

    /*
      WEEKLY TREND
    */
    const trendRes = await query(
      `
      SELECT
        EXTRACT(WEEK FROM expense_date)
          AS week,

        SUM(amount)::float AS total

      FROM expenses

      WHERE
        user_id = $1
        AND EXTRACT(MONTH FROM expense_date) = $2
        AND EXTRACT(YEAR FROM expense_date) = $3

      GROUP BY week

      ORDER BY week
      `,
      [
        userId,
        currentMonth,
        currentYear,
      ]
    );

    /*
      HIGHEST SPEND DAY
    */
    const highestDayRes = await query(
      `
      SELECT
        expense_date,

        SUM(amount)::float AS total

      FROM expenses

      WHERE
        user_id = $1
        AND EXTRACT(MONTH FROM expense_date) = $2
        AND EXTRACT(YEAR FROM expense_date) = $3

      GROUP BY expense_date

      ORDER BY total DESC

      LIMIT 1
      `,
      [
        userId,
        currentMonth,
        currentYear,
      ]
    );

    /*
      MOST EXPENSIVE CATEGORY
    */
    const expensiveCategoryRes =
      await query(
        `
      SELECT
        c.name,

        SUM(e.amount)::float AS total

      FROM expenses e

      JOIN categories c
        ON c.id = e.category_id

      WHERE
        e.user_id = $1
        AND EXTRACT(MONTH FROM e.expense_date) = $2
        AND EXTRACT(YEAR FROM e.expense_date) = $3

      GROUP BY c.name

      ORDER BY total DESC

      LIMIT 1
      `,
        [
          userId,
          currentMonth,
          currentYear,
        ]
      );

    /*
      BUDGET BREAKDOWN
    */
    const breakdownRes = await query(
      `
      SELECT
        c.name,

        b.monthly_limit,

        COALESCE(SUM(e.amount),0)::float
          AS actual

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
        c.name,
        b.monthly_limit

      ORDER BY actual DESC
      `,
      [
        userId,
        currentMonth,
        currentYear,
      ]
    );

    return NextResponse.json({
      success: true,

      total:
        totalRes.rows[0]?.total || 0,

      categories:
        categoryRes.rows,

      trend:
        trendRes.rows,

      highestDay:
        highestDayRes.rows[0] || null,

      expensiveCategory:
        expensiveCategoryRes.rows[0] ||
        null,

      breakdown:
        breakdownRes.rows,
    });
  } catch (err) {
    console.error(
      "Reports API Error:",
      err
    );

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