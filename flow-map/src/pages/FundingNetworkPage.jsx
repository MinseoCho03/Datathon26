import { useEffect, useMemo, useRef, useState } from 'react'
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from 'd3-force'
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

const GW = 780, GH = 780
// Approximate px per character for 11px bold sans-serif
const CHAR_W = 6.8
const BOX_PAD = 18
const MAX_BOX_W = 160
const MAX_BOX_CHARS = Math.floor((MAX_BOX_W - BOX_PAD) / CHAR_W) // ~21 chars before ellipsis
// Recipient label estimation (10px regular sans-serif)
const LCHAR_W = 5.5
const LABEL_H = 13

function funderBoxWidth(label) {
  const capped = label.length > MAX_BOX_CHARS ? label.slice(0, MAX_BOX_CHARS - 1) + '…' : label
  return Math.min(capped.length * CHAR_W + BOX_PAD, MAX_BOX_W)
}

const GRAPH_GUTTER = 22
const GRAPH_ZOOM_MIN = 0.75
const GRAPH_ZOOM_MAX = 3.2
const GRAPH_DRAG_THRESHOLD = 6
const GRAPH_LEGEND = [['#60a5fa', 'Funder'], ['#34d399', 'Shared'], ['#f59e0b', 'Single-source'], ['#f87171', 'Weak coverage']]

function clampZoom(value) {
  return Math.max(GRAPH_ZOOM_MIN, Math.min(GRAPH_ZOOM_MAX, Number(value.toFixed(2))))
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value))
}

