import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { TRAINING_PLANS } from '../data/trainingData'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { IconArrowLeft, IconLock, IconChevronDown } from '../components/Icons'

export default function SessionView() {
  const { planId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const plan = TRAINING_PLANS.find(p => p.id === planId)
  const [expandedBlock, setExpandedBlock] = useState(null)
  const [sessionStarted, setSessionStarted] = useState(false)
  const [running, setRunning] = useState(false)
  const [sessionSeconds, setSessionSeconds] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => setSessionSeconds(s => s + 1), 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [running])

  async function finishSession() {
    if (!user) return
    await supabase.from('sessionLogs').insert({
      userId: user.id,
      planId,
      completedAt: new Date().toISOString(),
      durationMinutes: Math.round(sessionSeconds / 60)
    })
    navigate('/train')
  }

  if (!plan) return (
    <div className="min-h-screen flex items-center justify-center">
      <p style={{ color: 'rgba(240,234,248,0.4)' }}>Plan not found.</p>
    </div>
  )

  const mins = String(Math.floor(sessionSeconds / 60)).padStart(2, '0')
  const secs = String(sessionSeconds % 60).padStart(2, '0')

  return (
    <div className="min-h-screen px-4 py-8 max-w-lg mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate('/train')}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(240,234,248,0.5)', marginBottom: '24px', padding: 0 }}
      >
        <IconArrowLeft size={18} />
        <span style={{ fontSize: '14px' }}>Training Plans</span>
      </button>

      {/* Plan header */}
      <div className="mb-8">
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '42px', letterSpacing: '2px', color: '#F0EAFB', lineHeight: 1, marginBottom: '6px' }}>
          {plan.title}
        </h1>
        <p style={{ color: 'rgba(240,234,248,0.55)', fontSize: '14px' }}>{plan.focus}</p>
        {sessionStarted && (
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '28px', color: running ? 'var(--color-primary)' : 'rgba(240,234,248,0.4)', letterSpacing: '2px', transition: 'color 200ms ease' }}>
              {mins}:{secs}
            </span>
            {!running && (
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(240,234,248,0.35)' }}>
                Paused
              </span>
            )}
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="relative">
        {plan.blocks?.map((block, idx) => (
          <TimelineBlock
            key={block.id}
            block={block}
            isLast={idx === plan.blocks.length - 1}
            expanded={expandedBlock === block.id}
            onToggle={() => setExpandedBlock(expandedBlock === block.id ? null : block.id)}
          />
        ))}
      </div>

      {/* Total time bar */}
      <div style={{
        background: '#13101A',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '10px',
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '8px',
        marginBottom: '24px'
      }}>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(240,234,248,0.4)' }}>
          Total Duration
        </span>
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '24px', letterSpacing: '2px', color: '#F0EAFB' }}>
          90 MIN
        </span>
      </div>

      {/* Action button */}
      {!sessionStarted ? (
        <button
          onClick={() => { setSessionStarted(true); setRunning(true) }}
          className="btn btn-primary w-full"
          style={{ background: 'var(--color-primary)', color: 'var(--color-text-on-primary, #fff)', fontSize: '17px', padding: '16px' }}
        >
          Start Session
        </button>
      ) : (
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setRunning(r => !r)}
            className="btn btn-primary"
            style={{ flex: 1, background: 'var(--color-primary)', color: 'var(--color-text-on-primary, #fff)', fontSize: '17px', padding: '16px' }}
          >
            {running ? 'Pause' : 'Resume'}
          </button>
          <button
            onClick={finishSession}
            className="btn"
            style={{ flex: 1, background: '#1A1525', border: '1px solid rgba(255,255,255,0.1)', color: '#F0EAFB', fontSize: '17px', padding: '16px' }}
          >
            Finish & Log
          </button>
        </div>
      )}
    </div>
  )
}

