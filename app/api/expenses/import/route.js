import { getServerSession } from 'next-auth'
import { authOptions }     from '@/lib/auth'
import { query }           from '@/lib/db'
import { NextResponse }    from 'next/server'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { rows } = await request.json()

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'No rows provided' }, { status: 400 })
    }

    let inserted = 0
    for (const row of rows) {
      if (!row.amount || !row.date) continue
      await query(
        `INSERT INTO expenses (user_id, amount, category_id, description, expense_date)
         VALUES ($1, $2, $3, $4, $5)`,
        [session.user.id, row.amount, row.category_id || null, row.description || '', row.date]
      )
      inserted++
    }

    return NextResponse.json({ success: true, inserted })
  } catch (err) {
    console.error('[API] POST /api/expenses/import:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}