function CoverageGraph({ coverage, selectedFunders, selectedCountry, highlightedFunder, maxCountryWeight, onSelectCountry, onSelectFunder, onHoverCountry }) {
  const svgRef = useRef(null)
  const pointersRef = useRef(new Map())
  const gestureRef = useRef(null)
  const draggedRef = useRef(false)
  const dragDistanceRef = useRef(0)
  const [viewport, setViewport] = useState({ cx: GW / 2, cy: GH / 2, zoom: 1 })

  const { nodes, links, graphSize, displayH } = useMemo(() => {
    const visible = coverage.countries          // show ALL countries, no slice
    const visibleSet = new Set(visible.map(c => c.country))

    // Square canvas keeps the force layout circular instead of flattened.
    const totalNodes = visible.length + selectedFunders.length
    const dynSize = Math.max(620, Math.min(1040, totalNodes * 13))
    const dynDisplayH = Math.max(520, Math.min(760, dynSize))

    const nodeArr = [
      ...selectedFunders.map(name => ({
        id: name, type: 'funder', label: name,
        boxW: funderBoxWidth(name),
      })),
      ...visible.map(c => ({
        id: c.country, country: c.country, type: 'recipient', label: c.country,
        status: c.status, funders: c.funders, totalWeight: c.totalWeight, mainSector: c.mainSector,
      })),
    ]
    const linkArr = coverage.relationships
      .filter(r => visibleSet.has(r.country))
      .map(r => ({ source: r.funder, target: r.country, weight: r.weight }))

    if (!nodeArr.length) return { nodes: [], links: [], graphSize: dynSize, displayH: dynDisplayH }

    forceSimulation(nodeArr)
      .force('link', forceLink(linkArr).id(d => d.id).distance(160).strength(0.4))
      .force('charge', forceManyBody().strength(-520))
      .force('center', forceCenter(dynSize / 2, dynSize / 2))
      .force('collide', forceCollide(n => n.type === 'funder' ? (n.boxW / 2 + 12) : 48).iterations(4))
      .stop()
      .tick(300)

    nodeArr.forEach(n => {
      const pad = n.type === 'funder' ? (n.boxW / 2 + 14) : 52
      n.x = Math.max(pad, Math.min(dynSize - pad, n.x ?? dynSize / 2))
      n.y = Math.max(34, Math.min(dynSize - 34, n.y ?? dynSize / 2))
    })

    // ── Label deconfliction ──────────────────────────────────────────────────
    // Compute each node's label bounding box, then iteratively push
    // overlapping labels apart in Y. Funder boxes are fixed anchors;
    // only recipient text labels move.
    const maxTW = Math.max(...visible.map(c => c.totalWeight), 1)

    const meta = nodeArr.map(n => {
      if (n.type === 'funder') {
        const bw = n.boxW ?? 80
        return { n, isFunder: true, bw }
      }
      const r = 6 + Math.min(10, ((n.totalWeight ?? 0) / maxTW) * 10)
      const lw = truncate(n.label, 18).length * LCHAR_W
      const right = n.x <= dynSize / 2
      return { n, isFunder: false, r, lw, right }
    })

    nodeArr.forEach(n => { n._adjY = 0 })

    for (let iter = 0; iter < 80; iter++) {
      let moved = false
      for (let i = 0; i < meta.length; i++) {
        for (let j = i + 1; j < meta.length; j++) {
          const a = meta[i], b = meta[j]

          // X bounds of each label
          const ax1 = a.isFunder ? a.n.x - a.bw / 2 : a.right ? a.n.x + a.r + 5 : a.n.x - a.r - 5 - a.lw
          const ax2 = a.isFunder ? a.n.x + a.bw / 2 : a.right ? a.n.x + a.r + 5 + a.lw : a.n.x - a.r - 5
          const bx1 = b.isFunder ? b.n.x - b.bw / 2 : b.right ? b.n.x + b.r + 5 : b.n.x - b.r - 5 - b.lw
          const bx2 = b.isFunder ? b.n.x + b.bw / 2 : b.right ? b.n.x + b.r + 5 + b.lw : b.n.x - b.r - 5

          if (ax2 <= bx1 || bx2 <= ax1) continue   // no X overlap → skip

          // Y bounds (funder box fixed; recipient floats by _adjY)
          const aH = a.isFunder ? 22 : LABEL_H
          const bH = b.isFunder ? 22 : LABEL_H
          const ay = a.n.y + (a.isFunder ? 0 : a.n._adjY)
          const by = b.n.y + (b.isFunder ? 0 : b.n._adjY)
          const oy = Math.min(ay + aH / 2, by + bH / 2) - Math.max(ay - aH / 2, by - bH / 2)
          if (oy <= 0) continue

          const push = oy / 2 + 1
          if (!a.isFunder) a.n._adjY += ay <= by ? -push : push
          if (!b.isFunder) b.n._adjY += by <= ay ? -push : push
          moved = true
        }
      }
      if (!moved) break
    }
    // ────────────────────────────────────────────────────────────────────────

    nodeArr.forEach(n => {
      if (n.type !== 'funder') {
        n._adjY = Math.max(12 - n.y, Math.min(dynSize - 12 - n.y, n._adjY ?? 0))
      }
    })

    return { nodes: nodeArr, links: linkArr, graphSize: dynSize, displayH: dynDisplayH }
  }, [selectedFunders, coverage])

  useEffect(() => {
    setViewport({ cx: graphSize / 2, cy: graphSize / 2, zoom: 1 })
    pointersRef.current.clear()
    gestureRef.current = null
    draggedRef.current = false
    dragDistanceRef.current = 0
  }, [graphSize, selectedFunders, coverage.countries.length])

  const graphViewBox = useMemo(() => {
    const base = graphSize + GRAPH_GUTTER * 2
    const view = base / viewport.zoom
    const viewX = viewport.cx - view / 2
    const viewY = viewport.cy - view / 2
    return `${viewX} ${viewY} ${view} ${view}`
  }, [graphSize, viewport])

  const zoomByAt = (clientX, clientY, factor) => {
    setViewport(current => {
      const svg = svgRef.current
      if (!svg) return current
      const rect = svg.getBoundingClientRect()
      const safeZoom = clampZoom(current.zoom * factor)
      const base = graphSize + GRAPH_GUTTER * 2
      const oldView = base / current.zoom
      const oldX = current.cx - oldView / 2
      const oldY = current.cy - oldView / 2
      const scale = Math.min(rect.width / oldView, rect.height / oldView)
      const contentW = oldView * scale
      const contentH = oldView * scale
      const offsetX = (rect.width - contentW) / 2
      const offsetY = (rect.height - contentH) / 2
      const rx = clamp01((clientX - rect.left - offsetX) / contentW)
      const ry = clamp01((clientY - rect.top - offsetY) / contentH)
      const graphX = oldX + rx * oldView
      const graphY = oldY + ry * oldView
      const newView = base / safeZoom
      return {
        cx: graphX - (rx - 0.5) * newView,
        cy: graphY - (ry - 0.5) * newView,
        zoom: safeZoom,
      }
    })
  }

  const updatePan = (dx, dy) => {
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    setViewport(current => {
      const base = graphSize + GRAPH_GUTTER * 2
      const view = base / current.zoom
      const scale = Math.min(rect.width / view, rect.height / view)
      return {
        ...current,
        cx: current.cx - dx / scale,
        cy: current.cy - dy / scale,
      }
    })
  }

  const handleWheel = event => {
    event.preventDefault()
    const factor = event.deltaY > 0 ? 0.88 : 1.14
    zoomByAt(event.clientX, event.clientY, factor)
  }

  const zoomByCenter = factor => {
    setViewport(current => ({
      ...current,
      zoom: clampZoom(current.zoom * factor),
    }))
  }

  const resetViewport = () => {
    setViewport({ cx: graphSize / 2, cy: graphSize / 2, zoom: 1 })
  }

  const handlePointerDown = event => {
    draggedRef.current = false
    dragDistanceRef.current = 0
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    const points = [...pointersRef.current.values()]
    const midX = points.length >= 2 ? (points[0].x + points[1].x) / 2 : event.clientX
    const midY = points.length >= 2 ? (points[0].y + points[1].y) / 2 : event.clientY
    gestureRef.current = {
      lastX: midX,
      lastY: midY,
      dist: points.length >= 2 ? Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y) : 0,
    }
  }

  const handlePointerMove = event => {
    if (!pointersRef.current.has(event.pointerId)) return
    const previous = pointersRef.current.get(event.pointerId)
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    const points = [...pointersRef.current.values()]

    if (points.length >= 2) {
      const [a, b] = points
      const cx = (a.x + b.x) / 2
      const cy = (a.y + b.y) / 2
      const dist = Math.hypot(a.x - b.x, a.y - b.y)
      const last = gestureRef.current || { lastX: cx, lastY: cy, dist }
      if (last.dist > 0 && dist > 0) zoomByAt(cx, cy, dist / last.dist)
      updatePan(cx - last.lastX, cy - last.lastY)
      gestureRef.current = { lastX: cx, lastY: cy, dist }
      dragDistanceRef.current += Math.hypot(cx - last.lastX, cy - last.lastY)
      if (dragDistanceRef.current > GRAPH_DRAG_THRESHOLD) draggedRef.current = true
      return
    }

    const dx = event.clientX - previous.x
    const dy = event.clientY - previous.y
    const move = Math.hypot(dx, dy)
    if (move > 0) {
      dragDistanceRef.current += move
      updatePan(dx, dy)
      if (dragDistanceRef.current > GRAPH_DRAG_THRESHOLD) draggedRef.current = true
    }
    gestureRef.current = { lastX: event.clientX, lastY: event.clientY, dist: 0 }
  }

  const handlePointerEnd = event => {
    pointersRef.current.delete(event.pointerId)
    const points = [...pointersRef.current.values()]
    gestureRef.current = points.length
      ? { lastX: points[0].x, lastY: points[0].y, dist: 0 }
      : null
    if (draggedRef.current) window.setTimeout(() => { draggedRef.current = false }, 0)
    if (!points.length) window.setTimeout(() => { dragDistanceRef.current = 0 }, 0)
  }

  const runNodeAction = action => {
    if (draggedRef.current) return
    action()
  }

  const center = graphSize / 2

  return (
    <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, background: '#0b1829', overflow: 'hidden' }}>
      <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <p style={{ color: '#e2eaf4', fontSize: 12, fontWeight: 800 }}>Funding network</p>
          <p style={{ ...S.subtle, marginTop: 2 }}>{selectedFunders.length} funder{selectedFunders.length !== 1 ? 's' : ''} · {coverage.countries.length} countries · force-directed layout</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {GRAPH_LEGEND.map(([color, label]) => (
              <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color }}>
                <svg width="8" height="8"><circle cx="4" cy="4" r="4" fill={color} /></svg>
                {label}
              </span>
            ))}
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: 3, borderRadius: 8, background: '#070f1c', border: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              type="button"
              title="Zoom out"
              onClick={() => zoomByCenter(0.85)}
              style={{ ...S.quietButton, width: 26, height: 24, padding: 0, borderRadius: 6, fontSize: 15, lineHeight: 1 }}
            >
              −
            </button>
            <button
              type="button"
              title="Reset zoom"
              onClick={resetViewport}
              style={{ ...S.quietButton, minWidth: 46, height: 24, padding: '0 7px', borderRadius: 6, fontSize: 10 }}
            >
              {Math.round(viewport.zoom * 100)}%
            </button>
            <button
              type="button"
              title="Zoom in"
              onClick={() => zoomByCenter(1.18)}
              style={{ ...S.quietButton, width: 26, height: 24, padding: 0, borderRadius: 6, fontSize: 15, lineHeight: 1 }}
            >
              +
            </button>
          </div>
        </div>
      </div>

      <svg
        ref={svgRef}
        viewBox={graphViewBox}
        width="100%"
        height={displayH}
        preserveAspectRatio="xMidYMid meet"
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onPointerLeave={handlePointerEnd}
        style={{ display: 'block', overflow: 'hidden', touchAction: 'none', cursor: pointersRef.current.size ? 'grabbing' : 'grab' }}
      >
        {/* Edges */}
        {links.map((link, i) => {
          const src = typeof link.source === 'object' ? link.source : null
          const tgt = typeof link.target === 'object' ? link.target : null
          if (!src || !tgt) return null
          const active = selectedCountry === tgt.id || highlightedFunder === src.id
          const muted = (selectedCountry && selectedCountry !== tgt.id) || (highlightedFunder && highlightedFunder !== src.id)
          const color = tgt.status === 'weak' ? '#f87171' : tgt.funders?.length > 1 ? '#34d399' : '#f59e0b'
          return (
            <line key={i}
              x1={src.x} y1={src.y} x2={tgt.x} y2={tgt.y}
              stroke={color} strokeWidth={active ? 2.5 : 1}
              strokeOpacity={active ? 0.75 : muted ? 0.05 : 0.2}
            />
          )
        })}

        {/* Recipients first, funders on top */}
        {[...nodes].sort(a => a.type === 'funder' ? 1 : -1).map(node => {
          const isFunder = node.type === 'funder'
          const isSelected = selectedCountry === node.id
          const isHighlighted = highlightedFunder === node.id
          const related = !isFunder && highlightedFunder ? node.funders?.includes(highlightedFunder) : false
          const r = isFunder ? 0 : 6 + Math.min(10, ((node.totalWeight ?? 0) / Math.max(maxCountryWeight, 1)) * 10)
          const fill = isFunder
            ? (isHighlighted ? 'rgba(35,102,201,0.45)' : '#0f1e31')
            : node.status === 'weak' ? '#321b24' : node.funders?.length > 1 ? '#143224' : '#352817'
          const stroke = isFunder ? '#60a5fa'
            : node.status === 'weak' ? '#f87171'
            : node.funders?.length > 1 ? '#34d399' : '#f59e0b'
          const emphStroke = (isSelected || isHighlighted || related) ? '#93c5fd' : stroke

          // Recipient labels flip side based on which half of the canvas they're in
          const labelRight = !isFunder && (node.x ?? center) <= center
          const textX = isFunder ? 0 : labelRight ? (r + 6) : -(r + 6)
          const textAnchor = isFunder ? 'middle' : labelRight ? 'start' : 'end'

          // Funder: dynamic box, Recipient: circle
          const boxW = node.boxW ?? 80
          const displayLabel = isFunder
            ? (node.label.length > MAX_BOX_CHARS ? node.label.slice(0, MAX_BOX_CHARS - 1) + '…' : node.label)
            : truncate(node.label, 18)

          return (
            <g key={node.id}
              transform={`translate(${(node.x ?? center).toFixed(1)},${(node.y ?? center).toFixed(1)})`}
              onClick={() => runNodeAction(() => isFunder ? onSelectFunder(node.id) : onSelectCountry(node))}
              onMouseEnter={() => !isFunder && onHoverCountry(node)}
              onMouseLeave={() => !isFunder && onHoverCountry(null)}
              style={{ cursor: 'pointer' }}
            >
              {isFunder
                ? <rect x={-boxW / 2} y={-11} width={boxW} height={22} rx={6}
                    fill={fill} stroke={emphStroke} strokeWidth={isHighlighted ? 2 : 1.2} />
                : <circle r={r} fill={fill} stroke={emphStroke} strokeWidth={(isSelected || related) ? 2.3 : 1.4} />
              }
              <text x={textX} y={isFunder ? 4 : 4 + (node._adjY ?? 0)}
                textAnchor={textAnchor}
                fill={isFunder ? '#c8dff2' : '#94a3b8'}
                fontSize={isFunder ? 11 : 10}
                fontWeight={isFunder ? 700 : 400}
                style={{ pointerEvents: 'none', userSelect: 'none' }}>
                {displayLabel}
              </text>
              <title>{node.label}{!isFunder ? ` · ${fmtAmount(node.totalWeight)}` : ''}</title>
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

  let result = Array.from(map.values()).sort((a, b) => b.total - a.total)

  if (config.xAxisFilter?.length) {
    const filterSet = new Set(config.xAxisFilter)
    result = result.filter(item => filterSet.has(String(item._original)))
  } else if (config.xAxis === 'country' || config.xAxis === 'org') {
    result = result.slice(0, 20)
  } else {
    result = result.slice(0, 40)
  }

  if (config.xAxis === 'year') {
    result = result.sort((a, b) => String(a._original).localeCompare(String(b._original)))
  }

  return result
}

function DesignChartArea({ config, projects }) {
  const data = useMemo(() => prepareChartData(projects, config), [projects, config])

  if (!data.length) return <div style={{...S.subtle, padding: 20}}>No data available.</div>

  const dataKeys = useMemo(() => {
    if (!config.colorBy || config.colorBy === 'none' || config.type === 'pie') return ['total']
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
          <BarChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 95 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="name" stroke="#64748b" fontSize={11} angle={-45} textAnchor="end" tick={{ fill: '#94a3b8' }} interval={0} minTickGap={0} height={88} />
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
              {data.slice(0, 15).map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip isAmount={config.yAxis === 'amount'} />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        ) : config.type === 'scatter' ? (
          <ScatterChart margin={{ top: 20, right: 30, bottom: 95, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} angle={-45} textAnchor="end" tick={{ fill: '#94a3b8' }} allowDuplicatedCategory={false} interval={0} minTickGap={0} height={88} />
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

function CheckboxRow({ checked, label, onChange }) {
  return (
    <label
      style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '3px 5px', borderRadius: 5, transition: 'background 0.1s' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
    >
      <div style={{
        width: 14, height: 14, borderRadius: 3, flexShrink: 0, transition: 'all 0.1s',
        border: checked ? '1.5px solid #60a5fa' : '1.5px solid rgba(255,255,255,0.18)',
        background: checked ? '#60a5fa' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {checked && (
          <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
            <path d="M1 3L3 5L7 1" stroke="#070f1c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ display: 'none' }} />
      <span style={{ fontSize: 11, color: checked ? '#c8dff2' : '#64748b', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
    </label>
  )
}

function ChartDesignerConfig({ config, setConfig, availableValues = { sectors: [], countries: [], orgs: [] } }) {
  const [filterSearch, setFilterSearch] = useState('')

  const dimensions = [
    { value: 'regionMacro', label: 'Region' },
    { value: 'sector', label: 'Sector' },
    { value: 'year', label: 'Year' },
    { value: 'country', label: 'Recipient Country' },
    { value: 'org', label: 'Donor Organization' },
  ]

  const measures = [
    { value: 'amount', label: 'Funding Amount' },
    { value: 'count', label: 'Project Count' },
  ]

  const allItems = (
    config.xAxis === 'sector' ? availableValues.sectors :
    config.xAxis === 'country' ? availableValues.countries.slice(0, 80) :
    config.xAxis === 'org' ? availableValues.orgs.slice(0, 80) : []
  )

  const defaultActiveSet = new Set(config.xAxis === 'sector' ? allItems : allItems.slice(0, 20))
  const activeSet = config.xAxisFilter !== null ? new Set(config.xAxisFilter) : defaultActiveSet
  const showFilter = ['sector', 'country', 'org'].includes(config.xAxis)

  const visibleItems = filterSearch
    ? allItems.filter(i => i.toLowerCase().includes(filterSearch.toLowerCase()))
    : allItems

  const handleXAxisChange = newAxis => {
    setFilterSearch('')
    setConfig({ ...config, xAxis: newAxis, xAxisFilter: null })
  }

  const toggleItem = item => {
    const next = new Set(activeSet)
    if (next.has(item)) next.delete(item); else next.add(item)
    setConfig({ ...config, xAxisFilter: [...next] })
  }

  const checkedVisible = visibleItems.filter(i => activeSet.has(i)).length
  const allVisibleChecked = visibleItems.length > 0 && checkedVisible === visibleItems.length

  const toggleAllVisible = () => {
    const next = new Set(activeSet)
    if (allVisibleChecked) visibleItems.forEach(i => next.delete(i))
    else visibleItems.forEach(i => next.add(i))
    setConfig({ ...config, xAxisFilter: [...next] })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <p style={{ color: '#e2eaf4', fontSize: 13, fontWeight: 800 }}>Chart Designer</p>
        <p style={{ ...S.subtle, marginTop: 4 }}>Configure your custom visualization.</p>
      </div>

      <div>
        <p style={S.label}>Chart Type</p>
        <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
          {[{ id: 'bar', label: 'Bar' }, { id: 'pie', label: 'Pie' }, { id: 'scatter', label: 'Scatter' }].map(t => (
            <button
              key={t.id}
              onClick={() => setConfig({ ...config, type: t.id })}
              style={{
                padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                border: config.type === t.id ? '1px solid #60a5fa' : '1px solid rgba(255,255,255,0.1)',
                background: config.type === t.id ? 'rgba(96,165,250,0.15)' : 'rgba(255,255,255,0.03)',
                color: config.type === t.id ? '#60a5fa' : '#94a3b8',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <p style={{ ...S.label, marginBottom: 0 }}>X-Axis</p>
        <select value={config.xAxis} onChange={e => handleXAxisChange(e.target.value)} style={S.input}>
          {dimensions.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
        </select>

        {showFilter && (
          <div style={{ background: '#070f1c', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ ...S.label, margin: 0 }}>
                {config.xAxis === 'sector' ? 'Sectors' : config.xAxis === 'country' ? 'Countries' : 'Organizations'}
                <span style={{ color: '#334155', fontWeight: 400, textTransform: 'none', fontSize: 10, marginLeft: 4 }}>
                  {activeSet.size} selected
                </span>
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={toggleAllVisible} style={{ fontSize: 10, color: '#475569', background: 'none', border: 'none', cursor: 'pointer' }}>
                  {allVisibleChecked ? 'None' : 'All'}
                </button>
                {config.xAxisFilter !== null && (
                  <button onClick={() => { setConfig({ ...config, xAxisFilter: null }); setFilterSearch('') }} style={{ fontSize: 10, color: '#334155', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Reset
                  </button>
                )}
              </div>
            </div>

            <input
              value={filterSearch}
              onChange={e => setFilterSearch(e.target.value)}
              placeholder="Search…"
              style={{ ...S.input, fontSize: 11, padding: '5px 8px' }}
            />

            <div style={{ maxHeight: 170, overflowY: 'auto', display: 'flex', flexDirection: 'column', paddingRight: 2 }}>
              {visibleItems.map(item => (
                <CheckboxRow
                  key={item}
                  checked={activeSet.has(item)}
                  label={item}
                  onChange={() => toggleItem(item)}
                />
              ))}
              {!visibleItems.length && <p style={{ ...S.subtle, fontSize: 10, padding: '4px 5px' }}>No matches.</p>}
            </div>
          </div>
        )}

        <div>
          <p style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Y-Axis</p>
          <select value={config.yAxis} onChange={e => setConfig({ ...config, yAxis: e.target.value })} style={S.input}>
            {measures.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
      </div>

      {(config.type === 'bar' || config.type === 'scatter') && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 12 }}>
          <p style={{ ...S.label, marginBottom: 8 }}>Marks</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <p style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Color By</p>
              <select value={config.colorBy} onChange={e => setConfig({ ...config, colorBy: e.target.value })} style={S.input}>
                <option value="none">None</option>
                {dimensions.filter(d => d.value !== config.xAxis).map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
            {config.type === 'scatter' && (
              <div>
                <p style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Size By</p>
                <select value={config.sizeBy} onChange={e => setConfig({ ...config, sizeBy: e.target.value })} style={S.input}>
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
  const [viewMode, setViewMode] = useState('design')
  const [chartConfig, setChartConfig] = useState({
    type: 'bar',
    xAxis: 'sector',
    yAxis: 'amount',
    colorBy: 'none',
    sizeBy: 'none',
    xAxisFilter: null,
  })

  const funders = useMemo(() => buildFunderData(projects), [projects])
  const dataByFunder = useMemo(() => Object.fromEntries(funders.map(funder => [funder.name, funder])), [funders])

  const availableValues = useMemo(() => {
    if (!projects.length) return { sectors: [], countries: [], orgs: [] }
    const countryTotals = {}, orgTotals = {}, sectorSet = new Set()
    for (const p of projects) {
      if (p.sector) sectorSet.add(p.sector)
      if (p.country) countryTotals[p.country] = (countryTotals[p.country] || 0) + (Number(p.amount) || 0)
      if (p.org) orgTotals[p.org] = (orgTotals[p.org] || 0) + (Number(p.amount) || 0)
    }
    return {
      sectors: [...sectorSet].sort(),
      countries: Object.entries(countryTotals).sort((a, b) => b[1] - a[1]).map(([k]) => k),
      orgs: Object.entries(orgTotals).sort((a, b) => b[1] - a[1]).map(([k]) => k),
    }
  }, [projects])

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
          <h1 style={{ color: '#e2eaf4', fontSize: 20, fontWeight: 800, letterSpacing: '-0.2px' }}>Funding Explorer</h1>
          <p style={{ color: '#64748b', fontSize: 12, lineHeight: 1.6, marginTop: 5, maxWidth: 720 }}>
            Explore where selected funders have coverage, where their strategies overlap, and where recipient countries may be weakly connected.
          </p>
        </div>
      </div>


      <div style={{ display: 'grid', gridTemplateColumns: viewMode === 'design' ? '280px minmax(0, 1fr)' : '280px minmax(620px, 1fr) 300px', gap: 16, alignItems: 'start' }}>
        <aside style={{ ...S.panel, padding: 16, display: 'flex', flexDirection: 'column', gap: 14, position: 'sticky', top: 16 }}>
          {viewMode === 'design' ? (
            <ChartDesignerConfig config={chartConfig} setConfig={setChartConfig} availableValues={availableValues} />
          ) : (
            <>
              <div>
                <p style={{ color: '#e2eaf4', fontSize: 13, fontWeight: 800 }}>Funder selector</p>
                <p style={{ ...S.subtle, marginTop: 4 }}>{funders.length.toLocaleString()} real funders from project records.</p>
              </div>

              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search funders..." style={S.input} />

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <p style={S.label}>Selected funders <span style={{ color: '#60a5fa', fontWeight: 800 }}>{selectedFunders.length > 0 ? `(${selectedFunders.length})` : ''}</span></p>
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

        <section style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
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

        <div style={{ display: viewMode === 'design' ? 'none' : undefined }}>
          <StrategicReading selected={selected} coverage={coverage} dataByFunder={dataByFunder} />
        </div>
      </div>
    </div>
  )
}
