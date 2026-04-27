import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

function fmt(millions) {
  const v = Number(millions || 0)
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}B`
  if (v >= 1) return `$${v.toFixed(1)}M`
  return `$${Math.round(v * 1000)}K`
}

const SECTOR_COLORS = [
  '#60a5fa','#34d399','#f59e0b','#f472b6','#a78bfa','#fb923c','#22d3ee','#4ade80',
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#132235', border: '1px solid #1e3a5f', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#c8dff2' }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
      <div>{fmt(payload[0].value)}</div>
    </div>
  )
}

export default function CountryProfile({ recipient, onClose }) {
  if (!recipient) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <p className="text-sm text-slate-400 leading-relaxed">
          Click any blue dot or shaded country on the map to open its funding profile.
          You'll see top donor countries, sector breakdown, and year trend.
        </p>
        <div className="grid grid-cols-2 gap-3 mt-2">
          {[
            ['Where are we duplicating?', 'Compare dominant donors before adding capital.'],
            ['Where can we co-fund?', 'Find active peers already moving money.'],
            ['Cause mix too narrow?', 'See if health, education, or climate is crowded.'],
            ['Momentum changing?', 'Spot pullbacks, surges, or timing windows.'],
          ].map(([q, a]) => (
            <div key={q} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '12px 14px' }}>
              <p className="text-xs font-semibold text-blue-300 mb-1">{q}</p>
              <p className="text-xs text-slate-400">{a}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const topDonors = (recipient.topDonors || []).slice(0, 6).map((d) => ({
    name: d.donorCountry.replace("China (People's Republic of)", 'China').replace('United States', 'US').replace('United Kingdom', 'UK'),
    amount: d.amount,
  }))

  const topSectors = (recipient.topSectors || []).slice(0, 6).map((s) => ({
    name: s.sector,
    amount: s.amount,
  }))

  const yearTrend = (recipient.yearTrend || []).map((y) => ({
    year: String(y.year),
    amount: y.amount,
  }))

  const total = recipient.total
  const topDonor = recipient.topDonors?.[0]
  const topSector = recipient.topSectors?.[0]
  const concentration = topDonor && total ? Math.round((topDonor.amount / total) * 100) : 0

  return (
    <div className="flex flex-col gap-5 overflow-y-auto" style={{ maxHeight: '100%' }}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">{recipient.country}</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {recipient.regionMacro || recipient.region} · Rank #{recipient.rank}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-slate-300 text-xl leading-none"
        >×</button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3">
        {[
          ['Total Received', fmt(total)],
          ['Concentration', `${concentration}%`],
          ['Top Donor', topDonor ? topDonor.donorCountry.replace("China (People's Republic of)", 'China').replace('United States', 'US') : '—'],
          ['Top Sector', topSector?.sector || '—'],
        ].map(([label, val]) => (
          <div key={label} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '10px 12px' }}>
            <p className="text-xs text-slate-400 mb-0.5">{label}</p>
            <p className="text-sm font-bold text-white truncate">{val}</p>
          </div>
        ))}
      </div>

      {/* Donors bar chart */}
      {topDonors.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-300 mb-2">Top Donor Countries</p>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={topDonors} layout="vertical" margin={{ left: 0, right: 8, top: 0, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={36} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="amount" radius={[0, 4, 4, 0]} maxBarSize={14}>
                {topDonors.map((_, i) => (
                  <Cell key={i} fill={SECTOR_COLORS[i % SECTOR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Sectors bar chart */}
      {topSectors.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-300 mb-2">Sector DNA</p>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={topSectors} layout="vertical" margin={{ left: 0, right: 8, top: 0, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={76} tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="amount" radius={[0, 4, 4, 0]} maxBarSize={14} fill="#2366c9" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Year trend */}
      {yearTrend.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-300 mb-2">Year Trend</p>
          <ResponsiveContainer width="100%" height={100}>
            <LineChart data={yearTrend} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
              <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#34d399"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#0d846a', strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
