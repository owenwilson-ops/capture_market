import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useProfile } from '../hooks/useProfile'
import { SCHOOLS } from '../data/schools'
import { LACROSSE_POSITIONS, GRADES } from '../data/positions'
import { IconArrowLeft } from '../components/Icons'

function calcGradYear(grade) {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() // 0-indexed
  // Academic year: if after June, we're in new school year
  const academicYear = currentMonth >= 6 ? currentYear : currentYear - 1
  const gradeNum = { '8th': 8, '9th': 9, '10th': 10, '11th': 11, '12th': 12 }[grade] || 12
  return academicYear + (12 - gradeNum) + 1
}

const POSITION_DESCRIPTIONS = {
  Attack: "The scoring engine. Elite footwork, finishing, and creativity around the cage. Must create off the dodge and make the right read under pressure.",
  Midfielder: "Covers 70 yards every possession. Transition speed, two-way discipline, and the ability to drive to cage or settle — whatever the moment demands.",
  Defense: "Communication, positioning, and the willingness to compete on every ride. Defensive systems win championships. Your IQ matters as much as your athleticism.",
  Goalie: "Everything moves through you. Commanding the defense, shot-stopping mechanics, and composure under pressure separate keepers who play from those who don't."
}

function ProgressBar({ step, total }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          height: '3px',
          flex: 1,
          borderRadius: '2px',
          background: i < step ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)',
          transition: 'background 300ms ease'
        }} />
      ))}
    </div>
  )
}

