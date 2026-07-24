import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useProfile } from '../hooks/useProfile'
import { ROADMAP_DATA } from '../data/roadmapData'
import { supabase } from '../lib/supabase'
import { IconCheck, IconChevronDown } from '../components/Icons'
import { SCHOOLS } from '../data/schools'
import { getNextWindow, getCurrentPeriod, CALENDAR_SEASON } from '../data/recruitingCalendar'

const PERIOD_COLORS = {
  contact: '#4ADE80',
  quiet: '#FBBF24',
  dead: '#FB7185',
  shutdown: '#FB7185',
}

function daysUntilGrad(gradYear) {
  if (!gradYear) return null
  const grad = new Date(`${gradYear}-06-01`)
  const now = new Date()
  return Math.max(0, Math.ceil((grad - now) / (1000 * 60 * 60 * 24)))
}

export default function Roadmap() {
  const { user } = useAuth()
  const { profile } = useProfile(user?.id)
  const [completedMilestones, setCompletedMilestones] = useState(new Set())
  const [expandedGrade, setExpandedGrade] = useState(null)
  const school = SCHOOLS.find(s => s.id === profile?.dreamSchoolId)

  const currentGrade = profile?.grade || '10th'
  const days = daysUntilGrad(profile?.gradYear)
  const nextWindow = getNextWindow(profile?.gradYear)
  const currentPeriod = getCurrentPeriod()

  const gradeOrder = ['8th', '9th', '10th', '11th', '12th']
  const currentGradeIndex = gradeOrder.indexOf(currentGrade)

  useEffect(() => {
    if (!user) return
    supabase
      .from('roadmapProgress')
      .select('milestoneId')
      .eq('userId', user.id)
      .then(({ data }) => {
        if (data) setCompletedMilestones(new Set(data.map(r => r.milestoneId)))
      })
    // Default expand current grade
    setExpandedGrade(currentGrade)
  }, [user, currentGrade])

  async function toggleMilestone(milestoneId) {
    if (completedMilestones.has(milestoneId)) {
      await supabase.from('roadmapProgress').delete().eq('userId', user.id).eq('milestoneId', milestoneId)
      setCompletedMilestones(s => { const n = new Set(s); n.delete(milestoneId); return n })
    } else {
      await supabase.from('roadmapProgress').insert({ userId: user.id, milestoneId, completedAt: new Date().toISOString() })
      setCompletedMilestones(s => new Set([...s, milestoneId]))
    }
  }

  const gradeGroups = gradeOrder.map(grade => ({
    grade,
    milestones: ROADMAP_DATA.filter(m => m.grade === grade),
    isCurrent: grade === currentGrade,
    isPast: gradeOrder.indexOf(grade) < currentGradeIndex,
    isFuture: gradeOrder.indexOf(grade) > currentGradeIndex
  }))

  return (
    <div className="min-h-screen px-4 py-8 max-w-lg mx-auto">
      <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '44px', letterSpacing: '2px', color: '#F0EAFB', marginBottom: '6px' }}>
        Recruiting Roadmap
      </h1>
      {school && (
        <p style={{ color: 'rgba(240,234,248,0.5)', fontSize: '14px', marginBottom: '8px' }}>
          Goal: <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{school.name}</span>
        </p>
      )}

      {/* Days countdown */}
      {days !== null && (
        <div style={{
          background: '#13101A',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '52px', lineHeight: 1, color: 'var(--color-primary)' }}>
              {days.toLocaleString()}
            </div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(240,234,248,0.4)' }}>
              Days Until Graduation
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '13px', color: 'rgba(240,234,248,0.5)', lineHeight: 1.6 }}>
              Class of {profile?.gradYear}. Every day compounds.
            </p>
          </div>
        </div>
      )}

      {/* Next recruiting window */}
      {nextWindow && (nextWindow.kind === 'contactOpens' || nextWindow.kind === 'period') && (
        <div style={{
          background: nextWindow.kind === 'contactOpens'
            ? 'color-mix(in srgb, var(--color-primary) 10%, #13101A)'
            : '#13101A',
          border: `1px solid ${nextWindow.kind === 'contactOpens' ? 'color-mix(in srgb, var(--color-primary) 35%, transparent)' : 'rgba(255,255,255,0.07)'}`,
          borderRadius: '12px', padding: '18px', marginBottom: '28px'
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--color-primary)' }}>
              {nextWindow.kind === 'contactOpens' ? 'Next milestone' : 'Calendar'}
            </span>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '1px', color: 'rgba(240,234,248,0.3)' }}>
              {nextWindow.weeks <= 8 ? `IN ${nextWindow.weeks} WK${nextWindow.weeks === 1 ? '' : 'S'}` : nextWindow.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <div style={{ fontWeight: 600, fontSize: '16px', color: '#F0EAFB', marginBottom: '6px' }}>
            {nextWindow.title}
            {nextWindow.kind === 'contactOpens' && (
              <span style={{ color: 'var(--color-primary)' }}> · {nextWindow.date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            )}
          </div>
          <p style={{ fontSize: '13px', color: 'rgba(240,234,248,0.55)', lineHeight: 1.6 }}>
            {nextWindow.detail}
          </p>

          {/* Current period status (only relevant once contact has opened) */}
          {nextWindow.contactOpen && currentPeriod && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: PERIOD_COLORS[currentPeriod.type] || 'rgba(255,255,255,0.4)', flexShrink: 0 }} />
              <span style={{ fontSize: '13px', color: 'rgba(240,234,248,0.65)' }}>
                Currently a <strong style={{ color: PERIOD_COLORS[currentPeriod.type] }}>{currentPeriod.label}</strong>
              </span>
            </div>
          )}
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', letterSpacing: '1px', color: 'rgba(240,234,248,0.25)', marginTop: '12px', lineHeight: 1.5 }}>
            NCAA D1 WLAX {CALENDAR_SEASON} · VERIFY CURRENT DATES WITH YOUR COACH OR NCAA.ORG
          </p>
        </div>
      )}

      {/* Timeline */}
      <div className="flex flex-col gap-3">
        {gradeGroups.map(({ grade, milestones, isCurrent, isPast, isFuture }) => {
          const isExpanded = expandedGrade === grade
          const completedCount = milestones.filter(m => completedMilestones.has(m.id)).length

          return (
            <div key={grade}>
              <button
                onClick={() => setExpandedGrade(isExpanded ? null : grade)}
                style={{
                  width: '100%',
                  background: isCurrent ? 'color-mix(in srgb, var(--color-primary) 8%, #13101A)' : '#13101A',
                  border: `1px solid ${isCurrent ? 'color-mix(in srgb, var(--color-primary) 30%, transparent)' : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: '10px',
                  padding: '16px 20px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 200ms ease'
                }}
              >
                <div className="flex items-center gap-3">
                  <div style={{
                    width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0,
                    background: isCurrent ? 'var(--color-primary)' : isPast ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                    border: isCurrent ? '2px solid var(--color-primary)' : '2px solid transparent'
                  }} />
                  <div>
                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '20px', letterSpacing: '2px', color: isFuture ? 'rgba(240,234,248,0.4)' : '#F0EAFB' }}>
                      {grade} Grade
                    </span>
                    {isCurrent && <span className="chip chip-primary ml-2">Current</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: 'rgba(240,234,248,0.4)', letterSpacing: '1px' }}>
                    {completedCount}/{milestones.length}
                  </span>
                  <IconChevronDown
                    size={16}
                    style={{
                      color: 'rgba(240,234,248,0.4)',
                      transform: isExpanded ? 'rotate(180deg)' : 'none',
                      transition: 'transform 200ms ease'
                    }}
                  />
                </div>
              </button>

              {isExpanded && (
                <div className="flex flex-col gap-2 mt-2 ml-4">
                  {milestones.map(milestone => {
                    const done = completedMilestones.has(milestone.id)
                    return (
                      <div
                        key={milestone.id}
                        style={{
                          background: done ? 'color-mix(in srgb, var(--color-primary) 5%, #13101A)' : '#1A1525',
                          border: `1px solid ${done ? 'color-mix(in srgb, var(--color-primary) 20%, transparent)' : 'rgba(255,255,255,0.06)'}`,
                          borderRadius: '10px',
                          padding: '16px'
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => toggleMilestone(milestone.id)}
                            style={{
                              width: '20px', height: '20px', borderRadius: '5px', flexShrink: 0, marginTop: '2px',
                              background: done ? 'var(--color-primary)' : 'transparent',
                              border: `1.5px solid ${done ? 'var(--color-primary)' : 'rgba(255,255,255,0.2)'}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer', transition: 'all 200ms ease'
                            }}
                          >
                            {done && <IconCheck size={11} color="var(--color-text-on-primary, #fff)" />}
                          </button>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(240,234,248,0.4)', marginBottom: '4px' }}>
                              {milestone.timeframe}
                            </div>
                            <div style={{ fontWeight: 600, fontSize: '14px', color: done ? 'rgba(240,234,248,0.5)' : '#F0EAFB', textDecoration: done ? 'line-through' : 'none', marginBottom: '6px' }}>
                              {milestone.title}
                            </div>
                            <p style={{ fontSize: '13px', color: 'rgba(240,234,248,0.55)', lineHeight: 1.6, marginBottom: '10px' }}>
                              {milestone.description}
                            </p>
                            {milestone.actionItems?.length > 0 && (
                              <ul style={{ paddingLeft: '16px', margin: 0 }}>
                                {milestone.actionItems.map((item, i) => (
                                  <li key={i} style={{ fontSize: '12px', color: 'rgba(240,234,248,0.45)', lineHeight: 1.7 }}>
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
