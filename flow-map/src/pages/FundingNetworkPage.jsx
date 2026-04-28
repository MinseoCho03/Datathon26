import { useEffect, useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis, PieChart, Pie, Cell, Legend, CartesianGrid } from 'recharts'

const WEIGHT_LABEL = 'Funding amount'
const MAX_FUNDER_RESULTS = 80

const S = {
  panel: {
    background: '#0f1e31',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 10,
  },
  subtle: { fontSize: 11, color: '#475569', lineHeight: 1.5 },
  label: { fontSize: 10, color: '#334155', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' },
  input: {
    background: '#070f1c',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 7,
    color: '#c8dff2',
    padding: '9px 10px',
    fontSize: 12,
    outline: 'none',
    width: '100%',
  },
  quietButton: {
    border: '1px solid rgba(255,255,255,0.09)',
    background: 'rgba(255,255,255,0.035)',
    color: '#94a3b8',
    borderRadius: 7,
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600,
  },
}

function fmtAmount(value) {
  const n = Number(value || 0)
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}B`
  if (n >= 1) return `$${n.toFixed(1)}M`
  if (n > 0) return `$${Math.round(n * 1000)}K`
  return '$0'
}

function truncate(text, max = 34) {
  if (!text) return ''
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}

function topSectorFromTotals(sectorTotals) {
  return Object.entries(sectorTotals || {}).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unspecified'
}

function Badge({ children, tone = 'slate' }) {
  const tones = {
    blue: ['#60a5fa', 'rgba(96,165,250,0.12)', 'rgba(96,165,250,0.28)'],
    green: ['#34d399', 'rgba(52,211,153,0.11)', 'rgba(52,211,153,0.24)'],
    amber: ['#f59e0b', 'rgba(245,158,11,0.11)', 'rgba(245,158,11,0.24)'],
    slate: ['#94a3b8', 'rgba(148,163,184,0.09)', 'rgba(148,163,184,0.2)'],
    red: ['#f87171', 'rgba(248,113,113,0.1)', 'rgba(248,113,113,0.22)'],
  }
  const [color, bg, border] = tones[tone]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 7px', borderRadius: 999, fontSize: 10, fontWeight: 700, color, background: bg, border: `1px solid ${border}`, whiteSpace: 'nowrap' }}>
      {children}
    </span>
  )
}

function KpiCard({ label, value, sub }) {
  return (
    <div style={{ ...S.panel, padding: '13px 15px', minHeight: 74 }}>
      <p style={{ fontSize: 10, color: '#475569', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 800, color: '#e2eaf4', marginTop: 5 }}>{value}</p>
      {sub && <p style={{ ...S.subtle, marginTop: 2 }}>{sub}</p>}
    </div>
  )
}

function MiniBar({ value, max, color = '#60a5fa' }) {
  const pct = max > 0 ? Math.max(4, Math.min(100, (value / max) * 100)) : 0
  return (
    <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 999 }} />
    </div>
  )
}

function buildFunderData(projects) {
  const funders = new Map()

  ;(projects || []).forEach(project => {
    const funderName = project.org
    const country = project.country
    if (!funderName || !country) return

    const amount = Number(project.amount)
    const safeAmount = Number.isFinite(amount) ? amount : 0
    const sector = project.sector || 'Unspecified'

    if (!funders.has(funderName)) {
      funders.set(funderName, { name: funderName, total: 0, recordCount: 0, countries: new Map(), sectorTotals: {} })
    }

    const funder = funders.get(funderName)
    funder.total += safeAmount
    funder.recordCount += 1
    funder.sectorTotals[sector] = (funder.sectorTotals[sector] || 0) + safeAmount

    if (!funder.countries.has(country)) {
      funder.countries.set(country, { country, weight: 0, recordCount: 0, sectorTotals: {} })
    }

    const edge = funder.countries.get(country)
    edge.weight += safeAmount
    edge.recordCount += 1
    edge.sectorTotals[sector] = (edge.sectorTotals[sector] || 0) + safeAmount
  })

  return [...funders.values()]
    .map(funder => ({
      ...funder,
      countries: [...funder.countries.values()].sort((a, b) => b.weight - a.weight || b.recordCount - a.recordCount),
      topSector: topSectorFromTotals(funder.sectorTotals),
    }))
    .filter(funder => funder.countries.length)
    .sort((a, b) => b.total - a.total || b.recordCount - a.recordCount || a.name.localeCompare(b.name))
}

function deriveCoverage(selectedFunders, dataByFunder) {
  const relationships = selectedFunders.flatMap(funderName =>
    (dataByFunder[funderName]?.countries || []).map(countryEdge => ({
      ...countryEdge,
      funder: funderName,
      id: `${funderName}|||${countryEdge.country}`,
      topSector: topSectorFromTotals(countryEdge.sectorTotals),
    }))
  )

  const countries = new Map()
  relationships.forEach(edge => {
    if (!countries.has(edge.country)) {
      countries.set(edge.country, { country: edge.country, totalWeight: 0, recordCount: 0, funders: [], edges: [], sectorTotals: {} })
    }
    const country = countries.get(edge.country)
    country.totalWeight += edge.weight
    country.recordCount += edge.recordCount
    country.funders.push(edge.funder)
    country.edges.push(edge)
    Object.entries(edge.sectorTotals || {}).forEach(([sector, amount]) => {
      country.sectorTotals[sector] = (country.sectorTotals[sector] || 0) + amount
    })
  })

  const countryList = [...countries.values()]
    .map(country => ({
      ...country,
      funders: [...new Set(country.funders)],
      mainSector: topSectorFromTotals(country.sectorTotals),
      strongestEdge: [...country.edges].sort((a, b) => b.weight - a.weight || b.recordCount - a.recordCount)[0],
    }))
    .sort((a, b) => b.totalWeight - a.totalWeight || b.recordCount - a.recordCount || a.country.localeCompare(b.country))

  const weights = countryList.map(country => country.totalWeight).sort((a, b) => a - b)
  const weakCutoff = weights.length ? weights[Math.max(0, Math.floor(weights.length * 0.25) - 1)] : 0
  const withStatus = countryList.map(country => {
    const weak = country.totalWeight <= weakCutoff || country.strongestEdge?.weight <= weakCutoff
    const status = weak ? 'weak' : country.funders.length > 1 ? 'shared' : 'single'
    return { ...country, weak, status }
  })

  return {
    relationships,
    countries: withStatus,
    shared: withStatus.filter(country => country.funders.length > 1),
    single: withStatus.filter(country => country.funders.length === 1),
    weak: withStatus.filter(country => country.weak),
    crowded: withStatus.filter(country => country.funders.length > 1).sort((a, b) => b.funders.length - a.funders.length || b.totalWeight - a.totalWeight),
    maxCountryWeight: Math.max(...withStatus.map(country => country.totalWeight), 0),
  }
}

function CountryCard({ country, selected, highlighted, onClick, onHover }) {
  const badge = country.weak
    ? { label: 'Weak coverage', tone: 'red' }
    : country.funders.length > 1
      ? { label: 'Shared corridor', tone: 'green' }
      : { label: 'Single-source', tone: 'amber' }

  return (
    <button
      onClick={() => onClick(country)}
      onMouseEnter={() => onHover(country)}
      onMouseLeave={() => onHover(null)}
      style={{
        textAlign: 'left',
        background: selected ? 'rgba(35,102,201,0.18)' : highlighted ? 'rgba(96,165,250,0.08)' : '#0b1829',
        border: selected ? '1px solid rgba(96,165,250,0.5)' : highlighted ? '1px solid rgba(96,165,250,0.28)' : '1px solid rgba(255,255,255,0.07)',
        borderRadius: 8,
        padding: 12,
        cursor: 'pointer',
        color: '#c8dff2',
        width: '100%',
        boxShadow: selected ? '0 0 0 1px rgba(96,165,250,0.08)' : 'none',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 800, color: '#e2eaf4', lineHeight: 1.25 }}>{country.country}</p>
          <p style={{ fontSize: 10, color: '#475569', marginTop: 4 }}>{country.funders.length} selected funder{country.funders.length === 1 ? '' : 's'} · {country.mainSector}</p>
        </div>
        <Badge tone={badge.tone}>{badge.label}</Badge>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, alignItems: 'end', marginTop: 12 }}>
        <MiniBar value={country.totalWeight} max={country.maxForBar || country.totalWeight} color={country.weak ? '#f87171' : country.funders.length > 1 ? '#34d399' : '#f59e0b'} />
        <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>{fmtAmount(country.totalWeight)}</span>
      </div>
    </button>
  )
}

function CoverageColumn({ title, subtitle, countries, empty, selectedCountry, highlightedFunder, maxCountryWeight, onSelectCountry, onHoverCountry }) {
  return (
    <div style={{ ...S.panel, padding: 14, minHeight: 390, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <p style={{ fontSize: 13, color: '#e2eaf4', fontWeight: 800 }}>{title}</p>
          <p style={{ ...S.subtle, marginTop: 3 }}>{subtitle}</p>
        </div>
        <span style={{ fontSize: 18, fontWeight: 800, color: '#64748b' }}>{countries.length}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, overflowY: 'auto', paddingRight: 2 }}>
        {countries.length ? countries.map(country => (
          <CountryCard
            key={country.country}
            country={{ ...country, maxForBar: maxCountryWeight }}
            selected={selectedCountry === country.country}
            highlighted={highlightedFunder ? country.funders.includes(highlightedFunder) : false}
            onClick={onSelectCountry}
            onHover={onHoverCountry}
          />
        )) : (
          <p style={{ ...S.subtle, padding: '14px 2px' }}>{empty}</p>
        )}
      </div>
    </div>
  )
}

function spreadPositions(count, top, bottom) {
  if (count <= 1) return [(top + bottom) / 2]
  const step = (bottom - top) / (count - 1)
  return Array.from({ length: count }, (_, index) => top + index * step)
}

function CoverageGraph({ coverage, selectedFunders, selectedCountry, highlightedFunder, maxCountryWeight, onSelectCountry, onSelectFunder, onHoverCountry }) {
  const visibleCountries = coverage.countries.slice(0, 14)
  const countryNames = new Set(visibleCountries.map(country => country.country))
  const funderY = spreadPositions(selectedFunders.length, 78, 462)
  const countryY = spreadPositions(visibleCountries.length, 54, 486)
  const funderPositions = Object.fromEntries(selectedFunders.map((name, index) => [name, { x: 118, y: funderY[index] }]))
  const countryPositions = Object.fromEntries(visibleCountries.map((country, index) => [country.country, { x: 560, y: countryY[index] }]))
  const maxEdgeWeight = Math.max(...coverage.relationships.map(edge => edge.weight), 1)
  const edges = coverage.relationships.filter(edge => countryNames.has(edge.country))

  return (
    <div style={{ minHeight: 520, border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, background: '#0b1829', overflow: 'hidden' }}>
      <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
        <div>
          <p style={{ color: '#e2eaf4', fontSize: 12, fontWeight: 800 }}>Funder to country graph</p>
          <p style={{ ...S.subtle, marginTop: 2 }}>Showing the top {visibleCountries.length} countries by coverage weight.</p>
        </div>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Badge tone="blue">Funders</Badge>
          <Badge tone="green">Shared</Badge>
          <Badge tone="amber">Single-source</Badge>
          <Badge tone="red">Weak</Badge>
        </div>
      </div>

      <svg viewBox="0 0 780 520" width="100%" height="520" role="img" aria-label="Funding coverage graph">
        <text x="52" y="31" fill="#64748b" fontSize="11" fontWeight="700">SELECTED FUNDERS</text>
        <text x="510" y="31" fill="#64748b" fontSize="11" fontWeight="700">RECIPIENT COUNTRIES</text>

        {edges.map(edge => {
          const start = funderPositions[edge.funder]
          const end = countryPositions[edge.country]
          if (!start || !end) return null
          const country = coverage.countries.find(item => item.country === edge.country)
          const active = selectedCountry === edge.country || highlightedFunder === edge.funder
          const muted = (selectedCountry && selectedCountry !== edge.country) || (highlightedFunder && highlightedFunder !== edge.funder)
          const width = 1.2 + Math.min(7, (edge.weight / maxEdgeWeight) * 7)
          return (
            <path
              key={edge.id}
              d={`M ${start.x + 64} ${start.y} C 300 ${start.y}, 465 ${end.y}, ${end.x - 78} ${end.y}`}
              fill="none"
              stroke={country?.weak ? '#f87171' : country?.funders.length > 1 ? '#34d399' : '#f59e0b'}
              strokeWidth={active ? width + 1.2 : width}
              strokeOpacity={active ? 0.72 : muted ? 0.08 : 0.24}
              strokeLinecap="round"
            />
          )
        })}

        {selectedFunders.map(name => {
          const pos = funderPositions[name]
          const active = highlightedFunder === name
          return (
            <g
              key={name}
              transform={`translate(${pos.x}, ${pos.y})`}
              onClick={() => onSelectFunder(name)}
              style={{ cursor: 'pointer' }}
            >
              <rect x="-68" y="-18" width="136" height="36" rx="9" fill={active ? 'rgba(35,102,201,0.28)' : '#0f1e31'} stroke={active ? 'rgba(96,165,250,0.65)' : 'rgba(255,255,255,0.11)'} />
              <circle cx="-51" cy="0" r="5" fill="#60a5fa" />
              <text x="-39" y="4" fill="#c8dff2" fontSize="11" fontWeight="700">{truncate(name, 18)}</text>
            </g>
          )
        })}

        {visibleCountries.map(country => {
          const pos = countryPositions[country.country]
          const selected = selectedCountry === country.country
          const related = highlightedFunder ? country.funders.includes(highlightedFunder) : false
          const radius = 15 + Math.min(17, (country.totalWeight / Math.max(maxCountryWeight, 1)) * 17)
          const fill = country.weak ? '#321b24' : country.funders.length > 1 ? '#143224' : '#352817'
          const stroke = country.weak ? '#f87171' : country.funders.length > 1 ? '#34d399' : '#f59e0b'
          return (
            <g
              key={country.country}
              transform={`translate(${pos.x}, ${pos.y})`}
              onClick={() => onSelectCountry(country)}
              onMouseEnter={() => onHoverCountry(country)}
              onMouseLeave={() => onHoverCountry(null)}
              style={{ cursor: 'pointer' }}
            >
              <circle r={radius} fill={fill} stroke={selected || related ? '#60a5fa' : stroke} strokeWidth={selected || related ? 2.3 : 1.5} />
              <text x={radius + 9} y="-3" fill="#e2eaf4" fontSize="12" fontWeight="800">{truncate(country.country, 18)}</text>
              <text x={radius + 9} y="12" fill="#64748b" fontSize="10">{country.funders.length} funder{country.funders.length === 1 ? '' : 's'} · {fmtAmount(country.totalWeight)}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function StrategicReading({ selected, coverage, dataByFunder }) {
  const selectedCountry = selected?.type === 'country'
    ? coverage.countries.find(country => country.country === selected.name)
    : null
  const selectedFunder = selected?.type === 'funder' ? dataByFunder[selected.name] : null
  const selectedFunderEdges = selectedFunder?.countries || []

  if (selectedCountry) {
    const status = selectedCountry.weak
      ? 'Weak coverage'
      : selectedCountry.funders.length > 1 ? 'Shared corridor' : 'Single-source connection'
    const interpretation = selectedCountry.weak
      ? 'This country sits in the lower coverage band among the visible countries, suggesting a weaker connection in the selected set.'
      : selectedCountry.funders.length > 1
        ? 'This country is shared across multiple selected funders, suggesting an existing funding corridor.'
        : 'This country appears through only one selected funder, which may indicate a narrower coverage pattern.'

    return (
      <aside style={{ ...S.panel, padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <p style={{ ...S.label, marginBottom: 7 }}>Strategic Reading</p>
          <Badge tone={selectedCountry.weak ? 'red' : selectedCountry.funders.length > 1 ? 'green' : 'amber'}>{status}</Badge>
          <h2 style={{ color: '#e2eaf4', fontSize: 18, fontWeight: 800, marginTop: 9 }}>{selectedCountry.country}</h2>
        </div>
        <MetricRow label="Connected selected funders" value={selectedCountry.funders.join(', ')} />
        <MetricRow label={WEIGHT_LABEL} value={fmtAmount(selectedCountry.totalWeight)} />
        <MetricRow label="Top sector" value={selectedCountry.mainSector} />
        <MetricRow label="Strongest relationship" value={`${selectedCountry.strongestEdge?.funder || '—'} · ${fmtAmount(selectedCountry.strongestEdge?.weight || 0)}`} />
        <p style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.6, borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 12 }}>{interpretation}</p>
      </aside>
    )
  }

  if (selectedFunder) {
    const visibleEdges = selectedFunderEdges.filter(edge => coverage.countries.some(country => country.country === edge.country))
    const overlapCountries = coverage.countries.filter(country => country.funders.includes(selectedFunder.name) && country.funders.length > 1)
    const strongest = selectedFunderEdges[0]
    const topCountries = selectedFunderEdges.slice(0, 5).map(edge => edge.country).join(', ')
    const interpretation = overlapCountries.length
      ? `${selectedFunder.name} overlaps with other selected funders in ${overlapCountries.slice(0, 3).map(country => country.country).join(', ')}.`
      : `${selectedFunder.name}'s selected coverage is concentrated in countries that are not shared by the current funder set.`

    return (
      <aside style={{ ...S.panel, padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <p style={{ ...S.label, marginBottom: 7 }}>Strategic Reading</p>
          <Badge tone="blue">Selected funder</Badge>
          <h2 style={{ color: '#e2eaf4', fontSize: 18, fontWeight: 800, marginTop: 9 }}>{selectedFunder.name}</h2>
        </div>
        <MetricRow label="Countries reached" value={visibleEdges.length} />
        <MetricRow label="Strongest country connection" value={strongest ? `${strongest.country} · ${fmtAmount(strongest.weight)}` : '—'} />
        <MetricRow label="Top countries by weight" value={topCountries || '—'} />
        <MetricRow label="Top sectors" value={Object.entries(selectedFunder.sectorTotals || {}).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([sector]) => sector).join(', ') || '—'} />
        <p style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.6, borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 12 }}>{interpretation}</p>
      </aside>
    )
  }

  const concentrated = coverage.countries.slice(0, 3).map(country => country.country).join(', ') || '—'
  const narrowCoverageCount = coverage.countries.filter(country => country.funders.length === 1 || country.weak).length
  const interpretation = coverage.countries.length
    ? `This selected funder set is concentrated around ${concentrated}, while ${narrowCoverageCount} countries appear through one funder relationship or low coverage weight.`
    : 'Select funders to build a coverage map.'

  return (
    <aside style={{ ...S.panel, padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <p style={{ ...S.label, marginBottom: 7 }}>Strategic Reading</p>
        <h2 style={{ color: '#e2eaf4', fontSize: 16, fontWeight: 800 }}>Coverage summary</h2>
      </div>
      <MetricRow label="Crowded corridors" value={coverage.crowded.slice(0, 5).map(country => country.country).join(', ') || 'None yet'} />
      <MetricRow label="Single-source exposure" value={coverage.single.slice(0, 5).map(country => country.country).join(', ') || 'None yet'} />
      <MetricRow label="Weak coverage" value={coverage.weak.slice(0, 5).map(country => country.country).join(', ') || 'None yet'} />
      <p style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.6, borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 12 }}>{interpretation}</p>
    </aside>
  )
}

