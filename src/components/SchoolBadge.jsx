// Displayed in headers across the app when a school is selected
export default function SchoolBadge({ school, size = 'sm' }) {
  if (!school || school.id === 'undecided') return null

  const isLg = size === 'lg'

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: isLg ? '10px' : '7px',
      background: `color-mix(in srgb, ${school.primaryColor} 10%, rgba(255,255,255,0.04))`,
      border: `1px solid color-mix(in srgb, ${school.primaryColor} 30%, transparent)`,
      borderRadius: '20px',
      padding: isLg ? '8px 16px 8px 10px' : '5px 12px 5px 8px',
    }}>
      {/* Color dot */}
      <div style={{
        width: isLg ? '10px' : '7px',
        height: isLg ? '10px' : '7px',
        borderRadius: '50%',
        background: school.primaryColor,
        boxShadow: `0 0 ${isLg ? '10px' : '6px'} ${school.primaryColor}`,
        flexShrink: 0
      }} />
      <div>
        <div style={{
          fontSize: isLg ? '14px' : '12px',
          fontWeight: 600,
          color: 'rgba(240,234,248,0.85)',
          lineHeight: 1.1
        }}>
          {school.name}
        </div>
        {isLg && school.mascot && (
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '9px',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            color: school.primaryColor,
            marginTop: '2px'
          }}>
            {school.mascot} · {school.conference}
          </div>
        )}
        {!isLg && (
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '8px',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            color: `color-mix(in srgb, ${school.primaryColor} 80%, rgba(240,234,248,0.4))`,
            marginTop: '1px'
          }}>
            {school.mascot} · {school.conference}
          </div>
        )}
      </div>
    </div>
  )
}
