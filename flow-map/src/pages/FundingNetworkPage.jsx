import { useEffect, useMemo, useState } from 'react'

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
    shared: withStatus.filter(country => country.funders.length > 1 && !country.weak),
    single: withStatus.filter(country => country.funders.length === 1 && !country.weak),
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
  const interpretation = coverage.countries.length
    ? `This selected funder set is concentrated around ${concentrated}, while ${coverage.single.length + coverage.weak.length} countries appear through one funder relationship or low coverage weight.`
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

export default function FundingNetworkPage({ projects = [], projectsLoading = false }) {
  const [search, setSearch] = useState('')
  const [selectedFunders, setSelectedFunders] = useState([])
  const [selected, setSelected] = useState(null)
  const [hoveredCountry, setHoveredCountry] = useState(null)
  const [highlightedFunder, setHighlightedFunder] = useState(null)

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

      <div style={{ display: 'grid', gridTemplateColumns: '280px minmax(620px, 1fr) 300px', gap: 16, alignItems: 'start' }}>
        <aside style={{ ...S.panel, padding: 16, display: 'flex', flexDirection: 'column', gap: 14, position: 'sticky', top: 16 }}>
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
        </aside>

        <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ ...S.panel, padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 12 }}>
              <div>
                <p style={{ color: '#e2eaf4', fontSize: 13, fontWeight: 800 }}>Country coverage</p>
                <p style={{ ...S.subtle, marginTop: 3 }}>{WEIGHT_LABEL} is summed from real project amounts. Bottom quartile countries are marked as weak coverage.</p>
              </div>
              <Badge tone="slate">Coverage weight = {WEIGHT_LABEL}</Badge>
            </div>

            {!selectedFunders.length ? (
              <div style={{ minHeight: 360, display: 'grid', placeItems: 'center', border: '1px dashed rgba(255,255,255,0.12)', borderRadius: 10, background: 'rgba(255,255,255,0.025)' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: '#e2eaf4', fontSize: 14, fontWeight: 800 }}>Select funders to build a coverage map.</p>
                  <p style={{ ...S.subtle, marginTop: 6 }}>Choose funders from the left panel to compare recipient country coverage.</p>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
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
                <CoverageColumn
                  title="Possible White Space"
                  subtitle="Lower-weight countries among this selected set"
                  countries={coverage.weak}
                  empty="No weak coverage countries in this selection."
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

        <StrategicReading selected={selected} coverage={coverage} dataByFunder={dataByFunder} />
      </div>
    </div>
  )
}
