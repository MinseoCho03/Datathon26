const TABS = [
  {
    id: 'map',
    label: 'Follow the Money',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
  },
  {
    id: 'projects',
    label: 'Discover Projects',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
  },
  {
    id: 'history',
    label: 'Foundation Funding History',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  {
    id: 'network',
    label: 'Coverage Map',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="7" r="3"/><circle cx="18" cy="7" r="3"/><circle cx="12" cy="17" r="3"/>
        <path d="M8.7 8.5 10.5 14"/><path d="m15.3 8.5-1.8 5.5"/><path d="M9 7h6"/>
      </svg>
    ),
  },
  {
    id: 'simulator',
    label: 'Strategy Simulator',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  },
]

const S = {
  aside: (collapsed) => ({
    width: collapsed ? 64 : 220,
    flexShrink: 0,
    background: '#070f1c',
    borderRight: '1px solid rgba(255,255,255,0.07)',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    position: 'sticky',
    top: 0,
    transition: 'width 0.2s ease',
    overflow: 'hidden',
    zIndex: 10,
  }),
  brand: (collapsed) => ({
    padding: collapsed ? '18px 0' : '18px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    justifyContent: collapsed ? 'center' : 'flex-start',
    minHeight: 64,
    flexShrink: 0,
  }),
  brandMark: {
    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
    background: 'linear-gradient(135deg,#2366c9,#0d846a)',
    display: 'grid', placeItems: 'center',
    fontSize: 11, fontWeight: 800, color: '#fff',
  },
  navItem: (active, collapsed) => ({
    display: 'flex',
    alignItems: 'center',
    gap: collapsed ? 0 : 10,
    padding: collapsed ? '10px 0' : '9px 12px',
    justifyContent: collapsed ? 'center' : 'flex-start',
    borderRadius: 8,
    marginBottom: 2,
    cursor: 'pointer',
    border: 'none',
    width: '100%',
    textAlign: 'left',
    background: active ? 'rgba(35,102,201,0.2)' : 'transparent',
    borderLeft: active ? '2px solid #2366c9' : '2px solid transparent',
    color: active ? '#fff' : '#94a3b8',
    fontWeight: active ? 600 : 400,
    fontSize: 13,
    transition: 'background 0.12s, color 0.12s',
  }),
}

export default function Sidebar({ page, onNavigate, collapsed, onToggle }) {
  return (
    <aside style={S.aside(collapsed)}>
      {/* Brand */}
      <div style={S.brand(collapsed)}>
        <div style={S.brandMark}>FS</div>
        {!collapsed && (
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>First Spark</div>
            <div style={{ fontSize: 11, color: '#475569', whiteSpace: 'nowrap' }}>Funder dashboard</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ padding: '12px 8px' }}>
        {!collapsed && (
          <div style={{ fontSize: 10, fontWeight: 600, color: '#334155', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 6px 8px', whiteSpace: 'nowrap' }}>
            Funder Portal
          </div>
        )}
        {TABS.map(({ id, label, icon }) => {
          const active = page === id
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              title={collapsed ? label : undefined}
              style={S.navItem(active, collapsed)}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#c8dff2' } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8' } }}
            >
              <span style={{ flexShrink: 0, display: 'flex' }}>{icon}</span>
              {!collapsed && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>}
            </button>
          )
        })}
      </nav>

      {/* Collapse toggle — placed right after nav so it's always accessible */}
      <button
        onClick={onToggle}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        style={{
          margin: '0 8px 8px', padding: collapsed ? '10px 0' : '9px 12px',
          borderRadius: 8, border: '1px solid rgba(35,102,201,0.4)',
          background: 'rgba(35,102,201,0.15)', color: '#60a5fa',
          cursor: 'pointer', display: 'flex', alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          gap: 8, flexShrink: 0, width: 'calc(100% - 16px)',
          fontSize: 12, fontWeight: 500,
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          {collapsed
            ? <><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></>
            : <><polyline points="11 17 6 12 11 7"/><polyline points="18 17 13 12 18 7"/></>}
        </svg>
        {!collapsed && <span>Collapse</span>}
      </button>

      <div style={{ flex: 1 }} />
    </aside>
  )
}
