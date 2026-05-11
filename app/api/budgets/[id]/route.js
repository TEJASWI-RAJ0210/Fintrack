import { getServerSession } from 'next-auth'
import { authOptions }     from '@/lib/auth'
import { query }           from '@/lib/db'
import { NextResponse }    from 'next/server'

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await query(
      'DELETE FROM budgets WHERE id=$1 AND user_id=$2',
      [params.id, session.user.id]
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[API] DELETE /api/budgets/[id]:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}