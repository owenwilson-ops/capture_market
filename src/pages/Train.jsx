import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TRAINING_PLANS, WEEKLY_PLAN } from '../data/trainingData'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

export default function Train() {
  const [tab, setTab] = useState('skill') // 'skill' | 'week'
  const [selectedDay, setSelectedDay] = useState(0)
  const navigate = useNavigate()

  const currentDayOfWeek = new Date().getDay() // 0=Sun, 1=Mon...
  const activeDayIndex = currentDayOfWeek >= 1 && currentDayOfWeek <= 5 ? currentDayOfWeek - 1 : 0

  return (
    <div className="min-h-screen px-4 py-8 max-w-lg mx-auto">
      <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '44px', letterSpacing: '2px', color: '#F0EAFB', marginBottom: '24px' }}>
        Training Plans
      </h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-8" style={{ background: '#13101A', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '4px' }}>
        {[['skill', 'Skill Focus'], ['week', 'Mixed Week']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              flex: 1, padding: '10px', borderRadius: '8px',
              background: tab === key ? 'var(--color-primary)' : 'transparent',
              color: tab === key ? 'var(--color-text-on-primary, #fff)' : 'rgba(240,234,248,0.5)',
              border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '14px',
              transition: 'all 200ms ease'
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Skill Focus */}
      {tab === 'skill' && (
        <div className="flex flex-col gap-3">
          {TRAINING_PLANS.map(plan => (
            <button
              key={plan.id}
              onClick={() => navigate(`/train/session/${plan.id}`)}
              style={{
                background: '#13101A',
                border: '1px solid rgba(255,255,255,0.07)',
                borderLeft: '3px solid var(--color-primary)',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 200ms ease',
                width: '100%'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderRightColor = 'rgba(255,255,255,0.14)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderRightColor = 'rgba(255,255,255,0.07)' }}
            >
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '26px', letterSpacing: '2px', color: '#F0EAFB', marginBottom: '4px' }}>
                {plan.title}
              </div>
              <div style={{ fontSize: '13px', color: 'rgba(240,234,248,0.55)', marginBottom: '12px' }}>
                {plan.focus}
              </div>
              <div className="flex gap-3">
                <span className="chip chip-secondary">{plan.blocks?.length || 6} Blocks</span>
                <span className="chip chip-secondary">90 min</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Mixed Week */}
      {tab === 'week' && (
        <div>
          {/* Day selector */}
          <div className="flex gap-2 mb-6">
            {DAYS.map((d, i) => (
              <button
                key={d}
                onClick={() => setSelectedDay(i)}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: '8px',
                  background: selectedDay === i ? 'var(--color-primary)' : i === activeDayIndex ? 'rgba(255,255,255,0.06)' : '#13101A',
                  color: selectedDay === i ? 'var(--color-text-on-primary, #fff)' : 'rgba(240,234,248,0.6)',
                  border: `1px solid ${selectedDay === i ? 'var(--color-primary)' : 'rgba(255,255,255,0.07)'}`,
                  cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                  transition: 'all 200ms ease'
                }}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Selected day plan */}
          {(() => {
            const dayEntry = WEEKLY_PLAN.days[selectedDay]
            const plan = TRAINING_PLANS.find(p => p.id === dayEntry.planId)
            if (!plan) return null
            return (
              <button
                onClick={() => navigate(`/train/session/${plan.id}`)}
                style={{
                  width: '100%',
                  background: '#13101A',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderLeft: '3px solid var(--color-primary)',
                  borderRadius: '12px',
                  padding: '24px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 200ms ease'
                }}
              >
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(240,234,248,0.4)', marginBottom: '10px' }}>
                  {dayEntry.day}
                </div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '30px', letterSpacing: '2px', color: '#F0EAFB', marginBottom: '6px' }}>
                  {plan.title}
                </div>
                <div style={{ fontSize: '14px', color: 'rgba(240,234,248,0.55)', marginBottom: '14px' }}>
                  {plan.focus}
                </div>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: 'var(--color-primary)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                  Open session →
                </span>
              </button>
            )
          })()}
        </div>
      )}
    </div>
  )
}
