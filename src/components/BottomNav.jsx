import { NavLink } from 'react-router-dom'
import { IconHome, IconTrain, IconSchools, IconRoadmap, IconProfile } from './Icons'

const tabs = [
  { to: '/home', label: 'Home', Icon: IconHome },
  { to: '/train', label: 'Train', Icon: IconTrain },
  { to: '/schools', label: 'Schools', Icon: IconSchools },
  { to: '/roadmap', label: 'Roadmap', Icon: IconRoadmap },
  { to: '/profile', label: 'Profile', Icon: IconProfile },
]

export default function BottomNav() {
  return (
    <>
      {/* Bottom nav — mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
        style={{ background: '#13101A', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex">
          {tabs.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-colors duration-200 ${
                  isActive ? 'text-primary' : ''
                }`
              }
              style={({ isActive }) => isActive ? { color: 'var(--color-primary)' } : { color: 'rgba(240,234,248,0.4)' }}
            >
              <Icon size={22} />
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                {label}
              </span>
            </NavLink>
          ))}
        </div>
        {/* Safe area for iPhone home bar */}
        <div style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
      </nav>

      {/* Sidebar — desktop */}
      <nav className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-50 w-20"
        style={{ background: '#13101A', borderRight: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex flex-col items-center pt-8 gap-2">
          {tabs.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className="flex flex-col items-center gap-1.5 p-3 rounded-lg w-16 transition-all duration-200"
              style={({ isActive }) => isActive
                ? { color: 'var(--color-primary)', background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)' }
                : { color: 'rgba(240,234,248,0.4)' }
              }
            >
              <Icon size={22} />
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                {label}
              </span>
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  )
}
