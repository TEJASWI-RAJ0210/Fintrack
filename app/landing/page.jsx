'use client'
import { signIn } from 'next-auth/react'
import { useState } from 'react'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

const FEATURES = [
  { icon: '📊', title: 'Visual Dashboard',    desc: 'Charts and graphs that make your spending instantly clear.' },
  { icon: '🏷️', title: 'Smart Categories',   desc: 'Auto-categorize expenses or create your own custom categories.' },
  { icon: '🎯', title: 'Budget Alerts',       desc: 'Set monthly limits and get warned before you overspend.' },
  { icon: '📂', title: 'CSV Import',          desc: 'Bulk import from any bank statement in seconds.' },
  { icon: '🔒', title: 'Privacy First',       desc: 'Your data lives in your own database. Never sold.' },
  { icon: '💸', title: 'Completely Free',     desc: 'No subscriptions, no hidden fees, no ads. Ever.' },
]

const STATS = [
  { value: '100%', label: 'Free forever' },
  { value: '0',    label: 'Ads or trackers' },
  { value: '∞',    label: 'Expenses tracked' },
]

export default function LandingPage() {
  const [loading, setLoading] = useState(false)

  const handleSignIn = async () => {
    setLoading(true)
    await signIn('google', { callbackUrl: '/dashboard' })
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0F',
      color: '#F1F5F9',
      fontFamily: 'DM Sans, sans-serif',
    }}>

      {/* ── Navbar ── */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 60px',
        borderBottom: '1px solid #1A1A26',
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(10,10,15,0.9)',
        backdropFilter: 'blur(12px)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32,
            background: 'rgba(34,197,94,0.12)',
            border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: 9,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="#22C55E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8 8h8M8 12h8M12 8v8"/>
              <path d="M8 12c0 2 1.5 4 4 4"/>
            </svg>
          </div>
          <span style={{
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontWeight: 700, fontSize: 18, color: '#F1F5F9',
          }}>
            Fintrack
          </span>
        </div>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {['Features', 'Privacy', 'Free'].map(link => (
            <a key={link} href={`#${link.toLowerCase()}`} style={{
              color: '#94A3B8', fontSize: 14, textDecoration: 'none',
              transition: 'color 150ms',
            }}
              onMouseEnter={e => e.target.style.color = '#F1F5F9'}
              onMouseLeave={e => e.target.style.color = '#94A3B8'}
            >
              {link}
            </a>
          ))}
        </div>

        {/* Sign in button */}
        <button
          onClick={handleSignIn}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#22C55E', color: '#0A0A0F',
            border: 'none', borderRadius: 10,
            padding: '9px 20px', fontSize: 14, fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            transition: 'all 150ms',
            fontFamily: 'inherit',
          }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#16A34A' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#22C55E' }}
        >
          {loading ? 'Signing in…' : 'Sign in free'}
        </button>
      </nav>

      {/* ── Hero ── */}
      <section style={{ padding: '100px 60px 80px', textAlign: 'center', maxWidth: 800, margin: '0 auto' }}>

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(34,197,94,0.08)',
          border: '1px solid rgba(34,197,94,0.2)',
          borderRadius: 999, padding: '6px 16px',
          marginBottom: 32,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E' }} />
          <span style={{ color: '#22C55E', fontSize: 13, fontWeight: 500 }}>
            Free forever — no credit card needed
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          fontSize: 56, fontWeight: 800, lineHeight: 1.1,
          marginBottom: 24,
          background: 'linear-gradient(135deg, #F1F5F9 0%, #94A3B8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Your money,<br />
          <span style={{
            background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            finally clear.
          </span>
        </h1>

        {/* Subheadline */}
        <p style={{
          color: '#94A3B8', fontSize: 18, lineHeight: 1.7,
          marginBottom: 40, maxWidth: 560, margin: '0 auto 40px',
        }}>
          Track expenses, visualize spending, and manage budgets —
          all in one privacy-first dashboard. Free, forever.
        </p>

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={handleSignIn}
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: '#22C55E', color: '#0A0A0F',
              border: 'none', borderRadius: 12,
              padding: '14px 28px', fontSize: 15, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 0 32px rgba(34,197,94,0.25)',
              transition: 'all 150ms', fontFamily: 'inherit',
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = '#16A34A'; e.currentTarget.style.transform = 'translateY(-1px)' }}}
            onMouseLeave={e => { e.currentTarget.style.background = '#22C55E'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <GoogleIcon />
            {loading ? 'Signing in…' : 'Continue with Google'}
          </button>

          <a href="#features" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'transparent',
            border: '1px solid #2A2A3A', color: '#94A3B8',
            borderRadius: 12, padding: '14px 24px',
            fontSize: 15, fontWeight: 500,
            textDecoration: 'none', transition: 'all 150ms',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#3A3A52'; e.currentTarget.style.color = '#F1F5F9' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A3A'; e.currentTarget.style.color = '#94A3B8' }}
          >
            See features ↓
          </a>
        </div>

        {/* Social proof */}
        <p style={{ color: '#475569', fontSize: 13, marginTop: 24 }}>
          ✓ No credit card &nbsp;&nbsp; ✓ No ads &nbsp;&nbsp; ✓ Your data stays yours
        </p>
      </section>

      {/* ── Preview card ── */}
      <section style={{ padding: '0 60px 80px' }}>
        <div style={{
          maxWidth: 900, margin: '0 auto',
          background: '#12121A',
          border: '1px solid #2A2A3A',
          borderRadius: 20, padding: 32,
          boxShadow: '0 40px 80px rgba(0,0,0,0.4)',
        }}>
          {/* Fake browser bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            marginBottom: 24, paddingBottom: 16,
            borderBottom: '1px solid #1A1A26',
          }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#EF4444' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#F59E0B' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#22C55E' }} />
            <div style={{
              flex: 1, background: '#1A1A26', borderRadius: 6,
              padding: '4px 12px', marginLeft: 8,
            }}>
              <span style={{ color: '#475569', fontSize: 12 }}>fintrack.vercel.app/dashboard</span>
            </div>
          </div>

          {/* Mock dashboard */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
            {[
              { label: 'Total Spent', value: '₹24,350', accent: '#22C55E', emoji: '💸' },
              { label: 'Categories',  value: '5',        accent: '#3B82F6', emoji: '🏷️' },
              { label: 'Budget Alerts',value: 'All clear',accent: '#22C55E', emoji: '✅' },
            ].map((card, i) => (
              <div key={i} style={{
                background: '#0A0A0F',
                border: `1px solid ${card.accent}22`,
                borderRadius: 12, padding: 16,
              }}>
                <div style={{ fontSize: 18, marginBottom: 8 }}>{card.emoji}</div>
                <p style={{ color: '#F1F5F9', fontSize: 18, fontWeight: 700,
                  fontFamily: 'JetBrains Mono, monospace', marginBottom: 4 }}>
                  {card.value}
                </p>
                <p style={{ color: '#475569', fontSize: 11 }}>{card.label}</p>
              </div>
            ))}
          </div>

          {/* Mock bar chart */}
          <div style={{
            background: '#0A0A0F', border: '1px solid #1A1A26',
            borderRadius: 12, padding: 16,
          }}>
            <p style={{ color: '#94A3B8', fontSize: 12, marginBottom: 12 }}>Monthly Spending Trend</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 60 }}>
              {[40, 65, 52, 78, 60, 85].map((h, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: '100%', height: `${h}%`,
                    background: i === 5 ? '#22C55E' : '#1A1A26',
                    borderRadius: '4px 4px 0 0',
                    border: i === 5 ? 'none' : '1px solid #2A2A3A',
                    boxShadow: i === 5 ? '0 0 12px rgba(34,197,94,0.3)' : 'none',
                    transition: 'height 700ms ease',
                  }} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              {['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'].map(m => (
                <div key={m} style={{ flex: 1, textAlign: 'center', color: '#475569', fontSize: 10 }}>{m}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ padding: '40px 60px', borderTop: '1px solid #1A1A26', borderBottom: '1px solid #1A1A26' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', justifyContent: 'space-around' }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <p style={{
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                fontSize: 36, fontWeight: 800, color: '#22C55E', marginBottom: 4,
              }}>
                {s.value}
              </p>
              <p style={{ color: '#475569', fontSize: 13 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{ padding: '80px 60px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontSize: 36, fontWeight: 700, color: '#F1F5F9', marginBottom: 12,
            }}>
              Everything you need,<br />nothing you don&apos;t
            </h2>
            <p style={{ color: '#94A3B8', fontSize: 16 }}>
              Built for people who want clarity, not complexity.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{
                background: '#12121A',
                border: '1px solid #2A2A3A',
                borderRadius: 16, padding: 24,
                transition: 'border-color 200ms, transform 200ms',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(34,197,94,0.3)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#2A2A3A'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
                <h3 style={{
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  fontSize: 16, fontWeight: 600, color: '#F1F5F9', marginBottom: 8,
                }}>
                  {f.title}
                </h3>
                <p style={{ color: '#94A3B8', fontSize: 13, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Privacy section ── */}
      <section id="privacy" style={{
        padding: '60px',
        background: 'rgba(34,197,94,0.03)',
        borderTop: '1px solid rgba(34,197,94,0.1)',
        borderBottom: '1px solid rgba(34,197,94,0.1)',
      }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
          <h2 style={{
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontSize: 28, fontWeight: 700, color: '#F1F5F9', marginBottom: 12,
          }}>
            Privacy-first, always
          </h2>
          <p style={{ color: '#94A3B8', fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>
            Your financial data is stored in your own PostgreSQL database.
            We never sell your data, never show ads, and never share anything
            with third parties. Sign in with Google just for authentication —
            we don&apos;t read your emails or contacts.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['No data selling', 'No ads', 'No email access', 'Open source friendly'].map(item => (
              <div key={item} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(34,197,94,0.08)',
                border: '1px solid rgba(34,197,94,0.15)',
                borderRadius: 999, padding: '6px 14px',
              }}>
                <span style={{ color: '#22C55E', fontSize: 12 }}>✓</span>
                <span style={{ color: '#94A3B8', fontSize: 12 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA section ── */}
      <section id="free" style={{ padding: '100px 60px', textAlign: 'center' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontSize: 40, fontWeight: 800, color: '#F1F5F9',
            marginBottom: 16, lineHeight: 1.2,
          }}>
            Start tracking in{' '}
            <span style={{ color: '#22C55E' }}>30 seconds</span>
          </h2>
          <p style={{ color: '#94A3B8', fontSize: 16, marginBottom: 36, lineHeight: 1.6 }}>
            Sign in with Google. No forms, no setup, no credit card.
            Your dashboard is ready instantly.
          </p>

          <button
            onClick={handleSignIn}
            disabled={loading}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: '#22C55E', color: '#0A0A0F',
              border: 'none', borderRadius: 14,
              padding: '16px 32px', fontSize: 16, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 0 40px rgba(34,197,94,0.3)',
              transition: 'all 150ms', fontFamily: 'inherit',
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = '#16A34A'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 0 48px rgba(34,197,94,0.4)' }}}
            onMouseLeave={e => { e.currentTarget.style.background = '#22C55E'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(34,197,94,0.3)' }}
          >
            <GoogleIcon />
            {loading ? 'Redirecting…' : 'Get started free'}
          </button>

          <p style={{ color: '#475569', fontSize: 12, marginTop: 16 }}>
            Takes 30 seconds. Free forever.
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: '1px solid #1A1A26',
        padding: '24px 60px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#475569', fontSize: 13 }}>
            Fintrack — Built with ❤️ for personal finance clarity
          </span>
        </div>
        <p style={{ color: '#475569', fontSize: 12 }}>
          Free forever · Privacy-first · No ads
        </p>
      </footer>

    </div>
  )
}