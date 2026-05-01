import { Pool } from 'pg'

// ── Connection pool ───────────────────────────────────────────────
// globalThis trick prevents creating multiple pools during
// Next.js hot-reloads in development. In production this just
// runs once and stays alive.
const globalForPg = globalThis

if (!globalForPg._pgPool) {
  globalForPg._pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,

    // SSL off for local pgAdmin, on for Neon/cloud in production
    ssl: process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,

    max:              10,   // max simultaneous connections
    idleTimeoutMillis: 30000, // close idle connections after 30s
    connectionTimeoutMillis: 5000, // error if can't connect in 5s
  })

  // Log connection errors so they appear in terminal / Vercel logs
  globalForPg._pgPool.on('error', (err) => {
    console.error('[DB] Unexpected pool error:', err.message)
  })
}

export const pool = globalForPg._pgPool


// ── Generic query helper ──────────────────────────────────────────
// Use this in every API route:
//   import { query } from '@/lib/db'
//   const res = await query('SELECT * FROM expenses WHERE user_id=$1', [id])
//   return res.rows
export async function query(text, params) {
  const start  = Date.now()
  const client = await pool.connect()

  try {
    const res = await client.query(text, params)

    // Log slow queries (over 500ms) to help spot performance issues
    const duration = Date.now() - start
    if (duration > 500) {
      console.warn(`[DB] Slow query (${duration}ms):`, text.slice(0, 80))
    }

    return res
  } catch (err) {
    // Log the failing query and error so it shows in terminal
    console.error('[DB] Query error:', err.message)
    console.error('[DB] Query was:', text.slice(0, 120))
    throw err   // re-throw so the API route returns a 500
  } finally {
    client.release()   // always release back to pool
  }
}


// ── upsertUser ────────────────────────────────────────────────────
// Called by lib/auth.js after every Google login.
// Creates user on first login, updates name/image on subsequent logins.
// DO NOT rename this function — auth.js imports it by this exact name.
export async function upsertUser({ email, name, image }) {
  const res = await query(
    `INSERT INTO users (email, name, image)
     VALUES ($1, $2, $3)
     ON CONFLICT (email)
     DO UPDATE SET
       name  = EXCLUDED.name,
       image = EXCLUDED.image
     RETURNING *`,
    [email, name, image]
  )
  return res.rows[0]
}


// ── testConnection ────────────────────────────────────────────────
// Optional helper to verify DB is reachable.
// Call it once from terminal to confirm setup is working:
//   node -e "import('./lib/db.js').then(m => m.testConnection())"
export async function testConnection() {
  try {
    const res = await query('SELECT NOW() AS time, current_database() AS db')
    console.log('[DB] Connected successfully!')
    console.log('[DB] Server time:', res.rows[0].time)
    console.log('[DB] Database:   ', res.rows[0].db)
    return true
  } catch (err) {
    console.error('[DB] Connection FAILED:', err.message)
    console.error('[DB] Check your DATABASE_URL in .env.local')
    return false
  }
}