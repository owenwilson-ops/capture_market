import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthPage() {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'signup') {
        const { error } = await signUp(email, password)
        if (error) throw error
        // New users go to onboarding
        navigate('/onboarding')
      } else {
        const { error } = await signIn(email, password)
        if (error) throw error
        navigate('/home')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: '#0D0A0F' }}>
      {/* Wordmark */}
      <div className="mb-12 text-center">
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: '42px',
          letterSpacing: '3px',
          color: '#F0EAFB',
          lineHeight: 1,
          marginBottom: '6px'
        }}>
          RECRUIT READY
        </h1>
        <p style={{ color: 'rgba(240,234,248,0.4)', fontSize: '13px', letterSpacing: '2px', fontFamily: "'Space Mono', monospace", textTransform: 'uppercase' }}>
          Train with purpose. Recruit with intent.
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm" style={{
        background: '#13101A',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '14px',
        padding: '32px'
      }}>
        <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: '20px', color: '#F0EAFB', marginBottom: '24px' }}>
          {mode === 'signin' ? 'Welcome back' : 'Create your account'}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'rgba(240,234,248,0.55)', marginBottom: '6px', fontFamily: "'Space Mono', monospace", letterSpacing: '1px', textTransform: 'uppercase' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              style={{
                width: '100%',
                background: '#1A1525',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '7px',
                padding: '12px 14px',
                color: '#F0EAFB',
                fontSize: '15px',
                outline: 'none',
                fontFamily: "'DM Sans', sans-serif"
              }}
              onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'rgba(240,234,248,0.55)', marginBottom: '6px', fontFamily: "'Space Mono', monospace", letterSpacing: '1px', textTransform: 'uppercase' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: '100%',
                background: '#1A1525',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '7px',
                padding: '12px 14px',
                color: '#F0EAFB',
                fontSize: '15px',
                outline: 'none',
                fontFamily: "'DM Sans', sans-serif"
              }}
              onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          {error && (
            <p style={{ color: '#FF6B6B', fontSize: '13px' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full mt-2"
            style={{ background: 'var(--color-primary)', color: 'var(--color-text-on-primary, #fff)' }}
          >
            {loading ? 'Loading…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p style={{ marginTop: '20px', textAlign: 'center', color: 'rgba(240,234,248,0.4)', fontSize: '14px' }}>
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError('') }}
            style={{ color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
