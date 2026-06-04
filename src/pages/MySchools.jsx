import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useProfile } from '../hooks/useProfile'
import { SCHOOLS } from '../data/schools'
import { ROSTER_DATA, getPositionNeed } from '../data/rosterData'
import { getTeamLeaders, filmSearchUrl, STATS_SEASON } from '../data/statsLeaders'
import { supabase } from '../lib/supabase'
import { IconPlus, IconX, IconSearch, IconCheck } from '../components/Icons'

const CLASS_COLORS = { SR: 1.0, JR: 0.7, SO: 0.45, FR: 0.25 }

function CoachPhoto({ src, name, size = 52 }) {
  const [errored, setErrored] = useState(false)
  const initials = name ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?'

  if (src && !errored) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setErrored(true)}
        style={{
          width: size, height: size, borderRadius: '50%',
          objectFit: 'cover', objectPosition: 'top',
          border: '2px solid rgba(255,255,255,0.1)',
          flexShrink: 0
        }}
      />
    )
  }

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))',
      border: '2px solid rgba(255,255,255,0.1)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      fontFamily: "'Bebas Neue', sans-serif",
      fontSize: size * 0.35 + 'px',
      letterSpacing: '1px',
      color: 'rgba(240,234,248,0.4)'
    }}>
      {initials}
    </div>
  )
}

