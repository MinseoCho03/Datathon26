import { useMemo } from 'react'
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
    <div style={{ background: '#0f1e31', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#c8dff2' }}>
      <div style={{ fontWeight: 600, marginBottom: 2 }}>{label}</div>
      <div>{fmt(payload[0].value)}</div>
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

function Kpi({ label, value }) {
  return (
    <div style={{ background: '#0f1e31', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '14px 18px' }}>
      <p style={{ fontSize: 11, color: '#475569', marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 20, fontWeight: 700, color: '#e2eaf4' }}>{value}</p>
    </div>
  )
}

export default function PipelinePage({ data }) {
  const projects = data.projects || []

  const bySector = useMemo(() => {
    const m = {}
    projects.forEach(p => { m[p.sector] = (m[p.sector] || 0) + p.amount })
    return Object.entries(m).map(([name, amount]) => ({ name, amount })).sort((a,b) => b.amount - a.amount).slice(0, 10)
  }, [projects])

  const byRegion = useMemo(() => {
    const m = {}
    projects.forEach(p => { if (p.regionMacro) m[p.regionMacro] = (m[p.regionMacro] || 0) + p.amount })
    return Object.entries(m).map(([name, amount]) => ({ name, amount })).sort((a,b) => b.amount - a.amount)
  }, [projects])

  const byDonor = useMemo(() => {
    const m = {}
    projects.forEach(p => { if (p.donorCountry) m[p.donorCountry] = (m[p.donorCountry] || 0) + p.amount })
    return Object.entries(m).map(([name, amount]) => ({ name, amount })).sort((a,b) => b.amount - a.amount).slice(0, 8)
  }, [projects])

  const byCountry = useMemo(() => {
    const m = {}
    projects.forEach(p => { if (p.country) m[p.country] = (m[p.country] || 0) + p.amount })
    return Object.entries(m).map(([name, amount]) => ({ name, amount })).sort((a,b) => b.amount - a.amount).slice(0, 10)
  }, [projects])

  const totalAmount = projects.reduce((s, p) => s + p.amount, 0)
  const uniqueOrgs  = new Set(projects.map(p => p.org)).size
  const uniqueRecip = new Set(projects.map(p => p.country)).size

  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        <Kpi label="Projects (top 1000)" value={projects.length.toLocaleString()} />
        <Kpi label="Total Amount"        value={fmt(totalAmount)} />
        <Kpi label="Unique Organisations" value={uniqueOrgs.toLocaleString()} />
        <Kpi label="Recipient Countries" value={uniqueRecip.toLocaleString()} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <ChartCard title="Funding by Sector" sub="Top 10 sectors by total disbursements">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={bySector} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={110} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<TT />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="amount" radius={[0,4,4,0]} maxBarSize={16}>
                {bySector.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Funding by Region" sub="Macro-region breakdown">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byRegion} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={80} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<TT />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="amount" radius={[0,4,4,0]} maxBarSize={18} fill="#2366c9" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top Donor Countries" sub="By total disbursed">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byDonor} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={90} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<TT />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="amount" radius={[0,4,4,0]} maxBarSize={16}>
                {byDonor.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top Recipient Countries" sub="By total received (top 10)">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byCountry} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={100} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<TT />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="amount" radius={[0,4,4,0]} maxBarSize={16} fill="#0d846a" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}
