import { useState, useMemo } from 'react'

function fmt(v) {
  v = Number(v || 0)
  if (v >= 1000) return `$${(v/1000).toFixed(1)}B`
  if (v >= 1)    return `$${v.toFixed(1)}M`
  return `$${Math.round(v*1000)}K`
}

const SECTOR_COLORS = {
  'Health':             '#34d399',
  'Education':          '#60a5fa',
  'Agriculture':        '#f59e0b',
  'Financial Services': '#a78bfa',
  'Social Services':    '#fb923c',
  'Gov & Civil Society':'#22d3ee',
  'Reproductive Health':'#f472b6',
  'Environment':        '#4ade80',
  'Emergency Response': '#f87171',
  'Energy':             '#fbbf24',
}
function sectorColor(s) { return SECTOR_COLORS[s] || '#94a3b8' }

function Badge({ label, color }) {
  return (
    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600, background: `${color}22`, color, border: `1px solid ${color}44`, whiteSpace: 'nowrap' }}>
      {label}
    </span>
  )
}

function ProjectCard({ p }) {
  const [expanded, setExpanded] = useState(false)
  const color = sectorColor(p.sector)
  return (
    <div style={{ background: '#0f1e31', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10, cursor: 'pointer' }}
      onClick={() => setExpanded(e => !e)}>
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <Badge label={p.sector} color={color} />
          {p.year && <Badge label={String(p.year)} color="#475569" />}
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#34d399', whiteSpace: 'nowrap', flexShrink: 0 }}>{fmt(p.amount)}</span>
      </div>

      {/* Title */}
      <p style={{ fontSize: 13, fontWeight: 600, color: '#e2eaf4', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: expanded ? 'none' : 2, WebkitBoxOrient: 'vertical', overflow: expanded ? 'visible' : 'hidden' }}>
        {p.title}
      </p>

      {/* Meta */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <p style={{ fontSize: 11, color: '#64748b' }}>
          <span style={{ color: '#94a3b8' }}>{p.org}</span>
          {p.donorCountry && <span style={{ color: '#475569' }}> · {p.donorCountry}</span>}
        </p>
        <p style={{ fontSize: 11, color: '#475569' }}>
          {p.country}{p.region ? ` · ${p.region}` : ''}
          {p.subsector ? <span style={{ color: '#334155' }}> · {p.subsector}</span> : null}
        </p>
        {p.duration && <p style={{ fontSize: 11, color: '#334155' }}>{p.duration}</p>}
      </div>

      {/* Description */}
      <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: expanded ? 'none' : 2, WebkitBoxOrient: 'vertical', overflow: expanded ? 'visible' : 'hidden' }}>
        {p.description}
      </p>

      {expanded && p.flowType && (
        <p style={{ fontSize: 10, color: '#334155' }}>Flow type: {p.flowType}</p>
      )}
    </div>
  )
}

const PAGE_SIZE = 30

export default function ProjectsPage({ data, projects: projectsProp, projectsLoading }) {
  const projects = projectsProp || []
  const [search, setSearch]       = useState('')
  const [sector, setSector]       = useState('All')
  const [donor, setDonor]         = useState('All')
  const [year, setYear]           = useState('All')
  const [region, setRegion]       = useState('All')
  const [page, setPage]           = useState(0)

  const sectors  = useMemo(() => ['All', ...new Set(projects.map(p => p.sector).filter(Boolean).sort())], [projects])
  const donors   = useMemo(() => ['All', ...new Set(projects.map(p => p.donorCountry).filter(Boolean).sort())], [projects])
  const years    = useMemo(() => ['All', ...new Set(projects.map(p => p.year).filter(Boolean).sort().reverse().map(String))], [projects])
  const regions  = useMemo(() => ['All', ...new Set(projects.map(p => p.regionMacro).filter(Boolean).sort())], [projects])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return projects.filter(p => {
      if (sector !== 'All' && p.sector !== sector) return false
      if (donor  !== 'All' && p.donorCountry !== donor) return false
      if (year   !== 'All' && String(p.year) !== year) return false
      if (region !== 'All' && p.regionMacro !== region) return false
      if (q && !`${p.title} ${p.org} ${p.country} ${p.description}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [projects, search, sector, donor, year, region])

  const visible = filtered.slice(0, (page + 1) * PAGE_SIZE)

  const resetPage = () => setPage(0)

  const selStyle = { background: '#0f1e31', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#c8dff2', padding: '7px 10px', fontSize: 12, outline: 'none', width: '100%' }

  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Search + filters */}
      <div style={{ background: '#0f1e31', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '14px 16px', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: '1 1 200px' }}>
          <p style={{ fontSize: 11, color: '#475569', marginBottom: 4 }}>Search</p>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); resetPage() }}
            placeholder="Title, org, country…"
            style={{ ...selStyle, width: '100%' }}
          />
        </div>
        {[
          { label: 'Sector',  val: sector,  set: v => { setSector(v);  resetPage() }, opts: sectors  },
          { label: 'Donor',   val: donor,   set: v => { setDonor(v);   resetPage() }, opts: donors   },
          { label: 'Year',    val: year,    set: v => { setYear(v);    resetPage() }, opts: years    },
          { label: 'Region',  val: region,  set: v => { setRegion(v);  resetPage() }, opts: regions  },
        ].map(({ label, val, set, opts }) => (
          <div key={label} style={{ flex: '1 1 120px' }}>
            <p style={{ fontSize: 11, color: '#475569', marginBottom: 4 }}>{label}</p>
            <select value={val} onChange={e => set(e.target.value)} style={selStyle}>
              {opts.map(o => <option key={o} value={o} style={{ background: '#0b1829' }}>{o}</option>)}
            </select>
          </div>
        ))}
        <div style={{ alignSelf: 'flex-end' }}>
          <p style={{ fontSize: 11, color: '#334155' }}>{filtered.length.toLocaleString()} of {projects.length.toLocaleString()} projects</p>
        </div>
      </div>

      {/* Grid */}
      {projectsLoading && projects.length === 0 ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60, gap: 12, color: '#475569', fontSize: 13 }}>
          <div style={{ width: 18, height: 18, border: '2px solid #2366c9', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
          Loading {(31366).toLocaleString()} projects…
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
          {visible.map(p => <ProjectCard key={p.id} p={p} />)}
        </div>
      )}

      {visible.length < filtered.length && (
        <button
          onClick={() => setPage(p => p + 1)}
          style={{ alignSelf: 'center', padding: '10px 28px', background: 'rgba(35,102,201,0.15)', border: '1px solid rgba(35,102,201,0.3)', borderRadius: 8, color: '#60a5fa', fontSize: 13, cursor: 'pointer' }}>
          Load more ({filtered.length - visible.length} remaining)
        </button>
      )}

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: '#334155', fontSize: 13 }}>No projects match these filters.</div>
      )}
    </div>
  )
}
