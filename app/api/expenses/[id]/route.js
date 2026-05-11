import { getServerSession } from 'next-auth'
import { authOptions }     from '@/lib/auth'
import { query }           from '@/lib/db'
import { NextResponse }    from 'next/server'

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { amount, category_id, description, date } = await request.json()

    const res = await query(
      `UPDATE expenses
       SET amount=$1, category_id=$2, description=$3, expense_date=$4
       WHERE id=$5 AND user_id=$6
       RETURNING *`,
      [amount, category_id || null, description, date, params.id, session.user.id]
    )

    if (!res.rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true, expense: res.rows[0] })
  } catch (err) {
    console.error('[API] PUT /api/expenses/[id]:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await query(
      'DELETE FROM expenses WHERE id=$1 AND user_id=$2',
      [params.id, session.user.id]
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[API] DELETE /api/expenses/[id]:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}