function MetricRow({ label, value }) {
  return (
    <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 12 }}>
      <p style={{ ...S.label, marginBottom: 5 }}>{label}</p>
      <p style={{ color: '#c8dff2', fontSize: 12, lineHeight: 1.55, fontWeight: 600 }}>{value}</p>
    </div>
  )
}

const COLORS = ['#60a5fa', '#34d399', '#f59e0b', '#f87171', '#a78bfa', '#2dd4bf', '#fb7185', '#fb923c']

function CustomTooltip({ active, payload, label, isAmount }) {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#0f1e31', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 14px', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
        <p style={{ color: '#e2eaf4', fontSize: 13, fontWeight: 800, marginBottom: 5 }}>{label || payload[0]?.payload?.name || 'Details'}</p>
        {payload.map((entry, index) => {
          let val = entry.value
          if (isAmount) val = fmtAmount(val)
          return (
            <p key={index} style={{ color: entry.color || '#94a3b8', fontSize: 12, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <span>{entry.name}:</span>
              <span style={{ fontWeight: 700, color: '#e2eaf4' }}>{val}</span>
            </p>
          )
        })}
      </div>
    );
  }
  return null;
}

function prepareChartData(projects, config) {
  const map = new Map()
  
  projects.forEach(p => {
    const xVal = p[config.xAxis] || 'Unknown'
    const yVal = config.yAxis === 'amount' ? (Number(p.amount) || 0) : 1
    const sizeVal = config.sizeBy === 'amount' ? (Number(p.amount) || 0) : 1

    let colorVal = 'Total'
    if (config.colorBy && config.colorBy !== 'none' && config.type !== 'pie') {
      colorVal = p[config.colorBy] || 'Unknown'
    }
    
    if (!map.has(xVal)) {
      map.set(xVal, { name: truncate(String(xVal), 20), _original: xVal, total: 0, totalSize: 0 })
    }
    
    const item = map.get(xVal)
    item.total += yVal
    item.totalSize += sizeVal
    
    if (colorVal !== 'Total') {
      item[colorVal] = (item[colorVal] || 0) + yVal
      item[`${colorVal}_size`] = (item[`${colorVal}_size`] || 0) + sizeVal
    }
  })
  
  let result = Array.from(map.values()).sort((a, b) => b.total - a.total).slice(0, 40)
  
  if (config.xAxis === 'year') {
    result = result.sort((a, b) => String(a._original).localeCompare(String(b._original)))
  }
  
  return result
}

