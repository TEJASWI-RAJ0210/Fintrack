'use client'
import { signIn, useSession } from 'next-auth/react'
import { useRouter }          from 'next/navigation'
import { useEffect, useState } from 'react'

// ─── Google "G" logo SVG ──────────────────────────────────────
function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

// ─── Loading spinner ──────────────────────────────────────────
function Spinner({ size = 20, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      style={{ animation: 'spin 0.75s linear infinite' }}
      aria-label="Loading"
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="12" cy="12" r="10" stroke="#2A2A3A" strokeWidth="3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

// ─── Rupee coin icon ──────────────────────────────────────────
function CoinIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"
      stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 8h8M8 12h8M12 8v8" />
      <path d="M8 12c0 2 1.5 4 4 4" />
    </svg>
  )
}

// ─── Decorative floating stat card ───────────────────────────
function FloatCard({ style, children }) {
  return (
    <div
      style={{
        position: 'absolute',
        background: 'rgba(26,26,38,0.85)',
        border: '1px solid #2A2A3A',
        borderRadius: 14,
        padding: '14px 16px',
        backdropFilter: 'blur(8px)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// ─── Dot-grid SVG pattern ─────────────────────────────────────
function DotGrid() {
  return (
    <svg
      aria-hidden="true"
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        opacity: 0.04, pointerEvents: 'none',
      }}
    >
      <defs>
        <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.5" fill="white" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dots)" />
    </svg>
  )
}

// ─── Main Login Page ──────────────────────────────────────────
export default function LoginPage() {
  const { data: session, status } = useSession()
  const router  = useRouter()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (session) router.replace('/dashboard')
  }, [session, router])

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      await signIn('google', { callbackUrl: '/dashboard' }) // it was previous written as /dashboard
    } catch {
      setLoading(false)
    }
  }

  // ── Full-screen loading while session resolves ──
  if (status === 'loading') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#0A0A0F',
      }}>
        <Spinner size={32} />
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      backgroundColor: '#0A0A0F',
      fontFamily: 'var(--font-body, DM Sans, sans-serif)',
    }}>

      {/* ════════════════════════════════════════
          LEFT PANEL — branding + decorative cards
          (hidden on mobile, shown on lg screens)
      ════════════════════════════════════════ */}
      <div style={{
        display: 'none',
        width: '50%',
        backgroundColor: '#12121A',
        position: 'relative',
        overflow: 'hidden',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px',
      }}
        className="lg-panel"
      >
        {/* Responsive: show on lg */}
        <style>{`
          @media (min-width: 1024px) {
            .lg-panel { display: flex !important; }
          }
        `}</style>

        {/* Dot grid background */}
        <DotGrid />

        {/* ── Decorative floating cards ── */}
        <FloatCard style={{ top: '18%', right: 32, transform: 'rotate(3deg)', minWidth: 180 }}>
          <p style={{ color: '#475569', fontSize: 11, marginBottom: 6 }}>Total this month</p>
          <p style={{
            color: '#F1F5F9', fontSize: 22, fontWeight: 700,
            fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
            marginBottom: 10,
          }}>
            ₹24,350
          </p>
          {/* Progress bar */}
          <div style={{ height: 4, background: '#1A1A26', borderRadius: 999 }}>
            <div style={{ height: 4, width: '62%', background: '#22C55E', borderRadius: 999 }} />
          </div>
          <p style={{ color: '#475569', fontSize: 10, marginTop: 5 }}>62% of monthly budget</p>
        </FloatCard>

        <FloatCard style={{ top: '42%', right: 64, transform: 'rotate(-2deg)', minWidth: 160 }}>
          <p style={{ color: '#475569', fontSize: 11, marginBottom: 4 }}>Saved this year</p>
          <p style={{
            color: '#22C55E', fontSize: 20, fontWeight: 700,
            fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
          }}>
            ₹1.2L
          </p>
        </FloatCard>

        <FloatCard style={{ bottom: '28%', right: 24, transform: 'rotate(1deg)', minWidth: 192 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444', flexShrink: 0 }} />
            <p style={{ color: '#475569', fontSize: 11 }}>Food &amp; Dining</p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ color: '#F1F5F9', fontSize: 13, fontWeight: 500 }}>₹8,200</p>
            <p style={{ color: '#475569', fontSize: 11 }}>of ₹10,000</p>
          </div>
          <div style={{ height: 4, background: '#1A1A26', borderRadius: 999, marginTop: 8 }}>
            <div style={{ height: 4, width: '82%', background: '#F59E0B', borderRadius: 999 }} />
          </div>
        </FloatCard>

        {/* ── Logo (top) ── */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34,
              background: 'rgba(34,197,94,0.12)',
              border: '1px solid rgba(34,197,94,0.3)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CoinIcon />
            </div>
            <span style={{
              fontFamily: 'var(--font-display, Plus Jakarta Sans, sans-serif)',
              fontWeight: 700, fontSize: 20, color: '#F1F5F9',
            }}>
              Fintrack
            </span>
          </div>
        </div>

        {/* ── Headline + subtext ── */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{
            fontFamily: 'var(--font-display, Plus Jakarta Sans, sans-serif)',
            fontSize: 40, fontWeight: 700,
            lineHeight: 1.15, marginBottom: 16, color: '#F1F5F9',
          }}>
            Your money,<br />
            <span style={{ color: '#22C55E' }}>your clarity.</span>
          </h2>
          <p style={{ color: '#94A3B8', fontSize: 14, lineHeight: 1.7, maxWidth: 320 }}>
            Track every rupee, visualize spending patterns, and stay on budget —
            all without subscriptions or hidden fees.
          </p>
        </div>

        {/* ── Feature tags (bottom) ── */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 32 }}>
          {[
            ['Privacy-first', 'Your data stays yours'],
            ['100% Free',     'No subscriptions ever'],
            ['Visual insights','Beautiful charts'],
          ].map(([title, sub]) => (
            <div key={title}>
              <p style={{ color: '#F1F5F9', fontSize: 13, fontWeight: 500, marginBottom: 3 }}>{title}</p>
              <p style={{ color: '#475569', fontSize: 11 }}>{sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════
          RIGHT PANEL — login form
      ════════════════════════════════════════ */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px',
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Mobile-only logo */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            marginBottom: 32,
          }} className="mobile-logo">
            <style>{`
              @media (min-width: 1024px) { .mobile-logo { display: none !important; } }
            `}</style>
            <div style={{
              width: 32, height: 32,
              background: 'rgba(34,197,94,0.12)',
              border: '1px solid rgba(34,197,94,0.3)',
              borderRadius: 9,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CoinIcon />
            </div>
            <span style={{
              fontFamily: 'var(--font-display, Plus Jakarta Sans, sans-serif)',
              fontWeight: 700, fontSize: 20, color: '#F1F5F9',
            }}>
              Fintrack
            </span>
          </div>

          {/* ── Form card ── */}
          <div style={{
            background: '#12121A',
            border: '1px solid #2A2A3A',
            borderRadius: 20,
            padding: 36,
          }}>
            {/* Heading */}
            <h1 style={{
              fontFamily: 'var(--font-display, Plus Jakarta Sans, sans-serif)',
              fontSize: 26, fontWeight: 700,
              color: '#F1F5F9', marginBottom: 6,
            }}>
              Welcome back
            </h1>
            <p style={{ color: '#94A3B8', fontSize: 14, marginBottom: 32 }}>
              Sign in to continue to Fintrack
            </p>

            {/* ── Google sign-in button ── */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                background: '#1A1A26',
                border: '1px solid #2A2A3A',
                borderRadius: 12,
                padding: '13px 20px',
                color: '#F1F5F9',
                fontSize: 14,
                fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'border-color 150ms, background 150ms',
                fontFamily: 'inherit',
              }}
              onMouseEnter={e => {
                if (!loading) {
                  e.currentTarget.style.borderColor = '#3A3A52'
                  e.currentTarget.style.background   = '#222232'
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#2A2A3A'
                e.currentTarget.style.background   = '#1A1A26'
              }}
            >
              {loading ? <Spinner size={18} /> : <GoogleLogo />}
              {loading ? 'Signing in…' : 'Continue with Google'}
            </button>

            {/* ── Divider ── */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              margin: '24px 0 16px',
            }}>
              <div style={{ flex: 1, height: 1, background: '#2A2A3A' }} />
              <span style={{ color: '#475569', fontSize: 12 }}>or</span>
              <div style={{ flex: 1, height: 1, background: '#2A2A3A' }} />
            </div>

            {/* ── Hint ── */}
            <p style={{
              textAlign: 'center', color: '#475569', fontSize: 12, lineHeight: 1.6,
            }}>
              No account needed — signing in creates one automatically.
            </p>

            {/* ── Divider + Privacy note ── */}
            <div style={{
              borderTop: '1px solid #2A2A3A',
              marginTop: 28, paddingTop: 24,
              textAlign: 'center',
            }}>
              <p style={{ color: '#475569', fontSize: 11, lineHeight: 1.7 }}>
                By signing in, you agree to our{' '}
                <a href="#" style={{ color: '#94A3B8', textDecoration: 'underline' }}>Terms</a>
                {' & '}
                <a href="#" style={{ color: '#94A3B8', textDecoration: 'underline' }}>Privacy Policy</a>.
                <br />
                Your data is stored in your own database and never sold or shared.
              </p>
            </div>
          </div>

          {/* ── Below card tagline ── */}
          <p style={{
            textAlign: 'center', color: '#475569', fontSize: 11,
            marginTop: 20,
          }}>
            Fintrack is free, open-source, and privacy-first.
          </p>
        </div>
      </div>

    </div>
  )
}