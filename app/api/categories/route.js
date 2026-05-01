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

    const res = await query(
      `SELECT * FROM categories
       WHERE user_id IS NULL OR user_id = $1
       ORDER BY is_default DESC, name ASC`,
      [session.user.id]
    )

    return NextResponse.json(res.rows)
  } catch (err) {
    console.error('[API] GET /api/categories error:', err.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, color, icon } = await request.json()
    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }

    const res = await query(
      `INSERT INTO categories (user_id, name, color, icon)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [session.user.id, name, color || '#22C55E', icon || 'tag']
    )

    return NextResponse.json(res.rows[0], { status: 201 })
  } catch (err) {
    console.error('[API] POST /api/categories error:', err.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}