import { useMemo } from 'react'
import {
  ComposableMap,
  Geographies,
  Geography,
  useMapContext,
} from 'react-simple-maps'
import { scaleSequentialLog } from 'd3-scale'

const GEO_URL =
  'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

const ISO_TO_NAME = {
  4:'Afghanistan',8:'Albania',12:'Algeria',24:'Angola',32:'Argentina',
  51:'Armenia',36:'Australia',40:'Austria',50:'Bangladesh',56:'Belgium',
  84:'Belize',204:'Benin',64:'Bhutan',68:'Bolivia',70:'Bosnia and Herzegovina',
  72:'Botswana',76:'Brazil',854:'Burkina Faso',108:'Burundi',116:'Cambodia',
  120:'Cameroon',124:'Canada',140:'Central African Republic',148:'Chad',
  152:'Chile',156:"China (People's Republic of)",170:'Colombia',178:'Democratic Republic of the Congo',
  174:'Comoros',188:'Costa Rica',384:"Côte d'Ivoire",192:'Cuba',
  208:'Denmark',262:'Djibouti',214:'Dominican Republic',218:'Ecuador',
  818:'Egypt',222:'El Salvador',232:'Eritrea',251:'Eswatini',231:'Ethiopia',
  246:'Finland',250:'France',260:'Gabon',270:'Gambia',268:'Georgia',
  276:'Germany',288:'Ghana',320:'Guatemala',324:'Guinea',624:'Guinea-Bissau',
  328:'Guyana',332:'Haiti',340:'Honduras',356:'India',360:'Indonesia',
  368:'Iraq',372:'Ireland',376:'Israel',380:'Italy',388:'Jamaica',
  392:'Japan',400:'Jordan',398:'Kazakhstan',404:'Kenya',
  418:"Lao People's Democratic Republic",422:'Lebanon',426:'Lesotho',
  430:'Liberia',434:'Libya',450:'Madagascar',454:'Malawi',458:'Malaysia',
  462:'Maldives',466:'Mali',484:'Mexico',498:'Moldova',496:'Mongolia',
  504:'Morocco',508:'Mozambique',104:'Myanmar',516:'Namibia',524:'Nepal',
  528:'Netherlands',558:'Nicaragua',562:'Niger',
  566:'Nigeria',578:'Norway',586:'Pakistan',591:'Panama',598:'Papua New Guinea',
  600:'Paraguay',604:'Peru',608:'Philippines',620:'Portugal',634:'Qatar',
  646:'Rwanda',686:'Senegal',694:'Sierra Leone',706:'Somalia',
  710:'South Africa',728:'South Sudan',724:'Spain',144:'Sri Lanka',
  729:'Sudan',752:'Sweden',756:'Switzerland',760:'Syrian Arab Republic',
  762:'Tajikistan',834:'Tanzania',764:'Thailand',626:'Timor-Leste',
  768:'Togo',788:'Tunisia',792:'Türkiye',800:'Uganda',804:'Ukraine',
  826:'United Kingdom',840:'United States',860:'Uzbekistan',
  862:'Venezuela',704:'Viet Nam',887:'Yemen',894:'Zambia',716:'Zimbabwe',
  191:'Croatia',703:'Slovakia',705:'Slovenia',300:'Greece',470:'Malta',
  807:'North Macedonia',499:'Montenegro',688:'Serbia',
}

const ARC_COLORS = [
  '#60a5fa','#34d399','#f59e0b','#f472b6','#a78bfa','#fb923c','#22d3ee',
]

const DONOR_TOP_RED = '#c0392b'  // top-N donors: muted red
const DONOR_DIM_RED = '#4a1515'  // non-top-N donors: very faint red tint
const DONOR_DOT     = '#f87171'  // dot color on map

