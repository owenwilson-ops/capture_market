import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthPage() {
  const [mode, setMode] = useState('signin')
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
    <div style={{
      minHeight: '100vh',
      background: '#0A0812',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Ambient background glow */}
      <div style={{
        position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)',
        width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(75,60,120,0.25) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '-100px', right: '-100px',
        width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(60,40,100,0.15) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* Wordmark */}
      <div style={{ marginBottom: '48px', textAlign: 'center', position: 'relative' }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', color: 'rgba(240,234,248,0.3)', marginBottom: '10px' }}>
          Women's Lacrosse Recruiting
        </div>
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: '52px',
          letterSpacing: '6px',
          color: '#F0EAFB',
          lineHeight: 1,
          marginBottom: '0'
        }}>
          RECRUIT READY
        </h1>
        <div style={{ width: '40px', height: '2px', background: 'rgba(255,255,255,0.2)', margin: '14px auto 0', borderRadius: '1px' }} />
      </div>

      {/* Card */}
      <div style={{
        width: '100%',
        maxWidth: '360px',
        background: 'linear-gradient(160deg, #181424 0%, #120f1c 100%)',
        border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: '18px',
        padding: '32px',
        position: 'relative',
        boxShadow: '0 24px 80px rgba(0,0,0,0.5)'
      }}>
        <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: '19px', color: '#F0EAFB', marginBottom: '24px' }}>
          {mode === 'signin' ? 'Welcome back' : 'Create your account'}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '10px', color: 'rgba(240,234,248,0.4)', marginBottom: '7px', fontFamily: "'Space Mono', monospace", letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="input"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '10px', color: 'rgba(240,234,248,0.4)', marginBottom: '7px', fontFamily: "'Space Mono', monospace", letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="input"
            />
          </div>

          {error && (
            <div style={{ background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.25)', borderRadius: '8px', padding: '10px 14px', color: '#FF8080', fontSize: '13px' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ marginTop: '4px', width: '100%', background: 'rgba(120,90,200,0.9)', color: '#fff', boxShadow: '0 4px 20px rgba(100,70,180,0.35)' }}
          >
            {loading ? 'Loading…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p style={{ marginTop: '20px', textAlign: 'center', color: 'rgba(240,234,248,0.35)', fontSize: '13px' }}>
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError('') }}
            style={{ color: 'rgba(200,180,255,0.9)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
