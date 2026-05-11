import { getServerSession } from 'next-auth'
import { authOptions }     from '@/lib/auth'
import { query }           from '@/lib/db'
import { NextResponse }    from 'next/server'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const uid   = session.user.id
    const now   = new Date()
    const month = now.getMonth() + 1
    const year  = now.getFullYear()

    const [totalRes, byCatRes, trendRes, alertRes] = await Promise.all([

      // 1 — total spent this month
      query(
        `SELECT COALESCE(SUM(amount), 0) AS total
         FROM expenses
         WHERE user_id = $1
           AND EXTRACT(MONTH FROM expense_date) = $2
           AND EXTRACT(YEAR  FROM expense_date) = $3`,
        [uid, month, year]
      ),

      // 2 — spend by category this month
      query(
        `SELECT c.name, c.color,
                COALESCE(SUM(e.amount), 0) AS total
         FROM expenses e
         LEFT JOIN categories c ON e.category_id = c.id
         WHERE e.user_id = $1
           AND EXTRACT(MONTH FROM e.expense_date) = $2
           AND EXTRACT(YEAR  FROM e.expense_date) = $3
         GROUP BY c.name, c.color
         ORDER BY total DESC`,
        [uid, month, year]
      ),

      // 3 — monthly totals last 6 months (bar chart)
      query(
        `SELECT TO_CHAR(expense_date, 'Mon') AS month_label,
                EXTRACT(YEAR  FROM expense_date) AS year,
                EXTRACT(MONTH FROM expense_date) AS month_num,
                SUM(amount) AS total
         FROM expenses
         WHERE user_id = $1
           AND expense_date >= date_trunc('month', NOW()) - INTERVAL '5 months'
         GROUP BY month_label, year, month_num
         ORDER BY year, month_num`,
        [uid]
      ),

      // 4 — budget alerts (categories >= 80% spent)
      query(
        `SELECT c.name AS category_name, c.color,
                b.monthly_limit,
                COALESCE(SUM(e.amount), 0) AS spent
         FROM budgets b
         LEFT JOIN categories c ON b.category_id = c.id
         LEFT JOIN expenses e
               ON  e.user_id     = b.user_id
               AND e.category_id = b.category_id
               AND EXTRACT(MONTH FROM e.expense_date) = $2
               AND EXTRACT(YEAR  FROM e.expense_date) = $3
         WHERE b.user_id = $1
           AND b.month   = $2
           AND b.year    = $3
         GROUP BY c.name, c.color, b.monthly_limit
         HAVING COALESCE(SUM(e.amount), 0) >= b.monthly_limit * 0.8`,
        [uid, month, year]
      ),
    ])

    return NextResponse.json({
      totalThisMonth: parseFloat(totalRes.rows[0].total),
      byCategory:     byCatRes.rows,
      monthlyTrend:   trendRes.rows,
      budgetAlerts:   alertRes.rows,
    })

  } catch (err) {
    console.error('[API] GET /api/dashboard error:', err.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}