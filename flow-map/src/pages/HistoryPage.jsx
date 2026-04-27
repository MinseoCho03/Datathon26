import { useMemo } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts'

function fmt(v) {
  v = Number(v || 0)
  if (v >= 1000) return `$${(v/1000).toFixed(1)}B`
  if (v >= 1)    return `$${v.toFixed(1)}M`
  return `$${Math.round(v*1000)}K`
}

const TT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#0f1e31', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#c8dff2' }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
      {payload.map(p => <div key={p.name} style={{ color: p.color }}>{p.name}: {fmt(p.value)}</div>)}
    </div>
  )
}

const COLORS = ['#60a5fa','#34d399','#f59e0b','#f472b6','#a78bfa','#fb923c','#22d3ee']
const SECTOR_COLORS = { 'Health':'#34d399','Education':'#60a5fa','Agriculture':'#f59e0b','Financial Services':'#a78bfa','Social Services':'#fb923c','Gov & Civil Society':'#22d3ee','Reproductive Health':'#f472b6' }

function ChartCard({ title, sub, children }) {
  return (
    <div style={{ background: '#0f1e31', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '16px 18px' }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#c8dff2', marginBottom: 2 }}>{title}</p>
      {sub && <p style={{ fontSize: 11, color: '#475569', marginBottom: 14 }}>{sub}</p>}
      {children}
    </div>
  )
}

export default function HistoryPage({ data }) {
  const yearly = data.fundingByYear || []

  // Year totals from records
  const yearTotals = useMemo(() => {
    const m = {}
    ;(data.records || []).forEach(r => { m[r.year] = (m[r.year] || 0) + r.amount })
    return (data.years || []).map(yr => ({ year: String(yr), amount: m[yr] || 0 }))
  }, [data])

  // Sector × year breakdown
  const topSectors = useMemo(() => {
    const m = {}
    ;(data.records || []).forEach(r => { m[r.sector] = (m[r.sector] || 0) + r.amount })
    return Object.entries(m).sort((a,b) => b[1]-a[1]).slice(0,6).map(([s]) => s)
  }, [data])

  const sectorByYear = useMemo(() => {
    const rows = {}
    ;(data.records || []).forEach(r => {
      if (!topSectors.includes(r.sector)) return
      const k = String(r.year)
      if (!rows[k]) rows[k] = { year: k }
      rows[k][r.sector] = (rows[k][r.sector] || 0) + r.amount
    })
    return (data.years || []).map(yr => rows[String(yr)] || { year: String(yr) })
  }, [data, topSectors])

  // Donor × year
  const donorByYear = useMemo(() => {
    const donors = {}
    ;(data.records || []).forEach(r => { donors[r.donorCountry] = (donors[r.donorCountry] || 0) + r.amount })
    const top = Object.entries(donors).sort((a,b) => b[1]-a[1]).slice(0,5).map(([d]) => d)
    const rows = {}
    ;(data.records || []).forEach(r => {
      if (!top.includes(r.donorCountry)) return
      const k = String(r.year)
      if (!rows[k]) rows[k] = { year: k }
      rows[k][r.donorCountry] = (rows[k][r.donorCountry] || 0) + r.amount
    })
    return { rows: (data.years||[]).map(yr => rows[String(yr)] || { year: String(yr) }), donors: top }
  }, [data])

  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <ChartCard title="Total Funding by Year" sub="All records, USD millions deflated">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={yearTotals} margin={{ left: 0, right: 16, top: 8, bottom: 0 }}>
            <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip content={<TT />} />
            <Line type="monotone" dataKey="amount" stroke="#2366c9" strokeWidth={3} dot={{ r: 5, fill: '#0d846a', strokeWidth: 0 }} activeDot={{ r: 7 }} name="Total" />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Sector Breakdown by Year" sub="Top 6 sectors, stacked">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={sectorByYear} margin={{ left: 0, right: 16, top: 8, bottom: 0 }}>
            <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip content={<TT />} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#64748b' }} />
            {topSectors.map((s, i) => (
              <Bar key={s} dataKey={s} stackId="a" fill={SECTOR_COLORS[s] || COLORS[i % COLORS.length]} maxBarSize={40} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Top Donor Countries by Year" sub="Top 5 donor countries over time">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={donorByYear.rows} margin={{ left: 0, right: 16, top: 8, bottom: 0 }}>
            <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip content={<TT />} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#64748b' }} />
            {donorByYear.donors.map((d, i) => (
              <Line key={d} type="monotone" dataKey={d} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} name={d.replace("China (People's Republic of)",'China')} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
