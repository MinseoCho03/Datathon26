import { useMemo, useRef, useState } from 'react'

const FOUNDATION_DATA = [
  {
    name: 'Gates Foundation',
    edges: [
      { country: 'Kenya', weight: 42, grants: 18, sector: 'Health' },
      { country: 'India', weight: 65, grants: 24, sector: 'Health' },
      { country: 'Nigeria', weight: 38, grants: 16, sector: 'Health' },
      { country: 'Ethiopia', weight: 22, grants: 9, sector: 'Agriculture' },
    ],
  },
  {
    name: 'Mastercard Foundation',
    edges: [
      { country: 'Kenya', weight: 56, grants: 21, sector: 'Youth Employment' },
      { country: 'Ghana', weight: 44, grants: 17, sector: 'Education' },
      { country: 'Rwanda', weight: 30, grants: 11, sector: 'Digital Skills' },
      { country: 'Nigeria', weight: 28, grants: 10, sector: 'Youth Employment' },
    ],
  },
  {
    name: 'Ford Foundation',
    edges: [
      { country: 'India', weight: 34, grants: 14, sector: 'Civic Engagement' },
      { country: 'Brazil', weight: 29, grants: 12, sector: 'Inequality' },
      { country: 'South Africa', weight: 25, grants: 9, sector: 'Justice' },
      { country: 'Kenya', weight: 18, grants: 7, sector: 'Governance' },
    ],
  },
  {
    name: 'Rockefeller Foundation',
    edges: [
      { country: 'India', weight: 48, grants: 19, sector: 'Climate' },
      { country: 'Kenya', weight: 31, grants: 13, sector: 'Food Systems' },
      { country: 'Indonesia', weight: 26, grants: 10, sector: 'Climate' },
      { country: 'Philippines', weight: 24, grants: 9, sector: 'Resilience' },
    ],
  },
  {
    name: 'Wellcome Trust',
    edges: [
      { country: 'Kenya', weight: 33, grants: 12, sector: 'Health Research' },
      { country: 'South Africa', weight: 41, grants: 15, sector: 'Health Research' },
      { country: 'India', weight: 36, grants: 13, sector: 'Public Health' },
      { country: 'Brazil', weight: 21, grants: 8, sector: 'Infectious Disease' },
    ],
  },
  {
    name: 'MacArthur Foundation',
    edges: [
      { country: 'Nigeria', weight: 27, grants: 10, sector: 'Accountability' },
      { country: 'India', weight: 32, grants: 12, sector: 'Climate' },
      { country: 'Mexico', weight: 23, grants: 8, sector: 'Migration' },
      { country: 'Ghana', weight: 19, grants: 7, sector: 'Governance' },
    ],
  },
]

const DATA_BY_FOUNDATION = Object.fromEntries(FOUNDATION_DATA.map(f => [f.name, f]))
const ALL_FOUNDATIONS = FOUNDATION_DATA.map(f => f.name)
const GRAPH_WIDTH = 760
const GRAPH_HEIGHT = 500

const S = {
  panel: {
    background: '#0f1e31',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 10,
  },
  subtle: { fontSize: 11, color: '#475569', lineHeight: 1.5 },
  label: { fontSize: 10, color: '#334155', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' },
  button: {
    border: '1px solid rgba(35,102,201,0.35)',
    background: 'rgba(35,102,201,0.14)',
    color: '#7ab4d8',
    borderRadius: 7,
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600,
  },
}

function spreadPositions(count, top, bottom) {
  if (count <= 1) return [(top + bottom) / 2]
  const step = (bottom - top) / (count - 1)
  return Array.from({ length: count }, (_, i) => top + i * step)
}

function topEntries(items, keyFn) {
  const counts = {}
  items.forEach(item => {
    const key = keyFn(item)
    counts[key] = (counts[key] || 0) + 1
  })
  return Object.entries(counts).sort((a, b) => b[1] - a[1])
}

function Badge({ children, tone = 'blue' }) {
  const tones = {
    blue: ['#60a5fa', 'rgba(96,165,250,0.12)'],
    green: ['#34d399', 'rgba(52,211,153,0.12)'],
    amber: ['#f59e0b', 'rgba(245,158,11,0.12)'],
    slate: ['#94a3b8', 'rgba(148,163,184,0.1)'],
  }
  const [color, bg] = tones[tone]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 7px', borderRadius: 999, fontSize: 10, fontWeight: 700, color, background: bg, border: `1px solid ${color}35`, whiteSpace: 'nowrap' }}>
      {children}
    </span>
  )
}

