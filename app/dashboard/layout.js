'use client'
import { useSession } from 'next-auth/react'
import { useRouter }  from 'next/navigation'
import { useEffect }  from 'react'
import Sidebar        from '@/components/layout/Sidebar'

export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login')
  }, [status, router])

  if (status === 'loading') {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#0A0A0F',
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
          style={{ animation: 'spin 0.75s linear infinite' }}>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <circle cx="12" cy="12" r="10" stroke="#2A2A3A" strokeWidth="3" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
    )
  }

  if (status === 'unauthenticated') return null

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0A0A0F' }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>
        {children}
      </main>
    </div>
  )
}