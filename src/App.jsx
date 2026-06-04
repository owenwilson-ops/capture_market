import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { useProfile } from './hooks/useProfile'
import { useTheme } from './hooks/useTheme'
import AppLayout from './components/AppLayout'

import AuthPage from './pages/AuthPage'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import ParentHome from './pages/ParentHome'
import Train from './pages/Train'
import SessionView from './pages/SessionView'
import NonNegotiables from './pages/NonNegotiables'
import MySchools from './pages/MySchools'
import Roadmap from './pages/Roadmap'
import Profile from './pages/Profile'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  const { user } = useAuth()
  const { profile } = useProfile(user?.id)
  useTheme(profile?.dreamSchoolId)

  const HomeScreen = profile?.parentMode ? ParentHome : Home

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/home" replace /> : <AuthPage />} />
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        }
      />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <AppLayout>
              <HomeScreen />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/train"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Train />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/train/session/:planId"
        element={
          <ProtectedRoute>
            <AppLayout>
              <SessionView />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/non-negotiables"
        element={
          <ProtectedRoute>
            <AppLayout>
              <NonNegotiables />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/schools"
        element={
          <ProtectedRoute>
            <AppLayout>
              <MySchools />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/roadmap"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Roadmap />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Profile />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0D0A0F',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: '28px',
        letterSpacing: '4px',
        color: 'rgba(240,234,248,0.3)'
      }}>
        RECRUIT READY
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
