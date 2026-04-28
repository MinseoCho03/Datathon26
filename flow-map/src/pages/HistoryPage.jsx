import { useState, useMemo, useRef, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

function fmt(v) {
  v = Number(v || 0)
  if (v >= 1000) return `$${(v/1000).toFixed(1)}B`
  if (v >= 1)    return `$${v.toFixed(1)}M`
  return `$${Math.round(v*1000)}K`
}

const COLORS = ['#60a5fa','#34d399','#f59e0b','#f472b6','#a78bfa','#fb923c','#22d3ee','#4ade80']

const TT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#0b1829', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#c8dff2' }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{label || payload[0]?.name}</div>
      {payload.map(p => <div key={p.name} style={{ color: p.color || '#c8dff2' }}>{p.name ? `${p.name}: ` : ''}{fmt(p.value)}</div>)}
    </div>
  )
}

function BarList({ data, colorFn, single }) {
  const max = Math.max(...data.map(d => d.amount), 1)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '2px 0' }}>
      {data.map((d, i) => (
        <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 130, fontSize: 11, color: '#64748b', textAlign: 'right', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={d.name}>
            {d.name}
          </span>
          <div style={{ flex: 1, height: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 3 }}>
            <div style={{ width: `${(d.amount / max) * 100}%`, height: '100%', background: colorFn ? colorFn(i) : single, borderRadius: '0 3px 3px 0', minWidth: 2 }} />
          </div>
          <span style={{ fontSize: 10, color: '#475569', width: 46, flexShrink: 0 }}>{fmt(d.amount)}</span>
        </div>
      ))}
    </div>
  )
}