function DesignChartArea({ config, projects }) {
  const data = useMemo(() => prepareChartData(projects, config), [projects, config])

  if (!data.length) return <div style={{...S.subtle, padding: 20}}>No data available.</div>

  const dataKeys = useMemo(() => {
    if (!config.colorBy || config.colorBy === 'none' || config.type === 'pie') return ['Total']
    const keys = new Set()
    data.forEach(d => Object.keys(d).forEach(k => {
      if (k !== 'name' && k !== '_original' && k !== 'total' && k !== 'totalSize' && !k.endsWith('_size')) keys.add(k)
    }))
    return Array.from(keys).slice(0, 10)
  }, [data, config])

  const yTickFormatter = config.yAxis === 'amount' ? (v) => `$${v>=1000?v/1000+'B':v>=1?v+'M':v+'K'}` : undefined

  return (
    <div style={{ width: '100%', height: 500, paddingTop: 20 }}>
      <ResponsiveContainer>
        {config.type === 'bar' ? (
          <BarChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 80 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="name" stroke="#64748b" fontSize={11} angle={-45} textAnchor="end" tick={{ fill: '#94a3b8' }} />
            <YAxis stroke="#64748b" fontSize={11} tickFormatter={yTickFormatter} tick={{ fill: '#94a3b8' }} />
            <Tooltip content={<CustomTooltip isAmount={config.yAxis === 'amount'} />} cursor={{fill: 'rgba(255,255,255,0.04)'}} />
            <Legend wrapperStyle={{ fontSize: 11, bottom: 10 }} />
            {dataKeys.map((key, i) => (
              <Bar key={key} dataKey={key} stackId="a" fill={COLORS[i % COLORS.length]} radius={dataKeys.length === 1 ? [4,4,0,0] : [0,0,0,0]} />
            ))}
          </BarChart>
        ) : config.type === 'pie' ? (
          <PieChart margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
            <Pie
              data={data.slice(0, 15)}
              dataKey="total"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={180}
              innerRadius={90}
              paddingAngle={2}
              stroke="none"
            >
              {data.slice(0, 15).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip isAmount={config.yAxis === 'amount'} />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        ) : config.type === 'scatter' ? (
          <ScatterChart margin={{ top: 20, right: 30, bottom: 80, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} angle={-45} textAnchor="end" tick={{ fill: '#94a3b8' }} allowDuplicatedCategory={false} />
            <YAxis type="number" dataKey="total" stroke="#64748b" fontSize={11} name={config.yAxis} tickFormatter={yTickFormatter} tick={{ fill: '#94a3b8' }} />
            {config.sizeBy !== 'none' && <ZAxis type="number" dataKey="totalSize" range={[60, 600]} />}
            <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip isAmount={config.yAxis === 'amount'} />} />
            <Legend wrapperStyle={{ fontSize: 11, bottom: 10 }} />
            {dataKeys.map((key, i) => {
              const seriesData = data.filter(d => d[key] > 0).map(d => ({
                name: d.name,
                total: d[key],
                totalSize: config.sizeBy !== 'none' ? (d[`${key}_size`] || d[key]) : 100
              }))
              return (
                <Scatter key={key} name={key} data={seriesData} fill={COLORS[i % COLORS.length]} opacity={0.7} />
              )
            })}
          </ScatterChart>
        ) : null}
      </ResponsiveContainer>
    </div>
  )
}

function ChartDesignerConfig({ config, setConfig }) {
  const dimensions = [
    { value: 'org', label: 'Funder (Org)' },
    { value: 'country', label: 'Recipient Country' },
    { value: 'regionMacro', label: 'Region' },
    { value: 'sector', label: 'Sector' },
    { value: 'year', label: 'Year' }
  ];
  
  const measures = [
    { value: 'amount', label: 'Funding Amount' },
    { value: 'count', label: 'Project Count' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <p style={{ color: '#e2eaf4', fontSize: 13, fontWeight: 800 }}>Chart Designer</p>
        <p style={{ ...S.subtle, marginTop: 4 }}>Configure your custom visualization.</p>
      </div>

      <div>
        <p style={S.label}>Chart Type</p>
        <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
          {[
            { id: 'bar', label: 'Bar' },
            { id: 'pie', label: 'Pie' },
            { id: 'scatter', label: 'Scatter' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setConfig({ ...config, type: t.id })}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                border: config.type === t.id ? '1px solid #60a5fa' : '1px solid rgba(255,255,255,0.1)',
                background: config.type === t.id ? 'rgba(96,165,250,0.15)' : 'rgba(255,255,255,0.03)',
                color: config.type === t.id ? '#60a5fa' : '#94a3b8',
                cursor: 'pointer'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 12 }}>
        <p style={{...S.label, marginBottom: 8}}>Columns</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <p style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Primary Category (X-Axis)</p>
            <select 
              value={config.xAxis} 
              onChange={e => setConfig({...config, xAxis: e.target.value})}
              style={S.input}
            >
              {dimensions.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>

          <div>
            <p style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Primary Measure (Y-Axis)</p>
            <select 
              value={config.yAxis} 
              onChange={e => setConfig({...config, yAxis: e.target.value})}
              style={S.input}
            >
              {measures.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {(config.type === 'bar' || config.type === 'scatter') && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 12 }}>
          <p style={{...S.label, marginBottom: 8}}>Marks (Color & Size)</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <p style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Color By</p>
              <select 
                value={config.colorBy} 
                onChange={e => setConfig({...config, colorBy: e.target.value})}
                style={S.input}
              >
                <option value="none">None</option>
                {dimensions.filter(d => d.value !== config.xAxis).map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
            
            {config.type === 'scatter' && (
              <div>
                <p style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Size By</p>
                <select 
                  value={config.sizeBy} 
                  onChange={e => setConfig({...config, sizeBy: e.target.value})}
                  style={S.input}
                >
                  <option value="none">None (Uniform)</option>
                  {measures.filter(m => m.value !== config.yAxis).map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  <option value={config.yAxis}>{measures.find(m => m.value === config.yAxis)?.label}</option>
                </select>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function FundingNetworkPage({ projects = [], projectsLoading = false }) {
  const [search, setSearch] = useState('')
  const [selectedFunders, setSelectedFunders] = useState([])
  const [selected, setSelected] = useState(null)
  const [hoveredCountry, setHoveredCountry] = useState(null)
  const [highlightedFunder, setHighlightedFunder] = useState(null)
  const [viewMode, setViewMode] = useState('dashboard')
  const [chartConfig, setChartConfig] = useState({
    type: 'bar',
    xAxis: 'sector',
    yAxis: 'amount',
    colorBy: 'none',
    sizeBy: 'none'
  })

  const funders = useMemo(() => buildFunderData(projects), [projects])
  const dataByFunder = useMemo(() => Object.fromEntries(funders.map(funder => [funder.name, funder])), [funders])

  useEffect(() => {
    if (selectedFunders.length || !funders.length) return
    setSelectedFunders(funders.slice(0, 3).map(funder => funder.name))
  }, [funders, selectedFunders.length])

  const coverage = useMemo(() => deriveCoverage(selectedFunders, dataByFunder), [dataByFunder, selectedFunders])

  const filteredFunders = funders
    .filter(funder => funder.name.toLowerCase().includes(search.trim().toLowerCase()))
    .filter(funder => !selectedFunders.includes(funder.name))
    .slice(0, MAX_FUNDER_RESULTS)

  const selectFunder = name => {
    if (!dataByFunder[name]) return
    setSelectedFunders(prev => prev.includes(name) ? prev : [...prev, name])
    setSelected({ type: 'funder', name })
    setHighlightedFunder(name)
  }

  const removeFunder = name => {
    setSelectedFunders(prev => prev.filter(funder => funder !== name))
    setSelected(prev => prev?.name === name ? null : prev)
    setHighlightedFunder(prev => prev === name ? null : prev)
  }

  const selectedCountryName = selected?.type === 'country' ? selected.name : null
  const hoveredFunders = hoveredCountry?.funders || []

  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ color: '#e2eaf4', fontSize: 20, fontWeight: 800, letterSpacing: '-0.2px' }}>Funding Coverage Map</h1>
          <p style={{ color: '#64748b', fontSize: 12, lineHeight: 1.6, marginTop: 5, maxWidth: 720 }}>
            Explore where selected funders have coverage, where their strategies overlap, and where recipient countries may be weakly connected.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Badge tone="green">Shared corridor</Badge>
          <Badge tone="amber">Single-source</Badge>
          <Badge tone="red">Weak coverage</Badge>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(140px, 1fr))', gap: 12 }}>
        <KpiCard label="Selected funders" value={selectedFunders.length} />
        <KpiCard label="Countries reached" value={coverage.countries.length} />
        <KpiCard label="Shared countries" value={coverage.countries.filter(country => country.funders.length > 1).length} />
        <KpiCard label="Single-source countries" value={coverage.countries.filter(country => country.funders.length === 1).length} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: viewMode === 'design' ? '280px minmax(620px, 1fr)' : '280px minmax(620px, 1fr) 300px', gap: 16, alignItems: 'start' }}>
        <aside style={{ ...S.panel, padding: 16, display: 'flex', flexDirection: 'column', gap: 14, position: 'sticky', top: 16 }}>
          {viewMode === 'design' ? (
            <ChartDesignerConfig config={chartConfig} setConfig={setChartConfig} />
          ) : (
            <>
              <div>
                <p style={{ color: '#e2eaf4', fontSize: 13, fontWeight: 800 }}>Funder selector</p>
                <p style={{ ...S.subtle, marginTop: 4 }}>{funders.length.toLocaleString()} real funders from project records.</p>
              </div>

              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search funders..." style={S.input} />

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <p style={S.label}>Selected funders</p>
                  <button
                    onClick={() => { setSelectedFunders([]); setSelected(null); setHighlightedFunder(null) }}
                    style={{ ...S.quietButton, padding: '5px 8px' }}
                  >
                    Reset
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {selectedFunders.map(name => {
                    const highlighted = highlightedFunder === name || hoveredFunders.includes(name)
                    return (
                      <button
                        key={name}
                        onClick={() => { setSelected({ type: 'funder', name }); setHighlightedFunder(prev => prev === name ? null : name) }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          maxWidth: '100%',
                          padding: '6px 8px',
                          borderRadius: 999,
                          border: highlighted ? '1px solid rgba(96,165,250,0.5)' : '1px solid rgba(35,102,201,0.28)',
                          background: highlighted ? 'rgba(35,102,201,0.22)' : 'rgba(35,102,201,0.1)',
                          color: '#c8dff2',
                          cursor: 'pointer',
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                        title={name}
                      >
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{truncate(name, 28)}</span>
                        <span
                          onClick={event => { event.stopPropagation(); removeFunder(name) }}
                          style={{ color: '#64748b', fontSize: 14, lineHeight: 1 }}
                        >
                          ×
                        </span>
                      </button>
                    )
                  })}
                  {!selectedFunders.length && <p style={S.subtle}>No funders selected.</p>}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 430, overflowY: 'auto', paddingRight: 2 }}>
                {projectsLoading && !funders.length && <p style={{ ...S.subtle, padding: '10px 2px' }}>Loading project data...</p>}
                {filteredFunders.map(funder => (
                  <button
                    key={funder.name}
                    onClick={() => selectFunder(funder.name)}
                    style={{ width: '100%', textAlign: 'left', background: '#0b1829', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '10px 11px', color: '#c8dff2', cursor: 'pointer' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(96,165,250,0.35)'; e.currentTarget.style.background = 'rgba(35,102,201,0.1)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = '#0b1829' }}
                  >
                    <span style={{ display: 'block', fontSize: 12, color: '#e2eaf4', fontWeight: 700 }}>{funder.name}</span>
                    <span style={{ display: 'block', fontSize: 10, color: '#475569', marginTop: 3 }}>{funder.countries.length} countries · {fmtAmount(funder.total)}</span>
                  </button>
                ))}
                {!projectsLoading && !filteredFunders.length && <p style={{ ...S.subtle, padding: '10px 2px' }}>No matching funders to add.</p>}
              </div>
            </>
          )}
        </aside>

        <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ ...S.panel, padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 12 }}>
              <div>
                <p style={{ color: '#e2eaf4', fontSize: 13, fontWeight: 800 }}>{viewMode === 'design' ? 'Custom Visualization' : 'Country coverage'}</p>
                <p style={{ ...S.subtle, marginTop: 3 }}>{viewMode === 'design' ? 'Exploring entire dataset or selection.' : `${WEIGHT_LABEL} is summed from real project amounts. Bottom quartile countries are marked as weak coverage.`}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
                <div style={{ display: 'inline-flex', padding: 3, borderRadius: 8, background: '#070f1c', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {[
                    ['design', 'Design Chart'],
                    ['dashboard', 'Dashboard'],
                    ['graph', 'Graph'],
                  ].map(([mode, label]) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      style={{
                        padding: '6px 10px',
                        border: 'none',
                        borderRadius: 6,
                        background: viewMode === mode ? 'rgba(35,102,201,0.28)' : 'transparent',
                        color: viewMode === mode ? '#e2eaf4' : '#64748b',
                        fontSize: 11,
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <Badge tone="slate">Coverage weight = {WEIGHT_LABEL}</Badge>
              </div>
            </div>

            {viewMode === 'design' ? (
              <DesignChartArea config={chartConfig} projects={projects} />
            ) : !selectedFunders.length ? (
              <div style={{ minHeight: 360, display: 'grid', placeItems: 'center', border: '1px dashed rgba(255,255,255,0.12)', borderRadius: 10, background: 'rgba(255,255,255,0.025)' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: '#e2eaf4', fontSize: 14, fontWeight: 800 }}>Select funders to build a coverage map.</p>
                  <p style={{ ...S.subtle, marginTop: 6 }}>Choose funders from the left panel to compare recipient country coverage.</p>
                </div>
              </div>
            ) : viewMode === 'graph' ? (
              <CoverageGraph
                coverage={coverage}
                selectedFunders={selectedFunders}
                selectedCountry={selectedCountryName}
                highlightedFunder={highlightedFunder}
                maxCountryWeight={coverage.maxCountryWeight}
                onSelectCountry={country => setSelected({ type: 'country', name: country.country })}
                onSelectFunder={name => { setSelected({ type: 'funder', name }); setHighlightedFunder(prev => prev === name ? null : name) }}
                onHoverCountry={setHoveredCountry}
              />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
                <CoverageColumn
                  title="Shared Corridors"
                  subtitle="Countries connected to 2+ selected funders"
                  countries={coverage.shared}
                  empty="No shared countries in this selection."
                  selectedCountry={selectedCountryName}
                  highlightedFunder={highlightedFunder}
                  maxCountryWeight={coverage.maxCountryWeight}
                  onSelectCountry={country => setSelected({ type: 'country', name: country.country })}
                  onHoverCountry={setHoveredCountry}
                />
                <CoverageColumn
                  title="Single-Source Connections"
                  subtitle="Countries connected to exactly one selected funder"
                  countries={coverage.single}
                  empty="No single-source countries in this selection."
                  selectedCountry={selectedCountryName}
                  highlightedFunder={highlightedFunder}
                  maxCountryWeight={coverage.maxCountryWeight}
                  onSelectCountry={country => setSelected({ type: 'country', name: country.country })}
                  onHoverCountry={setHoveredCountry}
                />
              </div>
            )}
          </div>
        </section>

        {viewMode !== 'design' && <StrategicReading selected={selected} coverage={coverage} dataByFunder={dataByFunder} />}
      </div>
    </div>
  )
}
