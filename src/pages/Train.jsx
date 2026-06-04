import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TRAINING_PLANS, WEEKLY_PLAN } from '../data/trainingData'
import { IconChevronRight } from '../components/Icons'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

export default function Train() {
  const [tab, setTab] = useState('skill')
  const [selectedDay, setSelectedDay] = useState(Math.max(0, new Date().getDay() - 1))
  const navigate = useNavigate()
  const activeDayIndex = Math.max(0, Math.min(4, new Date().getDay() - 1))

  return (
    <div style={{ background: '#0A0812', minHeight: '100vh' }}>

      {/* Header */}
      <div className="hero-header">
        <div style={{ maxWidth: '440px', margin: '0 auto' }}>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '48px', letterSpacing: '3px', color: '#F0EAFB', lineHeight: 1 }}>
            Training Plans
          </h1>
          <p style={{ color: 'rgba(240,234,248,0.4)', fontSize: '13px', marginTop: '6px' }}>
            Every session opens with 20 minutes of wall ball. No exceptions.
          </p>
        </div>
      </div>

      <div style={{ padding: '24px 20px', maxWidth: '440px', margin: '0 auto' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '4px' }}>
          {[['skill', 'Skill Focus'], ['week', 'Mixed Week']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                flex: 1, padding: '11px', borderRadius: '9px',
                background: tab === key ? 'var(--color-primary)' : 'transparent',
                color: tab === key ? 'var(--color-text-on-primary, #fff)' : 'rgba(240,234,248,0.4)',
                border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '14px',
                transition: 'all 200ms ease',
                boxShadow: tab === key ? `0 4px 16px color-mix(in srgb, var(--color-primary) 35%, transparent)` : 'none'
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Skill Focus */}
        {tab === 'skill' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {TRAINING_PLANS.map((plan, i) => (
              <button
                key={plan.id}
                onClick={() => navigate(`/train/session/${plan.id}`)}
                style={{
                  background: 'linear-gradient(145deg, #181424, #120f1c)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '14px',
                  padding: '20px',
                  textAlign: 'left', cursor: 'pointer',
                  transition: 'all 220ms ease', width: '100%',
                  position: 'relative', overflow: 'hidden'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: 'var(--color-primary)', borderRadius: '14px 0 0 14px', boxShadow: '2px 0 10px color-mix(in srgb, var(--color-primary) 50%, transparent)' }} />
                <div style={{ paddingLeft: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                    <div>
                      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '26px', letterSpacing: '2px', color: '#F0EAFB', marginBottom: '4px' }}>
                        {plan.title}
                      </div>
                      <div style={{ fontSize: '12px', color: 'rgba(240,234,248,0.45)', marginBottom: '12px' }}>
                        {plan.focus}
                      </div>
                    </div>
                    <IconChevronRight size={16} style={{ color: 'rgba(240,234,248,0.25)', flexShrink: 0, marginTop: '4px' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span className="chip chip-secondary">6 Blocks</span>
                    <span className="chip chip-secondary">90 min</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Mixed Week */}
        {tab === 'week' && (
          <div>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
              {DAYS.map((d, i) => (
                <button
                  key={d}
                  onClick={() => setSelectedDay(i)}
                  style={{
                    flex: 1, padding: '10px 0', borderRadius: '10px',
                    background: selectedDay === i ? 'var(--color-primary)' : i === activeDayIndex ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)',
                    color: selectedDay === i ? 'var(--color-text-on-primary, #fff)' : i === activeDayIndex ? 'rgba(240,234,248,0.8)' : 'rgba(240,234,248,0.4)',
                    border: `1px solid ${selectedDay === i ? 'var(--color-primary)' : 'rgba(255,255,255,0.07)'}`,
                    cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                    transition: 'all 200ms ease',
                    boxShadow: selectedDay === i ? `0 4px 14px color-mix(in srgb, var(--color-primary) 35%, transparent)` : 'none'
                  }}
                >
                  {d}
                </button>
              ))}
            </div>

            {(() => {
              const dayEntry = WEEKLY_PLAN.days[selectedDay]
              const plan = TRAINING_PLANS.find(p => p.id === dayEntry.planId)
              if (!plan) return null
              return (
                <button
                  onClick={() => navigate(`/train/session/${plan.id}`)}
                  style={{
                    width: '100%', background: 'linear-gradient(145deg, #181424, #120f1c)',
                    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px',
                    padding: '24px', textAlign: 'left', cursor: 'pointer',
                    transition: 'all 220ms ease', position: 'relative', overflow: 'hidden'
                  }}
                >
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: 'var(--color-primary)', borderRadius: '14px 0 0 14px', boxShadow: '2px 0 10px color-mix(in srgb, var(--color-primary) 50%, transparent)' }} />
                  <div style={{ paddingLeft: '12px' }}>
                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(240,234,248,0.35)', marginBottom: '10px' }}>
                      {dayEntry.day}
                    </div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '32px', letterSpacing: '2px', color: '#F0EAFB', marginBottom: '6px' }}>
                      {plan.title}
                    </div>
                    <div style={{ fontSize: '13px', color: 'rgba(240,234,248,0.5)', marginBottom: '14px' }}>
                      {plan.focus}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="chip chip-primary">90 min</span>
                      <span style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 600, marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Open session <IconChevronRight size={12} />
                      </span>
                    </div>
                  </div>
                </button>
              )
            })()}
          </div>
        )}
      </div>
    </div>
  )
}