function Metric({ label, value, sub }) {
  return (
    <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 12 }}>
      <p style={{ ...S.label, marginBottom: 5 }}>{label}</p>
      <p style={{ fontSize: 16, color: '#e2eaf4', fontWeight: 700, lineHeight: 1.3 }}>{value}</p>
      {sub && <p style={{ ...S.subtle, marginTop: 4 }}>{sub}</p>}
    </div>
  )
}

function InsightPanel({ selection, network }) {
  const { selectedFoundations, selectedEdges, countryStats, strongestEdge, sharedCountries, uniqueCountries } = network

  if (!selectedEdges.length) {
    return (
      <div style={{ ...S.panel, padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <p style={{ fontSize: 13, color: '#e2eaf4', fontWeight: 700 }}>Network insight</p>
          <p style={{ ...S.subtle, marginTop: 5 }}>Add foundations to compare overlap, concentration, and relationship strength.</p>
        </div>
        <Metric label="Selected foundations" value={selectedFoundations.length} />
        <Metric label="Countries reached" value={countryStats.length} />
      </div>
    )
  }

  if (selection?.type === 'foundation') {
    const edges = selectedEdges.filter(e => e.foundation === selection.name)
    if (edges.length) {
      const strongest = [...edges].sort((a, b) => b.weight - a.weight)[0]
      const sectors = topEntries(edges, e => e.sector).map(([sector]) => sector).slice(0, 3)
      const total = edges.reduce((sum, e) => sum + e.weight, 0)
      return (
        <div style={{ ...S.panel, padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <Badge tone="blue">foundation</Badge>
            <p style={{ fontSize: 18, color: '#e2eaf4', fontWeight: 800, marginTop: 8 }}>{selection.name}</p>
          </div>
          <Metric label="Connected countries" value={edges.map(e => e.country).join(', ')} />
          <Metric label="Strongest connection" value={strongest.country} sub={`Relative funding weight ${strongest.weight}`} />
          <Metric label="Top sectors" value={sectors.join(', ')} />
          <Metric label="Total relative funding weight" value={total} />
        </div>
      )
    }
  }

  if (selection?.type === 'country') {
    const stat = countryStats.find(c => c.country === selection.name)
    if (stat) {
      return (
        <div style={{ ...S.panel, padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <Badge tone={stat.foundations.length > 1 ? 'green' : 'amber'}>{stat.foundations.length > 1 ? 'shared funding corridor' : 'single-source connection'}</Badge>
            <p style={{ fontSize: 18, color: '#e2eaf4', fontWeight: 800, marginTop: 8 }}>{selection.name}</p>
          </div>
          <Metric label="Connected selected foundations" value={stat.foundations.join(', ')} />
          <Metric label="Total incoming funding weight" value={stat.totalWeight} />
          <Metric label="Dominant sector" value={stat.dominantSector} />
          <Metric label="Network role" value={stat.foundations.length > 1 ? 'Shared by multiple selected foundations' : `Unique to ${stat.foundations[0]}`} />
        </div>
      )
    }
  }

  if (selection?.type === 'edge') {
    const edge = selectedEdges.find(e => e.id === selection.id)
    if (edge) {
      const sorted = [...selectedEdges].sort((a, b) => b.weight - a.weight)
      const rank = sorted.findIndex(e => e.id === edge.id)
      const interpretation = rank < Math.ceil(sorted.length / 3)
        ? 'This is one of the stronger relationships in the selected network.'
        : 'This is a lighter connection compared with other selected foundation-country links.'
      return (
        <div style={{ ...S.panel, padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <Badge tone="slate">relationship</Badge>
            <p style={{ fontSize: 18, color: '#e2eaf4', fontWeight: 800, marginTop: 8 }}>{edge.foundation} → {edge.country}</p>
          </div>
          <Metric label="Funding weight" value={edge.weight} />
          <Metric label="Grant count" value={`${edge.grants} grants`} />
          <Metric label="Top sector" value={edge.sector} />
          <p style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.6, borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 12 }}>{interpretation}</p>
        </div>
      )
    }
  }

  const strongestLabel = strongestEdge ? `${strongestEdge.foundation} → ${strongestEdge.country}` : 'None yet'
  const insightSentence = sharedCountries.length
    ? `${sharedCountries[0].country} appears as a shared recipient across multiple selected foundations, while ${uniqueCountries[0]?.country || 'some countries'} are connected through one foundation in this sample network.`
    : `${uniqueCountries[0]?.country || countryStats[0]?.country} is currently a single-source connection in this sample network. Add another foundation to reveal potential overlaps.`

  return (
    <div style={{ ...S.panel, padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <p style={{ fontSize: 13, color: '#e2eaf4', fontWeight: 700 }}>Network insight</p>
        <p style={{ ...S.subtle, marginTop: 5 }}>Shared countries reveal overlap across foundation strategies.</p>
      </div>
      <Metric label="Selected foundations" value={selectedFoundations.length} />
      <Metric label="Countries reached" value={countryStats.length} />
      <Metric label="Strongest connection" value={strongestLabel} sub={strongestEdge ? `Relative funding weight ${strongestEdge.weight}` : null} />
      <Metric label="Shared recipient countries" value={sharedCountries.length ? sharedCountries.map(c => c.country).join(', ') : 'None in this selection'} />
      <Metric label="Single-source countries" value={uniqueCountries.length ? uniqueCountries.map(c => c.country).join(', ') : 'None in this selection'} />
      <p style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.7, borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 12 }}>
        {insightSentence}
      </p>
    </div>
  )
}

export default function FundingNetworkPage() {
  const [selectedFoundations, setSelectedFoundations] = useState(['Gates Foundation', 'Mastercard Foundation'])
  const [search, setSearch] = useState('')
  const [selection, setSelection] = useState(null)
  const [hover, setHover] = useState(null)
  const [tooltip, setTooltip] = useState(null)
  const graphRef = useRef(null)

  const network = useMemo(() => {
    const selectedEdges = selectedFoundations.flatMap(foundation =>
      DATA_BY_FOUNDATION[foundation].edges.map(edge => ({
        ...edge,
        foundation,
        id: `${foundation}|||${edge.country}`,
      }))
    )

    const countryMap = new Map()
    selectedEdges.forEach(edge => {
      if (!countryMap.has(edge.country)) {
        countryMap.set(edge.country, { country: edge.country, edges: [], totalWeight: 0, foundations: [] })
      }
      const stat = countryMap.get(edge.country)
      stat.edges.push(edge)
      stat.totalWeight += edge.weight
      stat.foundations.push(edge.foundation)
    })

    const countryStats = [...countryMap.values()]
      .map(stat => {
        const dominantSector = topEntries(stat.edges, e => e.sector)[0]?.[0] || 'Mixed'
        return { ...stat, dominantSector, foundations: [...new Set(stat.foundations)] }
      })
      .sort((a, b) => b.totalWeight - a.totalWeight || a.country.localeCompare(b.country))

    const foundationY = spreadPositions(selectedFoundations.length, 90, GRAPH_HEIGHT - 90)
    const countryY = spreadPositions(countryStats.length, 70, GRAPH_HEIGHT - 70)
    const foundationNodes = selectedFoundations.map((name, i) => ({ type: 'foundation', name, x: 135, y: foundationY[i] }))
    const countryNodes = countryStats.map((stat, i) => ({ type: 'country', name: stat.country, x: 610, y: countryY[i], stat }))
    const nodeByName = Object.fromEntries([...foundationNodes, ...countryNodes].map(node => [`${node.type}:${node.name}`, node]))
    const strongestEdge = [...selectedEdges].sort((a, b) => b.weight - a.weight)[0] || null
    const sharedCountries = countryStats.filter(c => c.foundations.length > 1)
    const uniqueCountries = countryStats.filter(c => c.foundations.length === 1)
    const weights = selectedEdges.map(e => e.weight)
    const minWeight = Math.min(...weights, 0)
    const maxWeight = Math.max(...weights, 1)

    return {
      selectedFoundations,
      selectedEdges,
      countryStats,
      foundationNodes,
      countryNodes,
      nodeByName,
      strongestEdge,
      sharedCountries,
      uniqueCountries,
      minWeight,
      maxWeight,
    }
  }, [selectedFoundations])

  const filteredFoundations = ALL_FOUNDATIONS.filter(name => name.toLowerCase().includes(search.trim().toLowerCase()))
  const availableFoundations = filteredFoundations.filter(name => !selectedFoundations.includes(name))

  const addFoundation = name => {
    setSelectedFoundations(prev => prev.includes(name) ? prev : [...prev, name])
    setSelection({ type: 'foundation', name })
  }

  const removeFoundation = name => {
    setSelectedFoundations(prev => prev.filter(f => f !== name))
    setSelection(prev => prev?.name === name ? null : prev)
    setHover(null)
    setTooltip(null)
  }

  const isConnectedToSelection = edge => {
    if (!selection) return false
    if (selection.type === 'foundation') return edge.foundation === selection.name
    if (selection.type === 'country') return edge.country === selection.name
    return selection.type === 'edge' && edge.id === selection.id
  }

  const isConnectedToHover = edge => {
    if (!hover) return false
    if (hover.type === 'foundation') return edge.foundation === hover.name
    if (hover.type === 'country') return edge.country === hover.name
    return hover.type === 'edge' && edge.id === hover.id
  }

  const edgeWidth = weight => {
    const { minWeight, maxWeight } = network
    const range = Math.max(maxWeight - minWeight, 1)
    return 2 + ((weight - minWeight) / range) * 7
  }

  const nodeActive = node => {
    if (!selection && !hover) return false
    const active = selection || hover
    if (active.type === node.type && active.name === node.name) return true
    if (node.type === 'foundation') return network.selectedEdges.some(edge => edge.foundation === node.name && ((active.type === 'country' && edge.country === active.name) || (active.type === 'edge' && edge.id === active.id)))
    if (node.type === 'country') return network.selectedEdges.some(edge => edge.country === node.name && ((active.type === 'foundation' && edge.foundation === active.name) || (active.type === 'edge' && edge.id === active.id)))
    return false
  }

  const handleEdgeMove = (event, edge) => {
    const rect = graphRef.current?.getBoundingClientRect()
    if (!rect) return
    setTooltip({
      x: event.clientX - rect.left + 12,
      y: event.clientY - rect.top + 12,
      edge,
    })
  }

  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.6 }}>
            Drag or click foundations to build a network. Edge thickness = relative funding weight.
          </p>
          <p style={{ fontSize: 11, color: '#334155', marginTop: 4 }}>Sample foundation-country relationship data for strategy exploration.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Badge tone="blue">Foundation nodes</Badge>
          <Badge tone="green">Recipient countries</Badge>
          <Badge tone="slate">Sample data</Badge>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px minmax(440px, 1fr) 300px', gap: 16, alignItems: 'stretch' }}>
        <aside style={{ ...S.panel, padding: 16, display: 'flex', flexDirection: 'column', gap: 14, minHeight: 600 }}>
          <div>
            <p style={{ fontSize: 13, color: '#e2eaf4', fontWeight: 700 }}>Available foundations</p>
            <p style={{ ...S.subtle, marginTop: 4 }}>Click or drag a foundation into the canvas.</p>
          </div>

          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search foundations..."
            style={{ background: '#070f1c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, color: '#c8dff2', padding: '9px 10px', fontSize: 12, outline: 'none' }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {availableFoundations.map(name => (
              <button
                key={name}
                draggable
                onDragStart={e => e.dataTransfer.setData('text/plain', name)}
                onClick={() => addFoundation(name)}
                style={{ textAlign: 'left', background: '#0b1829', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, color: '#c8dff2', padding: '11px 12px', cursor: 'grab' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(96,165,250,0.35)'; e.currentTarget.style.background = 'rgba(35,102,201,0.12)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = '#0b1829' }}
              >
                <span style={{ display: 'block', fontSize: 13, fontWeight: 700 }}>{name}</span>
                <span style={{ display: 'block', fontSize: 11, color: '#475569', marginTop: 3 }}>Add to network</span>
              </button>
            ))}
            {!availableFoundations.length && <p style={{ ...S.subtle, padding: '10px 2px' }}>All matching foundations are already selected.</p>}
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={S.label}>Selected foundations</p>
            {selectedFoundations.map(name => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(35,102,201,0.1)', border: '1px solid rgba(35,102,201,0.25)', borderRadius: 8, padding: '9px 10px' }}>
                <button onClick={() => setSelection({ type: 'foundation', name })} style={{ flex: 1, textAlign: 'left', background: 'none', border: 'none', color: '#e2eaf4', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>{name}</button>
                <button onClick={() => removeFoundation(name)} title={`Remove ${name}`} style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#94a3b8', cursor: 'pointer', lineHeight: 1 }}>×</button>
              </div>
            ))}
          </div>
        </aside>

        <section
          ref={graphRef}
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault()
            const name = e.dataTransfer.getData('text/plain')
            if (name) addFoundation(name)
          }}
          style={{ ...S.panel, position: 'relative', minHeight: 600, padding: 16, overflow: 'hidden' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 10, alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 13, color: '#e2eaf4', fontWeight: 700 }}>Funding network</p>
              <p style={{ ...S.subtle, marginTop: 3 }}>Shared countries reveal overlap across foundation strategies.</p>
            </div>
            <button onClick={() => { setSelectedFoundations([]); setSelection(null); setHover(null); setTooltip(null) }} style={{ ...S.button, padding: '8px 11px' }}>Clear</button>
          </div>

          <svg viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`} style={{ width: '100%', height: 'calc(100% - 54px)', minHeight: 510, display: 'block' }}>
            <defs>
              <linearGradient id="networkEdge" x1="0" x2="1">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
              <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <text x="58" y="36" fill="#475569" fontSize="11" fontWeight="700" letterSpacing="1.1">FOUNDATIONS</text>
            <text x="548" y="36" fill="#475569" fontSize="11" fontWeight="700" letterSpacing="1.1">RECIPIENT COUNTRIES</text>
            <line x1="250" y1="44" x2="250" y2={GRAPH_HEIGHT - 30} stroke="rgba(255,255,255,0.05)" />
            <line x1="500" y1="44" x2="500" y2={GRAPH_HEIGHT - 30} stroke="rgba(255,255,255,0.05)" />

            {network.selectedEdges.map(edge => {
              const from = network.nodeByName[`foundation:${edge.foundation}`]
              const to = network.nodeByName[`country:${edge.country}`]
              if (!from || !to) return null
              const active = isConnectedToSelection(edge) || isConnectedToHover(edge)
              const inactive = (selection || hover) && !active
              const path = `M ${from.x + 78} ${from.y} C 330 ${from.y}, 420 ${to.y}, ${to.x - 70} ${to.y}`
              return (
                <path
                  key={edge.id}
                  d={path}
                  fill="none"
                  stroke={active ? 'url(#networkEdge)' : 'rgba(148,163,184,0.42)'}
                  strokeWidth={edgeWidth(edge.weight)}
                  strokeLinecap="round"
                  opacity={inactive ? 0.18 : active ? 0.95 : 0.58}
                  filter={active ? 'url(#softGlow)' : undefined}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelection({ type: 'edge', id: edge.id })}
                  onMouseEnter={e => { setHover({ type: 'edge', id: edge.id }); handleEdgeMove(e, edge) }}
                  onMouseMove={e => handleEdgeMove(e, edge)}
                  onMouseLeave={() => { setHover(null); setTooltip(null) }}
                />
              )
            })}

            {network.foundationNodes.map(node => {
              const active = nodeActive(node)
              const dim = (selection || hover) && !active
              return (
                <g
                  key={node.name}
                  onClick={() => setSelection({ type: 'foundation', name: node.name })}
                  onMouseEnter={() => setHover({ type: 'foundation', name: node.name })}
                  onMouseLeave={() => setHover(null)}
                  style={{ cursor: 'pointer' }}
                  opacity={dim ? 0.35 : 1}
                >
                  <rect x={node.x - 84} y={node.y - 24} width="168" height="48" rx="9" fill={active ? 'rgba(35,102,201,0.36)' : '#102844'} stroke={active ? '#60a5fa' : 'rgba(96,165,250,0.32)'} strokeWidth={active ? 2 : 1} />
                  <circle cx={node.x - 62} cy={node.y} r="8" fill="#60a5fa" />
                  <text x={node.x - 46} y={node.y + 4} fill="#e2eaf4" fontSize="12" fontWeight="700">{node.name}</text>
                </g>
              )
            })}

            {network.countryNodes.map(node => {
              const active = nodeActive(node)
              const dim = (selection || hover) && !active
              const shared = node.stat.foundations.length > 1
              return (
                <g
                  key={node.name}
                  onClick={() => setSelection({ type: 'country', name: node.name })}
                  onMouseEnter={() => setHover({ type: 'country', name: node.name })}
                  onMouseLeave={() => setHover(null)}
                  style={{ cursor: 'pointer' }}
                  opacity={dim ? 0.35 : 1}
                >
                  <circle cx={node.x} cy={node.y} r={active ? 25 : 22} fill={shared ? 'rgba(52,211,153,0.28)' : 'rgba(245,158,11,0.22)'} stroke={shared ? '#34d399' : '#f59e0b'} strokeWidth={active ? 2.5 : 1.4} />
                  <text x={node.x + 34} y={node.y - 4} fill="#e2eaf4" fontSize="12" fontWeight="800">{node.name}</text>
                  <text x={node.x + 34} y={node.y + 13} fill={shared ? '#34d399' : '#f59e0b'} fontSize="10" fontWeight="700">{shared ? 'shared funding corridor' : 'single-source connection'}</text>
                </g>
              )
            })}

            {!network.selectedEdges.length && (
              <g>
                <rect x="170" y="190" width="420" height="96" rx="12" fill="rgba(255,255,255,0.035)" stroke="rgba(255,255,255,0.08)" />
                <text x="380" y="232" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="700">Build a network from the foundation list</text>
                <text x="380" y="256" textAnchor="middle" fill="#475569" fontSize="12">Click or drop foundations here to compare recipient countries.</text>
              </g>
            )}
          </svg>

          {tooltip?.edge && (
            <div style={{ position: 'absolute', left: tooltip.x, top: tooltip.y, zIndex: 5, pointerEvents: 'none', background: '#070f1c', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '9px 11px', boxShadow: '0 12px 28px rgba(0,0,0,0.35)', minWidth: 210 }}>
              <p style={{ color: '#e2eaf4', fontSize: 12, fontWeight: 800 }}>{tooltip.edge.foundation} → {tooltip.edge.country}</p>
              <p style={{ color: '#94a3b8', fontSize: 11, marginTop: 5 }}>Funding weight: {tooltip.edge.weight}</p>
              <p style={{ color: '#94a3b8', fontSize: 11 }}>Grant count: {tooltip.edge.grants}</p>
              <p style={{ color: '#94a3b8', fontSize: 11 }}>Top sector: {tooltip.edge.sector}</p>
            </div>
          )}
        </section>

        <InsightPanel selection={selection} network={network} />
      </div>
    </div>
  )
}
