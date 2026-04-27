import { useState, useMemo, useRef, useEffect } from 'react'
import FlowMap from '../components/FlowMap.jsx'
import CountryProfile from '../components/CountryProfile.jsx'
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

function fmt(v) {
  v = Number(v || 0)
  if (v >= 1000) return `$${(v/1000).toFixed(1)}B`
  if (v >= 1)    return `$${v.toFixed(1)}M`
  return `$${Math.round(v*1000)}K`
}

const COLORS = ['#60a5fa','#34d399','#f59e0b','#f472b6','#a78bfa','#fb923c','#22d3ee','#4ade80','#f87171','#fbbf24']

const TT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#070f1c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#c8dff2' }}>
      <div style={{ fontWeight: 600, marginBottom: 2 }}>{label || payload[0]?.name}</div>
      <div>{fmt(payload[0].value)}</div>
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

function Sel({ label, value, onChange, options }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 11, color: '#475569', fontWeight: 500 }}>{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ background: '#070f1c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#c8dff2', padding: '6px 10px', fontSize: 13, outline: 'none' }}>
        {options.map(o => <option key={o.value} value={o.value} style={{ background: '#070f1c' }}>{o.label}</option>)}
      </select>
    </label>
  )
}

function ChartCard({ title, children }) {
  return (
    <div style={{ background: '#0f1e31', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '14px 16px' }}>
      <p style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 10 }}>{title}</p>
      {children}
    </div>
  )
}