function TimelineBlock({ block, isLast, expanded, onToggle }) {
  const isLocked = block.locked

  return (
    <div className="flex gap-4 mb-2">
      {/* Time column */}
      <div style={{ width: '52px', flexShrink: 0, paddingTop: '18px' }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '18px', letterSpacing: '1px', color: isLocked ? 'var(--color-primary)' : 'rgba(240,234,248,0.5)' }}>
          {block.startTime}
        </div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', letterSpacing: '1px', color: 'rgba(240,234,248,0.3)', textTransform: 'uppercase' }}>
          {block.duration}m
        </div>
      </div>

      {/* Connector */}
      <div className="flex flex-col items-center" style={{ paddingTop: '20px' }}>
        <div style={{
          width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0,
          background: isLocked ? 'var(--color-primary)' : 'rgba(255,255,255,0.2)',
          border: `2px solid ${isLocked ? 'var(--color-primary)' : 'rgba(255,255,255,0.2)'}`
        }} />
        {!isLast && (
          <div style={{ width: '1px', flex: 1, minHeight: '40px', background: 'rgba(255,255,255,0.08)', marginTop: '4px' }} />
        )}
      </div>

      {/* Block card */}
      <div style={{ flex: 1, paddingBottom: '12px' }}>
        <button
          onClick={onToggle}
          style={{
            width: '100%',
            background: isLocked ? 'color-mix(in srgb, var(--color-primary) 6%, #13101A)' : '#13101A',
            border: `1px solid ${isLocked ? 'color-mix(in srgb, var(--color-primary) 25%, transparent)' : 'rgba(255,255,255,0.07)'}`,
            borderLeft: `3px solid ${isLocked ? 'var(--color-primary)' : 'rgba(255,255,255,0.12)'}`,
            borderRadius: '10px',
            padding: '16px',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 200ms ease'
          }}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {isLocked && (
                  <span className="chip chip-lock" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <IconLock size={8} /> Non-Negotiable · Daily
                  </span>
                )}
                {!isLocked && (
                  <span className="chip chip-secondary">{block.phase}</span>
                )}
              </div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '22px', letterSpacing: '1.5px', color: '#F0EAFB' }}>
                {block.name}
              </div>
            </div>
            <IconChevronDown
              size={16}
              style={{
                color: 'rgba(240,234,248,0.4)',
                flexShrink: 0,
                marginTop: '4px',
                transform: expanded ? 'rotate(180deg)' : 'none',
                transition: 'transform 200ms ease'
              }}
            />
          </div>
        </button>

        {/* Expanded drills */}
        {expanded && block.drills && (
          <div style={{ marginTop: '4px', background: '#13101A', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', overflow: 'hidden' }}>
            {block.drills.map((drill, i) => (
              <DrillRow key={drill.num} drill={drill} last={i === block.drills.length - 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function DrillRow({ drill, last }) {
  const tagClass = drill.tagType === 'lock' ? 'chip-lock' : drill.tagType === 'primary' ? 'chip-primary' : 'chip-secondary'
  return (
    <div style={{
      padding: '16px',
      borderBottom: last ? 'none' : '1px solid rgba(255,255,255,0.05)'
    }}>
      <div className="flex items-start gap-3">
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px', color: 'rgba(240,234,248,0.3)', flexShrink: 0, marginTop: '2px' }}>
          {drill.num}
        </span>
        <div style={{ flex: 1 }}>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span style={{ fontWeight: 600, fontSize: '14px', color: '#F0EAFB' }}>{drill.name}</span>
            {drill.tag && <span className={`chip ${tagClass}`}>{drill.tag}</span>}
          </div>
          <p style={{ fontSize: '13px', color: 'rgba(240,234,248,0.55)', lineHeight: 1.6, marginBottom: '6px' }}>
            {drill.description}
          </p>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', color: 'rgba(240,234,248,0.35)', letterSpacing: '1px' }}>
            {drill.sets}
          </span>
        </div>
      </div>
    </div>
  )
}
