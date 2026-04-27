import { useMemo } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts'

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
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
      {payload.map(p => <div key={p.name} style={{ color: p.color || '#c8dff2' }}>{p.name ? `${p.name}: ` : ''}{fmt(p.value)}</div>)}
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

function Kpi({ label, value, sub }) {
  return (
    <div style={{ background: '#0f1e31', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '14px 18px' }}>
      <p style={{ fontSize: 11, color: '#475569', marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 20, fontWeight: 700, color: '#e2eaf4' }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: '#334155', marginTop: 3 }}>{sub}</p>}
    </div>
  )
}

export default function HistoryPage({ data }) {
  const gf = data.gatesFunding || {}

  const yearTrend  = gf.yearTrend  || []
  const bySector   = (gf.bySector  || []).slice(0, 8).map(s => ({ name: s.sector,  amount: s.amount }))
  const byCountry  = (gf.byCountry || []).slice(0, 10).map(c => ({ name: c.country, amount: c.amount }))
  const byRegion   = (gf.byRegion  || []).map(r => ({ name: r.region,  amount: r.amount }))

  // Year-over-year delta
  const delta = useMemo(() => {
    if (yearTrend.length < 2) return null
    const first = yearTrend[0].amount
    const last  = yearTrend[yearTrend.length - 1].amount
    const pct   = first ? Math.round(((last - first) / first) * 100) : 0
    return { pct, dir: pct >= 0 ? '+' : '' }
  }, [yearTrend])

  const uniqueRecip = new Set((gf.projects || []).map(p => p.country)).size

  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header note */}
      <div style={{ background: 'rgba(35,102,201,0.08)', border: '1px solid rgba(35,102,201,0.2)', borderRadius: 10, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#2366c9,#0d846a)', display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 800, color: '#fff', flexShrink: 0 }}>GF</div>
        <p style={{ fontSize: 12, color: '#7ab4d8' }}>
          All charts on this page show <strong style={{ color: '#c8dff2' }}>Gates Foundation</strong> disbursements only — {(gf.projects || []).length.toLocaleString()} grants across 2020–2023.
        </p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        <Kpi label="Total Disbursed" value={gf.totalLabel || fmt(gf.total)} sub="Gates Foundation, 2020–2023" />
        <Kpi label="Annual Average" value={fmt((gf.total || 0) / 4)} sub="Across 4 years" />
        <Kpi label="Recipient Countries" value={uniqueRecip} sub="Mapped recipient countries" />
        <Kpi label="Trend" value={delta ? `${delta.dir}${delta.pct}%` : '—'} sub={`2020 → ${yearTrend[yearTrend.length-1]?.year || 2023}`} />
      </div>

      {/* Year trend line */}
      <ChartCard title="Annual Disbursements" sub="Gates Foundation total per year, USD millions">
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
        <ChartCard title="Disbursements by Sector" sub="Gates Foundation priority areas">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={bySector} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={120} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<TT />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="amount" radius={[0,4,4,0]} maxBarSize={16}>
                {bySector.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Region breakdown */}
        <ChartCard title="Disbursements by Region" sub="Where Gates Foundation money flows">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byRegion} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={80} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<TT />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="amount" radius={[0,4,4,0]} maxBarSize={18} fill="#0d846a" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Top recipient countries */}
      <ChartCard title="Top Recipient Countries" sub="Gates Foundation grants by recipient country (excludes regional/bilateral buckets)">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={byCountry} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" width={110} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<TT />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="amount" radius={[0,4,4,0]} maxBarSize={16}>
              {byCountry.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