export default function Onboarding() {
  const [step, setStep] = useState(1)
  const [dreamSchoolId, setDreamSchoolId] = useState(null)
  const [position, setPosition] = useState(null)
  const [grade, setGrade] = useState(null)
  const [name, setName] = useState('')
  const [gpa, setGpa] = useState('')
  const [sat, setSat] = useState('')
  const [act, setAct] = useState('')
  const [saving, setSaving] = useState(false)
  const { user } = useAuth()
  const { updateProfile } = useProfile(user?.id)
  const navigate = useNavigate()

  const school = SCHOOLS.find(s => s.id === dreamSchoolId)

  async function finish() {
    setSaving(true)
    const gradYear = calcGradYear(grade)
    const num = v => { const n = parseFloat(v); return Number.isFinite(n) ? n : null }
    await updateProfile({
      name: name.trim(),
      dreamSchoolId,
      position,
      grade,
      gradYear,
      gpa: num(gpa),
      satScore: num(sat),
      actScore: num(act),
      mySchools: dreamSchoolId && dreamSchoolId !== 'undecided' ? [dreamSchoolId] : [],
      parentMode: false
    })
    setSaving(false)
    navigate('/home')
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0D0A0F' }}>
      {/* Header */}
      <div className="px-6 pt-safe pt-6 pb-4">
        <div className="max-w-lg mx-auto flex items-center gap-4">
          {step > 1 && (
            <button
              onClick={() => setStep(s => s - 1)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(240,234,248,0.5)', padding: '4px' }}
            >
              <IconArrowLeft size={20} />
            </button>
          )}
          <div className="flex-1">
            <ProgressBar step={step} total={6} />
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 flex flex-col px-6 py-8">
        <div className="max-w-lg mx-auto w-full flex-1 flex flex-col">

          {/* Step 1 — School Picker */}
          {step === 1 && (
            <div>
              <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '52px', letterSpacing: '2px', color: '#F0EAFB', lineHeight: 1, marginBottom: '8px' }}>
                Where do you want to play?
              </h1>
              <p style={{ color: 'rgba(240,234,248,0.55)', fontSize: '15px', marginBottom: '32px' }}>
                Your entire experience builds around your goal.
              </p>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {SCHOOLS.filter(s => s.id !== 'undecided').map(s => (
                  <SchoolCard
                    key={s.id}
                    school={s}
                    onSelect={() => { setDreamSchoolId(s.id); setStep(2) }}
                  />
                ))}
                {/* Undecided last */}
                {SCHOOLS.filter(s => s.id === 'undecided').map(s => (
                  <UndecidedCard key={s.id} onSelect={() => { setDreamSchoolId(s.id); setStep(2) }} />
                ))}
              </div>
            </div>
          )}

          {/* Step 2 — Position */}
          {step === 2 && (
            <div>
              <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '52px', letterSpacing: '2px', color: '#F0EAFB', lineHeight: 1, marginBottom: '8px' }}>
                What position do you play?
              </h1>
              <p style={{ color: 'rgba(240,234,248,0.55)', fontSize: '15px', marginBottom: '32px' }}>
                Training plans and roster analysis will be built around your role.
              </p>
              <div className="flex flex-col gap-3">
                {LACROSSE_POSITIONS.map(pos => (
                  <button
                    key={pos}
                    onClick={() => { setPosition(pos); setStep(3) }}
                    style={{
                      background: position === pos ? 'color-mix(in srgb, var(--color-primary) 15%, #13101A)' : '#13101A',
                      border: `1px solid ${position === pos ? 'var(--color-primary)' : 'rgba(255,255,255,0.07)'}`,
                      borderRadius: '12px',
                      padding: '20px 24px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 200ms ease'
                    }}
                  >
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '26px', letterSpacing: '2px', color: '#F0EAFB', marginBottom: '4px' }}>
                      {pos}
                    </div>
                    <div style={{ color: 'rgba(240,234,248,0.55)', fontSize: '14px', lineHeight: 1.5 }}>
                      {POSITION_DESCRIPTIONS[pos]}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3 — Grade */}
          {step === 3 && (
            <div>
              <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '52px', letterSpacing: '2px', color: '#F0EAFB', lineHeight: 1, marginBottom: '8px' }}>
                What grade are you in?
              </h1>
              <p style={{ color: 'rgba(240,234,248,0.55)', fontSize: '15px', marginBottom: '32px' }}>
                Your recruiting roadmap and timeline are grade-specific.
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {GRADES.map(g => (
                  <button
                    key={g}
                    onClick={() => { setGrade(g); setStep(4) }}
                    style={{
                      background: grade === g ? 'color-mix(in srgb, var(--color-primary) 15%, #13101A)' : '#13101A',
                      border: `1px solid ${grade === g ? 'var(--color-primary)' : 'rgba(255,255,255,0.07)'}`,
                      borderRadius: '12px',
                      padding: '28px 20px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 200ms ease'
                    }}
                  >
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '32px', letterSpacing: '2px', color: '#F0EAFB' }}>
                      {g}
                    </div>
                    <div style={{ color: 'rgba(240,234,248,0.4)', fontSize: '12px', marginTop: '4px', fontFamily: "'Space Mono', monospace" }}>
                      Class of {calcGradYear(g)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4 — Name */}
          {step === 4 && (
            <div>
              <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '52px', letterSpacing: '2px', color: '#F0EAFB', lineHeight: 1, marginBottom: '8px' }}>
                What's your name?
              </h1>
              <p style={{ color: 'rgba(240,234,248,0.55)', fontSize: '15px', marginBottom: '32px' }}>
                First name is fine.
              </p>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your first name"
                autoFocus
                style={{
                  width: '100%',
                  background: '#1A1525',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  padding: '18px 20px',
                  color: '#F0EAFB',
                  fontSize: '22px',
                  fontFamily: "'DM Sans', sans-serif",
                  outline: 'none',
                  marginBottom: '24px'
                }}
                onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                onKeyDown={e => { if (e.key === 'Enter' && name.trim()) setStep(5) }}
              />
              <button
                onClick={() => setStep(5)}
                disabled={!name.trim()}
                className="btn btn-primary w-full"
                style={{
                  background: name.trim() ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)',
                  color: name.trim() ? 'var(--color-text-on-primary, #fff)' : 'rgba(240,234,248,0.3)',
                  cursor: name.trim() ? 'pointer' : 'not-allowed'
                }}
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 5 — Academics (optional) */}
          {step === 5 && (
            <div>
              <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '52px', letterSpacing: '2px', color: '#F0EAFB', lineHeight: 1, marginBottom: '8px' }}>
                Your academics
              </h1>
              <p style={{ color: 'rgba(240,234,248,0.55)', fontSize: '15px', marginBottom: '8px' }}>
                Optional. We use these to show whether each school is an academic reach, target, or likely fit.
              </p>
              <p style={{ color: 'rgba(240,234,248,0.35)', fontSize: '13px', marginBottom: '28px' }}>
                You can add or change these any time in your profile.
              </p>

              <div className="flex flex-col gap-4" style={{ marginBottom: '28px' }}>
                <AcademicField label="GPA (unweighted)" value={gpa} onChange={setGpa} placeholder="3.7" inputMode="decimal" />
                <AcademicField label="SAT (total)" value={sat} onChange={setSat} placeholder="1300" inputMode="numeric" />
                <AcademicField label="ACT (composite)" value={act} onChange={setAct} placeholder="29" inputMode="numeric" />
              </div>

              <button
                onClick={() => setStep(6)}
                className="btn btn-primary w-full"
                style={{ background: 'var(--color-primary)', color: 'var(--color-text-on-primary, #fff)', marginBottom: '12px' }}
              >
                Continue
              </button>
              <button
                onClick={() => { setGpa(''); setSat(''); setAct(''); setStep(6) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(240,234,248,0.45)', fontSize: '14px', width: '100%', padding: '8px' }}
              >
                Skip for now
              </button>
            </div>
          )}

          {/* Step 6 — Confirmation */}
          {step === 6 && (
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '10px',
                  letterSpacing: '3px',
                  textTransform: 'uppercase',
                  color: 'rgba(240,234,248,0.4)',
                  marginBottom: '16px'
                }}>
                  Your goal is set
                </div>

                <h1 style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: '52px',
                  letterSpacing: '2px',
                  color: '#F0EAFB',
                  lineHeight: 1.1,
                  marginBottom: '32px'
                }}>
                  {name}, your road to{' '}
                  <span style={{ color: 'var(--color-primary)' }}>
                    {school?.shortName || 'your goal'}
                  </span>{' '}
                  starts today.
                </h1>

                {/* Summary card */}
                <div style={{
                  background: '#13101A',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '12px',
                  padding: '24px',
                  marginBottom: '32px'
                }}>
                  <div className="flex flex-col gap-4">
                    <SummaryRow label="Dream School" value={school?.name || 'Undecided'} highlight />
                    <SummaryRow label="Position" value={position} />
                    <SummaryRow label="Grade" value={grade} />
                    <SummaryRow label="Graduation" value={`Class of ${calcGradYear(grade)}`} />
                    {gpa && <SummaryRow label="GPA" value={gpa} />}
                    {sat && <SummaryRow label="SAT" value={sat} />}
                    {act && <SummaryRow label="ACT" value={act} />}
                  </div>
                </div>
              </div>

              <button
                onClick={finish}
                disabled={saving}
                className="btn btn-primary w-full"
                style={{
                  background: 'var(--color-primary)',
                  color: 'var(--color-text-on-primary, #fff)',
                  fontSize: '17px',
                  padding: '16px'
                }}
              >
                {saving ? 'Setting up your profile…' : "Let's go"}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

