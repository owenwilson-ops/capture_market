import { useState, useEffect } from 'react'
import { NON_NEGOTIABLES } from '../data/nonNegotiables'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { IconCheck } from '../components/Icons'

function buildCalendar() {
  const days = []
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

export default function NonNegotiables() {
  const { user } = useAuth()
  const [completedDays, setCompletedDays] = useState(new Set())
  const [todayChecked, setTodayChecked] = useState(false)
  const today = new Date().toISOString().slice(0, 10)
  const calendarDays = buildCalendar()

  useEffect(() => {
    if (!user) return
    async function load() {
      const { data } = await supabase
        .from('streaks')
        .select('date, completed')
        .eq('userId', user.id)
        .eq('completed', true)
      if (data) {
        setCompletedDays(new Set(data.map(r => r.date)))
        setTodayChecked(data.some(r => r.date === today))
      }
    }
    load()
  }, [user, today])

  async function logToday() {
    if (!user || todayChecked) return
    await supabase.from('streaks').upsert({
      userId: user.id,
      date: today,
      completed: true,
      nonNegotiablesChecked: [1, 2, 3, 4, 5]
    }, { onConflict: 'userId,date' })
    setTodayChecked(true)
    setCompletedDays(s => new Set([...s, today]))
  }

  return (
    <div className="min-h-screen px-4 py-8 max-w-lg mx-auto">
      <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '44px', letterSpacing: '2px', color: '#F0EAFB', marginBottom: '6px' }}>
        Non-Negotiables
      </h1>
      <p style={{ color: 'rgba(240,234,248,0.5)', fontSize: '14px', marginBottom: '32px' }}>
        These do not change based on how you feel. They run every session, every day.
      </p>

      {/* Rules */}
      <div className="flex flex-col gap-4 mb-10">
        {NON_NEGOTIABLES.map(nn => (
          <div
            key={nn.number}
            style={{
              background: '#13101A',
              border: '1px solid rgba(255,255,255,0.07)',
              borderLeft: '3px solid var(--color-primary)',
              borderRadius: '12px',
              padding: '24px'
            }}
          >
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '56px', lineHeight: 1, color: 'var(--color-primary)', marginBottom: '8px' }}>
              {String(nn.number).padStart(2, '0')}
            </div>
            <div style={{ fontWeight: 600, fontSize: '16px', color: '#F0EAFB', marginBottom: '8px' }}>
              {nn.title}
            </div>
            <p style={{ color: 'rgba(240,234,248,0.6)', fontSize: '14px', lineHeight: 1.7, marginBottom: '12px' }}>
              {nn.description}
            </p>
            <span className="chip chip-lock">{nn.badge}</span>
          </div>
        ))}
      </div>

      {/* 30-day calendar */}
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(240,234,248,0.4)', marginBottom: '14px' }}>
        30-Day Streak
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '6px', marginBottom: '24px' }}>
        {calendarDays.map(day => {
          const isToday = day === today
          const completed = completedDays.has(day)
          return (
            <div
              key={day}
              title={day}
              style={{
                aspectRatio: '1',
                borderRadius: '4px',
                background: completed
                  ? 'var(--color-primary)'
                  : isToday
                  ? 'rgba(255,255,255,0.1)'
                  : 'rgba(255,255,255,0.04)',
                border: isToday ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
                transition: 'background 300ms ease'
              }}
            />
          )
        })}
      </div>

      {/* Log today */}
      <button
        onClick={logToday}
        disabled={todayChecked}
        className="btn w-full"
        style={{
          background: todayChecked ? 'rgba(255,255,255,0.05)' : 'var(--color-primary)',
          color: todayChecked ? 'rgba(240,234,248,0.4)' : 'var(--color-text-on-primary, #fff)',
          cursor: todayChecked ? 'default' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
        }}
      >
        {todayChecked ? (
          <><IconCheck size={16} /> Today logged</>
        ) : (
          'Log Today'
        )}
      </button>

      <p style={{ color: 'rgba(240,234,248,0.25)', fontSize: '11px', textAlign: 'center', marginTop: '12px' }}>
        Logging from the Home screen also counts here.
      </p>
    </div>
  )
}
