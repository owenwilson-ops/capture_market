import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useProfile } from '../hooks/useProfile'
import { supabase } from '../lib/supabase'
import { IconChevronDown } from '../components/Icons'

const LIFE_LESSONS = [
  {
    title: "Discipline Over Motivation",
    preview: "The training is showing up when there's no feeling behind it.",
    content: "Motivation is a weather condition — unpredictable, temporary, and unreliable as a training foundation. What your daughter is building is something more durable: the habit of beginning regardless of readiness. She is learning that action precedes feeling, not the other way around.",
    largerLesson: "Adults who succeed in complex careers, relationships, and personal growth operate on the same principle. They have long since stopped waiting to feel ready. Discipline is the skill of choosing behavior independently of internal state. She is building that now."
  },
  {
    title: "Delayed Gratification",
    preview: "The reps today don't pay off until next season.",
    content: "Wall ball on a Tuesday in October produces nothing visible that day. The benefit arrives months later, in a game that hasn't been played yet, in a moment she can't predict. She is learning to invest in a future she can't see and trust a process she can't fully control.",
    largerLesson: "The ability to act today for a return that arrives later — without needing immediate feedback — is one of the most transferable cognitive capacities a young person can develop. Finance, health, relationships, and career all reward this same skill. She is practicing it every time she shows up."
  },
  {
    title: "Identity Through Personal Standards",
    preview: "The non-negotiables aren't just rules — they're a statement about who she is.",
    content: "The five non-negotiables exist to give her a clear standard she holds herself to independent of coaches, teammates, or performance outcomes. When she follows them, she is reinforcing an identity: she is the kind of athlete who does the work regardless of circumstances. That identity becomes load-bearing.",
    largerLesson: "People who maintain their standards through difficulty have a more stable foundation under adversity than those whose behavior is dictated by external feedback. She is constructing that internal structure now. The standards she internalizes at 16 will still be running at 36."
  },
  {
    title: "Resilience in the Face of Failure",
    preview: "Bad sessions are not setbacks. They are part of the protocol.",
    content: "She will have sessions that don't work, evaluations that go poorly, coaches who don't see what you see. This is not dysfunction — it is the expected cost of pursuing something real. How she responds to those moments is being built through the training itself. Every incomplete session she returns from teaches a response pattern.",
    largerLesson: "The single most predictive variable for long-term success is not talent or opportunity — it is response to failure. Your role is to let her experience the failure and watch her recover. Intervening to protect her from disappointment removes the very stimulus that builds resilience."
  },
  {
    title: "The Power of a Goal Larger Than the Present Moment",
    preview: "Having a dream school isn't just about lacrosse.",
    content: "The dream school is a proxy for something deeper: a self-concept that extends beyond today's circumstances. When your daughter trains toward a specific program, she is practicing the skill of subordinating present discomfort to a future image of herself. That is an enormously useful mental skill to have before she turns 18.",
    largerLesson: "Young adults who have experienced goal-directed effort over a multi-year period — and have seen it pay off — carry a different orientation into adulthood. They understand that sustained effort compounds. They have evidence that it works. That evidence came from her training."
  },
  {
    title: "Competing with Humility",
    preview: "The best athletes are always students.",
    content: "Elite lacrosse culture at the Division I level rewards players who are coachable, self-aware, and willing to be corrected. The athletes who plateau are usually the ones who stop accepting instruction. What she is building through this process — logging reps, studying deficiencies, executing a structured protocol — is a learner's posture.",
    largerLesson: "The world increasingly rewards people who can stay curious and open to correction in high-stakes environments. Arrogance is a ceiling. Intellectual humility is a compounding advantage. She is practicing that orientation every time she takes feedback and gets back on the wall."
  }
]

const PARENT_ROLES = [
  {
    title: "Protect the Routine, Not the Comfort",
    content: "Your job is not to make training easier — it is to make training possible. That means protecting her schedule from fragmentation, defending her sleep window, and creating conditions where the work can happen. It does not mean stepping in when the work is hard."
  },
  {
    title: "Remain Off the Coaching",
    content: "You are not her coach. The moment you become a second coaching voice, you divide her attention and create a conflict between external authorities she cannot resolve. Your job is logistical and emotional support. The technical direction belongs entirely to her coaches and to her."
  },
  {
    title: "Help Manage the Calendar Thoughtfully",
    content: "Volume of activity is not the same as quality of development. Be willing to say no to events, tournaments, and commitments that don't serve the goal. Elite development requires focused repetition over time, not maximum exposure. Help her build depth, not just breadth."
  },
  {
    title: "Sustain the Vision on the Difficult Days",
    content: "There will be days she doesn't want to do it. Your role on those days is not to force the session — it is to quietly hold the larger picture and reflect it back when asked. Ask what she wants, not what you want for her. The goal is self-motivation, not compliance."
  },
  {
    title: "Celebrate the Process, Not Only the Results",
    content: "Results-only feedback trains your daughter to tie her self-worth to outcomes she can't fully control. Process feedback — noticing consistency, effort, coachability, recovery — builds the internal reinforcement system that sustains performance over the long arc of a career."
  }
]

