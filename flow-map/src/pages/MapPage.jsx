import { useState, useMemo } from 'react'
import FlowMap from '../components/FlowMap.jsx'
import CountryProfile from '../components/CountryProfile.jsx'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

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
    <div style={{ background: '#0b1829', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#c8dff2' }}>
      <div style={{ fontWeight: 600, marginBottom: 2 }}>{label}</div>
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
        style={{ background: '#0b1829', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#c8dff2', padding: '6px 10px', fontSize: 13, outline: 'none' }}>
        {options.map(o => <option key={o.value} value={o.value} style={{ background: '#0b1829' }}>{o.label}</option>)}
      </select>
    </label>
  )
}

function ChartCard({ title, children }) {
  return (
    <div style={{ background: '#0f1e31', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '14px 16px' }}>
      <p style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 12 }}>{title}</p>
      {children}
    </div>
  )
}

export default function MapPage({ data }) {
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [filters, setFilters] = useState({ sector: 'All', year: 'All', topN: 5 })
  const setFilter = (k, v) => setFilters(p => ({ ...p, [k]: v }))

  // Recipient regionMacro lookup
  const recipientMeta = useMemo(() =>
    Object.fromEntries((data.recipients || []).map(r => [r.country, r])),
  [data])

  // Filter records by sector + year
  const filteredRecords = useMemo(() => {
    return (data.records || []).filter(r => {
      if (filters.sector !== 'All' && r.sector !== filters.sector) return false
      if (filters.year !== 'All' && r.year !== Number(filters.year)) return false
      return true
    })
  }, [data, filters])

  // KPIs from filtered records
  const kpis = useMemo(() => {
    let total = 0
    const countries = new Set(), donors = new Set()
    filteredRecords.forEach(r => {
      total += r.amount
      countries.add(r.country)
      donors.add(r.donorCountry)
    })
    return { total, countries: countries.size, donors: donors.size, records: filteredRecords.length }
  }, [filteredRecords])

  // 4 bar charts from filtered records
  const charts = useMemo(() => {
    const sector = {}, region = {}, donor = {}, country = {}
    filteredRecords.forEach(r => {
      sector[r.sector] = (sector[r.sector] || 0) + r.amount
      const meta = recipientMeta[r.country]
      if (meta?.regionMacro) region[meta.regionMacro] = (region[meta.regionMacro] || 0) + r.amount
      donor[r.donorCountry] = (donor[r.donorCountry] || 0) + r.amount
      country[r.country]    = (country[r.country]    || 0) + r.amount
    })
    const sort = (m, n) => Object.entries(m).map(([name, amount]) => ({ name, amount })).sort((a,b) => b.amount - a.amount).slice(0, n)
    return {
      sector:  sort(sector,  8),
      region:  sort(region,  8),
      donor:   sort(donor,   8),
      country: sort(country, 10),
    }
  }, [filteredRecords, recipientMeta])

  // Selected recipient (filter-aware)
  const selectedRecipient = useMemo(() => {
    if (!data || !selectedCountry) return null
    const base = (data.recipients || []).find(r => r.country === selectedCountry)
    if (!base) return null
    if (filters.sector === 'All' && filters.year === 'All') return base
    const donorT = {}, sectorT = {}
    let total = 0
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
      topDonors:  Object.entries(donorT).map(([donorCountry, amount]) => ({ donorCountry, amount })).sort((a,b) => b.amount - a.amount),
      topSectors: Object.entries(sectorT).map(([sector, amount]) => ({ sector, amount })).sort((a,b) => b.amount - a.amount),
      yearTrend,
    }
  }, [data, selectedCountry, filteredRecords, filters])

  const sectorOpts = (data.sectors || ['All']).map(s => ({ value: s, label: s }))
  const yearOpts   = [{ value: 'All', label: 'All years' }, ...(data.years || []).map(y => ({ value: String(y), label: String(y) }))]
  const topNOpts   = [3,5,7,10].map(n => ({ value: n, label: `Top ${n} donors` }))

  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Filters ── */}
      <div style={{ background: '#0f1e31', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'flex-end', gap: 18, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.08em', alignSelf: 'flex-end', paddingBottom: 2 }}>Filters</span>
        <Sel label="Sector"     value={filters.sector} onChange={v => setFilter('sector', v)} options={sectorOpts} />
        <Sel label="Year"       value={filters.year}   onChange={v => setFilter('year', v)}   options={yearOpts}   />
        <Sel label="Donor arcs" value={filters.topN}   onChange={v => setFilter('topN', Number(v))} options={topNOpts} />
        {selectedCountry && (
          <button onClick={() => setSelectedCountry(null)}
            style={{ alignSelf: 'flex-end', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#94a3b8', padding: '6px 14px', fontSize: 12, cursor: 'pointer' }}>
            Clear selection
          </button>
        )}
      </div>

      {/* ── KPI cards (filter-aware) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        <Kpi label="Total Funding" value={fmt(kpis.total)} sub="Based on current filters" />
        <Kpi label="Recipient Countries" value={kpis.countries} sub="In filtered records" />
        <Kpi label="Donor Countries" value={kpis.donors} sub="In filtered records" />
        <Kpi label="Flow Records" value={kpis.records.toLocaleString()} sub="Aggregated grant records" />
      </div>

      {/* ── Map + country profile ── */}
      <div style={{ display: 'flex', gap: 16, minHeight: 480 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <FlowMap data={data} selectedCountry={selectedCountry} onSelect={setSelectedCountry} filters={filters} />
        </div>
        <div style={{ width: 300, flexShrink: 0, background: '#0f1e31', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 18, overflowY: 'auto' }}>
          <CountryProfile recipient={selectedRecipient} onClose={() => setSelectedCountry(null)} />
        </div>
      </div>

      {/* ── 4 bar charts (filter-aware) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <ChartCard title="Funding by Sector">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={charts.sector} layout="vertical" margin={{ left: 0, right: 12, top: 0, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={110} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<TT />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="amount" radius={[0,4,4,0]} maxBarSize={14}>
                {charts.sector.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Funding by Region">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={charts.region} layout="vertical" margin={{ left: 0, right: 12, top: 0, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={80} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<TT />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="amount" radius={[0,4,4,0]} maxBarSize={16} fill="#2366c9" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top Donor Countries">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={charts.donor} layout="vertical" margin={{ left: 0, right: 12, top: 0, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={90} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<TT />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="amount" radius={[0,4,4,0]} maxBarSize={14}>
                {charts.donor.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top Recipient Countries">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={charts.country} layout="vertical" margin={{ left: 0, right: 12, top: 0, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={100} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<TT />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="amount" radius={[0,4,4,0]} maxBarSize={14} fill="#0d846a" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Narrative */}
      {selectedRecipient && (
        <div style={{ background: '#0f1e31', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 18px', fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>
          <strong style={{ color: '#c8dff2' }}>{selectedRecipient.country}</strong> received{' '}
          <strong style={{ color: '#34d399' }}>{fmt(selectedRecipient.total)}</strong> in the current view.
          {selectedRecipient.topDonors?.[0] && <>{' '}<strong style={{ color: '#60a5fa' }}>{selectedRecipient.topDonors[0].donorCountry.replace("China (People's Republic of)",'China')}</strong> is the largest donor-country source ({fmt(selectedRecipient.topDonors[0].amount)}).</>}
          {selectedRecipient.topSectors?.[0] && <>{' '}<strong style={{ color: '#f59e0b' }}>{selectedRecipient.topSectors[0].sector}</strong> is the dominant sector.</>}
        </div>
      )}
    </div>
  )
}