function ChartCard({ title, sub, children }) {
  return (
    <div style={{ background: '#0f1e31', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '16px 18px' }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#c8dff2', marginBottom: 2 }}>{title}</p>
      {sub && <p style={{ fontSize: 11, color: '#475569', marginBottom: 14 }}>{sub}</p>}
      {children}
    </div>
  )
}

function ProjectList({ projects }) {
  return (
    <div style={{ maxHeight: 420, overflowY: 'auto', paddingRight: 4, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {projects.map(p => (
        <div key={p.id} style={{ background: '#0b1829', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '12px 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#e2eaf4', lineHeight: 1.35, marginBottom: 5 }}>
                {p.title || 'Untitled funded project'}
              </p>
              <p style={{ fontSize: 11, color: '#64748b', lineHeight: 1.5 }}>
                {p.country || 'Unknown country'} · {p.sector || 'Unspecified'} · {p.year || '—'}
              </p>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#34d399', whiteSpace: 'nowrap', flexShrink: 0 }}>{fmt(p.amount)}</span>
          </div>
          {p.description && (
            <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.5, marginTop: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {p.description}
            </p>
          )}
          {p.subsector && (
            <p style={{ fontSize: 10, color: '#334155', marginTop: 7 }}>{p.subsector}</p>
          )}
        </div>
      ))}
    </div>
  )
}

function Kpi({ label, value, sub }) {
  return (
    <div style={{ background: '#0f1e31', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '14px 18px' }}>
      <p style={{ fontSize: 11, color: '#475569', marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 20, fontWeight: 700, color: '#e2eaf4' }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: '#334155', marginTop: 3 }}>{sub}</p>}
    </div>
  )
}

function OrgSearch({ orgList, value, onChange }) {
  const [query, setQuery] = useState(value)
  const [open, setOpen]   = useState(false)
  const ref               = useRef(null)

  useEffect(() => { setQuery(value) }, [value])

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return orgList.slice(0, 12)
    return orgList.filter(o => o.org.toLowerCase().includes(q)).slice(0, 12)
  }, [query, orgList])

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative', width: 320 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#070f1c', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 7, padding: '7px 12px' }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder="Search organization…"
          style={{ background: 'none', border: 'none', outline: 'none', color: '#c8dff2', fontSize: 13, width: '100%' }}
        />
        {query && (
          <button onClick={() => { setQuery(''); setOpen(true) }} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', padding: 0, fontSize: 14, lineHeight: 1 }}>×</button>
        )}
      </div>
      {open && matches.length > 0 && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: '#0f1e31', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, overflow: 'hidden', zIndex: 200, boxShadow: '0 8px 24px rgba(0,0,0,0.5)', maxHeight: 260, overflowY: 'auto' }}>
          {matches.map(o => (
            <button key={o.org} onClick={() => { onChange(o.org); setQuery(o.org); setOpen(false) }}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', textAlign: 'left', padding: '8px 14px', background: 'none', border: 'none', color: '#c8dff2', fontSize: 12, cursor: 'pointer', gap: 8 }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.org}</span>
              <span style={{ color: '#475569', fontSize: 11, flexShrink: 0 }}>{fmt(o.amount)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function HistoryPage({ data, projects, projectsLoading, initialOrg }) {
  const [selectedOrg, setSelectedOrg] = useState(initialOrg || 'BBVAMF')
  const [projectYear, setProjectYear] = useState('All')
  const [projectSearch, setProjectSearch] = useState('')

  useEffect(() => {
    setProjectYear('All')
    setProjectSearch('')
  }, [selectedOrg])

  const orgList = useMemo(() => {
    if (!projects) return []
    const m = {}
    projects.forEach(p => { if (p.org) m[p.org] = (m[p.org] || 0) + p.amount })
    return Object.entries(m).map(([org, amount]) => ({ org, amount })).sort((a, b) => b.amount - a.amount)
  }, [projects])

  const orgStats = useMemo(() => {
    if (!projects) return null
    const orgProjects = projects.filter(p => p.org === selectedOrg)
    if (!orgProjects.length) return null

    const yearM = {}, sectorM = {}, countryM = {}, regionM = {}, donorM = {}
    orgProjects.forEach(p => {
      yearM[p.year] = (yearM[p.year] || 0) + p.amount
      if (p.sector && p.sector !== 'Unspecified') sectorM[p.sector] = (sectorM[p.sector] || 0) + p.amount
      if (p.country)     countryM[p.country]     = (countryM[p.country]     || 0) + p.amount
      if (p.regionMacro) regionM[p.regionMacro]  = (regionM[p.regionMacro]  || 0) + p.amount
      if (p.donorCountry) donorM[p.donorCountry] = (donorM[p.donorCountry]  || 0) + p.amount
    })
    const years = Object.keys(yearM).map(Number).sort((a, b) => a - b)
    const total = orgProjects.reduce((s, p) => s + p.amount, 0)
    const topDonorCountry = Object.entries(donorM).sort((a, b) => b[1] - a[1])[0]?.[0] || ''
    const availableYearLabel = years.length > 1 ? `${years[0]}–${years[years.length - 1]}` : String(years[0] || '—')
    return {
      total,
      yearTrend:  years.map(yr => ({ year: yr, amount: yearM[yr] || 0 })),
      bySector:   Object.entries(sectorM).map(([sector, amount]) => ({ sector, amount })).sort((a,b) => b.amount-a.amount).slice(0, 8),
      byCountry:  Object.entries(countryM).map(([country, amount]) => ({ country, amount })).sort((a,b) => b.amount-a.amount).slice(0, 12),
      byRegion:   Object.entries(regionM).map(([region, amount]) => ({ region, amount })).sort((a,b) => b.amount-a.amount),
      projects:    [...orgProjects].sort((a, b) => (b.year || 0) - (a.year || 0) || (b.amount || 0) - (a.amount || 0)),
      projectCount: orgProjects.length,
      donorCountry: topDonorCountry,
      availableYearLabel,
    }
  }, [projects, selectedOrg])

  const yearTrend = orgStats?.yearTrend || []
  const bySector  = (orgStats?.bySector  || []).map(s => ({ name: s.sector,  amount: s.amount }))
  const byCountry = (orgStats?.byCountry || []).map(c => ({ name: c.country, amount: c.amount }))
  const byRegion  = (orgStats?.byRegion  || []).map(r => ({ name: r.region,  amount: r.amount }))
  const projectYears = useMemo(() =>
    ['All', ...[...new Set((orgStats?.projects || []).map(p => p.year).filter(Boolean))].sort((a, b) => b - a)],
  [orgStats])
  const filteredProjects = useMemo(() => {
    const q = projectSearch.trim().toLowerCase()
    return (orgStats?.projects || []).filter(p => {
      if (projectYear !== 'All' && String(p.year) !== String(projectYear)) return false
      if (!q) return true
      return `${p.title || ''} ${p.description || ''} ${p.country || ''} ${p.sector || ''} ${p.subsector || ''}`.toLowerCase().includes(q)
    })
  }, [orgStats, projectYear, projectSearch])

  const delta = useMemo(() => {
    if (yearTrend.length < 2) return null
    const first = yearTrend[0].amount, last = yearTrend[yearTrend.length - 1].amount
    const pct = first ? Math.round(((last - first) / first) * 100) : 0
    return { pct, dir: pct >= 0 ? '+' : '' }
  }, [yearTrend])

  const initials = selectedOrg.split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?'

  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Org selector banner */}
      <div style={{ background: 'rgba(35,102,201,0.08)', border: '1px solid rgba(35,102,201,0.2)', borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#2366c9,#0d846a)', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 800, color: '#fff', flexShrink: 0 }}>{initials}</div>
        <div style={{ flex: 1, minWidth: 220 }}>
          <p style={{ fontSize: 11, color: '#475569', marginBottom: 6 }}>Viewing disbursements for</p>
          {projectsLoading && !projects ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#475569', fontSize: 12 }}>
              <div style={{ width: 12, height: 12, border: '2px solid #2366c9', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              Loading organizations…
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </div>
          ) : (
            <OrgSearch orgList={orgList} value={selectedOrg} onChange={setSelectedOrg} />
          )}
        </div>
        {orgStats && (
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <p style={{ fontSize: 11, color: '#475569' }}>Grants</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#c8dff2' }}>{orgStats.projectCount.toLocaleString()}</p>
            {orgStats.donorCountry && <p style={{ fontSize: 11, color: '#334155' }}>{orgStats.donorCountry}</p>}
          </div>
        )}
      </div>

      {!orgStats ? (
        <div style={{ textAlign: 'center', padding: 48, color: '#334155', fontSize: 13 }}>
          No grant data found for <strong style={{ color: '#64748b' }}>{selectedOrg}</strong> in this dataset.
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
            <Kpi label="Total Disbursed"     value={fmt(orgStats.total)}       sub={orgStats.availableYearLabel || 'Reported years'} />
            <Kpi label="Annual Average"      value={fmt(orgStats.total / Math.max(yearTrend.length, 1))}   sub={`Across ${yearTrend.length || 0} reported year${yearTrend.length === 1 ? '' : 's'}`} />
            <Kpi label="Recipient Countries" value={orgStats.byCountry.length} sub="Mapped countries" />
            <Kpi label="Trend"               value={delta ? `${delta.dir}${delta.pct}%` : '—'} sub={`${yearTrend[0]?.year || '—'} → ${yearTrend[yearTrend.length-1]?.year || '—'}`} />
          </div>

          {/* Year trend */}
          <ChartCard title="Annual Disbursements" sub={`Total per reported year, USD millions${orgStats.availableYearLabel ? ` · ${orgStats.availableYearLabel}` : ''}`}>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={yearTrend.map(y => ({ year: String(y.year), amount: y.amount }))} margin={{ left: 16, right: 24, top: 8, bottom: 0 }}>
                <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<TT />} />
                <Line type="monotone" dataKey="amount" stroke="#2366c9" strokeWidth={3} dot={{ r: 5, fill: '#0d846a', strokeWidth: 0 }} activeDot={{ r: 7 }} name="Disbursed" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {/* Sector breakdown */}
            <ChartCard title="Disbursements by Sector">
              <BarList data={bySector} colorFn={i => COLORS[i % COLORS.length]} />
            </ChartCard>

            {/* Region breakdown */}
            <ChartCard title="Disbursements by Region">
              <div style={{ minHeight: 170, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <BarList data={byRegion} single="#0d846a" />
              </div>
            </ChartCard>
          </div>

          {/* Top recipient countries */}
          <ChartCard title="Top Recipient Countries">
            <BarList data={byCountry} colorFn={i => COLORS[i % COLORS.length]} />
          </ChartCard>

          <ChartCard title="Funded Projects" sub={`${filteredProjects.length.toLocaleString()} of ${orgStats.projectCount.toLocaleString()} project records · scroll to browse`}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 12 }}>
              <label style={{ flex: '0 1 360px', maxWidth: 360 }}>
                <span style={{ display: 'block', fontSize: 11, color: '#475569', marginBottom: 4 }}>Search projects</span>
                <input
                  value={projectSearch}
                  onChange={e => setProjectSearch(e.target.value)}
                  placeholder="Project title, country, sector..."
                  style={{ width: '100%', background: '#070f1c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#c8dff2', padding: '8px 10px', fontSize: 12, outline: 'none' }}
                />
              </label>
              <label style={{ flex: '0 0 150px' }}>
                <span style={{ display: 'block', fontSize: 11, color: '#475569', marginBottom: 4 }}>Year</span>
                <select
                  value={projectYear}
                  onChange={e => setProjectYear(e.target.value)}
                  style={{ width: '100%', background: '#070f1c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#c8dff2', padding: '8px 10px', fontSize: 12, outline: 'none' }}
                >
                  {projectYears.map(y => <option key={y} value={y} style={{ background: '#070f1c' }}>{y === 'All' ? 'All years' : y}</option>)}
                </select>
              </label>
              {(projectSearch || projectYear !== 'All') && (
                <button
                  onClick={() => { setProjectSearch(''); setProjectYear('All') }}
                  style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#94a3b8', fontSize: 12, cursor: 'pointer' }}
                >
                  Clear
                </button>
              )}
            </div>
            {filteredProjects.length ? (
              <ProjectList projects={filteredProjects} />
            ) : (
              <div style={{ textAlign: 'center', padding: 36, color: '#334155', fontSize: 13, border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 8 }}>
                No projects match these filters.
              </div>
            )}
          </ChartCard>
        </>
      )}
    </div>
  )
}
