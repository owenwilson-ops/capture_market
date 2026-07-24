import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useProfile } from '../hooks/useProfile'
import { SCHOOLS } from '../data/schools'
import { LACROSSE_POSITIONS, GRADES } from '../data/positions'
import { supabase } from '../lib/supabase'

export default function Profile() {
  const { user, signOut } = useAuth()
  const { profile, updateProfile } = useProfile(user?.id)
  const navigate = useNavigate()
  const [editing, setEditing] = useState(null)
  const [name, setName] = useState('')
  const [acad, setAcad] = useState({ gpa: '', sat: '', act: '' })
  const [showSchoolPicker, setShowSchoolPicker] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [saving, setSaving] = useState(false)

  const school = SCHOOLS.find(s => s.id === profile?.dreamSchoolId)

  async function saveName() {
    if (!name.trim()) return
    setSaving(true)
    await updateProfile({ name: name.trim() })
    setSaving(false)
    setEditing(null)
  }

  async function setPosition(pos) {
    await updateProfile({ position: pos })
    setEditing(null)
  }

  async function setGrade(g) {
    await updateProfile({ grade: g })
    setEditing(null)
  }

  function openAcademics() {
    setAcad({
      gpa: profile?.gpa != null ? String(profile.gpa) : '',
      sat: profile?.satScore != null ? String(profile.satScore) : '',
      act: profile?.actScore != null ? String(profile.actScore) : '',
    })
    setEditing('academics')
  }

  async function saveAcademics() {
    setSaving(true)
    const num = v => { const n = parseFloat(v); return Number.isFinite(n) ? n : null }
    await updateProfile({ gpa: num(acad.gpa), satScore: num(acad.sat), actScore: num(acad.act) })
    setSaving(false)
    setEditing(null)
  }

  async function selectSchool(id) {
    await updateProfile({ dreamSchoolId: id })
    setShowSchoolPicker(false)
  }

  async function toggleParentMode() {
    await updateProfile({ parentMode: !profile?.parentMode })
  }

  async function resetProgress() {
    if (!user) return
    await Promise.all([
      supabase.from('streaks').delete().eq('userId', user.id),
      supabase.from('sessionLogs').delete().eq('userId', user.id),
      supabase.from('roadmapProgress').delete().eq('userId', user.id),
      supabase.from('contactLogs').delete().eq('userId', user.id),
    ])
    setShowResetConfirm(false)
  }

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen px-4 py-8 max-w-lg mx-auto">
      <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '44px', letterSpacing: '2px', color: '#F0EAFB', marginBottom: '28px' }}>
        Profile
      </h1>

      {/* Athlete Info */}
      <SectionLabel>Athlete</SectionLabel>
      <div style={{ background: '#13101A', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
        <ProfileRow
          label="Name"
          value={profile?.name}
          onEdit={() => { setName(profile?.name || ''); setEditing('name') }}
        />
        <ProfileRow
          label="Dream School"
          value={school?.name}
          valueColor="var(--color-primary)"
          onEdit={() => setShowSchoolPicker(true)}
        />
        <ProfileRow
          label="Position"
          value={profile?.position}
          onEdit={() => setEditing('position')}
        />
        <ProfileRow
          label="Grade"
          value={profile?.grade}
          last
          onEdit={() => setEditing('grade')}
        />
      </div>

      {/* Academics */}
      <SectionLabel>Academics</SectionLabel>
      <div style={{ background: '#13101A', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', overflow: 'hidden', marginBottom: '8px' }}>
        <ProfileRow label="GPA" value={profile?.gpa != null ? String(profile.gpa) : null} onEdit={openAcademics} />
        <ProfileRow label="SAT" value={profile?.satScore != null ? String(profile.satScore) : null} onEdit={openAcademics} />
        <ProfileRow label="ACT" value={profile?.actScore != null ? String(profile.actScore) : null} last onEdit={openAcademics} />
      </div>
      <p style={{ fontSize: '11px', color: 'rgba(240,234,248,0.3)', lineHeight: 1.6, marginBottom: '20px', padding: '0 4px' }}>
        Used to show whether each school is an academic reach, target, or likely fit. Stored privately on your profile.
      </p>

      {/* Account */}
      <SectionLabel>Account</SectionLabel>
      <div style={{ background: '#13101A', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(240,234,248,0.4)', marginBottom: '4px' }}>Email</div>
          <div style={{ fontSize: '14px', color: 'rgba(240,234,248,0.7)' }}>{user?.email}</div>
        </div>
        <button
          onClick={() => supabase.auth.resetPasswordForEmail(user?.email)}
          style={{ width: '100%', background: 'none', border: 'none', padding: '16px 20px', textAlign: 'left', cursor: 'pointer', color: 'rgba(240,234,248,0.6)', fontSize: '14px', transition: 'color 200ms' }}
          onMouseEnter={e => e.currentTarget.style.color = '#F0EAFB'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(240,234,248,0.6)'}
        >
          Send Password Reset Email
        </button>
      </div>

      {/* Parent Mode */}
      <SectionLabel>Mode</SectionLabel>
      <div style={{ background: '#13101A', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
        <button
          onClick={toggleParentMode}
          style={{
            width: '100%', background: 'none', border: 'none', padding: '20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: 'pointer'
          }}
        >
          <div>
            <div style={{ fontWeight: 600, fontSize: '15px', color: '#F0EAFB', marginBottom: '3px', textAlign: 'left' }}>
              Parent Mode
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(240,234,248,0.5)', textAlign: 'left' }}>
              Shifts app copy and home screen for parents
            </div>
          </div>
          {/* Toggle */}
          <div style={{
            width: '46px', height: '26px', borderRadius: '13px',
            background: profile?.parentMode ? 'var(--color-primary)' : 'rgba(255,255,255,0.12)',
            position: 'relative', transition: 'background 200ms ease', flexShrink: 0
          }}>
            <div style={{
              width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
              position: 'absolute', top: '3px',
              left: profile?.parentMode ? '23px' : '3px',
              transition: 'left 200ms ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.4)'
            }} />
          </div>
        </button>
      </div>

      {/* Danger zone */}
      <SectionLabel>Data</SectionLabel>
      <div style={{ background: '#13101A', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', overflow: 'hidden', marginBottom: '32px' }}>
        <button
          onClick={() => setShowResetConfirm(true)}
          style={{ width: '100%', background: 'none', border: 'none', padding: '16px 20px', textAlign: 'left', cursor: 'pointer', color: '#FF6B6B', fontSize: '14px' }}
        >
          Reset All Progress
        </button>
      </div>

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        className="btn btn-ghost w-full"
        style={{ border: '1px solid rgba(255,255,255,0.1)' }}
      >
        Sign Out
      </button>

      {/* Inline editors */}
      {editing === 'name' && (
        <Modal onClose={() => setEditing(null)} title="Edit Name">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
            style={{ width: '100%', background: '#1A1525', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '7px', padding: '12px 14px', color: '#F0EAFB', fontSize: '16px', outline: 'none', marginBottom: '16px' }}
          />
          <button onClick={saveName} disabled={saving} className="btn btn-primary w-full" style={{ background: 'var(--color-primary)', color: 'var(--color-text-on-primary, #fff)' }}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </Modal>
      )}

      {editing === 'position' && (
        <Modal onClose={() => setEditing(null)} title="Edit Position">
          <div className="flex flex-col gap-2">
            {LACROSSE_POSITIONS.map(pos => (
              <button key={pos} onClick={() => setPosition(pos)} style={{
                padding: '14px', borderRadius: '8px', cursor: 'pointer', textAlign: 'left',
                background: profile?.position === pos ? 'var(--color-primary)' : '#1A1525',
                color: profile?.position === pos ? 'var(--color-text-on-primary, #fff)' : '#F0EAFB',
                border: `1px solid ${profile?.position === pos ? 'var(--color-primary)' : 'rgba(255,255,255,0.08)'}`,
                fontWeight: 600, fontSize: '15px'
              }}>{pos}</button>
            ))}
          </div>
        </Modal>
      )}

      {editing === 'grade' && (
        <Modal onClose={() => setEditing(null)} title="Edit Grade">
          <div className="grid grid-cols-3 gap-2">
            {GRADES.map(g => (
              <button key={g} onClick={() => setGrade(g)} style={{
                padding: '14px 8px', borderRadius: '8px', cursor: 'pointer', textAlign: 'center',
                background: profile?.grade === g ? 'var(--color-primary)' : '#1A1525',
                color: profile?.grade === g ? 'var(--color-text-on-primary, #fff)' : '#F0EAFB',
                border: `1px solid ${profile?.grade === g ? 'var(--color-primary)' : 'rgba(255,255,255,0.08)'}`,
                fontFamily: "'Bebas Neue', sans-serif", fontSize: '20px', letterSpacing: '1px'
              }}>{g}</button>
            ))}
          </div>
        </Modal>
      )}

      {editing === 'academics' && (
        <Modal onClose={() => setEditing(null)} title="Edit Academics">
          <div className="flex flex-col gap-4" style={{ marginBottom: '16px' }}>
            {[
              { key: 'gpa', label: 'GPA (unweighted)', placeholder: '3.7', mode: 'decimal' },
              { key: 'sat', label: 'SAT (total)', placeholder: '1300', mode: 'numeric' },
              { key: 'act', label: 'ACT (composite)', placeholder: '29', mode: 'numeric' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(240,234,248,0.4)', marginBottom: '6px' }}>
                  {f.label}
                </label>
                <input
                  type="text"
                  inputMode={f.mode}
                  value={acad[f.key]}
                  onChange={e => setAcad(a => ({ ...a, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  style={{ width: '100%', background: '#1A1525', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '7px', padding: '12px 14px', color: '#F0EAFB', fontSize: '16px', outline: 'none' }}
                />
              </div>
            ))}
          </div>
          <button onClick={saveAcademics} disabled={saving} className="btn btn-primary w-full" style={{ background: 'var(--color-primary)', color: 'var(--color-text-on-primary, #fff)' }}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </Modal>
      )}

      {showSchoolPicker && (
        <Modal onClose={() => setShowSchoolPicker(false)} title="Change Dream School">
          <div style={{ maxHeight: '60vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {SCHOOLS.map(s => (
              <button key={s.id} onClick={() => selectSchool(s.id)} style={{
                padding: '14px', borderRadius: '8px', cursor: 'pointer', textAlign: 'left',
                background: profile?.dreamSchoolId === s.id ? 'color-mix(in srgb, var(--color-primary) 15%, #1A1525)' : '#1A1525',
                border: `1px solid ${profile?.dreamSchoolId === s.id ? s.primaryColor : 'rgba(255,255,255,0.07)'}`,
                borderLeft: `3px solid ${s.primaryColor}`,
                display: 'flex', alignItems: 'center', gap: '10px'
              }}>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '18px', letterSpacing: '1px', color: '#F0EAFB' }}>{s.shortName}</span>
                {s.conference && <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', color: 'rgba(240,234,248,0.35)', letterSpacing: '1px', textTransform: 'uppercase' }}>{s.conference}</span>}
              </button>
            ))}
          </div>
        </Modal>
      )}

      {showResetConfirm && (
        <Modal onClose={() => setShowResetConfirm(false)} title="Reset All Progress?">
          <p style={{ color: 'rgba(240,234,248,0.6)', fontSize: '14px', lineHeight: 1.6, marginBottom: '20px' }}>
            This permanently deletes your streak, session logs, contact history, and roadmap progress. This cannot be undone.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setShowResetConfirm(false)} className="btn btn-ghost flex-1" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
              Cancel
            </button>
            <button onClick={resetProgress} className="btn flex-1" style={{ background: '#7F1D1D', color: '#FCA5A5', border: 'none' }}>
              Reset
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function ProfileRow({ label, value, valueColor, onEdit, last }) {
  return (
    <button
      onClick={onEdit}
      style={{
        width: '100%', background: 'none', border: 'none',
        borderBottom: last ? 'none' : '1px solid rgba(255,255,255,0.05)',
        padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        cursor: 'pointer', textAlign: 'left', transition: 'background 200ms ease'
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
      onMouseLeave={e => e.currentTarget.style.background = 'none'}
    >
      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(240,234,248,0.4)' }}>
        {label}
      </span>
      <span style={{ fontSize: '14px', fontWeight: 500, color: valueColor || '#F0EAFB' }}>
        {value || '—'}
      </span>
    </button>
  )
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(240,234,248,0.4)', marginBottom: '10px', marginTop: '4px' }}>
      {children}
    </div>
  )
}

function Modal({ onClose, title, children }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center'
    }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{
        background: '#13101A', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px 16px 0 0', width: '100%', maxWidth: '520px', padding: '24px'
      }}>
        <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '22px', letterSpacing: '2px', color: '#F0EAFB', marginBottom: '20px' }}>
          {title}
        </h3>
        {children}
        <div style={{ height: 'env(safe-area-inset-bottom, 12px)', minHeight: '12px' }} />
      </div>
    </div>
  )
}