export default function ParentHome() {
  const { user } = useAuth()
  const { profile } = useProfile(user?.id)
  const [expanded, setExpanded] = useState(null)
  const [weekStats, setWeekStats] = useState({ streak: 0, sessions: 0, nonNegs: 0 })

  useEffect(() => {
    if (!user) return
    async function loadStats() {
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      weekStart.setHours(0, 0, 0, 0)

      const [streakRes, sessRes, nnRes] = await Promise.all([
        supabase.from('streaks').select('date, completed').eq('userId', user.id).eq('completed', true).order('date', { ascending: false }),
        supabase.from('sessionLogs').select('*', { count: 'exact', head: true }).eq('userId', user.id).gte('completedAt', weekStart.toISOString()),
        supabase.from('streaks').select('nonNegotiablesChecked').eq('userId', user.id).gte('date', weekStart.toISOString().slice(0, 10))
      ])

      let streak = 0
      if (streakRes.data) {
        let d = new Date()
        for (const row of streakRes.data) {
          const diff = Math.floor((d - new Date(row.date)) / 86400000)
          if (diff <= 1) { streak++; d = new Date(row.date) } else break
        }
      }

      const totalNNs = (nnRes.data || []).reduce((sum, r) => sum + (r.nonNegotiablesChecked?.length || 0), 0)

      setWeekStats({ streak, sessions: sessRes.count || 0, nonNegs: totalNNs })
    }
    loadStats()
  }, [user])

  return (
    <div className="min-h-screen px-4 py-8 max-w-lg mx-auto">

      {/* Parent mode banner */}
      <div style={{
        background: 'color-mix(in srgb, var(--color-primary) 12%, #1A1525)',
        border: '1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)',
        borderRadius: '8px',
        padding: '10px 16px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--color-primary)' }}>
          Parent Mode Active
        </span>
      </div>

      <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '40px', letterSpacing: '2px', color: '#F0EAFB', lineHeight: 1, marginBottom: '8px' }}>
        What This Builds in {profile?.name || 'Your Athlete'}
      </h1>
      <p style={{ color: 'rgba(240,234,248,0.5)', fontSize: '14px', marginBottom: '28px' }}>
        Behind the drills and timers, something larger is being developed.
      </p>

      {/* Life lessons */}
      <div className="flex flex-col gap-3 mb-10">
        {LIFE_LESSONS.map((lesson, i) => {
          const isOpen = expanded === `lesson-${i}`
          return (
            <div key={i} style={{ background: '#13101A', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', overflow: 'hidden' }}>
              <button
                onClick={() => setExpanded(isOpen ? null : `lesson-${i}`)}
                style={{
                  width: '100%', background: 'none', border: 'none', padding: '20px',
                  textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '15px', color: '#F0EAFB', marginBottom: '4px' }}>{lesson.title}</div>
                  {!isOpen && <div style={{ fontSize: '13px', color: 'rgba(240,234,248,0.5)' }}>{lesson.preview}</div>}
                </div>
                <IconChevronDown size={16} style={{ color: 'rgba(240,234,248,0.4)', flexShrink: 0, marginTop: '3px', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 200ms ease' }} />
              </button>
              {isOpen && (
                <div style={{ padding: '0 20px 20px' }}>
                  <p style={{ fontSize: '14px', color: 'rgba(240,234,248,0.6)', lineHeight: 1.7, marginBottom: '16px' }}>
                    {lesson.content}
                  </p>
                  <div style={{ background: '#1A1525', borderLeft: '3px solid var(--color-primary)', borderRadius: '0 8px 8px 0', padding: '14px 16px' }}>
                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: '8px' }}>
                      The Larger Lesson
                    </div>
                    <p style={{ fontSize: '13px', color: 'rgba(240,234,248,0.6)', lineHeight: 1.7 }}>
                      {lesson.largerLesson}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Your Role */}
      <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '30px', letterSpacing: '2px', color: '#F0EAFB', marginBottom: '16px' }}>
        Your Role
      </h2>
      <div className="flex flex-col gap-3 mb-10">
        {PARENT_ROLES.map((role, i) => (
          <div key={i} style={{
            background: '#13101A',
            border: '1px solid rgba(255,255,255,0.07)',
            borderLeft: '3px solid var(--color-primary)',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <div style={{ fontWeight: 600, fontSize: '15px', color: '#F0EAFB', marginBottom: '8px' }}>{role.title}</div>
            <p style={{ fontSize: '13px', color: 'rgba(240,234,248,0.6)', lineHeight: 1.7 }}>{role.content}</p>
          </div>
        ))}
      </div>

      {/* This Week's Activity */}
      <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '30px', letterSpacing: '2px', color: '#F0EAFB', marginBottom: '16px' }}>
        This Week's Activity
      </h2>
      <div style={{ background: '#13101A', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '20px', marginBottom: '8px' }}>
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: weekStats.streak, label: 'Day Streak' },
            { value: weekStats.sessions, label: 'Sessions' },
            { value: weekStats.nonNegs, label: 'Non-Negs Logged' }
          ].map(({ value, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '38px', color: 'var(--color-primary)', lineHeight: 1 }}>{value}</div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(240,234,248,0.4)', marginTop: '4px' }}>{label}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '11px', color: 'rgba(240,234,248,0.3)', textAlign: 'center', marginTop: '16px' }}>
          Read-only view. Progress is logged by the athlete.
        </p>
      </div>
    </div>
  )
}