// ── Country search bar ─────────────────────────────────────────────────────────
function CountrySearch({ countries, onSelect }) {
  const [query, setQuery]   = useState('')
  const [open, setOpen]     = useState(false)
  const ref                 = useRef(null)

  const matches = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return countries.filter(c => c.toLowerCase().includes(q)).slice(0, 8)
  }, [query, countries])

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative', width: 220 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#070f1c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, padding: '6px 10px' }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder="Search country…"
          style={{ background: 'none', border: 'none', outline: 'none', color: '#c8dff2', fontSize: 12, width: '100%' }}
        />
        {query && (
          <button onClick={() => { setQuery(''); setOpen(false) }} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', padding: 0, fontSize: 14, lineHeight: 1 }}>×</button>
        )}
      </div>
      {open && matches.length > 0 && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: '#0f1e31', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, overflow: 'hidden', zIndex: 100, boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
          {matches.map(c => (
            <button key={c} onClick={() => { onSelect(c); setQuery(''); setOpen(false) }}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', background: 'none', border: 'none', color: '#c8dff2', fontSize: 12, cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}>
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function MapPage({ data }) {
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [filters, setFilters] = useState({ sector: 'All', year: 'All', topN: 5 })
  const setFilter = (k, v) => setFilters(p => ({ ...p, [k]: v }))

  const recipientMeta = useMemo(() =>
    Object.fromEntries((data.recipients || []).map(r => [r.country, r])),
  [data])

  const allCountryNames = useMemo(() =>
    (data.recipients || []).map(r => r.country).sort(),
  [data])

  // Records filtered by both sector AND year (for KPIs + donor/country charts)
  const filteredRecords = useMemo(() =>
    (data.records || []).filter(r => {
      if (filters.sector !== 'All' && r.sector !== filters.sector) return false
      if (filters.year   !== 'All' && r.year   !== Number(filters.year))   return false
      return true
    }),
  [data, filters])

  // Records filtered by year ONLY (for sector pie chart)
  const yearOnlyRecords = useMemo(() =>
    (data.records || []).filter(r =>
      filters.year === 'All' || r.year === Number(filters.year)
    ),
  [data, filters.year])

  // KPIs
  const kpis = useMemo(() => {
    let total = 0; const countries = new Set(), donors = new Set()
    filteredRecords.forEach(r => { total += r.amount; countries.add(r.country); donors.add(r.donorCountry) })
    return { total, countries: countries.size, donors: donors.size, records: filteredRecords.length }
  }, [filteredRecords])

  // 4 charts
  const charts = useMemo(() => {
    const donor = {}, country = {}, region = {}

    filteredRecords.forEach(r => {
      donor[r.donorCountry]   = (donor[r.donorCountry]   || 0) + r.amount
      country[r.country]      = (country[r.country]      || 0) + r.amount
      const meta = recipientMeta[r.country]
      if (meta?.regionMacro) region[meta.regionMacro] = (region[meta.regionMacro] || 0) + r.amount
    })

    // Sector pie — year-only filter
    const sector = {}
    yearOnlyRecords.forEach(r => { sector[r.sector] = (sector[r.sector] || 0) + r.amount })

    const sort = (m, n) => Object.entries(m).map(([name, amount]) => ({ name, amount })).sort((a, b) => b.amount - a.amount).slice(0, n)
    const sectorPie = Object.entries(sector).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8)

    return { donor: sort(donor, 8), country: sort(country, 10), region: sort(region, 8), sectorPie }
  }, [filteredRecords, yearOnlyRecords, recipientMeta])

  // Country-specific top orgs for sidebar toggle (from data.projects)
  const countryOrgs = useMemo(() => {
    if (!selectedCountry) return []
    const m = {}
    ;(data.projects || []).forEach(p => {
      if (p.country !== selectedCountry) return
      if (filters.year !== 'All' && String(p.year) !== String(filters.year)) return
      if (!m[p.org]) m[p.org] = { org: p.org, donorCountry: p.donorCountry, amount: 0 }
      m[p.org].amount += p.amount
    })
    return Object.values(m).sort((a, b) => b.amount - a.amount).slice(0, 5)
  }, [selectedCountry, data, filters.year])

  // Sector DNA for CountryProfile (year-only, no sector filter)
  const sectorDnaData = useMemo(() => {
    if (!selectedCountry) return []
    const m = {}
    yearOnlyRecords.forEach(r => {
      if (r.country !== selectedCountry) return
      m[r.sector] = (m[r.sector] || 0) + r.amount
    })
    return Object.entries(m).map(([sector, amount]) => ({ sector, amount })).sort((a, b) => b.amount - a.amount)
  }, [selectedCountry, yearOnlyRecords])

  // Selected recipient (filter-aware)
  const selectedRecipient = useMemo(() => {
    if (!data || !selectedCountry) return null
    const base = (data.recipients || []).find(r => r.country === selectedCountry)
    if (!base) return null
    if (filters.sector === 'All' && filters.year === 'All') return base
    const donorT = {}, sectorT = {}; let total = 0
    filteredRecords.forEach(r => {
      if (r.country !== selectedCountry) return
      donorT[r.donorCountry]  = (donorT[r.donorCountry]  || 0) + r.amount
      sectorT[r.sector]       = (sectorT[r.sector]       || 0) + r.amount
      total += r.amount
    })
    const yearTrend = (data.years || []).map(yr => {
      let amt = 0
      ;(data.records || []).forEach(r => {
        if (r.country !== selectedCountry) return
        if (filters.sector !== 'All' && r.sector !== filters.sector) return
        if (r.year === yr) amt += r.amount
      })
      return { year: yr, amount: amt }
    })
    return {
      ...base, total,
      topDonors:  Object.entries(donorT).map(([donorCountry, amount]) => ({ donorCountry, amount })).sort((a, b) => b.amount - a.amount),
      topSectors: Object.entries(sectorT).map(([sector, amount]) => ({ sector, amount })).sort((a, b) => b.amount - a.amount),
      yearTrend,
    }
  }, [data, selectedCountry, filteredRecords, filters])

  const sectorOpts = (data.sectors || ['All']).map(s => ({ value: s, label: s }))
  const yearOpts   = [{ value: 'All', label: 'All years' }, ...(data.years || []).map(y => ({ value: String(y), label: String(y) }))]
  const topNOpts   = [3, 5, 7, 10].map(n => ({ value: n, label: `Top ${n} donors` }))

  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Filters + search */}
      <div style={{ background: '#0f1e31', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'flex-end', gap: 18, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.08em', alignSelf: 'flex-end', paddingBottom: 2 }}>Filters</span>
        <Sel label="Sector"     value={filters.sector} onChange={v => setFilter('sector', v)} options={sectorOpts} />
        <Sel label="Year"       value={filters.year}   onChange={v => setFilter('year', v)}   options={yearOpts}   />
        <Sel label="Donor arcs" value={filters.topN}   onChange={v => setFilter('topN', Number(v))} options={topNOpts} />
        <div style={{ alignSelf: 'flex-end' }}>
          <p style={{ fontSize: 11, color: '#475569', marginBottom: 4 }}>Find country</p>
          <CountrySearch countries={allCountryNames} onSelect={c => setSelectedCountry(c)} />
        </div>
        {selectedCountry && (
          <button onClick={() => setSelectedCountry(null)}
            style={{ alignSelf: 'flex-end', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#94a3b8', padding: '6px 14px', fontSize: 12, cursor: 'pointer' }}>
            Clear
          </button>
        )}
      </div>

      {/* Map + profile */}
      <div style={{ display: 'flex', gap: 16, minHeight: 480 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <FlowMap data={data} selectedCountry={selectedCountry} onSelect={setSelectedCountry} filters={filters} />
        </div>
        <div style={{ width: 300, flexShrink: 0, background: '#0f1e31', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 18, overflowY: 'auto' }}>
          <CountryProfile
            recipient={selectedRecipient}
            onClose={() => setSelectedCountry(null)}
            sectorDnaData={sectorDnaData}
            countryOrgs={countryOrgs}
          />
        </div>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        <Kpi label="Total Funding" value={fmt(kpis.total)} sub="Current filters" />
        <Kpi label="Recipient Countries" value={kpis.countries} sub="In filtered records" />
        <Kpi label="Donor Countries" value={kpis.donors} sub="In filtered records" />
        <Kpi label="Flow Records" value={kpis.records.toLocaleString()} sub="Aggregated grant records" />
      </div>

      {/* 4 charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

        {/* Sector — PIE (year-only) */}
        <ChartCard title={`Funding by Sector${filters.year !== 'All' ? ` · ${filters.year}` : ' · All Years'}`}>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart margin={{ left: 10, right: 0, top: 0, bottom: 0 }}>
              <Pie data={charts.sectorPie} dataKey="value" nameKey="name" cx="43%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={2}>
                {charts.sectorPie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={v => fmt(v)} contentStyle={{ background: '#070f1c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11, color: '#c8dff2' }} />
              <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 10, color: '#64748b', paddingLeft: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Funding by Region */}
        <ChartCard title="Funding by Region">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={charts.region} layout="vertical" margin={{ left: 0, right: 12, top: 0, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={72} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} interval={0} />
              <Tooltip content={<TT />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="amount" radius={[0,4,4,0]} maxBarSize={16} fill="#2366c9" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Top Donor Countries — full names, no skipping */}
        <ChartCard title="Top Donor Countries">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={charts.donor} layout="vertical" margin={{ left: 10, right: 12, top: 0, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                width={130}
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval={0}
              />
              <Tooltip content={<TT />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="amount" radius={[0,4,4,0]} maxBarSize={16}>
                {charts.donor.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Top Recipient Countries */}
        <ChartCard title="Top Recipient Countries">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={charts.country} layout="vertical" margin={{ left: 0, right: 12, top: 0, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={100} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} interval={0} />
              <Tooltip content={<TT />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="amount" radius={[0,4,4,0]} maxBarSize={16} fill="#0d846a" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Narrative */}
      {selectedRecipient && (
        <div style={{ background: '#0f1e31', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 18px', fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>
          <strong style={{ color: '#c8dff2' }}>{selectedRecipient.country}</strong> received{' '}
          <strong style={{ color: '#34d399' }}>{fmt(selectedRecipient.total)}</strong> in the current view.
          {selectedRecipient.topDonors?.[0] && <>{' '}<strong style={{ color: '#60a5fa' }}>{selectedRecipient.topDonors[0].donorCountry.replace("China (People's Republic of)", 'China')}</strong> is the largest donor-country source ({fmt(selectedRecipient.topDonors[0].amount)}).</>}
          {selectedRecipient.topSectors?.[0] && <>{' '}<strong style={{ color: '#f59e0b' }}>{selectedRecipient.topSectors[0].sector}</strong> is the dominant sector.</>}
        </div>
      )}
    </div>
  )
}
