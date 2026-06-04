import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useProfile } from '../hooks/useProfile'
import { SCHOOLS } from '../data/schools'
import { NON_NEGOTIABLES } from '../data/nonNegotiables'
import { TRAINING_PLANS } from '../data/trainingData'
import { supabase } from '../lib/supabase'
import { IconFlame, IconCheck, IconChevronRight } from '../components/Icons'

const DAY_PLANS = {
  1: 'shooting-heavy',
  2: 'footwork-focus',
  3: 'stick-ground-balls',
  4: 'dodge-finish',
  5: 'game-speed',
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function daysUntilGraduation(gradYear) {
  if (!gradYear) return null
  const grad = new Date(`${gradYear}-06-01`)
  const diff = Math.ceil((grad - new Date()) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
}

export default function Home() {
  const { user } = useAuth()
  const { profile } = useProfile(user?.id)
  const navigate = useNavigate()
  const [checked, setChecked] = useState([])
  const [streak, setStreak] = useState(0)
  const [sessionsThisWeek, setSessionsThisWeek] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(20 * 60)
  const timerRef = useRef(null)

  const school = SCHOOLS.find(s => s.id === profile?.dreamSchoolId)
  const day = new Date().getDay()
  const todayPlanId = DAY_PLANS[day]
  const todayPlan = TRAINING_PLANS.find(p => p.id === todayPlanId)

  useEffect(() => {
    if (!user) return
    async function loadStreak() {
      const today = new Date().toISOString().slice(0, 10)
      const { data: todayEntry } = await supabase.from('streaks').select('*').eq('userId', user.id).eq('date', today).single()
      if (todayEntry?.nonNegotiablesChecked) setChecked(todayEntry.nonNegotiablesChecked)
      const { data: streakData } = await supabase.from('streaks').select('date, completed').eq('userId', user.id).eq('completed', true).order('date', { ascending: false })
      if (streakData) {
        let count = 0, d = new Date()
        for (const row of streakData) {
          const diff = Math.floor((d - new Date(row.date)) / (1000 * 60 * 60 * 24))
          if (diff <= 1) { count++; d = new Date(row.date) } else break
        }
        setStreak(count)
      }
      const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - weekStart.getDay()); weekStart.setHours(0,0,0,0)
      const { count } = await supabase.from('sessionLogs').select('*', { count: 'exact', head: true }).eq('userId', user.id).gte('completedAt', weekStart.toISOString())
      setSessionsThisWeek(count || 0)
    }
    loadStreak()
  }, [user])

  async function toggleNonNeg(num) {
    const newChecked = checked.includes(num) ? checked.filter(n => n !== num) : [...checked, num]
    setChecked(newChecked)
    const today = new Date().toISOString().slice(0, 10)
    const completed = newChecked.length === 5
    await supabase.from('streaks').upsert({ userId: user.id, date: today, completed, nonNegotiablesChecked: newChecked }, { onConflict: 'userId,date' })
    if (completed) setStreak(s => s + 1)
  }

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => setTimerSeconds(s => { if (s <= 1) { setTimerRunning(false); return 0 } return s - 1 }), 1000)
    } else { clearInterval(timerRef.current) }
    return () => clearInterval(timerRef.current)
  }, [timerRunning])

  async function logWallBall() {
    if (!user) return
    await supabase.from('sessionLogs').insert({ userId: user.id, planId: 'wall-ball', completedAt: new Date().toISOString(), durationMinutes: Math.round((20 * 60 - timerSeconds) / 60) })
    setTimerSeconds(20 * 60); setTimerRunning(false)
  }

  const mins = String(Math.floor(timerSeconds / 60)).padStart(2, '0')
  const secs = String(timerSeconds % 60).padStart(2, '0')
  const allChecked = checked.length === 5
  const days = daysUntilGraduation(profile?.gradYear)

  return (
    <div style={{ background: '#0A0812', minHeight: '100vh' }}>

      {/* Hero header */}
      <div className="hero-header">
        <div style={{ maxWidth: '440px', margin: '0 auto' }}>
          <p style={{ fontSize: '13px', color: 'rgba(240,234,248,0.45)', marginBottom: '6px', fontWeight: 400 }}>
            {getGreeting()}
          </p>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '52px', letterSpacing: '3px', color: '#F0EAFB', lineHeight: 1, marginBottom: '10px' }}>
            {profile?.name || 'Athlete'}
          </h1>
          {school && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '6px 14px 6px 8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: school.primaryColor, boxShadow: `0 0 8px ${school.primaryColor}` }} />
              <span style={{ fontSize: '13px', color: 'rgba(240,234,248,0.7)', fontWeight: 500 }}>
                {school.name}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '24px 20px 32px', maxWidth: '440px', margin: '0 auto' }}>

        {/* Quick stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '28px' }}>
          <StatCard value={streak} label="Streak" icon={<IconFlame size={14} />} />
          <StatCard value={sessionsThisWeek} label="Sessions" />
          <StatCard value={days ?? '—'} label="Days Left" small />
        </div>

        {/* Non-Negotiables */}
        <SectionLabel>Today's Non-Negotiables</SectionLabel>
        <div style={{ marginBottom: '28px' }}>
          {/* Progress bar */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '14px' }}>
            {NON_NEGOTIABLES.map(nn => (
              <div key={nn.number} style={{ flex: 1, height: '3px', borderRadius: '2px', background: checked.includes(nn.number) ? 'var(--color-primary)' : 'rgba(255,255,255,0.08)', transition: 'background 300ms ease', boxShadow: checked.includes(nn.number) ? `0 0 6px var(--color-primary)` : 'none' }} />
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {NON_NEGOTIABLES.map(nn => {
              const isChecked = checked.includes(nn.number)
              return (
                <button
                  key={nn.number}
                  onClick={() => toggleNonNeg(nn.number)}
                  style={{
                    background: isChecked
                      ? `linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 12%, #181424), #181424)`
                      : 'linear-gradient(145deg, #181424, #120f1c)',
                    border: `1px solid ${isChecked ? 'color-mix(in srgb, var(--color-primary) 35%, transparent)' : 'rgba(255,255,255,0.07)'}`,
                    borderRadius: '12px',
                    padding: '14px 16px',
                    display: 'flex', alignItems: 'center', gap: '14px',
                    textAlign: 'left', cursor: 'pointer',
                    transition: 'all 220ms ease',
                    boxShadow: isChecked ? `0 4px 20px color-mix(in srgb, var(--color-primary) 12%, transparent)` : 'none'
                  }}
                >
                  <div style={{
                    width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0,
                    background: isChecked ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
                    border: `1.5px solid ${isChecked ? 'var(--color-primary)' : 'rgba(255,255,255,0.15)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 220ms ease',
                    boxShadow: isChecked ? `0 0 10px color-mix(in srgb, var(--color-primary) 50%, transparent)` : 'none'
                  }}>
                    {isChecked && <IconCheck size={12} color="var(--color-text-on-primary, #fff)" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: isChecked ? 'rgba(240,234,248,0.5)' : '#F0EAFB', textDecoration: isChecked ? 'line-through' : 'none', transition: 'all 220ms ease' }}>
                      {nn.title}
                    </div>
                  </div>
                  {isChecked && <div className="glow-dot" />}
                </button>
              )
            })}
          </div>

          {allChecked && (
            <div style={{ marginTop: '12px', textAlign: 'center', padding: '12px', background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', borderRadius: '10px', border: '1px solid color-mix(in srgb, var(--color-primary) 25%, transparent)' }}>
              <span style={{ fontSize: '13px', color: 'var(--color-primary)', fontWeight: 600 }}>All 5 complete — streak extended</span>
            </div>
          )}
        </div>

        {/* Today's Session */}
        <SectionLabel>Today's Session</SectionLabel>
        <div style={{ marginBottom: '28px' }}>
          {todayPlan ? (
            <button
              onClick={() => navigate(`/train/session/${todayPlan.id}`)}
              style={{
                width: '100%',
                background: 'linear-gradient(145deg, #181424, #120f1c)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '14px',
                padding: '20px',
                textAlign: 'left', cursor: 'pointer',
                transition: 'all 220ms ease',
                position: 'relative', overflow: 'hidden'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4), 0 0 24px color-mix(in srgb, var(--color-primary) 15%, transparent)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
            >
              {/* Color bar */}
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: 'var(--color-primary)', borderRadius: '14px 0 0 14px', boxShadow: '0 0 12px var(--color-primary)' }} />
              <div style={{ paddingLeft: '12px' }}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(240,234,248,0.35)', marginBottom: '8px' }}>
                  {new Date().toLocaleDateString('en-US', { weekday: 'long' })} · Scheduled
                </div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '30px', letterSpacing: '2px', color: '#F0EAFB', marginBottom: '4px' }}>
                  {todayPlan.title}
                </div>
                <div style={{ fontSize: '13px', color: 'rgba(240,234,248,0.5)', marginBottom: '14px' }}>
                  {todayPlan.focus}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="chip chip-primary">90 min</span>
                  <span style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
                    Open <IconChevronRight size={12} />
                  </span>
                </div>
              </div>
            </button>
          ) : (
            <div style={{ background: 'linear-gradient(145deg, #181424, #120f1c)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '28px', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '26px', color: 'rgba(240,234,248,0.3)', marginBottom: '6px' }}>Rest Day</div>
              <p style={{ color: 'rgba(240,234,248,0.3)', fontSize: '13px' }}>Recovery is training. Sleep and eat well today.</p>
            </div>
          )}
        </div>

        {/* Wall Ball Timer */}
        <SectionLabel>Wall Ball Timer</SectionLabel>
        <div style={{
          background: 'linear-gradient(145deg, #181424, #120f1c)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '14px',
          padding: '28px 20px',
          textAlign: 'center',
          marginBottom: '28px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background glow when running */}
          {timerRunning && (
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 40%, color-mix(in srgb, var(--color-primary) 10%, transparent), transparent 70%)', pointerEvents: 'none' }} />
          )}
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '80px',
            letterSpacing: '6px',
            lineHeight: 1,
            color: timerRunning ? 'var(--color-primary)' : '#F0EAFB',
            transition: 'color 400ms ease',
            textShadow: timerRunning ? `0 0 40px color-mix(in srgb, var(--color-primary) 50%, transparent)` : 'none',
            position: 'relative'
          }}>
            {mins}:{secs}
          </div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(240,234,248,0.3)', marginTop: '6px', marginBottom: '20px' }}>
            Non-Negotiable · 20:00
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              onClick={() => setTimerRunning(r => !r)}
              className="btn btn-primary"
              style={{ minWidth: '120px', background: 'var(--color-primary)', color: 'var(--color-text-on-primary, #fff)' }}
            >
              {timerRunning ? 'Pause' : timerSeconds < 20 * 60 ? 'Resume' : 'Start'}
            </button>
            {timerSeconds < 20 * 60 && (
              <button onClick={logWallBall} className="btn btn-ghost">Log</button>
            )}
          </div>
          {timerSeconds === 0 && (
            <p style={{ marginTop: '14px', color: 'rgba(240,234,248,0.55)', fontSize: '13px' }}>
              Done. Move to shooting mechanics.
            </p>
          )}
        </div>

      </div>
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(240,234,248,0.35)', marginBottom: '12px' }}>
      {children}
    </div>
  )
}

function StatCard({ value, label, icon, small }) {
  return (
    <div style={{
      background: 'linear-gradient(145deg, #181424, #120f1c)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '12px',
      padding: '16px 12px',
      textAlign: 'center'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '4px' }}>
        {icon && <span style={{ color: 'var(--color-primary)' }}>{icon}</span>}
        <span style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: small ? '32px' : '38px',
          letterSpacing: '2px',
          lineHeight: 1,
          color: 'var(--color-primary)',
          textShadow: `0 0 20px color-mix(in srgb, var(--color-primary) 40%, transparent)`
        }}>
          {value}
        </span>
      </div>
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(240,234,248,0.3)' }}>
        {label}
      </div>
    </div>
  )
}
