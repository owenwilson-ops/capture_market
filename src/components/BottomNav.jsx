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
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden nav-bar">
        <div className="flex">
          {tabs.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-all duration-200"
              style={({ isActive }) => isActive
                ? { color: 'var(--color-primary)', filter: `drop-shadow(0 0 6px var(--color-primary))` }
                : { color: 'rgba(240,234,248,0.3)' }
              }
            >
              {({ isActive }) => (
                <>
                  <div style={{ position: 'relative' }}>
                    <Icon size={22} />
                    {isActive && (
                      <div style={{
                        position: 'absolute', bottom: '-6px', left: '50%', transform: 'translateX(-50%)',
                        width: '4px', height: '4px', borderRadius: '50%',
                        background: 'var(--color-primary)',
                        boxShadow: '0 0 6px var(--color-primary)'
                      }} />
                    )}
                  </div>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '4px' }}>
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
        <div style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
      </nav>

      {/* Sidebar — desktop */}
      <nav className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-50 w-20 nav-sidebar">
        <div className="flex flex-col items-center pt-8 gap-1">
          {tabs.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl w-16 transition-all duration-200"
              style={({ isActive }) => isActive
                ? {
                    color: 'var(--color-primary)',
                    background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
                    filter: `drop-shadow(0 0 8px color-mix(in srgb, var(--color-primary) 60%, transparent))`
                  }
                : { color: 'rgba(240,234,248,0.3)' }
              }
            >
              <Icon size={22} />
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '7px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                {label}
              </span>
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  )
}
