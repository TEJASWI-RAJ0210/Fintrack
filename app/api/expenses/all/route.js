import { getServerSession } from 'next-auth'
import { authOptions }     from '@/lib/auth'
import { query }           from '@/lib/db'
import { NextResponse }    from 'next/server'

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await query('DELETE FROM expenses WHERE user_id=$1', [session.user.id])
    await query('DELETE FROM budgets   WHERE user_id=$1', [session.user.id])

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[API] DELETE /api/expenses/all:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}