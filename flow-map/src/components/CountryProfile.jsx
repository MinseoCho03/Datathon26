import { useState } from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

function fmt(v) {
  v = Number(v || 0)
  if (v >= 1000) return `$${(v/1000).toFixed(1)}B`
  if (v >= 1)    return `$${v.toFixed(1)}M`
  return `$${Math.round(v*1000)}K`
}

const COLORS = ['#60a5fa','#34d399','#f59e0b','#f472b6','#a78bfa','#fb923c','#22d3ee','#4ade80']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#070f1c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#c8dff2' }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{label || payload[0]?.name}</div>
      <div>{fmt(payload[0].value)}</div>
    </div>
  )
}

// sectorDnaData: [{sector, amount}] filtered by year only (not sector), passed from MapPage
export default function CountryProfile({ recipient, onClose, sectorDnaData, countryOrgs = [], onOrgClick }) {
  const [donorView, setDonorView] = useState('countries')
  if (!recipient) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '4px 0' }}>
        <p style={{ fontSize: 12, color: '#334155', lineHeight: 1.6 }}>
          Click any dot or shaded country on the map to open its funding profile.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4 }}>
          {[
            ['Duplicating?', 'Compare dominant donors before adding capital.'],
            ['Co-fund?', 'Find active peers already moving money.'],
            ['Cause mix?', 'See if a sector is crowded or under-served.'],
            ['Momentum?', 'Spot pullbacks, surges, or timing windows.'],
          ].map(([q, a]) => (
            <div key={q} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 7, padding: '10px 12px' }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#2366c9', marginBottom: 3 }}>{q}</p>
              <p style={{ fontSize: 11, color: '#334155' }}>{a}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const topDonors = (recipient.topDonors || []).slice(0, 5).map(d => ({
    name: d.donorCountry
      .replace("China (People's Republic of)", 'China')
      .replace('United States', 'US')
      .replace('United Kingdom', 'UK'),
    amount: d.amount,
  }))

  // Sector DNA — use sectorDnaData (year-only filter) if provided, else fall back to recipient data
  const pieSectors = (sectorDnaData && sectorDnaData.length
    ? sectorDnaData
    : (recipient.topSectors || [])
  ).slice(0, 7).map(s => ({
    name: s.sector,
    value: s.amount,
  }))

  const yearTrend = (recipient.yearTrend || []).map(y => ({
    year: String(y.year),
    amount: y.amount,
  }))

  const total = recipient.total
  const topDonor = recipient.topDonors?.[0]
  const concentration = topDonor && total ? Math.round((topDonor.amount / total) * 100) : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto', maxHeight: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#e2eaf4' }}>{recipient.country}</h2>
          <p style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>
            {recipient.regionMacro || recipient.region} · Rank #{recipient.rank}
          </p>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#475569', fontSize: 20, cursor: 'pointer', lineHeight: 1, padding: '0 2px' }}>×</button>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {[
          ['Total Received', fmt(total)],
          ['Concentration', `${concentration}%`],
          ['Top Donor', topDonor
            ? topDonor.donorCountry.replace("China (People's Republic of)", 'China').replace('United States', 'US')
            : '—'],
          ['Top Sector', recipient.topSectors?.[0]?.sector || '—'],
        ].map(([label, val]) => (
          <div key={label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 7, padding: '9px 11px' }}>
            <p style={{ fontSize: 10, color: '#475569', marginBottom: 2 }}>{label}</p>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#e2eaf4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{val}</p>
          </div>
        ))}
      </div>

      {/* Donors section with toggle */}
      {topDonors.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>
              {donorView === 'countries' ? 'Top Donor Countries' : 'Top Donor Orgs'}
            </p>
            <div style={{ display: 'flex', gap: 4 }}>
              {['countries', 'orgs'].map(v => (
                <button key={v} onClick={() => setDonorView(v)}
                  style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, cursor: 'pointer',
                    border: donorView === v ? '1px solid rgba(35,102,201,0.4)' : '1px solid rgba(255,255,255,0.08)',
                    background: donorView === v ? 'rgba(35,102,201,0.15)' : 'transparent',
                    color: donorView === v ? '#60a5fa' : '#475569' }}>
                  {v === 'countries' ? 'Countries' : 'Orgs'}
                </button>
              ))}
            </div>
          </div>

          {donorView === 'countries' ? (
            <ResponsiveContainer width="100%" height={110}>
              <BarChart data={topDonors} layout="vertical" margin={{ left: 8, right: 8, top: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={30} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} interval={0} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="amount" radius={[0,3,3,0]} maxBarSize={12}>
                  {topDonors.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : countryOrgs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {countryOrgs.map((o, i) => (
                <div key={o.org}
                  onClick={() => onOrgClick?.(o.org)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: onOrgClick ? 'pointer' : 'default', borderRadius: 6, padding: '2px 4px', margin: '0 -4px', transition: 'background 0.1s' }}
                  onMouseEnter={e => { if (onOrgClick) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                >
                  <span style={{ width: 16, height: 16, borderRadius: '50%', background: COLORS[i % COLORS.length], display: 'grid', placeItems: 'center', fontSize: 9, fontWeight: 700, color: '#070f1c', flexShrink: 0 }}>{i + 1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 11, color: onOrgClick ? '#7ab4d8' : '#c8dff2', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.org}</p>
                    <p style={{ fontSize: 10, color: '#475569' }}>{o.donorCountry}</p>
                  </div>
                  <span style={{ fontSize: 11, color: '#64748b', flexShrink: 0 }}>{fmt(o.amount)}</span>
                </div>
              ))}
              {onOrgClick && <p style={{ fontSize: 10, color: '#334155', marginTop: 2 }}>Click an org to view its funding history</p>}
            </div>
          ) : (
            <p style={{ fontSize: 11, color: '#334155' }}>No project-level data for this country in the current view.</p>
          )}
        </div>
      )}

      {/* Sector DNA pie chart */}
      {pieSectors.length > 0 && (
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Sector DNA</p>
          <ResponsiveContainer width="100%" height={190}>
            <PieChart>
              <Pie
                data={pieSectors}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="42%"
                innerRadius={32}
                outerRadius={58}
                paddingAngle={2}
              >
                {pieSectors.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                layout="horizontal"
                align="center"
                verticalAlign="bottom"
                iconType="circle"
                iconSize={6}
                wrapperStyle={{ fontSize: 9, color: '#64748b', paddingTop: 4 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Year Trend */}
      {yearTrend.length > 0 && (
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Year Trend</p>
          <ResponsiveContainer width="100%" height={90}>
            <LineChart data={yearTrend} margin={{ left: 12, right: 12, top: 6, bottom: 0 }}>
              <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="amount" stroke="#34d399" strokeWidth={2} dot={{ r: 3, fill: '#0d846a', strokeWidth: 0 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
