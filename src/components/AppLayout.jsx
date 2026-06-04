import BottomNav from './BottomNav'
import { useAuth } from '../context/AuthContext'
import { useProfile } from '../hooks/useProfile'
import { useTheme } from '../hooks/useTheme'

export default function AppLayout({ children }) {
  const { user } = useAuth()
  const { profile } = useProfile(user?.id)
  useTheme(profile?.dreamSchoolId)

  return (
    <div className="min-h-screen" style={{ background: '#0D0A0F' }}>
      <BottomNav />
      {/* Content area — offset for sidebar on desktop, bottom nav on mobile */}
      <main className="md:pl-20 pb-20 md:pb-0 min-h-screen">
        {children}
      </main>
    </div>
  )
}
