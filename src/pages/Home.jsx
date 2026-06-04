import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useProfile } from '../hooks/useProfile'
import { SCHOOLS } from '../data/schools'
import { NON_NEGOTIABLES } from '../data/nonNegotiables'
import { TRAINING_PLANS } from '../data/trainingData'
import { supabase } from '../lib/supabase'
import { IconFlame, IconCheck } from '../components/Icons'

const DAY_PLANS = {
  1: 'shooting-heavy',    // Monday
  2: 'footwork-focus',    // Tuesday
  3: 'stick-ground-balls',// Wednesday
  4: 'dodge-finish',      // Thursday
  5: 'game-speed',        // Friday
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function daysUntilGraduation(gradYear) {
  if (!gradYear) return null
  // Graduation ~June 1 of grad year
  const grad = new Date(`${gradYear}-06-01`)
  const now = new Date()
  const diff = Math.ceil((grad - now) / (1000 * 60 * 60 * 24))
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

  // Load today's streak data
  useEffect(() => {
    if (!user) return
    async function loadStreak() {
      const today = new Date().toISOString().slice(0, 10)
      // Get current streak entry
      const { data: todayEntry } = await supabase
        .from('streaks')
        .select('*')
        .eq('userId', user.id)
        .eq('date', today)
        .single()
      if (todayEntry?.nonNegotiablesChecked) {
        setChecked(todayEntry.nonNegotiablesChecked)
      }
      // Count streak length
      const { data: streakData } = await supabase
        .from('streaks')
        .select('date, completed')
        .eq('userId', user.id)
        .eq('completed', true)
        .order('date', { ascending: false })
      if (streakData) {
        let count = 0
        let d = new Date()
        for (const row of streakData) {
          const rowDate = new Date(row.date)
          const diff = Math.floor((d - rowDate) / (1000 * 60 * 60 * 24))
          if (diff <= 1) { count++; d = rowDate }
          else break
        }
        setStreak(count)
      }
      // Sessions this week
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      weekStart.setHours(0,0,0,0)
      const { count } = await supabase
        .from('sessionLogs')
        .select('*', { count: 'exact', head: true })
        .eq('userId', user.id)
        .gte('completedAt', weekStart.toISOString())
      setSessionsThisWeek(count || 0)
    }
    loadStreak()
  }, [user])

  async function toggleNonNeg(num) {
    const newChecked = checked.includes(num)
      ? checked.filter(n => n !== num)
      : [...checked, num]
    setChecked(newChecked)
    const today = new Date().toISOString().slice(0, 10)
    const completed = newChecked.length === 5
    await supabase.from('streaks').upsert({
      userId: user.id,
      date: today,
      completed,
      nonNegotiablesChecked: newChecked
    }, { onConflict: 'userId,date' })
    if (completed) setStreak(s => s + 1)
  }

  // Timer
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(s => {
          if (s <= 1) { setTimerRunning(false); return 0 }
          return s - 1
        })
      }, 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [timerRunning])

  async function logWallBall() {
    if (!user) return
    await supabase.from('sessionLogs').insert({
      userId: user.id,
      planId: 'wall-ball',
      completedAt: new Date().toISOString(),
      durationMinutes: Math.round((20 * 60 - timerSeconds) / 60)
    })
    setTimerSeconds(20 * 60)
    setTimerRunning(false)
  }

  const mins = String(Math.floor(timerSeconds / 60)).padStart(2, '0')
  const secs = String(timerSeconds % 60).padStart(2, '0')

  return (
    <div className="min-h-screen px-4 py-8 max-w-lg mx-auto">

      {/* Header */}
      <div className="mb-8">
        <p style={{ color: 'rgba(240,234,248,0.5)', fontSize: '14px', marginBottom: '4px' }}>
          {getGreeting()},
        </p>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '44px', letterSpacing: '2px', color: '#F0EAFB', lineHeight: 1 }}>
          {profile?.name || 'Athlete'}
        </h1>
        {school && (
          <p style={{ color: 'rgba(240,234,248,0.45)', fontSize: '13px', marginTop: '6px' }}>
            Training for{' '}
            <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
              {school.name}
            </span>
          </p>
        )}
      </div>

      {/* Non-Negotiables */}
      <Section label="Today's Non-Negotiables">
        <div className="flex items-center gap-3 mb-4">
          <div style={{ color: 'var(--color-primary)' }}>
            <IconFlame size={28} />
          </div>
          <div>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '48px', lineHeight: 1, color: 'var(--color-primary)' }}>
              {streak}
            </span>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', letterSpacing: '2px', color: 'rgba(240,234,248,0.4)', textTransform: 'uppercase', marginLeft: '8px' }}>
              Day Streak
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {NON_NEGOTIABLES.map(nn => {
            const isChecked = checked.includes(nn.number)
            return (
              <button
                key={nn.number}
                onClick={() => toggleNonNeg(nn.number)}
                style={{
                  background: isChecked ? 'color-mix(in srgb, var(--color-primary) 8%, #13101A)' : '#13101A',
                  border: `1px solid ${isChecked ? 'color-mix(in srgb, var(--color-primary) 30%, transparent)' : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: '10px',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 200ms ease'
                }}
              >
                <div style={{
                  width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0,
                  background: isChecked ? 'var(--color-primary)' : 'transparent',
                  border: `1.5px solid ${isChecked ? 'var(--color-primary)' : 'rgba(255,255,255,0.2)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 200ms ease'
                }}>
                  {isChecked && <IconCheck size={12} color="var(--color-text-on-primary, #fff)" />}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: isChecked ? 'rgba(240,234,248,0.6)' : '#F0EAFB', textDecoration: isChecked ? 'line-through' : 'none' }}>
                    {nn.title}
                  </div>
                  <div className="chip chip-lock mt-1">
                    {nn.badge}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </Section>

      {/* Today's Session */}
      <Section label="Today's Session">
        {todayPlan ? (
          <button
            onClick={() => navigate(`/train/session/${todayPlan.id}`)}
            style={{
              width: '100%',
              background: '#13101A',
              border: '1px solid rgba(255,255,255,0.07)',
              borderLeft: '3px solid var(--color-primary)',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 200ms ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)' }}
          >
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(240,234,248,0.4)', marginBottom: '8px' }}>
              Today · {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
            </div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '28px', letterSpacing: '2px', color: '#F0EAFB', marginBottom: '4px' }}>
              {todayPlan.title}
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(240,234,248,0.55)' }}>
              {todayPlan.focus}
            </div>
            <div style={{ marginTop: '12px', fontFamily: "'Space Mono', monospace", fontSize: '9px', color: 'var(--color-primary)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              Tap to open session →
            </div>
          </button>
        ) : (
          <div style={{ background: '#13101A', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '24px', color: 'rgba(240,234,248,0.4)' }}>
              Rest Day
            </div>
            <p style={{ color: 'rgba(240,234,248,0.35)', fontSize: '13px', marginTop: '6px' }}>
              Recovery is part of training. Prioritize sleep and nutrition today.
            </p>
          </div>
        )}
      </Section>

      {/* Wall Ball Timer */}
      <Section label="Wall Ball Timer">
        <div style={{ background: '#13101A', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '28px', textAlign: 'center' }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '72px', letterSpacing: '4px', color: timerRunning ? 'var(--color-primary)' : '#F0EAFB', lineHeight: 1, transition: 'color 300ms ease' }}>
            {mins}:{secs}
          </div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(240,234,248,0.35)', marginTop: '6px', marginBottom: '20px' }}>
            20:00 Non-Negotiable
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setTimerRunning(r => !r)}
              className="btn"
              style={{
                background: timerRunning ? 'rgba(255,255,255,0.08)' : 'var(--color-primary)',
                color: timerRunning ? '#F0EAFB' : 'var(--color-text-on-primary, #fff)',
                minWidth: '120px'
              }}
            >
              {timerRunning ? 'Pause' : timerSeconds < 20 * 60 ? 'Resume' : 'Start'}
            </button>
            {timerSeconds < 20 * 60 && (
              <button
                onClick={logWallBall}
                className="btn btn-ghost"
              >
                Log Session
              </button>
            )}
          </div>
          {timerSeconds === 0 && (
            <p style={{ marginTop: '16px', color: 'rgba(240,234,248,0.6)', fontSize: '14px' }}>
              20 minutes complete. Log and move to shooting mechanics.
            </p>
          )}
        </div>
      </Section>

      {/* Quick Stats */}
      <Section label="This Week">
        <div className="grid grid-cols-3 gap-3">
          <StatCard value={streak} label="Day Streak" />
          <StatCard value={sessionsThisWeek} label="Sessions" />
          <StatCard value={daysUntilGraduation(profile?.gradYear) ?? '—'} label="Days Left" />
        </div>
      </Section>

    </div>
  )
}

function Section({ label, children }) {
  return (
    <div className="mb-8">
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(240,234,248,0.4)', marginBottom: '14px' }}>
        {label}
      </div>
      {children}
    </div>
  )
}

function StatCard({ value, label }) {
  return (
    <div style={{ background: '#13101A', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '20px 12px', textAlign: 'center' }}>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '40px', color: 'var(--color-primary)', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(240,234,248,0.4)', marginTop: '6px' }}>
        {label}
      </div>
    </div>
  )
}
