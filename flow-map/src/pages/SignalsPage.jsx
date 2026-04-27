import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts'

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
      <div style={{ fontWeight: 600, marginBottom: 2 }}>{label}</div>
      <div>{fmt(payload[0].value)}</div>
    </div>
  )
}

const COLORS = ['#60a5fa','#34d399','#f59e0b','#f472b6','#a78bfa','#fb923c','#22d3ee','#4ade80','#f87171','#fbbf24']

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

export default function SignalsPage({ data }) {
  const m = data.metrics || {}

  const topFunders = useMemo(() => (data.topFunders || []).slice(0, 8).map(f => ({ name: f.label, amount: f.amount })), [data])

  const topRecipients = useMemo(() => (data.topRecipientCountries || []).filter(r => !r.label.toLowerCase().includes('unspecified') && !r.label.toLowerCase().includes('regional') && !r.label.toLowerCase().includes('bilateral')).slice(0, 8).map(r => ({ name: r.label.replace("China (People's Republic of)",'China'), amount: r.amount })), [data])

  const sectorPie = useMemo(() => (data.topSectors || []).slice(0, 7).map((s, i) => ({ name: s.label, value: s.amount, fill: COLORS[i % COLORS.length] })), [data])

  const donorBar = useMemo(() => (data.topDonorCountries || []).slice(0, 6).map(d => ({ name: d.label.replace("China (People's Republic of)",'China'), amount: d.amount })), [data])

  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        <Kpi label="Total Disbursed" value={m.totalFundingLabel || '$68.2B'} sub="2020–2023, all records" />
        <Kpi label="Records" value={(m.recordCount || 116561).toLocaleString()} />
        <Kpi label="Recipient Countries" value={m.recipientCount || 135} />
        <Kpi label="Donor Countries" value={m.donorCount || 25} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {topFunders.length > 0 && (
          <ChartCard title="Top Funders" sub="By total disbursed">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={topFunders} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={130} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<TT />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="amount" radius={[0,4,4,0]} maxBarSize={16}>
                  {topFunders.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {sectorPie.length > 0 && (
          <ChartCard title="Sector Share" sub="Proportion of total disbursements">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={sectorPie} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {sectorPie.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip formatter={v => fmt(v)} contentStyle={{ background: '#0f1e31', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12, color: '#c8dff2' }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#64748b' }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {topRecipients.length > 0 && (
          <ChartCard title="Top Recipient Countries" sub="Excluding regional/unspecified buckets">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topRecipients} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={90} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<TT />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="amount" radius={[0,4,4,0]} maxBarSize={16} fill="#0d846a" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {donorBar.length > 0 && (
          <ChartCard title="Top Donor Countries" sub="By country of origin">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={donorBar} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={100} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<TT />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="amount" radius={[0,4,4,0]} maxBarSize={16}>
                  {donorBar.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>

      <div style={{ background: '#0f1e31', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '14px 18px', fontSize: 12, color: '#475569', lineHeight: 1.6 }}>
        <strong style={{ color: '#64748b' }}>About this dataset:</strong> OECD private philanthropy data covering cross-border grants from foundations and philanthropic organisations to recipient countries, 2020–2023. Amounts are in USD millions, deflated. Regional and unspecified recipient buckets are excluded from country-level analysis.
      </div>
    </div>
  )
}