export default function MySchools() {
  const { user } = useAuth()
  const { profile, updateProfile } = useProfile(user?.id)
  const [selectedId, setSelectedId] = useState(null)
  const [tab, setTab] = useState('staff')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [contactLogs, setContactLogs] = useState([])
  const [showHistory, setShowHistory] = useState(false)

  const mySchoolIds = profile?.mySchools || []
  const activeId = selectedId || mySchoolIds[0]
  const school = SCHOOLS.find(s => s.id === activeId)
  const rosterData = ROSTER_DATA[activeId]

  useEffect(() => {
    if (mySchoolIds.length && !selectedId) setSelectedId(mySchoolIds[0])
  }, [mySchoolIds.length])

  useEffect(() => {
    if (!user || !activeId) return
    supabase.from('contactLogs').select('*').eq('userId', user.id).eq('schoolId', activeId).order('date', { ascending: false })
      .then(({ data }) => setContactLogs(data || []))
  }, [user, activeId])

  async function removeSchool(id) {
    const updated = mySchoolIds.filter(s => s !== id)
    await updateProfile({ mySchools: updated })
    if (selectedId === id) setSelectedId(updated[0] || null)
  }

  async function addSchool(id) {
    if (mySchoolIds.includes(id) || mySchoolIds.length >= 5) return
    const updated = [...mySchoolIds, id]
    await updateProfile({ mySchools: updated })
    setSelectedId(id)
    setShowAddModal(false)
  }

  return (
    <div style={{ background: '#0A0812', minHeight: '100vh' }}>

      {/* Hero header */}
      <div className="hero-header">
        <div style={{ maxWidth: '440px', margin: '0 auto' }}>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '48px', letterSpacing: '3px', color: '#F0EAFB', lineHeight: 1 }}>
            My Schools
          </h1>
          <p style={{ color: 'rgba(240,234,248,0.4)', fontSize: '13px', marginTop: '6px' }}>
            Track coaching staff, roster depth, and contact history.
          </p>
        </div>
      </div>

      <div style={{ padding: '24px 20px', maxWidth: '440px', margin: '0 auto' }}>

        {/* School slots */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {mySchoolIds.map(id => {
            const s = SCHOOLS.find(sc => sc.id === id)
            const isActive = id === activeId
            return (
              <button
                key={id}
                onClick={() => setSelectedId(id)}
                style={{
                  background: isActive
                    ? `color-mix(in srgb, ${s?.primaryColor} 15%, #181424)`
                    : 'rgba(255,255,255,0.04)',
                  border: `1.5px solid ${isActive ? s?.primaryColor : 'rgba(255,255,255,0.09)'}`,
                  borderRadius: '10px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  transition: 'all 200ms ease',
                  boxShadow: isActive ? `0 4px 16px color-mix(in srgb, ${s?.primaryColor} 25%, transparent)` : 'none'
                }}
              >
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: s?.primaryColor, flexShrink: 0, boxShadow: isActive ? `0 0 6px ${s?.primaryColor}` : 'none' }} />
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '16px', letterSpacing: '1px', color: isActive ? s?.primaryColor : 'rgba(240,234,248,0.6)' }}>
                  {s?.shortName}
                </span>
                <button
                  onClick={e => { e.stopPropagation(); removeSchool(id) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(240,234,248,0.25)', padding: '0', display: 'flex', alignItems: 'center', marginLeft: '2px' }}
                >
                  <IconX size={11} />
                </button>
              </button>
            )
          })}

          {mySchoolIds.length < 5 && (
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px dashed rgba(255,255,255,0.15)',
                borderRadius: '10px',
                padding: '8px 14px',
                cursor: 'pointer',
                color: 'rgba(240,234,248,0.35)',
                display: 'flex', alignItems: 'center', gap: '6px',
                transition: 'all 200ms ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)'; e.currentTarget.style.color = 'rgba(240,234,248,0.6)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(240,234,248,0.35)' }}
            >
              <IconPlus size={14} />
              <span style={{ fontSize: '13px', fontWeight: 500 }}>Add School</span>
            </button>
          )}
        </div>

        {/* Selected school */}
        {school && rosterData ? (
          <div>
            {/* School identity card */}
            <div style={{
              background: `linear-gradient(135deg, color-mix(in srgb, ${school.primaryColor} 18%, #181424) 0%, #13101A 60%)`,
              border: `1px solid color-mix(in srgb, ${school.primaryColor} 30%, transparent)`,
              borderRadius: '16px',
              padding: '22px',
              marginBottom: '16px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Background watermark text */}
              <div style={{
                position: 'absolute', right: '-10px', bottom: '-16px',
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '80px', letterSpacing: '4px',
                color: `color-mix(in srgb, ${school.primaryColor} 8%, transparent)`,
                lineHeight: 1, pointerEvents: 'none', userSelect: 'none'
              }}>
                {school.shortName}
              </div>
              <div style={{ position: 'relative' }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '32px', letterSpacing: '2px', color: '#F0EAFB', lineHeight: 1 }}>
                  {school.name}
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                  <span style={{
                    fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '2px',
                    textTransform: 'uppercase', color: school.primaryColor,
                    background: `color-mix(in srgb, ${school.primaryColor} 15%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${school.primaryColor} 30%, transparent)`,
                    padding: '3px 8px', borderRadius: '4px'
                  }}>
                    {school.mascot}
                  </span>
                  <span className="chip chip-secondary">{school.conference}</span>
                  <span className="chip chip-secondary">{school.division}</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '4px' }}>
              {[['staff', 'Coaching Staff'], ['roster', 'Roster Depth'], ['leaders', 'Stat Leaders']].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  style={{
                    flex: 1, padding: '11px', borderRadius: '9px',
                    background: tab === key ? 'var(--color-primary)' : 'transparent',
                    color: tab === key ? 'var(--color-text-on-primary, #fff)' : 'rgba(240,234,248,0.4)',
                    border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '14px',
                    transition: 'all 200ms ease',
                    boxShadow: tab === key ? `0 4px 16px color-mix(in srgb, var(--color-primary) 35%, transparent)` : 'none',
                    position: 'relative'
                  }}
                >
                  {label}
                  {key === 'staff' && contactLogs.length > 0 && (
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: tab === key ? 'rgba(255,255,255,0.8)' : 'var(--color-primary)', position: 'absolute', top: '8px', right: '8px', boxShadow: '0 0 5px currentColor' }} />
                  )}
                </button>
              ))}
            </div>

            {/* Coaching Staff */}
            {tab === 'staff' && (
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                  {rosterData.coachingStaff.map((coach, i) => (
                    <div
                      key={i}
                      style={{
                        background: 'linear-gradient(145deg, #181424, #120f1c)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '14px',
                        padding: '16px',
                        display: 'flex',
                        gap: '14px',
                        alignItems: 'flex-start'
                      }}
                    >
                      <CoachPhoto src={coach.photo} name={coach.name} size={52} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '15px', color: '#F0EAFB', marginBottom: '2px' }}>
                          {coach.name}
                        </div>
                        <div style={{ fontSize: '12px', color: 'rgba(240,234,248,0.45)', marginBottom: '10px' }}>
                          {coach.title}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {coach.email && (
                            <a href={`mailto:${coach.email}`} style={{ fontSize: '12px', color: school.primaryColor, textDecoration: 'none', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {coach.email}
                            </a>
                          )}
                          {coach.phone && (
                            <a href={`tel:${coach.phone}`} style={{ fontSize: '12px', color: 'rgba(240,234,248,0.4)', textDecoration: 'none' }}>
                              {coach.phone}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setShowContactModal(true)}
                  className="btn btn-primary w-full"
                  style={{ width: '100%', background: 'var(--color-primary)', color: 'var(--color-text-on-primary, #fff)', marginBottom: '12px' }}
                >
                  Log Contact
                </button>

                {contactLogs.length > 0 && (
                  <button
                    onClick={() => setShowHistory(s => !s)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(240,234,248,0.4)', fontSize: '13px', width: '100%', textAlign: 'center', padding: '8px' }}
                  >
                    {showHistory ? 'Hide' : 'View'} Contact History ({contactLogs.length})
                  </button>
                )}

                {showHistory && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                    {contactLogs.map(log => (
                      <div key={log.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span className="chip chip-secondary">{log.method}</span>
                          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: 'rgba(240,234,248,0.3)' }}>{log.date}</span>
                        </div>
                        {log.notes && <p style={{ fontSize: '13px', color: 'rgba(240,234,248,0.55)', lineHeight: 1.6 }}>{log.notes}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Roster Depth */}
            {tab === 'roster' && <RosterDepth rosterData={rosterData} school={school} profile={profile} />}

            {/* Stat Leaders */}
            {tab === 'leaders' && <StatLeaders schoolId={activeId} rosterData={rosterData} school={school} />}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '28px', color: 'rgba(240,234,248,0.2)', marginBottom: '8px' }}>
              No Schools Added
            </div>
            <p style={{ color: 'rgba(240,234,248,0.35)', fontSize: '14px', marginBottom: '24px' }}>
              Add up to 5 programs to track coaching staff and roster depth.
            </p>
            <button onClick={() => setShowAddModal(true)} className="btn btn-primary" style={{ background: 'var(--color-primary)', color: 'var(--color-text-on-primary, #fff)' }}>
              Add Your First School
            </button>
          </div>
        )}
      </div>

      {showAddModal && <AddSchoolModal current={mySchoolIds} onAdd={addSchool} onClose={() => setShowAddModal(false)} />}
      {showContactModal && (
        <ContactLogModal
          userId={user?.id} schoolId={activeId}
          onClose={() => setShowContactModal(false)}
          onSaved={log => { setContactLogs(prev => [log, ...prev]); setShowContactModal(false) }}
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
        {positions.map(pos => {
          const need = getPositionNeed(school.id, pos, userGradYear)
          const isUserPos = pos === userPosition
          const players = rosterData.roster.filter(p => p.position === pos)
          const byCYear = { SR: [], JR: [], SO: [], FR: [] }
          players.forEach(p => { if (byCYear[p.year]) byCYear[p.year].push(p) })

          const needText = {
            high: `${players.filter(p => p.gradYear <= userGradYear).length} players graduating before your entry — strong opportunity`,
            medium: '1 player graduating before your entry — some roster need',
            low: 'Stacked with underclassmen through your entry year — limited need'
          }[need]

          return (
            <div key={pos} style={{
              background: isUserPos
                ? `linear-gradient(135deg, color-mix(in srgb, ${school.primaryColor} 8%, #181424), #181424)`
                : 'linear-gradient(145deg, #181424, #120f1c)',
              border: `1px solid ${isUserPos ? `color-mix(in srgb, ${school.primaryColor} 25%, transparent)` : 'rgba(255,255,255,0.07)'}`,
              borderRadius: '12px', padding: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 600, fontSize: '14px', color: '#F0EAFB' }}>{pos}</span>
                  {isUserPos && <span className="chip chip-primary">Your Position</span>}
                </div>
                <span className={`chip ${need === 'high' ? 'chip-primary' : need === 'medium' ? 'chip-secondary' : 'chip-lock'}`}>
                  {need} need
                </span>
              </div>
              <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', marginBottom: '10px' }}>
                {(['SR','JR','SO','FR']).map(year =>
                  byCYear[year].map((_, i) => (
                    <div key={`${year}-${i}`} title={year} style={{ width: '10px', height: '10px', borderRadius: '2px', background: school.primaryColor, opacity: CLASS_COLORS[year] }} />
                  ))
                )}
              </div>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                {(['SR','JR','SO','FR']).map(year => (
                  <div key={year} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '7px', height: '7px', borderRadius: '1px', background: school.primaryColor, opacity: CLASS_COLORS[year] }} />
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', color: 'rgba(240,234,248,0.35)', letterSpacing: '1px' }}>
                      {year} {byCYear[year].length}
                    </span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '12px', color: 'rgba(240,234,248,0.45)', lineHeight: 1.6 }}>{needText}</p>
            </div>
          )
        })}
      </div>
      <p style={{ fontSize: '11px', color: 'rgba(240,234,248,0.25)', textAlign: 'center', lineHeight: 1.6 }}>
        Roster data is updated periodically. Always verify directly with the coaching staff.
      </p>
    </div>
  )
}

function FilmLink({ name, schoolName, color }) {
  return (
    <a
      href={filmSearchUrl(name, schoolName)}
      target="_blank"
      rel="noreferrer"
      style={{
        fontSize: '11px', fontWeight: 600, color, textDecoration: 'none',
        border: `1px solid color-mix(in srgb, ${color} 35%, transparent)`,
        background: `color-mix(in srgb, ${color} 12%, transparent)`,
        padding: '5px 10px', borderRadius: '8px', whiteSpace: 'nowrap', flexShrink: 0,
      }}
    >
      Watch film
    </a>
  )
}

function StatLeaders({ schoolId, rosterData, school }) {
  const leaders = getTeamLeaders(schoolId)

  if (leaders.length > 0) {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '18px', letterSpacing: '1.5px', color: '#F0EAFB' }}>
            Scoring Leaders
          </span>
          {STATS_SEASON && (
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '1px', color: 'rgba(240,234,248,0.3)' }}>
              {STATS_SEASON} SEASON
            </span>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {leaders.map((p, i) => (
            <div key={`${p.name}-${i}`} style={{ background: 'linear-gradient(145deg, #181424, #120f1c)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '22px', color: school.primaryColor, width: '24px', textAlign: 'center', flexShrink: 0 }}>{i + 1}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '14px', color: '#F0EAFB', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', letterSpacing: '0.5px', color: 'rgba(240,234,248,0.45)', marginTop: '3px' }}>
                  {[p.position, `${p.points} PTS`, `${p.goals}G`, `${p.assists}A`].filter(Boolean).join('  ·  ')}
                </div>
              </div>
              <FilmLink name={p.name} schoolName={school.name} color={school.primaryColor} />
            </div>
          ))}
        </div>
        <p style={{ fontSize: '11px', color: 'rgba(240,234,248,0.25)', textAlign: 'center', lineHeight: 1.6, marginTop: '16px' }}>
          Stat leaders via Inside Lacrosse. Film links open a YouTube search for each athlete.
        </p>
      </div>
    )
  }

  // No season stats loaded yet — fall back to the current roster so recruits can
  // still pull up film on the upperclassmen they would be competing with.
  const watchable = rosterData.roster
    .filter(p => p.name && (p.year === 'JR' || p.year === 'SR'))
    .slice(0, 12)

  return (
    <div>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '14px', marginBottom: '14px' }}>
        <p style={{ fontSize: '12px', color: 'rgba(240,234,248,0.5)', lineHeight: 1.6 }}>
          Live scoring leaders are not loaded yet. Add a parse.bot API key and run
          <span style={{ fontFamily: "'Space Mono', monospace", color: 'rgba(240,234,248,0.7)' }}> npm run fetch-stats </span>
          to rank players by scoring. Until then, here is the current roster so you can watch film.
        </p>
      </div>
      {watchable.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {watchable.map((p, i) => (
            <div key={`${p.name}-${i}`} style={{ background: 'linear-gradient(145deg, #181424, #120f1c)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '14px', color: '#F0EAFB' }}>{p.name}</div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', letterSpacing: '0.5px', color: 'rgba(240,234,248,0.45)', marginTop: '3px' }}>
                  {[p.position, p.year].filter(Boolean).join('  ·  ')}
                </div>
              </div>
              <FilmLink name={p.name} schoolName={school.name} color={school.primaryColor} />
            </div>
          ))}
        </div>
      ) : (
        <p style={{ fontSize: '12px', color: 'rgba(240,234,248,0.35)', textAlign: 'center', padding: '20px' }}>
          No roster data available for this program yet.
        </p>
      )}
    </div>
  )
}

function AddSchoolModal({ current, onAdd, onClose }) {
  const [query, setQuery] = useState('')
  const filtered = SCHOOLS.filter(s => s.id !== 'undecided' && !current.includes(s.id) && (s.name.toLowerCase().includes(query.toLowerCase()) || s.shortName.toLowerCase().includes(query.toLowerCase())))

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div style={{ background: 'linear-gradient(160deg, #181424, #120f1c)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: '520px', padding: '24px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '24px', letterSpacing: '2px', color: '#F0EAFB' }}>Add a School</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(240,234,248,0.4)' }}><IconX size={20} /></button>
        </div>
        <div style={{ position: 'relative', marginBottom: '14px' }}>
          <IconSearch size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(240,234,248,0.3)' }} />
          <input autoFocus placeholder="Search schools…" value={query} onChange={e => setQuery(e.target.value)} className="input" style={{ paddingLeft: '38px' }} />
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {filtered.map(s => (
            <button key={s.id} onClick={() => onAdd(s.id)} style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '14px 4px', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px', transition: 'background 200ms ease' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{ width: '4px', height: '40px', borderRadius: '2px', background: s.primaryColor, flexShrink: 0, boxShadow: `0 0 8px ${s.primaryColor}` }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '15px', color: '#F0EAFB' }}>{s.name}</div>
                <div style={{ fontSize: '11px', color: 'rgba(240,234,248,0.35)', fontFamily: "'Space Mono', monospace", letterSpacing: '1px', marginTop: '2px' }}>{s.mascot} · {s.conference}</div>
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
    const { data, error } = await supabase.from('contactLogs').insert({ userId, schoolId, date, method, notes, createdAt: new Date().toISOString() }).select().single()
    setSaving(false)
    if (!error) onSaved(data)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div style={{ background: 'linear-gradient(160deg, #181424, #120f1c)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: '520px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '24px', letterSpacing: '2px', color: '#F0EAFB' }}>Log Contact</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(240,234,248,0.4)' }}><IconX size={20} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '10px', color: 'rgba(240,234,248,0.4)', marginBottom: '7px', fontFamily: "'Space Mono', monospace", letterSpacing: '1.5px', textTransform: 'uppercase' }}>Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '10px', color: 'rgba(240,234,248,0.4)', marginBottom: '7px', fontFamily: "'Space Mono', monospace", letterSpacing: '1.5px', textTransform: 'uppercase' }}>Method</label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {methods.map(m => (
                <button key={m} onClick={() => setMethod(m)} style={{ padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', background: method === m ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)', color: method === m ? 'var(--color-text-on-primary, #fff)' : 'rgba(240,234,248,0.55)', border: `1px solid ${method === m ? 'var(--color-primary)' : 'rgba(255,255,255,0.08)'}`, transition: 'all 200ms ease', boxShadow: method === m ? `0 4px 12px color-mix(in srgb, var(--color-primary) 30%, transparent)` : 'none' }}>{m}</button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '10px', color: 'rgba(240,234,248,0.4)', marginBottom: '7px', fontFamily: "'Space Mono', monospace", letterSpacing: '1.5px', textTransform: 'uppercase' }}>Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="What was discussed?" rows={3} className="input" style={{ resize: 'vertical', fontFamily: "'DM Sans', sans-serif" }} />
          </div>
          <button onClick={save} disabled={saving} className="btn btn-primary" style={{ width: '100%', background: 'var(--color-primary)', color: 'var(--color-text-on-primary, #fff)' }}>
            {saving ? 'Saving…' : 'Save Contact Log'}
          </button>
        </div>
        <div style={{ height: 'env(safe-area-inset-bottom, 16px)', minHeight: '16px' }} />
      </div>
    </div>
  )
}
