'use client'
import Link        from 'next/link'
import Image       from 'next/image'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'

// ─── Nav items ────────────────────────────────────────────────
const NAV = [
  { href: '/dashboard', label: 'Dashboard',  Icon: IconDashboard },
  { href: '/expenses',  label: 'Expenses',   Icon: IconReceipt   },
  { href: '/budgets',   label: 'Budgets',    Icon: IconTarget    },
  { href: '/reports',   label: 'Reports',    Icon: IconChart     },
  { href: '/settings',  label: 'Settings',   Icon: IconSettings  },
]

export default function Sidebar() {
  const pathname          = usePathname()
  const { data: session } = useSession()

  const isActive = (href) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href))

  return (
    <aside style={{
        width: 240,
    height: '100vh',
    position: 'fixed',
    top: 0,
    left: 0,
    overflowY: 'auto',
    zIndex: 50,
      background: '#12121A',
      borderRight: '1px solid #2A2A3A',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>

      {/* ── Logo ── */}
      <div style={{
        padding: '24px 20px 20px',
        borderBottom: '1px solid #2A2A3A',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32,
            background: 'rgba(34,197,94,0.12)',
            border: '1px solid rgba(34,197,94,0.25)',
            borderRadius: 9,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="#22C55E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 8h8M8 12h8M12 8v8" />
              <path d="M8 12c0 2 1.5 4 4 4" />
            </svg>
          </div>
          <span style={{
            fontFamily: 'var(--font-display, Plus Jakarta Sans, sans-serif)',
            fontWeight: 700, fontSize: 18, color: '#F1F5F9',
          }}>
            Fintrack
          </span>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(({ href, label, Icon }) => {
          const active = isActive(href)
          return (
            <Link key={href} href={href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: active ? '10px 12px 10px 9px' : '10px 12px',
                borderRadius: 12,
                borderLeft: active ? '3px solid #22C55E' : '3px solid transparent',
                background: active ? 'rgba(34,197,94,0.08)' : 'transparent',
                color: active ? '#22C55E' : '#94A3B8',
                fontSize: 13.5,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 150ms',
              }}
                onMouseEnter={e => {
                  if (!active) {
                    e.currentTarget.style.background = '#1A1A26'
                    e.currentTarget.style.color      = '#F1F5F9'
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color      = '#94A3B8'
                  }
                }}
              >
                <Icon size={16} color={active ? '#22C55E' : 'currentColor'} />
                <span>{label}</span>
                {active && (
                  <div style={{
                    marginLeft: 'auto',
                    width: 6, height: 6,
                    borderRadius: '50%',
                    background: '#22C55E',
                  }} />
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* ── User profile + sign out ── */}
      <div style={{
        padding: '12px 10px',
        borderTop: '1px solid #2A2A3A',
      }}>
        {/* Avatar row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 12px', marginBottom: 4,
        }}>
          {session?.user?.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name || 'User'}
              width={32} height={32}
              style={{ borderRadius: '50%', flexShrink: 0 }}
            />
          ) : (
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              background: 'rgba(34,197,94,0.12)',
              border: '1px solid rgba(34,197,94,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#22C55E', fontSize: 13, fontWeight: 700,
            }}>
              {session?.user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <p style={{
              color: '#F1F5F9', fontSize: 13, fontWeight: 500,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {session?.user?.name || 'User'}
            </p>
            <p style={{
              color: '#475569', fontSize: 11,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {session?.user?.email}
            </p>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          style={{
            width: '100%',
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 12px',
            background: 'transparent',
            border: 'none',
            borderRadius: 10,
            color: '#475569',
            fontSize: 12,
            cursor: 'pointer',
            transition: 'all 150ms',
            fontFamily: 'inherit',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.08)'
            e.currentTarget.style.color      = '#EF4444'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color      = '#475569'
          }}
        >
          <IconLogout size={14} color="currentColor" />
          Sign out
        </button>
      </div>
    </aside>
  )
}

// ─── Inline SVG icons ─────────────────────────────────────────
function IconDashboard({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  )
}
function IconReceipt({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16l3-2 3 2 3-2 3 2V4a2 2 0 0 0-2-2z" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="9"  x2="8" y2="9"  />
      <line x1="10" y1="17" x2="8" y2="17" />
    </svg>
  )
}
function IconTarget({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}
function IconChart({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4"  />
      <line x1="6"  y1="20" x2="6"  y2="14" />
      <line x1="2"  y1="20" x2="22" y2="20" />
    </svg>
  )
}
function IconSettings({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}
function IconLogout({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}