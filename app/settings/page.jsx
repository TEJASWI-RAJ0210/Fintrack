'use client'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import DashboardLayout from '../dashboard/layout'

// ── Icon components ───────────────────────────────────────────
function IconUser({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
function IconTag({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  )
}
function IconDownload({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}
function IconTrash({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}
function IconPlus({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}
function IconCheck({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
function IconGoogle({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

// ── Default categories list ───────────────────────────────────
const DEFAULT_CATEGORIES = [
  { name: 'Food & Dining',     color: '#EF4444' },
  { name: 'Transport',         color: '#3B82F6' },
  { name: 'Shopping',          color: '#8B5CF6' },
  { name: 'Entertainment',     color: '#F59E0B' },
  { name: 'Health',            color: '#10B981' },
  { name: 'Bills & Utilities', color: '#6B7280' },
  { name: 'Education',         color: '#EC4899' },
  { name: 'Other',             color: '#9CA3AF' },
]

const COLOR_OPTIONS = [
  '#EF4444', '#F59E0B', '#10B981', '#3B82F6',
  '#8B5CF6', '#EC4899', '#6B7280', '#22C55E',
  '#F97316', '#14B8A6', '#9CA3AF', '#EAB308',
]

// ── Section card wrapper ──────────────────────────────────────
function Section({ icon, title, subtitle, children }) {
  return (
    <div style={{
      background: '#12121A',
      border: '1px solid #2A2A3A',
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 20,
    }}>
      {/* Section header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '18px 24px',
        borderBottom: '1px solid #2A2A3A',
      }}>
        <div style={{
          width: 34, height: 34,
          background: '#1A1A26',
          border: '1px solid #2A2A3A',
          borderRadius: 9,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#94A3B8', flexShrink: 0,
        }}>
          {icon}
        </div>
        <div>
          <p style={{ color: '#F1F5F9', fontSize: 15, fontWeight: 600,
            fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{title}</p>
          {subtitle && <p style={{ color: '#475569', fontSize: 12, marginTop: 2 }}>{subtitle}</p>}
        </div>
      </div>
      {/* Section body */}
      <div style={{ padding: '20px 24px' }}>
        {children}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────
export default function SettingsPage() {
  const { data: session } = useSession()

  // Custom categories state
  const [customCategories, setCustomCategories] = useState([])
  const [showAddCategory,  setShowAddCategory]  = useState(false)
  const [newCatName,       setNewCatName]        = useState('')
  const [newCatColor,      setNewCatColor]       = useState('#22C55E')
  const [savingCat,        setSavingCat]         = useState(false)

  // Export state
  const [exportingCSV,  setExportingCSV]  = useState(false)
  const [exportingJSON, setExportingJSON] = useState(false)

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleteInput,   setDeleteInput]   = useState('')
  const [deleting,      setDeleting]      = useState(false)

  // Toast notification
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // ── Load custom categories from API ──
 useEffect(() => {
  fetch('/api/categories')
    .then(r => r.ok ? r.json() : { categories: [] })
    .then(data => {
      const all    = data.categories || []
      const custom = all.filter(c => !c.is_default)
      setCustomCategories(custom)
    })
    .catch(() => {})
}, [])
 // ── Add custom category ──
const handleAddCategory = async () => {
  if (!newCatName.trim()) return
  setSavingCat(true)
  try {
    const res = await fetch('/api/categories', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name: newCatName.trim(), color: newCatColor }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to add category')

    const created = data.category || data
    if (!created.id) throw new Error('Invalid response from server')

    setCustomCategories(prev => [...prev, created])
    setNewCatName('')
    setNewCatColor('#22C55E')
    setShowAddCategory(false)
    showToast('Category added successfully')
  } catch (err) {
    console.error('Add category error:', err)
    showToast(err.message || 'Failed to add category', 'error')
  }
  setSavingCat(false)
}

  // ── Delete custom category ──
  const handleDeleteCategory = async (id) => {
    try {
      await fetch(`/api/categories/${id}`, { method: 'DELETE' })
      setCustomCategories(prev => prev.filter(c => c.id !== id))
      showToast('Category deleted')
    } catch {
      showToast('Failed to delete', 'error')
    }
  }

 // ── Export CSV ──
const handleExportCSV = async () => {
  setExportingCSV(true)
  try {
    const res      = await fetch('/api/expenses')
    const data     = await res.json()
    const expenses = data.expenses || []

    if (expenses.length === 0) {
      showToast('No expenses to export', 'error')
      setExportingCSV(false)
      return
    }

    const headers = 'date,amount,description,category\n'
    const rows    = expenses.map(e =>
      `${e.expense_date?.split('T')[0] || ''},${e.amount},"${e.description || ''}","${e.category || ''}"`
    ).join('\n')

    const blob     = new Blob([headers + rows], { type: 'text/csv' })
    const url      = URL.createObjectURL(blob)
    const a        = document.createElement('a')
    a.href         = url
    a.download     = `fintrack-expenses-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showToast('CSV exported successfully')
  } catch (err) {
    console.error('Export CSV error:', err)
    showToast('Export failed: ' + err.message, 'error')
  }
  setExportingCSV(false)
}

 // ── Export JSON ──
const handleExportJSON = async () => {
  setExportingJSON(true)
  try {
    const [expRes, budRes] = await Promise.all([
      fetch('/api/expenses'),
      fetch('/api/budgets'),
    ])
    const expData = await expRes.json()
    const budData = await budRes.json()
    const expenses = expData.expenses || []
    const budgets  = budData.budgets  || []

    const exportData = {
      exported_at: new Date().toISOString(),
      user:        session?.user?.email,
      expenses,
      budgets,
    }

    const blob     = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url      = URL.createObjectURL(blob)
    const a        = document.createElement('a')
    a.href         = url
    a.download     = `fintrack-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showToast('JSON exported successfully')
  } catch (err) {
    console.error('Export JSON error:', err)
    showToast('Export failed: ' + err.message, 'error')
  }
  setExportingJSON(false)
}

  // ── Delete all data ──
  const handleDeleteAll = async () => {
    if (deleteInput !== 'DELETE') return
    setDeleting(true)
    try {
      await fetch('/api/expenses/all', { method: 'DELETE' })
      setDeleteConfirm(false)
      setDeleteInput('')
      showToast('All data deleted')
    } catch {
      showToast('Failed to delete data', 'error')
    }
    setDeleting(false)
  }

  return (
      <DashboardLayout>
        <div style={{
      padding: '24px 16px', maxWidth: 720,
      animation: 'fadeUp 0.3s ease both',
    }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px);} to { opacity:1; transform:translateY(0);} }

        .settings-wrapper {
          padding: 36px 40px;
        }
        .profile-row {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        .profile-info {
          flex: 1;
          min-width: 0;
        }
        .signout-btn {
          flex-shrink: 0;
        }
        .categories-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin-bottom: 24px;
        }
        .export-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .export-btn {
          flex: 1;
          min-width: 130px;
        }
        .danger-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        @media (max-width: 640px) {
          .settings-wrapper {
            padding: 20px 16px !important;
          }
          .profile-row {
            flex-direction: column;
            align-items: flex-start;
          }
          .signout-btn {
            width: 100%;
            text-align: center;
            justify-content: center;
          }
          .categories-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .export-row {
            flex-direction: column;
          }
          .export-btn {
            width: 100%;
          }
          .danger-row {
            flex-direction: column;
            align-items: flex-start;
          }
          .danger-delete-btn {
            width: 100%;
            margin-left: 0 !important;
            margin-top: 12px;
          }
        }

        @media (min-width: 641px) and (max-width: 900px) {
          .settings-wrapper {
            padding: 24px 20px !important;
          }
          .categories-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
      `}</style>

      {/* ── Page header ── */}
      <div className="settings-wrapper" style={{ paddingBottom: 0, paddingTop: 0, maxWidth: 720 }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontSize: 30, fontWeight: 700, color: '#F1F5F9', marginBottom: 6,
          }}>
            Settings
          </h1>
          <p style={{ color: '#475569', fontSize: 14 }}>
            Manage your profile, categories, and data
          </p>
        </div>

        {/* ════════════════════════════════
            SECTION 1 — Profile
        ════════════════════════════════ */}
        <Section
          icon={<IconUser size={16} />}
          title="Profile"
          subtitle="Your account information from Google"
        >
          <div className="profile-row">
            {/* Avatar */}
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt="Profile"
                width={64} height={64}
                style={{ borderRadius: '50%', border: '2px solid #2A2A3A', flexShrink: 0 }}
              />
            ) : (
              <div style={{
                width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
                background: 'rgba(34,197,94,0.1)',
                border: '2px solid rgba(34,197,94,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#22C55E', fontSize: 24, fontWeight: 700,
              }}>
                {session?.user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}

            {/* Info */}
            <div className="profile-info">
              <p style={{
                color: '#F1F5F9', fontSize: 18, fontWeight: 600,
                fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 4,
              }}>
                {session?.user?.name || 'User'}
              </p>
              <p style={{ color: '#94A3B8', fontSize: 13, marginBottom: 10 }}>
                {session?.user?.email}
              </p>
              {/* Google badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: '#1A1A26', border: '1px solid #2A2A3A',
                borderRadius: 999, padding: '4px 10px',
              }}>
                <IconGoogle size={13} />
                <span style={{ color: '#94A3B8', fontSize: 11, fontWeight: 500 }}>
                  Signed in with Google
                </span>
              </div>
            </div>

            {/* Sign out button */}
            <button
              className="signout-btn"
              onClick={() => signOut({ callbackUrl: '/login' })}
              style={{
                background: 'transparent',
                border: '1px solid #2A2A3A',
                borderRadius: 10, padding: '8px 16px',
                color: '#94A3B8', fontSize: 13, cursor: 'pointer',
                transition: 'all 150ms', fontFamily: 'inherit',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#EF4444'
                e.currentTarget.style.color = '#EF4444'
                e.currentTarget.style.background = 'rgba(239,68,68,0.05)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#2A2A3A'
                e.currentTarget.style.color = '#94A3B8'
                e.currentTarget.style.background = 'transparent'
              }}
            >
              Sign out
            </button>
          </div>
        </Section>

        {/* ════════════════════════════════
            SECTION 2 — Categories
        ════════════════════════════════ */}
        <Section
          icon={<IconTag size={16} />}
          title="Categories"
          subtitle="Default categories + your custom ones"
        >
          {/* Default categories grid */}
          <p style={{ color: '#475569', fontSize: 12, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Default
          </p>
          <div className="categories-grid">
            {DEFAULT_CATEGORIES.map(cat => (
              <div key={cat.name} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: '#1A1A26', border: '1px solid #2A2A3A',
                borderRadius: 10, padding: '8px 10px',
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: cat.color, flexShrink: 0,
                }} />
                <span style={{ color: '#94A3B8', fontSize: 12, overflow: 'hidden',
                  textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {cat.name}
                </span>
              </div>
            ))}
          </div>

          {/* Custom categories */}
          {customCategories.length > 0 && (
            <>
              <p style={{ color: '#475569', fontSize: 12, marginBottom: 12,
                textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Custom
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                {customCategories.map(cat => (
                  <div key={cat.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: '#1A1A26', border: '1px solid #2A2A3A',
                    borderRadius: 10, padding: '10px 14px',
                  }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: cat.color, flexShrink: 0,
                    }} />
                    <span style={{ color: '#F1F5F9', fontSize: 13, flex: 1 }}>
                      {cat.name}
                    </span>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      style={{
                        background: 'transparent', border: 'none',
                        cursor: 'pointer', color: '#475569', padding: 4,
                        borderRadius: 6, transition: 'all 150ms',
                        display: 'flex', alignItems: 'center',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.background = 'transparent' }}
                    >
                      <IconTrash size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Add category form */}
          {showAddCategory ? (
            <div style={{
              background: '#1A1A26', border: '1px solid #2A2A3A',
              borderRadius: 12, padding: 16, marginBottom: 12,
            }}>
              <p style={{ color: '#F1F5F9', fontSize: 13, fontWeight: 500, marginBottom: 12 }}>
                New category
              </p>
              {/* Name input */}
              <input
                type="text"
                placeholder="Category name"
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                style={{
                  width: '100%', background: '#0A0A0F',
                  border: '1px solid #2A2A3A', borderRadius: 10,
                  padding: '9px 12px', color: '#F1F5F9', fontSize: 13,
                  outline: 'none', marginBottom: 12, fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
                autoFocus
              />
              {/* Color picker */}
              <p style={{ color: '#475569', fontSize: 12, marginBottom: 8 }}>Pick a color</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                {COLOR_OPTIONS.map(color => (
                  <button
                    key={color}
                    onClick={() => setNewCatColor(color)}
                    style={{
                      width: 26, height: 26, borderRadius: '50%',
                      background: color, border: 'none', cursor: 'pointer',
                      outline: newCatColor === color ? `2px solid ${color}` : 'none',
                      outlineOffset: 2,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'transform 150ms',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.15)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
                  >
                    {newCatColor === color && <IconCheck size={12} />}
                  </button>
                ))}
              </div>
              {/* Buttons */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  onClick={handleAddCategory}
                  disabled={!newCatName.trim() || savingCat}
                  style={{
                    background: '#22C55E', color: '#0A0A0F',
                    border: 'none', borderRadius: 9,
                    padding: '8px 16px', fontSize: 13, fontWeight: 600,
                    cursor: newCatName.trim() ? 'pointer' : 'not-allowed',
                    opacity: newCatName.trim() ? 1 : 0.5,
                    fontFamily: 'inherit',
                  }}
                >
                  {savingCat ? 'Saving…' : 'Add category'}
                </button>
                <button
                  onClick={() => { setShowAddCategory(false); setNewCatName(''); setNewCatColor('#22C55E') }}
                  style={{
                    background: 'transparent', border: '1px solid #2A2A3A',
                    borderRadius: 9, padding: '8px 14px',
                    color: '#94A3B8', fontSize: 13, cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddCategory(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'transparent',
                border: '1px dashed #2A2A3A',
                borderRadius: 10, padding: '9px 14px',
                color: '#475569', fontSize: 13, cursor: 'pointer',
                transition: 'all 150ms', fontFamily: 'inherit',
                width: '100%',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#22C55E'
                e.currentTarget.style.color = '#22C55E'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#2A2A3A'
                e.currentTarget.style.color = '#475569'
              }}
            >
              <IconPlus size={14} />
              Add custom category
            </button>
          )}
        </Section>

        {/* ════════════════════════════════
            SECTION 3 — Data & Export
        ════════════════════════════════ */}
        <Section
          icon={<IconDownload size={16} />}
          title="Data & Export"
          subtitle="Download all your data anytime"
        >
          <div className="export-row">
            {/* Export CSV */}
            <button
              className="export-btn"
              onClick={handleExportCSV}
              disabled={exportingCSV}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: '#1A1A26', border: '1px solid #2A2A3A',
                borderRadius: 10, padding: '10px 18px',
                color: '#F1F5F9', fontSize: 13, fontWeight: 500,
                cursor: 'pointer', transition: 'all 150ms',
                opacity: exportingCSV ? 0.6 : 1, fontFamily: 'inherit',
              }}
              onMouseEnter={e => {
                if (!exportingCSV) e.currentTarget.style.borderColor = '#22C55E'
              }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A3A' }}
            >
              <IconDownload size={14} />
              {exportingCSV ? 'Exporting…' : 'Export CSV'}
            </button>

            {/* Export JSON */}
            <button
              className="export-btn"
              onClick={handleExportJSON}
              disabled={exportingJSON}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: '#1A1A26', border: '1px solid #2A2A3A',
                borderRadius: 10, padding: '10px 18px',
                color: '#F1F5F9', fontSize: 13, fontWeight: 500,
                cursor: 'pointer', transition: 'all 150ms',
                opacity: exportingJSON ? 0.6 : 1, fontFamily: 'inherit',
              }}
              onMouseEnter={e => {
                if (!exportingJSON) e.currentTarget.style.borderColor = '#3B82F6'
              }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A3A' }}
            >
              <IconDownload size={14} />
              {exportingJSON ? 'Exporting…' : 'Export JSON'}
            </button>
          </div>

          <p style={{ color: '#475569', fontSize: 12, marginTop: 12 }}>
            CSV exports your expenses as a spreadsheet. JSON exports all data including budgets.
          </p>
        </Section>

        {/* ════════════════════════════════
            SECTION 4 — Danger Zone
        ════════════════════════════════ */}
        <div style={{
          background: '#12121A',
          border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: 16, overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '18px 24px',
            borderBottom: '1px solid rgba(239,68,68,0.15)',
            background: 'rgba(239,68,68,0.04)',
          }}>
            <div style={{
              width: 34, height: 34,
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 9,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#EF4444',
            }}>
              <IconTrash size={16} />
            </div>
            <div>
              <p style={{ color: '#EF4444', fontSize: 15, fontWeight: 600,
                fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Danger Zone</p>
              <p style={{ color: '#475569', fontSize: 12, marginTop: 2 }}>
                Irreversible actions — proceed with caution
              </p>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: '20px 24px' }}>
            {!deleteConfirm ? (
              <div className="danger-row">
                <div>
                  <p style={{ color: '#F1F5F9', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
                    Delete all data
                  </p>
                  <p style={{ color: '#475569', fontSize: 12 }}>
                    Permanently removes all your expenses and budgets. Cannot be undone.
                  </p>
                </div>
                <button
                  className="danger-delete-btn"
                  onClick={() => setDeleteConfirm(true)}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: 10, padding: '8px 16px',
                    color: '#EF4444', fontSize: 13, fontWeight: 500,
                    cursor: 'pointer', transition: 'all 150ms',
                    fontFamily: 'inherit', flexShrink: 0, marginLeft: 16,
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(239,68,68,0.08)'
                    e.currentTarget.style.borderColor = '#EF4444'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'
                  }}
                >
                  Delete all data
                </button>
              </div>
            ) : (
              // Confirmation step
              <div>
                <p style={{ color: '#F1F5F9', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
                  Are you absolutely sure?
                </p>
                <p style={{ color: '#94A3B8', fontSize: 13, marginBottom: 16, lineHeight: 1.6 }}>
                  This will permanently delete <strong style={{ color: '#F1F5F9' }}>all your expenses and budgets</strong>.
                  Type <strong style={{ color: '#EF4444', fontFamily: 'JetBrains Mono, monospace' }}>DELETE</strong> to confirm.
                </p>
                <input
                  type="text"
                  placeholder="Type DELETE to confirm"
                  value={deleteInput}
                  onChange={e => setDeleteInput(e.target.value)}
                  style={{
                    width: '100%', background: '#0A0A0F',
                    border: `1px solid ${deleteInput === 'DELETE' ? '#EF4444' : '#2A2A3A'}`,
                    borderRadius: 10, padding: '9px 12px',
                    color: '#F1F5F9', fontSize: 13,
                    outline: 'none', marginBottom: 12, fontFamily: 'JetBrains Mono, monospace',
                    transition: 'border-color 150ms', boxSizing: 'border-box',
                  }}
                />
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    onClick={handleDeleteAll}
                    disabled={deleteInput !== 'DELETE' || deleting}
                    style={{
                      background: deleteInput === 'DELETE' ? '#EF4444' : '#2A2A3A',
                      border: 'none', borderRadius: 9,
                      padding: '8px 16px', fontSize: 13, fontWeight: 600,
                      color: deleteInput === 'DELETE' ? '#fff' : '#475569',
                      cursor: deleteInput === 'DELETE' ? 'pointer' : 'not-allowed',
                      transition: 'all 150ms', fontFamily: 'inherit',
                    }}
                  >
                    {deleting ? 'Deleting…' : 'Yes, delete everything'}
                  </button>
                  <button
                    onClick={() => { setDeleteConfirm(false); setDeleteInput('') }}
                    style={{
                      background: 'transparent', border: '1px solid #2A2A3A',
                      borderRadius: 9, padding: '8px 14px',
                      color: '#94A3B8', fontSize: 13, cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Toast notification ── */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
          background: toast.type === 'error' ? '#1A1A26' : '#12121A',
          border: `1px solid ${toast.type === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
          borderRadius: 12, padding: '12px 18px',
          display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          animation: 'fadeUp 0.2s ease both',
          maxWidth: 'calc(100vw - 48px)',
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
            background: toast.type === 'error' ? '#EF4444' : '#22C55E',
          }} />
          <span style={{ color: '#F1F5F9', fontSize: 13 }}>{toast.message}</span>
        </div>
      )}
    </div> 
      </DashboardLayout>
   
  )
}