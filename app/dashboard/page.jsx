'use client'
import { useSession }  from 'next-auth/react'
import { useEffect, useState } from 'react'
import { format }      from 'date-fns'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'

const MOCK_STATS = {
  totalThisMonth: 24350,
  byCategory: [
    { name: 'Food & Dining',     color: '#EF4444', total: 8200 },
    { name: 'Transport',         color: '#3B82F6', total: 4800 },
    { name: 'Shopping',          color: '#8B5CF6', total: 5200 },
    { name: 'Entertainment',     color: '#F59E0B', total: 2100 },
    { name: 'Bills & Utilities', color: '#6B7280', total: 4050 },
  ],
  monthlyTrend: [
    { month_label: 'Nov', total: 18400 },
    { month_label: 'Dec', total: 21000 },
    { month_label: 'Jan', total: 19800 },
    { month_label: 'Feb', total: 22500 },
    { month_label: 'Mar', total: 20100 },
    { month_label: 'Apr', total: 24350 },
  ],
  budgetAlerts: [
    { category_name: 'Food & Dining', spent: 8200, monthly_limit: 10000 },
  ],
}

function DarkTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#1A1A26', border: '1px solid #2A2A3A', borderRadius: 10, padding: '10px 14px' }}>
      {label && <p style={{ color: '#94A3B8', fontSize: 11, marginBottom: 4 }}>{label}</p>}
      <p style={{ color: '#F1F5F9', fontSize: 14, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>
        ₹{parseFloat(payload[0].value).toLocaleString('en-IN')}
      </p>
    </div>
  )
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const entry = payload[0]
  return (
    <div style={{ background: '#1A1A26', border: '1px solid #2A2A3A', borderRadius: 10, padding: '10px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: entry.payload.color }} />
        <p style={{ color: '#94A3B8', fontSize: 11 }}>{entry.name}</p>
      </div>
      <p style={{ color: '#F1F5F9', fontSize: 14, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>
        ₹{parseFloat(entry.value).toLocaleString('en-IN')}
      </p>
      <p style={{ color: entry.payload.color, fontSize: 11, marginTop: 2 }}>{entry.payload.percent}%</p>
    </div>
  )
}

function StatCard({ label, value, emoji, accent, isMono }) {
  return (
    <div style={{ background: '#12121A', border: `1px solid ${accent}33`, borderRadius: 16, padding: 20 }}>
      <div style={{ fontSize: 20, marginBottom: 12 }}>{emoji}</div>
      <p style={{ color: '#F1F5F9', fontSize: 22, fontWeight: 700, marginBottom: 4,
        fontFamily: isMono ? 'JetBrains Mono, monospace' : 'Plus Jakarta Sans, sans-serif' }}>
        {value}
      </p>
      <p style={{ color: '#475569', fontSize: 12 }}>{label}</p>
    </div>
  )
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => { setStats(d); setLoading(false) })
      .catch(() => { setStats(MOCK_STATS); setLoading(false) })
  }, [])

  if (loading) {
    return (
      <div style={{ padding: '24px 20px' }}>
        {[1,2,3].map(i => (
          <div key={i} style={{ height: 80, borderRadius: 12, background: '#12121A',
            marginBottom: 12, animation: 'pulse 1.5s infinite' }} />
        ))}
      </div>
    )
  }

  const monthName  = format(new Date(), 'MMMM yyyy')
  const firstName  = session?.user?.name?.split(' ')[0] || 'there'
  const totalSpent = parseFloat(stats?.totalThisMonth || 0)

  const pieData = (stats?.byCategory || [])
    .map(c => ({
      name:    c.name  || 'Uncategorized',
      color:   c.color || '#9CA3AF',
      total:   parseFloat(c.total || 0),
      percent: totalSpent > 0 ? Math.round((parseFloat(c.total || 0) / totalSpent) * 100) : 0,
    }))
    .filter(c => c.total > 0)

  const trendData = (stats?.monthlyTrend || []).map(t => ({
    month_label: t.month_label || t.label || '',
    total:       parseFloat(t.total || 0),
  }))

  return (
    <>
      <style>{`
        .dash-padding { padding: 36px 40px; }
        .stat-grid    { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
        .chart-grid   { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
        .pie-inner    { display: flex; align-items: center; gap: 16px; }
        .pie-legend   { display: flex; flex-direction: column; gap: 8px; flex: 1; }

        @media (max-width: 1024px) {
          .chart-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
          .dash-padding { padding: 20px 16px; }
          .stat-grid    { grid-template-columns: 1fr; gap: 10px; }
          .chart-grid   { grid-template-columns: 1fr; gap: 12px; }
          .pie-inner    { flex-direction: column; align-items: center; }
          .pie-legend   { width: 100%; }
        }
        @media (max-width: 480px) {
          .stat-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <div className="dash-padding">

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 700, color: '#F1F5F9', marginBottom: 4 }}>
            Hi, {firstName} 👋
          </h1>
          <p style={{ color: '#475569', fontSize: 14 }}>
            Here&apos;s your financial overview for {monthName}
          </p>
        </div>

        {/* Budget alerts */}
        {stats?.budgetAlerts?.length > 0 && (
          <div style={{ marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {stats.budgetAlerts.map((alert, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
                borderRadius: 12, padding: '12px 14px',
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B',
                  flexShrink: 0, marginTop: 3 }} />
                <p style={{ color: '#F59E0B', fontSize: 13, fontWeight: 500, lineHeight: 1.5 }}>
                  <strong>{alert.category_name}</strong>: ₹{parseFloat(alert.spent).toLocaleString('en-IN')} of ₹{parseFloat(alert.monthly_limit).toLocaleString('en-IN')} budget
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Stat cards */}
        <div className="stat-grid">
          <StatCard label="Total Spent This Month" value={`₹${totalSpent.toLocaleString('en-IN')}`} emoji="💸" accent="#22C55E" isMono />
          <StatCard label="Categories Tracked"     value={pieData.length}                             emoji="🏷️" accent="#3B82F6" />
          <StatCard
            label="Budget Alerts"
            value={stats?.budgetAlerts?.length > 0
              ? `${stats.budgetAlerts.length} alert${stats.budgetAlerts.length > 1 ? 's' : ''}`
              : 'All clear'}
            emoji={stats?.budgetAlerts?.length > 0 ? '⚠️' : '✅'}
            accent={stats?.budgetAlerts?.length > 0 ? '#F59E0B' : '#22C55E'}
          />
        </div>

        {/* Charts */}
        <div className="chart-grid">

          {/* Bar chart */}
          <div style={{ background: '#12121A', border: '1px solid #2A2A3A', borderRadius: 16, padding: 20 }}>
            <h2 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontSize: 15, fontWeight: 600, color: '#F1F5F9', marginBottom: 16 }}>
              Monthly Spending Trend
            </h2>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={trendData} barSize={24}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3A" vertical={false} />
                  <XAxis dataKey="month_label" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false}
                    tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="total" fill="#22C55E" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: '#475569', fontSize: 13 }}>No trend data yet</p>
              </div>
            )}
          </div>

          {/* Pie chart */}
          <div style={{ background: '#12121A', border: '1px solid #2A2A3A', borderRadius: 16, padding: 20 }}>
            <h2 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontSize: 15, fontWeight: 600, color: '#F1F5F9', marginBottom: 16 }}>
              Spending by Category
            </h2>

            {pieData.length > 0 ? (
              <div className="pie-inner">
                {/* Donut */}
                <div style={{ flexShrink: 0, position: 'relative', width: 180, height: 180 }}>
                  <ResponsiveContainer width={180} height={180}>
                    <PieChart>
                      <Pie data={pieData} dataKey="total" nameKey="name"
                        cx="50%" cy="50%" innerRadius={50} outerRadius={78}
                        paddingAngle={3} strokeWidth={0}>
                        {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center total */}
                  <div style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none',
                  }}>
                    <p style={{ color: '#F1F5F9', fontSize: 12, fontWeight: 700,
                      fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}>
                      ₹{(totalSpent/1000).toFixed(1)}k
                    </p>
                    <p style={{ color: '#475569', fontSize: 9, marginTop: 2 }}>total</p>
                  </div>
                </div>

                {/* Legend */}
                <div className="pie-legend">
                  {pieData.map((entry, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%',
                        background: entry.color, flexShrink: 0 }} />
                      <span style={{ color: '#94A3B8', fontSize: 11, flex: 1,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {entry.name}
                      </span>
                      <span style={{ color: '#F1F5F9', fontSize: 11,
                        fontFamily: 'JetBrains Mono, monospace', flexShrink: 0 }}>
                        {entry.percent}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ height: 200, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <p style={{ color: '#475569', fontSize: 13 }}>No spending data yet</p>
                <p style={{ color: '#2A2A3A', fontSize: 11 }}>Add expenses to see breakdown</p>
              </div>
            )}
          </div>
        </div>

        {/* Top categories */}
        <div style={{ background: '#12121A', border: '1px solid #2A2A3A', borderRadius: 16, padding: 20 }}>
          <h2 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontSize: 15, fontWeight: 600, color: '#F1F5F9', marginBottom: 16 }}>
            Top Categories
          </h2>
          {pieData.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {pieData.map((cat, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%',
                    background: cat.color, flexShrink: 0 }} />
                  <span style={{ color: '#94A3B8', fontSize: 12, width: 120, flexShrink: 0,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {cat.name}
                  </span>
                  <div style={{ flex: 1, height: 5, background: '#1A1A26', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 999, width: `${cat.percent}%`,
                      background: cat.color, transition: 'width 700ms ease' }} />
                  </div>
                  <span style={{ color: '#F1F5F9', fontSize: 12, fontWeight: 600,
                    fontFamily: 'JetBrains Mono, monospace', width: 80,
                    textAlign: 'right', flexShrink: 0 }}>
                    ₹{parseFloat(cat.total).toLocaleString('en-IN')}
                  </span>
                  <span style={{ color: '#475569', fontSize: 11, width: 30,
                    textAlign: 'right', flexShrink: 0 }}>
                    {cat.percent}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#475569', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
              No expense data yet. Add expenses to see the breakdown.
            </p>
          )}
        </div>
      </div>
    </>
  )
}