function SchoolCard({ school, onSelect }) {
  const [hovered, setHovered] = useState(false)
  const [selected, setSelected] = useState(false)

  function handleClick() {
    setSelected(true)
    setTimeout(onSelect, 220)
  }

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered || selected
          ? `linear-gradient(135deg, color-mix(in srgb, ${school.primaryColor} 15%, #181424), #181424)`
          : 'linear-gradient(145deg, #181424, #120f1c)',
        border: `1px solid ${hovered || selected ? `color-mix(in srgb, ${school.primaryColor} 50%, transparent)` : 'rgba(255,255,255,0.07)'}`,
        borderTop: `2px solid ${hovered || selected ? school.primaryColor : 'rgba(255,255,255,0.07)'}`,
        borderRadius: '12px',
        padding: '14px 12px',
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'all 200ms ease',
        transform: hovered ? 'translateY(-3px)' : selected ? 'scale(0.97)' : 'none',
        outline: 'none',
        boxShadow: hovered ? `0 8px 24px rgba(0,0,0,0.4), 0 0 20px color-mix(in srgb, ${school.primaryColor} 15%, transparent)` : 'none'
      }}
    >
      <div style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: '18px',
        letterSpacing: '1.5px',
        color: hovered ? '#FFFFFF' : '#F0EAFB',
        lineHeight: 1.1,
        marginBottom: '4px'
      }}>
        {school.shortName}
      </div>
      {school.mascot && (
        <div style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '7px',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          color: hovered ? school.primaryColor : 'rgba(240,234,248,0.3)',
          transition: 'color 200ms ease'
        }}>
          {school.mascot}
        </div>
      )}
      <div style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: '7px',
        letterSpacing: '1px',
        textTransform: 'uppercase',
        color: 'rgba(240,234,248,0.22)',
        marginTop: '2px'
      }}>
        {school.conference}
      </div>
    </button>
  )
}

function UndecidedCard({ onSelect }) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="col-span-2 sm:col-span-3"
      style={{
        background: hovered ? '#1A1525' : '#13101A',
        border: '1px dashed rgba(255,255,255,0.15)',
        borderRadius: '10px',
        padding: '20px 24px',
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'all 200ms ease',
        outline: 'none'
      }}
    >
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '20px', letterSpacing: '2px', color: 'rgba(240,234,248,0.6)' }}>
        I'm still deciding
      </div>
      <div style={{ fontSize: '13px', color: 'rgba(240,234,248,0.35)', marginTop: '4px' }}>
        Train toward the standard. Choose your school when you're ready.
      </div>
    </button>
  )
}

function AcademicField({ label, value, onChange, placeholder, inputMode }) {
  return (
    <div>
      <label style={{ display: 'block', fontFamily: "'Space Mono', monospace", fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(240,234,248,0.4)', marginBottom: '8px' }}>
        {label}
      </label>
      <input
        type="text"
        inputMode={inputMode}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', background: '#1A1525', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '10px', padding: '14px 16px', color: '#F0EAFB', fontSize: '18px',
          fontFamily: "'DM Sans', sans-serif", outline: 'none'
        }}
        onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
      />
    </div>
  )
}

function SummaryRow({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between">
      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(240,234,248,0.4)' }}>
        {label}
      </span>
      <span style={{ fontWeight: 600, fontSize: '15px', color: highlight ? 'var(--color-primary)' : '#F0EAFB' }}>
        {value}
      </span>
    </div>
  )
}
