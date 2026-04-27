import { useState, useMemo } from 'react'
import FlowMap from '../components/FlowMap.jsx'
import CountryProfile from '../components/CountryProfile.jsx'

function fmt(v) {
  v = Number(v || 0)
  if (v >= 1000) return `$${(v/1000).toFixed(1)}B`
  if (v >= 1)    return `$${v.toFixed(1)}M`
  return `$${Math.round(v*1000)}K`
}

function Kpi({ label, value, sub }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '14px 18px' }}>
      <p style={{ fontSize: 11, color: '#475569', marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 700, color: '#e2eaf4' }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: '#334155', marginTop: 3 }}>{sub}</p>}
    </div>
  )
}

function Sel({ label, value, onChange, options }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 11, color: '#475569', fontWeight: 500 }}>{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ background: '#0f1e31', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#c8dff2', padding: '6px 10px', fontSize: 13, outline: 'none' }}>
        {options.map(o => <option key={o.value} value={o.value} style={{ background: '#0b1829' }}>{o.label}</option>)}
      </select>
    </label>
  )
}

export default function MapPage({ data }) {
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [filters, setFilters] = useState({ sector: 'All', year: 'All', topN: 5 })
  const setFilter = (k, v) => setFilters(p => ({ ...p, [k]: v }))

  const filteredMetrics = useMemo(() => {
    if (!data) return {}
    if (filters.sector === 'All' && filters.year === 'All') return data.metrics
    let total = 0
    ;(data.records || []).forEach(r => {
      if (filters.sector !== 'All' && r.sector !== filters.sector) return
      if (filters.year !== 'All' && r.year !== Number(filters.year)) return
      total += r.amount
    })
    return { ...data.metrics, totalFunding: total, totalFundingLabel: fmt(total) }
  }, [data, filters])

  const selectedRecipient = useMemo(() => {
    if (!data || !selectedCountry) return null
    const base = (data.recipients || []).find(r => r.country === selectedCountry)
    if (!base) return null
    if (filters.sector === 'All' && filters.year === 'All') return base
    const donorT = {}, sectorT = {}
    let total = 0
    ;(data.records || []).forEach(r => {
      if (r.country !== selectedCountry) return
      if (filters.sector !== 'All' && r.sector !== filters.sector) return
      if (filters.year !== 'All' && r.year !== Number(filters.year)) return
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
  }, [data, selectedCountry, filters])

  const sectorOpts = (data.sectors || ['All']).map(s => ({ value: s, label: s }))
  const yearOpts   = [{ value: 'All', label: 'All years' }, ...(data.years || []).map(y => ({ value: String(y), label: String(y) }))]
  const topNOpts   = [3,5,7,10].map(n => ({ value: n, label: `Top ${n} donors` }))

  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        <Kpi label="Total Funding (filtered)" value={filteredMetrics.totalFundingLabel || fmt(filteredMetrics.totalFunding)} sub={`${fmt(data.metrics.totalFunding)} across all filters`} />
        <Kpi label="Recipient Countries" value={data.metrics.recipientCount} sub="Countries with mapped funding" />
        <Kpi label="Donor Countries" value={data.metrics.donorCount} sub="Unique donor-country sources" />
        <Kpi label="Cleaned Records" value={(data.metrics.recordCount||0).toLocaleString()} sub="From 116,561 raw rows" />
      </div>

      {/* Filters */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 18px', display: 'flex', alignItems: 'flex-end', gap: 18, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.08em', alignSelf: 'flex-end', paddingBottom: 1 }}>Filters</span>
        <Sel label="Sector"       value={filters.sector} onChange={v => setFilter('sector', v)} options={sectorOpts} />
        <Sel label="Year"         value={filters.year}   onChange={v => setFilter('year', v)}   options={yearOpts}   />
        <Sel label="Donor arcs"   value={filters.topN}   onChange={v => setFilter('topN', Number(v))} options={topNOpts} />
        {selectedCountry && (
          <button onClick={() => setSelectedCountry(null)}
            style={{ alignSelf: 'flex-end', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#94a3b8', padding: '6px 14px', fontSize: 12, cursor: 'pointer' }}>
            Clear selection
          </button>
        )}
      </div>

      {/* Map + sidebar */}
      <div style={{ display: 'flex', gap: 16, minHeight: 480 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <FlowMap data={data} selectedCountry={selectedCountry} onSelect={setSelectedCountry} filters={filters} />
        </div>
        <div style={{ width: 300, flexShrink: 0, background: '#0f1e31', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 18, overflowY: 'auto' }}>
          <CountryProfile recipient={selectedRecipient} onClose={() => setSelectedCountry(null)} />
        </div>
      </div>

      {/* Narrative */}
      {selectedRecipient && (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 18px', fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>
          <strong style={{ color: '#c8dff2' }}>{selectedRecipient.country}</strong> received{' '}
          <strong style={{ color: '#34d399' }}>{fmt(selectedRecipient.total)}</strong> in the current view.
          {selectedRecipient.topDonors?.[0] && <>{' '}<strong style={{ color: '#60a5fa' }}>{selectedRecipient.topDonors[0].donorCountry.replace("China (People's Republic of)",'China')}</strong> is the largest donor-country source ({fmt(selectedRecipient.topDonors[0].amount)}).</>}
          {selectedRecipient.topSectors?.[0] && <>{' '}<strong style={{ color: '#f59e0b' }}>{selectedRecipient.topSectors[0].sector}</strong> is the dominant sector.</>}
        </div>
      )}
    </div>
  )
}
