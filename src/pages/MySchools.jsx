import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useProfile } from '../hooks/useProfile'
import { SCHOOLS } from '../data/schools'
import { ROSTER_DATA, getPositionNeed } from '../data/rosterData'
import { supabase } from '../lib/supabase'
import { IconPlus, IconX, IconSearch, IconCheck } from '../components/Icons'

const CLASS_COLORS = {
  SR: 1.0,
  JR: 0.7,
  SO: 0.45,
  FR: 0.25
}

export default function MySchools() {
  const { user } = useAuth()
  const { profile, updateProfile } = useProfile(user?.id)
  const [selectedId, setSelectedId] = useState(null)
  const [tab, setTab] = useState('staff') // 'staff' | 'roster'
  const [showAddModal, setShowAddModal] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [contactLogs, setContactLogs] = useState([])
  const [showHistory, setShowHistory] = useState(false)

  const mySchoolIds = profile?.mySchools || []
  const activeId = selectedId || mySchoolIds[0]
  const school = SCHOOLS.find(s => s.id === activeId)
  const rosterData = ROSTER_DATA[activeId]

  useEffect(() => {
    if (!activeId) setSelectedId(null)
    if (mySchoolIds.length && !selectedId) setSelectedId(mySchoolIds[0])
  }, [mySchoolIds.length])

  useEffect(() => {
    if (!user || !activeId) return
    supabase
      .from('contactLogs')
      .select('*')
      .eq('userId', user.id)
      .eq('schoolId', activeId)
      .order('date', { ascending: false })
      .then(({ data }) => setContactLogs(data || []))
  }, [user, activeId])

  async function removeSchool(id) {
    const updated = mySchoolIds.filter(s => s !== id)
    await updateProfile({ mySchools: updated })
    if (selectedId === id) setSelectedId(updated[0] || null)
  }

  async function addSchool(id) {
    if (mySchoolIds.includes(id)) return
    if (mySchoolIds.length >= 5) return
    const updated = [...mySchoolIds, id]
    await updateProfile({ mySchools: updated })
    setSelectedId(id)
    setShowAddModal(false)
  }

  return (
    <div className="min-h-screen px-4 py-8 max-w-lg mx-auto">
      <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '44px', letterSpacing: '2px', color: '#F0EAFB', marginBottom: '24px' }}>
        My Schools
      </h1>

      {/* School slots */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {mySchoolIds.map(id => {
          const s = SCHOOLS.find(sc => sc.id === id)
          const isActive = id === activeId
          return (
            <button
              key={id}
              onClick={() => setSelectedId(id)}
              style={{
                background: isActive ? 'color-mix(in srgb, var(--color-primary) 15%, #13101A)' : '#13101A',
                border: `1.5px solid ${isActive ? s?.primaryColor || 'var(--color-primary)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: '8px',
                padding: '8px 14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 200ms ease'
              }}
            >
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '16px', letterSpacing: '1px', color: isActive ? s?.primaryColor || 'var(--color-primary)' : '#F0EAFB' }}>
                {s?.shortName}
              </span>
              <button
                onClick={e => { e.stopPropagation(); removeSchool(id) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(240,234,248,0.35)', padding: '0', display: 'flex', alignItems: 'center' }}
              >
                <IconX size={12} />
              </button>
            </button>
          )
        })}

        {mySchoolIds.length < 5 && (
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              background: '#13101A',
              border: '1px dashed rgba(255,255,255,0.2)',
              borderRadius: '8px',
              padding: '8px 14px',
              cursor: 'pointer',
              color: 'rgba(240,234,248,0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 200ms ease'
            }}
          >
            <IconPlus size={14} />
            <span style={{ fontSize: '13px' }}>Add School</span>
          </button>
        )}
      </div>

      {/* Selected school detail */}
      {school && rosterData ? (
        <div>
          {/* School header */}
          <div style={{
            background: '#13101A',
            border: '1px solid rgba(255,255,255,0.07)',
            borderTop: `3px solid ${school.primaryColor}`,
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '16px'
          }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '28px', letterSpacing: '2px', color: '#F0EAFB' }}>
              {school.name}
            </div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(240,234,248,0.4)', marginTop: '4px' }}>
              {school.division} · {school.conference}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6" style={{ background: '#13101A', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '4px' }}>
            {[['staff', 'Coaching Staff'], ['roster', 'Roster Depth']].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                style={{
                  flex: 1, padding: '10px', borderRadius: '8px',
                  background: tab === key ? 'var(--color-primary)' : 'transparent',
                  color: tab === key ? 'var(--color-text-on-primary, #fff)' : 'rgba(240,234,248,0.5)',
                  border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '14px',
                  transition: 'all 200ms ease',
                  position: 'relative'
                }}
              >
                {label}
                {key === 'staff' && contactLogs.length > 0 && (
                  <span style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: 'var(--color-primary)', position: 'absolute', top: '8px', right: '8px'
                  }} />
                )}
              </button>
            ))}
          </div>

          {/* Coaching Staff */}
          {tab === 'staff' && (
            <div>
              <div className="flex flex-col gap-3 mb-6">
                {rosterData.coachingStaff.map((coach, i) => (
                  <div
                    key={i}
                    style={{
                      background: '#13101A',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: '10px',
                      padding: '18px'
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '15px', color: '#F0EAFB', marginBottom: '2px' }}>
                      {coach.name}
                    </div>
                    <div style={{ fontSize: '12px', color: 'rgba(240,234,248,0.5)', marginBottom: '10px' }}>
                      {coach.title}
                    </div>
                    <div className="flex flex-col gap-1">
                      {coach.email && (
                        <a href={`mailto:${coach.email}`} style={{ fontSize: '13px', color: 'var(--color-primary)', textDecoration: 'none' }}>
                          {coach.email}
                        </a>
                      )}
                      {coach.phone && (
                        <a href={`tel:${coach.phone}`} style={{ fontSize: '13px', color: 'rgba(240,234,248,0.5)', textDecoration: 'none' }}>
                          {coach.phone}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowContactModal(true)}
                className="btn btn-primary w-full mb-4"
                style={{ background: 'var(--color-primary)', color: 'var(--color-text-on-primary, #fff)' }}
              >
                Log Contact
              </button>

              {contactLogs.length > 0 && (
                <button
                  onClick={() => setShowHistory(s => !s)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(240,234,248,0.5)', fontSize: '13px', width: '100%', textAlign: 'center', padding: '8px' }}
                >
                  {showHistory ? 'Hide' : 'View'} Contact History ({contactLogs.length})
                </button>
              )}

              {showHistory && contactLogs.length > 0 && (
                <div className="flex flex-col gap-2 mt-3">
                  {contactLogs.map(log => (
                    <div
                      key={log.id}
                      style={{
                        background: '#1A1525',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '8px',
                        padding: '14px'
                      }}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="chip chip-secondary">{log.method}</span>
                        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', color: 'rgba(240,234,248,0.35)' }}>{log.date}</span>
                      </div>
                      {log.notes && <p style={{ fontSize: '13px', color: 'rgba(240,234,248,0.6)', marginTop: '8px' }}>{log.notes}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Roster Depth */}
          {tab === 'roster' && (
            <RosterDepth rosterData={rosterData} school={school} profile={profile} />
          )}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ color: 'rgba(240,234,248,0.4)', fontSize: '15px' }}>
            Add a school to see coaching staff and roster depth.
          </p>
        </div>
      )}

      {/* Add School Modal */}
      {showAddModal && (
        <AddSchoolModal
          current={mySchoolIds}
          onAdd={addSchool}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Contact Log Modal */}
      {showContactModal && (
        <ContactLogModal
          userId={user?.id}
          schoolId={activeId}
          onClose={() => setShowContactModal(false)}
          onSaved={log => {
            setContactLogs(prev => [log, ...prev])
            setShowContactModal(false)
          }}
        />
      )}
    </div>
  )
}

function RosterDepth({ rosterData, school, profile }) {
  const positions = ['Attack', 'Midfielder', 'Defense', 'Goalie']
  const userPosition = profile?.position
  const userGradYear = profile?.gradYear || 2028

  return (
    <div>
      <div className="flex flex-col gap-4 mb-6">
        {positions.map(pos => {
          const need = getPositionNeed(school.id, pos, userGradYear)
          const isUserPos = pos === userPosition
          const players = rosterData.roster.filter(p => p.position === pos)
          const byCYear = { SR: [], JR: [], SO: [], FR: [] }
          players.forEach(p => { if (byCYear[p.year]) byCYear[p.year].push(p) })

          const needLabel = {
            high: `${players.filter(p => p.gradYear <= userGradYear).length} players graduating before your entry — strong opportunity`,
            medium: '1 player graduating before your entry — some roster need',
            low: 'Position stacked with underclassmen through your entry year — limited roster need'
          }[need]

          return (
            <div
              key={pos}
              style={{
                background: isUserPos ? 'color-mix(in srgb, var(--color-primary) 6%, #13101A)' : '#13101A',
                border: `1px solid ${isUserPos ? 'color-mix(in srgb, var(--color-primary) 25%, transparent)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: '10px',
                padding: '16px'
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div style={{ fontWeight: 600, fontSize: '14px', color: '#F0EAFB' }}>
                  {pos}
                  {isUserPos && <span className="chip chip-primary ml-2">Your Position</span>}
                </div>
                <span className={`chip ${need === 'high' ? 'chip-primary' : need === 'medium' ? 'chip-secondary' : 'chip-lock'}`}>
                  {need} need
                </span>
              </div>

              {/* Player squares */}
              <div className="flex gap-1 flex-wrap mb-3">
                {(['SR', 'JR', 'SO', 'FR']).map(year =>
                  byCYear[year].map((_, i) => (
                    <div
                      key={`${year}-${i}`}
                      title={year}
                      style={{
                        width: '10px', height: '10px', borderRadius: '2px',
                        background: school.primaryColor,
                        opacity: CLASS_COLORS[year]
                      }}
                    />
                  ))
                )}
              </div>

              {/* Legend */}
              <div className="flex gap-3 mb-3">
                {(['SR', 'JR', 'SO', 'FR']).map(year => (
                  <div key={year} className="flex items-center gap-1">
                    <div style={{ width: '8px', height: '8px', borderRadius: '1px', background: school.primaryColor, opacity: CLASS_COLORS[year] }} />
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', color: 'rgba(240,234,248,0.4)', letterSpacing: '1px' }}>
                      {year} · {byCYear[year].length}
                    </span>
                  </div>
                ))}
              </div>

              <p style={{ fontSize: '12px', color: 'rgba(240,234,248,0.5)', lineHeight: 1.6 }}>
                {needLabel}
              </p>
            </div>
          )
        })}
      </div>

      <p style={{ fontSize: '11px', color: 'rgba(240,234,248,0.3)', textAlign: 'center', lineHeight: 1.6 }}>
        Roster data is updated periodically. Always verify directly with the coaching staff.
      </p>
    </div>
  )
}

function AddSchoolModal({ current, onAdd, onClose }) {
  const [query, setQuery] = useState('')
  const filtered = SCHOOLS.filter(s =>
    s.id !== 'undecided' &&
    !current.includes(s.id) &&
    (s.name.toLowerCase().includes(query.toLowerCase()) ||
     s.shortName.toLowerCase().includes(query.toLowerCase()))
  )

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center'
    }}>
      <div style={{
        background: '#13101A',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px 16px 0 0',
        width: '100%', maxWidth: '520px',
        padding: '24px',
        maxHeight: '80vh',
        display: 'flex', flexDirection: 'column'
      }}>
        <div className="flex items-center justify-between mb-4">
          <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '24px', letterSpacing: '2px', color: '#F0EAFB' }}>
            Add a School
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(240,234,248,0.5)' }}>
            <IconX size={20} />
          </button>
        </div>

        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <IconSearch size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(240,234,248,0.4)' }} />
          <input
            autoFocus
            placeholder="Search schools…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              width: '100%', background: '#1A1525', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px', padding: '11px 12px 11px 36px', color: '#F0EAFB', fontSize: '14px',
              outline: 'none', fontFamily: "'DM Sans', sans-serif"
            }}
          />
        </div>

        <div style={{ overflowY: 'auto', flex: 1 }}>
          {filtered.map(s => (
            <button
              key={s.id}
              onClick={() => onAdd(s.id)}
              style={{
                width: '100%', background: 'transparent', border: 'none',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                padding: '14px 4px', textAlign: 'left', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '12px',
                transition: 'background 200ms ease'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ width: '4px', height: '36px', borderRadius: '2px', background: s.primaryColor, flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '15px', color: '#F0EAFB' }}>{s.name}</div>
                <div style={{ fontSize: '11px', color: 'rgba(240,234,248,0.4)', fontFamily: "'Space Mono', monospace", letterSpacing: '1px' }}>
                  {s.division} · {s.conference}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function ContactLogModal({ userId, schoolId, onClose, onSaved }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [method, setMethod] = useState('Email')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const methods = ['Email', 'Phone', 'Camp', 'Official Visit', 'Unofficial Visit']

  async function save() {
    setSaving(true)
    const { data, error } = await supabase.from('contactLogs').insert({
      userId, schoolId, date, method, notes,
      createdAt: new Date().toISOString()
    }).select().single()
    setSaving(false)
    if (!error) onSaved(data)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center'
    }}>
      <div style={{
        background: '#13101A', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px 16px 0 0', width: '100%', maxWidth: '520px', padding: '24px'
      }}>
        <div className="flex items-center justify-between mb-6">
          <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '24px', letterSpacing: '2px', color: '#F0EAFB' }}>
            Log Contact
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(240,234,248,0.5)' }}>
            <IconX size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'rgba(240,234,248,0.5)', marginBottom: '6px', fontFamily: "'Space Mono', monospace", letterSpacing: '1px', textTransform: 'uppercase' }}>Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width: '100%', background: '#1A1525', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '7px', padding: '11px 14px', color: '#F0EAFB', fontSize: '14px', outline: 'none' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'rgba(240,234,248,0.5)', marginBottom: '6px', fontFamily: "'Space Mono', monospace", letterSpacing: '1px', textTransform: 'uppercase' }}>Method</label>
            <div className="flex gap-2 flex-wrap">
              {methods.map(m => (
                <button key={m} onClick={() => setMethod(m)} style={{
                  padding: '8px 14px', borderRadius: '7px', cursor: 'pointer', fontSize: '13px',
                  background: method === m ? 'var(--color-primary)' : '#1A1525',
                  color: method === m ? 'var(--color-text-on-primary, #fff)' : 'rgba(240,234,248,0.6)',
                  border: `1px solid ${method === m ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)'}`,
                  transition: 'all 200ms ease'
                }}>{m}</button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'rgba(240,234,248,0.5)', marginBottom: '6px', fontFamily: "'Space Mono', monospace", letterSpacing: '1px', textTransform: 'uppercase' }}>Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="What was discussed?" rows={3} style={{ width: '100%', background: '#1A1525', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '7px', padding: '12px 14px', color: '#F0EAFB', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: "'DM Sans', sans-serif" }} />
          </div>
          <button onClick={save} disabled={saving} className="btn btn-primary w-full" style={{ background: 'var(--color-primary)', color: 'var(--color-text-on-primary, #fff)' }}>
            {saving ? 'Saving…' : 'Save Contact Log'}
          </button>
        </div>
      </div>
    </div>
  )
}