function fmt(millions) {
  const v = Number(millions || 0)
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}B`
  if (v >= 1) return `$${v.toFixed(1)}M`
  return `$${Math.round(v * 1000)}K`
}

function ArcLayer({ selectedRecipient, topDonors, donorMap, topN }) {
  const { projection } = useMapContext()
  if (!selectedRecipient || !projection) return null
  const target = projection([selectedRecipient.lon, selectedRecipient.lat])
  if (!target) return null
  const [tx, ty] = target

  return (
    <g>
      {topDonors.slice(0, topN).map((donor, i) => {
        const dc = donorMap[donor.donorCountry]
        if (!dc) return null
        const src = projection([dc.lon, dc.lat])
        if (!src) return null
        const [sx, sy] = src
        const mx = (sx + tx) / 2
        const dist = Math.hypot(tx - sx, ty - sy)
        const lift = Math.min(130, Math.max(40, dist * 0.35))
        const my = (sy + ty) / 2 - lift
        const strokeW = Math.max(1.2, Math.min(5, Math.sqrt(donor.amount) * 0.04))
        const color = ARC_COLORS[i % ARC_COLORS.length]
        return (
          <path
            key={donor.donorCountry}
            className="arc-path"
            d={`M ${sx.toFixed(1)} ${sy.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${tx.toFixed(1)} ${ty.toFixed(1)}`}
            stroke={color}
            strokeWidth={strokeW}
            strokeOpacity={0.85}
            style={{ animationDelay: `${i * 0.08}s` }}
          />
        )
      })}
    </g>
  )
}

function DonorDots({ topDonors, donorMap, topN }) {
  const { projection } = useMapContext()
  if (!projection) return null
  return (
    <g>
      {topDonors.slice(0, topN).map((donor) => {
        const dc = donorMap[donor.donorCountry]
        if (!dc) return null
        const pt = projection([dc.lon, dc.lat])
        if (!pt) return null
        const [x, y] = pt
        return (
          <g key={donor.donorCountry} transform={`translate(${x.toFixed(1)},${y.toFixed(1)})`}>
            <circle r={7} fill={DONOR_DOT} stroke="#fff" strokeWidth={1.5} opacity={0.95} />
          </g>
        )
      })}
    </g>
  )
}

function RecipientDots({ recipients, selectedCountry, onSelect, maxTotal }) {
  const { projection } = useMapContext()
  if (!projection) return null
  return (
    <g>
      {recipients.map((rec) => {
        const pt = projection([rec.lon, rec.lat])
        if (!pt) return null
        const [x, y] = pt
        const isSelected = rec.country === selectedCountry
        const r = isSelected ? 10 : Math.max(3.5, Math.sqrt(rec.total / maxTotal) * 18)
        return (
          <circle
            key={rec.country}
            cx={x.toFixed(1)}
            cy={y.toFixed(1)}
            r={r}
            fill={isSelected ? '#0d846a' : '#2366c9'}
            fillOpacity={isSelected ? 1 : 0.72}
            stroke={isSelected ? '#34d399' : '#60a5fa'}
            strokeWidth={isSelected ? 2.5 : 1}
            className="recipient-dot"
            onClick={() => onSelect(rec.country)}
          >
            <title>{rec.country} · {fmt(rec.total)}</title>
          </circle>
        )
      })}
    </g>
  )
}

export default function FlowMap({ data, selectedCountry, onSelect, filters }) {
  const { sector, year, topN } = filters

  const recipientMap = useMemo(
    () => Object.fromEntries((data.recipients || []).map((r) => [r.country, r])),
    [data]
  )
  const donorMap = useMemo(
    () => Object.fromEntries((data.donorCountries || []).map((d) => [d.country, d])),
    [data]
  )

  const filteredRecipients = useMemo(() => {
    if (sector === 'All' && year === 'All') return data.recipients || []
    const byCountry = {}
    ;(data.records || []).forEach((rec) => {
      if (sector !== 'All' && rec.sector !== sector) return
      if (year !== 'All' && rec.year !== Number(year)) return
      byCountry[rec.country] = (byCountry[rec.country] || 0) + rec.amount
    })
    return (data.recipients || [])
      .filter((r) => byCountry[r.country])
      .map((r) => ({ ...r, total: byCountry[r.country] }))
      .sort((a, b) => b.total - a.total)
  }, [data, sector, year])

  const maxTotal = useMemo(
    () => Math.max(...filteredRecipients.map((r) => r.total), 1),
    [filteredRecipients]
  )

  const colorScale = useMemo(() => (
    scaleSequentialLog().domain([0.1, maxTotal]).range(['#1e3a5f', '#0d846a'])
  ), [maxTotal])

  const countryTotals = useMemo(() => {
    const m = {}
    filteredRecipients.forEach((r) => { m[r.country] = r.total })
    return m
  }, [filteredRecipients])

  const selectedRecipient = useMemo(() => {
    if (!selectedCountry) return null
    if (sector === 'All' && year === 'All') return recipientMap[selectedCountry] || null
    const rec = filteredRecipients.find((r) => r.country === selectedCountry)
    if (!rec) return null
    const donorTotals = {}, sectorTotals = {}
    ;(data.records || []).forEach((r) => {
      if (r.country !== selectedCountry) return
      if (sector !== 'All' && r.sector !== sector) return
      if (year !== 'All' && r.year !== Number(year)) return
      donorTotals[r.donorCountry] = (donorTotals[r.donorCountry] || 0) + r.amount
      sectorTotals[r.sector] = (sectorTotals[r.sector] || 0) + r.amount
    })
    return {
      ...rec,
      topDonors: Object.entries(donorTotals)
        .map(([donorCountry, amount]) => ({ donorCountry, amount }))
        .sort((a, b) => b.amount - a.amount),
      topSectors: Object.entries(sectorTotals)
        .map(([sector, amount]) => ({ sector, amount }))
        .sort((a, b) => b.amount - a.amount),
    }
  }, [selectedCountry, filteredRecipients, recipientMap, data, sector, year])

  const topDonors = selectedRecipient?.topDonors || []

  // Top-N donor names (shown with arcs) → brighter red
  const topNDonorNames = useMemo(() => {
    if (!selectedRecipient) return new Set()
    return new Set(topDonors.slice(0, topN).map(d => d.donorCountry))
  }, [selectedRecipient, topDonors, topN])

  // All donor names for selected country → dim red for the rest
  const allDonorNames = useMemo(() => {
    if (!selectedRecipient) return new Set()
    return new Set((selectedRecipient.topDonors || []).map(d => d.donorCountry))
  }, [selectedRecipient])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {/* Map */}
      <div style={{ background: '#0a1628', borderRadius: 12, overflow: 'hidden' }}>
        <ComposableMap
          projectionConfig={{ scale: 155, center: [15, 5] }}
          style={{ width: '100%', height: '100%' }}
          height={480}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const name  = ISO_TO_NAME[Number(geo.id)]
                const total = name ? countryTotals[name] : 0
                const isSelected  = name && name === selectedCountry
                const isTopDonor  = name && topNDonorNames.has(name)
                const isDimDonor  = name && !isTopDonor && allDonorNames.has(name)

                let fill = '#1a2d44'
                if (isSelected)       fill = '#0d846a'
                else if (isTopDonor)  fill = DONOR_TOP_RED
                else if (isDimDonor)  fill = DONOR_DIM_RED
                else if (total)       fill = colorScale(total)

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fill}
                    stroke="#0e1f34"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: 'none' },
                      hover:   { outline: 'none', fill: isSelected ? '#0d846a' : isTopDonor ? '#dc2626' : isDimDonor ? '#6b2020' : '#2a4a6e', cursor: name ? 'pointer' : 'default' },
                      pressed: { outline: 'none' },
                    }}
                    onClick={() => name && onSelect(name)}
                  >
                    {name && <title>{name}{total ? ` · ${fmt(total)}` : ''}</title>}
                  </Geography>
                )
              })
            }
          </Geographies>

          <ArcLayer
            key={selectedCountry + sector + year}
            selectedRecipient={selectedRecipient}
            topDonors={topDonors}
            donorMap={donorMap}
            topN={topN}
          />

          <RecipientDots
            recipients={filteredRecipients}
            selectedCountry={selectedCountry}
            onSelect={onSelect}
            maxTotal={maxTotal}
          />

          {selectedRecipient && (
            <DonorDots topDonors={topDonors} donorMap={donorMap} topN={topN} />
          )}
        </ComposableMap>
      </div>

      {/* Legend — below the map so it never overlaps */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, paddingLeft: 6, flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#64748b' }}>
          <svg width="12" height="12"><circle cx="6" cy="6" r="5" fill="#2366c9" fillOpacity={0.8} /></svg>
          Recipient country
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#64748b' }}>
          <svg width="12" height="12"><circle cx="6" cy="6" r="5" fill={DONOR_DOT} /></svg>
          Donor
        </span>
        <span style={{ fontSize: 11, color: '#475569' }}>Click a dot or country to explore</span>
      </div>
    </div>
  )
}
