import { useState, useMemo, useCallback } from 'react'

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(v) {
  v = Number(v || 0)
  if (v >= 1000) return `$${(v/1000).toFixed(1)}B`
  if (v >= 1)    return `$${v.toFixed(1)}M`
  return `$${(v*1000).toFixed(0)}K`
}
function clamp(v, lo=0, hi=100) { return Math.max(lo, Math.min(hi, v)) }

// ── Scoring ───────────────────────────────────────────────────────────────────
const scoreWS   = (t, max) => clamp(100 - (Math.log1p(t) / Math.log1p(max || 1)) * 100)
const scoreConc = share   => clamp(share * 100)
const scoreAct  = (t, max) => clamp((t / (max || 1)) * 100)
const scoreMom  = (byYear, years) => {
  if (!years?.length) return 50
  const f = byYear[years[0]] || 0, l = byYear[years[years.length-1]] || 0
  return f <= 0 ? 50 : clamp(50 + ((l - f) / f) * 100)
}
const composite = (ws, conc, act, mom, sat, risk) => {
  let s
  if (risk === 'conservative') s = 0.15*ws + 0.15*conc + 0.40*act + 0.30*mom
  else if (risk === 'exploratory') s = 0.45*ws + 0.30*conc - 0.15*act + 0.40*mom
  else                             s = 0.30*ws + 0.25*conc + 0.20*act + 0.25*mom
  return clamp(s - 0.12*sat)
}
const numSlots  = risk => risk === 'conservative' ? 4 : risk === 'exploratory' ? 8 : 6

// ── Labels ────────────────────────────────────────────────────────────────────
const wsLabel   = s => s > 60 ? 'High'   : s > 35 ? 'Medium' : 'Low'
const wsColor   = s => s > 60 ? '#34d399': s > 35 ? '#f59e0b': '#f87171'
const concLabel = p => p > 0.65 ? 'High' : p > 0.35 ? 'Medium' : 'Low'
const concColor = p => p > 0.65 ? '#f59e0b': p > 0.35 ? '#60a5fa': '#34d399'
const divLabel  = (nc, ns) => nc >= 4 && ns >= 2 ? 'Diversified' : nc >= 2 ? 'Moderate' : 'Concentrated'
const divColor  = l => l === 'Diversified' ? '#34d399' : l === 'Moderate' ? '#60a5fa' : '#f59e0b'
const avgConcLabel = a => a > 0.55 ? 'High' : a > 0.35 ? 'Medium' : 'Low'

// ── Rationale ─────────────────────────────────────────────────────────────────
function rationale(a, risk) {
  const p = []
  if (a.wsScore > 60) p.push(`${a.country} is significantly underfunded in ${a.sector} relative to global sector activity`)
  else if (a.wsScore > 35) p.push(`${a.country} shows a moderate funding gap in ${a.sector}`)
  else p.push(`${a.country} has active ${a.sector} funding but strategic co-investment may still be additive`)
  if (a.topDonorShare > 0.65) p.push(`donor concentration is high (${a.topDonors[0]} accounts for ${Math.round(a.topDonorShare*100)}%), leaving clear room for an independent funder`)
  else if (a.topDonorShare < 0.30) p.push(`a diverse donor coalition already exists — partnership potential is strong`)
  if (risk === 'exploratory' && a.actScore < 35) p.push(`sector activity is low globally, suggesting a first-mover opportunity`)
  else if (risk === 'conservative' && a.actScore > 60) p.push(`${a.sector} has well-established funding infrastructure`)
  if (a.momScore > 65) p.push(`sector funding is trending upward`)
  else if (a.momScore < 40) p.push(`sector funding has been declining — contrarian entry may face headwinds`)
  return p.join('. ') + '.'
}

// ── Budget input with custom +/- ──────────────────────────────────────────────
function BudgetInput({ value, onChange }) {
  const step = value >= 100 ? 50 : value >= 10 ? 5 : 1
  return (
    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 7, overflow: 'hidden', background: '#070f1c' }}>
      <button onClick={() => onChange(Math.max(1, value - step))}
        style={{ width: 34, height: 36, background: 'rgba(255,255,255,0.05)', border: 'none', color: '#64748b', fontSize: 18, cursor: 'pointer', lineHeight: 1, flexShrink: 0 }}>−</button>
      <div style={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'center', gap: 4 }}>
        <span style={{ color: '#475569', fontSize: 13 }}>$</span>
        <input
          type="number" min="1" value={value}
          onChange={e => onChange(Math.max(1, Number(e.target.value) || 1))}
          style={{ background: 'none', border: 'none', outline: 'none', color: '#e2eaf4', fontSize: 14, fontWeight: 600, width: 60, textAlign: 'center', MozAppearance: 'textfield' }}
        />
        <span style={{ color: '#475569', fontSize: 12 }}>M</span>
      </div>
      <button onClick={() => onChange(value + step)}
        style={{ width: 34, height: 36, background: 'rgba(255,255,255,0.05)', border: 'none', color: '#64748b', fontSize: 18, cursor: 'pointer', lineHeight: 1, flexShrink: 0 }}>+</button>
    </div>
  )
}

// ── AI placeholder accordion ───────────────────────────────────────────────────
function AIExplanation() {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ background: 'rgba(35,102,201,0.07)', border: '1px solid rgba(35,102,201,0.2)', borderRadius: 10, overflow: 'hidden' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', color: '#7ab4d8', fontSize: 13, fontWeight: 500 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 1 0 20A10 10 0 0 1 12 2z"/><path d="M12 8v4m0 4h.01"/></svg>
          AI Strategy Explanation
          <span style={{ fontSize: 10, color: '#334155', fontStyle: 'italic' }}>— coming soon</span>
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <div style={{ padding: '0 16px 16px', fontSize: 12, color: '#475569', lineHeight: 1.7, borderTop: '1px solid rgba(35,102,201,0.15)' }}>
          <p style={{ marginTop: 12 }}>
            <em>Once connected to Claude, this section will contain a strategic narrative explaining:</em>
          </p>
          <ul style={{ marginTop: 8, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <li>Why this portfolio composition aligns with the stated strategic goal</li>
            <li>Key trade-offs between the selected allocations (e.g. concentration vs. diversification)</li>
            <li>Potential co-funding opportunities with existing donors in each country-sector</li>
            <li>Risk considerations specific to the chosen risk preference</li>
            <li>Suggested sequencing — which allocations to prioritise first and why</li>
          </ul>
          <p style={{ marginTop: 10, color: '#334155' }}>Strategic goal input will be passed to the model as context alongside the OECD funding signals.</p>
        </div>
      )}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function SimulatorPage({ data, projects, projectsLoading }) {
  const [budget, setBudget] = useState(10)
  const [region, setRegion] = useState('All')
  const [sector, setSector] = useState('All')
  const [goal, setGoal]     = useState('')
  const [risk, setRisk]     = useState('balanced')
  const [params, setParams] = useState(null)   // set on Generate click

  // Precompute country-sector stats
  const { csMeta, sectorMeta, maxCsTotal, maxSectorTotal } = useMemo(() => {
    const cs = {}, sm = {}
    ;(data.records || []).forEach(r => {
      const key = `${r.country}|||${r.sector}`
      if (!cs[key]) cs[key] = { country: r.country, sector: r.sector, total: 0, donors: {}, byYear: {} }
      cs[key].total                   += r.amount
      cs[key].donors[r.donorCountry]   = (cs[key].donors[r.donorCountry] || 0) + r.amount
      cs[key].byYear[r.year]           = (cs[key].byYear[r.year] || 0) + r.amount
      if (!sm[r.sector]) sm[r.sector] = { total: 0, byYear: {} }
      sm[r.sector].total              += r.amount
      sm[r.sector].byYear[r.year]      = (sm[r.sector].byYear[r.year] || 0) + r.amount
    })
    return {
      csMeta: cs, sectorMeta: sm,
      maxCsTotal: Math.max(...Object.values(cs).map(c => c.total), 1),
      maxSectorTotal: Math.max(...Object.values(sm).map(s => s.total), 1),
    }
  }, [data])

  const countryMeta = useMemo(() =>
    Object.fromEntries((data.recipients || []).map(r => [r.country, r])),
  [data])


  const regions  = useMemo(() => ['All', ...new Set((data.recipients||[]).map(r=>r.regionMacro).filter(Boolean)).values()].sort((a,b) => a==='All'?-1:a.localeCompare(b)), [data])
  const sectorOpts = useMemo(() => (data.sectors||['All']).filter(s => s!=='Unspecified'&&s!=='Other'), [data])

  // Portfolio — computed only from committed params
  const portfolio = useMemo(() => {
    if (!params) return null
    const { budget: bM, region: reg, sector: sec, risk: rsk } = params
    const years = data.years || [2020,2021,2022,2023]
    const n = numSlots(rsk)

    const candidates = Object.values(csMeta)
      .filter(cs => {
        if (sec !== 'All' && cs.sector !== sec) return false
        const meta = countryMeta[cs.country]
        if (reg !== 'All' && meta?.regionMacro !== reg) return false
        return true
      })
      .map(cs => {
        const dVals  = Object.values(cs.donors)
        const dTotal = dVals.reduce((s,v)=>s+v, 0)
        const topAmt = Math.max(...dVals, 0)
        const topShare = dTotal > 0 ? topAmt/dTotal : 0
        const topDonors = Object.entries(cs.donors).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k])=>k)

        const ws   = scoreWS(cs.total, maxCsTotal)
        const conc = scoreConc(topShare)
        const act  = scoreAct(sectorMeta[cs.sector]?.total||0, maxSectorTotal)
        const mom  = scoreMom(sectorMeta[cs.sector]?.byYear||{}, years)
        const sat  = clamp((cs.total/maxCsTotal)*100)
        const score = composite(ws, conc, act, mom, sat, rsk)
        return { ...cs, wsScore:ws, concScore:conc, actScore:act, momScore:mom, satScore:sat, score, topDonorShare:topShare, topDonors, meta: countryMeta[cs.country] }
      })
      .sort((a,b) => b.score - a.score)
      .slice(0, n)

    if (!candidates.length) return null

    const totalScore = candidates.reduce((s,c)=>s+c.score, 0)
    const allocs = candidates.map(c => ({
      ...c,
      allocation: Math.round((c.score/totalScore)*bM*10)/10,
      sharePct: Math.round((c.score/totalScore)*100),
    }))
    const uniqueCountries = new Set(allocs.map(a=>a.country)).size
    const uniqueSectors   = new Set(allocs.map(a=>a.sector)).size
    const avgConc = allocs.reduce((s,a)=>s+a.topDonorShare,0)/allocs.length
    return { allocs, uniqueCountries, uniqueSectors, avgConc, divLbl: divLabel(uniqueCountries, uniqueSectors), budgetM: bM }
  }, [params, csMeta, sectorMeta, countryMeta, maxCsTotal, maxSectorTotal, data])

  const handleGenerate = useCallback(() => {
    setParams({ budget: Number(budget)||10, region, sector, risk })
  }, [budget, region, sector, risk])

  const inputStyle = { background: '#070f1c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#c8dff2', padding: '8px 10px', fontSize: 13, outline: 'none', width: '100%' }
  const lbl = { fontSize: 11, color: '#475569', fontWeight: 500, marginBottom: 5, display: 'block' }

  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.6, maxWidth: 700 }}>
        Test where a new foundation budget could create strategic marginal value based on funding gaps, donor concentration, and sector activity.
      </p>

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        {/* Inputs */}
        <div style={{ width: 280, flexShrink: 0, background: '#0f1e31', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Simulation Inputs</p>

          <div>
            <label style={lbl}>Available Budget (USD millions)</label>
            <BudgetInput value={budget} onChange={setBudget} />
          </div>

          <div>
            <label style={lbl}>Region Focus</label>
            <select value={region} onChange={e=>setRegion(e.target.value)} style={inputStyle}>
              {regions.map(r=><option key={r} value={r} style={{background:'#070f1c'}}>{r}</option>)}
            </select>
          </div>

          <div>
            <label style={lbl}>Sector Focus</label>
            <select value={sector} onChange={e=>setSector(e.target.value)} style={inputStyle}>
              {sectorOpts.map(s=><option key={s} value={s} style={{background:'#070f1c'}}>{s}</option>)}
            </select>
          </div>

          <div>
            <label style={lbl}>Strategic Goal <span style={{color:'#334155',fontStyle:'italic'}}>(AI — coming soon)</span></label>
            <textarea value={goal} onChange={e=>setGoal(e.target.value)}
              placeholder="e.g. Reduce child mortality in sub-Saharan Africa by improving access to primary care…"
              rows={3}
              style={{...inputStyle, resize:'vertical', fontFamily:'inherit', lineHeight:1.5}}
            />
            <p style={{fontSize:10, color:'#334155', marginTop:4}}>Reserved for AI-powered strategy synthesis. Not used in current scoring.</p>
          </div>

          <div>
            <label style={lbl}>Risk Preference</label>
            <div style={{display:'flex', flexDirection:'column', gap:6}}>
              {[
                {id:'conservative', label:'Conservative', sub:'Established sectors, fewer bets'},
                {id:'balanced',     label:'Balanced',     sub:'Mix of proven and emerging'},
                {id:'exploratory',  label:'Exploratory',  sub:'Frontier areas, wider spread'},
              ].map(({id,label,sub})=>(
                <button key={id} onClick={()=>setRisk(id)}
                  style={{ textAlign:'left', padding:'9px 12px', borderRadius:8, cursor:'pointer',
                    border: risk===id ? '1px solid rgba(35,102,201,0.5)' : '1px solid rgba(255,255,255,0.07)',
                    background: risk===id ? 'rgba(35,102,201,0.15)' : 'rgba(255,255,255,0.03)',
                    color: risk===id ? '#e2eaf4' : '#64748b' }}>
                  <div style={{fontSize:12, fontWeight:600}}>{label}</div>
                  <div style={{fontSize:11, marginTop:2, opacity:0.7}}>{sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <button onClick={handleGenerate}
            style={{ marginTop:4, padding:'11px', borderRadius:8, border:'none', background:'linear-gradient(135deg,#2366c9,#0d846a)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', letterSpacing:'0.03em' }}>
            Generate Portfolio
          </button>

          <div style={{borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:10}}>
            <p style={{fontSize:10, color:'#334155', lineHeight:1.6}}>
              <strong style={{color:'#475569'}}>Score components:</strong><br/>
              White space · Donor concentration · Sector activity · Sector momentum · Saturation penalty
            </p>
          </div>
        </div>

        {/* Results */}
        <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column', gap:14 }}>
          {!portfolio ? (
            <div style={{ background:'#0f1e31', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:48, textAlign:'center' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="1.5" style={{margin:'0 auto 16px', display:'block'}}>
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              <p style={{color:'#475569', fontSize:13}}>Configure inputs and click <strong style={{color:'#7ab4d8'}}>Generate Portfolio</strong> to run the simulation.</p>
            </div>
          ) : (
            <>
              <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between'}}>
                <div>
                  <p style={{fontSize:14, fontWeight:700, color:'#e2eaf4'}}>Recommended Funding Portfolio</p>
                  <p style={{fontSize:11, color:'#475569', marginTop:2}}>{portfolio.allocs.length} allocations · {params.risk} strategy · {fmt(portfolio.budgetM)} total budget</p>
                </div>
              </div>

              <AIExplanation />

              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:12}}>
                {portfolio.allocs.map((alloc, i) => (
                  <AllocationCard key={`${alloc.country}-${alloc.sector}`} alloc={alloc} rank={i+1} risk={params.risk} projects={projects} projectsLoading={projectsLoading} />
                ))}
              </div>

              <PortfolioSummary portfolio={portfolio} />

              <div style={{background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:10, padding:'12px 16px', fontSize:12, color:'#475569', lineHeight:1.7}}>
                <strong style={{color:'#64748b'}}>Note: </strong>
                This simulator does not prescribe where funding must go. It uses OECD historical funding patterns to generate strategy scenarios for further investigation. Scores reflect relative signals only — all allocations should be validated against local context, grantee capacity, and foundation strategy before any commitment.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Allocation card (flip) ────────────────────────────────────────────────────
const CARD_H = 270

function AllocationCard({ alloc, rank, risk, projects, projectsLoading }) {
  const [flipped, setFlipped] = useState(false)
  const wsCl   = wsColor(alloc.wsScore)
  const concCl = concColor(alloc.topDonorShare)

  const countryProjects = useMemo(() =>
    (projects || []).filter(p => p.country === alloc.country),
    [projects, alloc.country]
  )

  return (
    <div style={{ perspective: '1200px', height: CARD_H }}>
      <div style={{
        position: 'relative', height: '100%',
        transformStyle: 'preserve-3d',
        transition: 'transform 0.45s ease',
        transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
      }}>

        {/* ── FRONT ── */}
        <div style={{
          position: 'absolute', inset: 0,
          backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
          background: '#0f1e31', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 10, padding: '14px 16px',
          display: 'flex', flexDirection: 'column', gap: 10, overflow: 'hidden',
        }}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
            <div>
              <p style={{fontSize:13, fontWeight:700, color:'#e2eaf4'}}>{alloc.country}</p>
              <p style={{fontSize:11, color:'#60a5fa', marginTop:1}}>{alloc.sector}</p>
              {alloc.meta?.regionMacro && <p style={{fontSize:10, color:'#334155', marginTop:1}}>{alloc.meta.regionMacro}</p>}
            </div>
            <div style={{textAlign:'right', flexShrink:0}}>
              <p style={{fontSize:16, fontWeight:700, color:'#34d399'}}>{fmt(alloc.allocation)}</p>
              <p style={{fontSize:10, color:'#475569'}}>{alloc.sharePct}% of budget</p>
            </div>
          </div>

          <div style={{display:'flex', flexDirection:'column', gap:6}}>
            <SignalBar label="White Space"     value={alloc.wsScore}   color={wsCl}    tag={wsLabel(alloc.wsScore)} />
            <SignalBar label="Concentration"   value={alloc.concScore} color={concCl}  tag={concLabel(alloc.topDonorShare)} />
            <SignalBar label="Sector Activity" value={alloc.actScore}  color="#60a5fa" tag={alloc.actScore>60?'High':alloc.actScore>30?'Med':'Low'} />
            <SignalBar label="Momentum"        value={alloc.momScore}  color="#a78bfa" tag={alloc.momScore>60?'↑':alloc.momScore>45?'→':'↓'} />
          </div>

          {alloc.topDonors.length > 0 && (
            <div>
              <p style={{fontSize:10, color:'#334155', marginBottom:4}}>Top existing donors</p>
              <div style={{display:'flex', gap:4, flexWrap:'wrap'}}>
                {alloc.topDonors.map(d=>(
                  <span key={d} style={{fontSize:10, padding:'2px 7px', borderRadius:4, background:'rgba(255,255,255,0.06)', color:'#64748b', border:'1px solid rgba(255,255,255,0.06)'}}>
                    {d.replace("China (People's Republic of)",'China')}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div style={{flex:1}} />
          <button onClick={() => setFlipped(true)}
            style={{background:'none', border:'none', color:'#334155', fontSize:10, cursor:'pointer', padding:'4px 0', textAlign:'center', width:'100%'}}>
            ▼ see active projects in {alloc.country}
          </button>
        </div>

        {/* ── BACK ── */}
        <div style={{
          position: 'absolute', inset: 0,
          backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          background: '#0f1e31', border: '1px solid rgba(35,102,201,0.25)',
          borderRadius: 10, padding: '12px 14px',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0}}>
            <div>
              <p style={{fontSize:12, fontWeight:700, color:'#e2eaf4'}}>{alloc.country}</p>
              <p style={{fontSize:10, color:'#60a5fa', marginTop:1}}>Active Projects ({countryProjects.length})</p>
            </div>
            <button onClick={() => setFlipped(false)}
              style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:6, color:'#64748b', fontSize:11, cursor:'pointer', padding:'3px 10px'}}>
              ← back
            </button>
          </div>

          <div style={{overflowY:'auto', flex:1}}>
            {projectsLoading && !projects ? (
              <div style={{display:'flex', alignItems:'center', gap:8, padding:'12px 0', color:'#475569', fontSize:11}}>
                <div style={{width:12, height:12, border:'2px solid #2366c9', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite', flexShrink:0}} />
                Loading projects…
              </div>
            ) : countryProjects.length > 0 ? countryProjects.map((p, i) => (
              <div key={p.id || i} style={{padding:'6px 0', borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                <p style={{fontSize:11, color:'#c8dff2', lineHeight:1.4}}>{p.title}</p>
                <p style={{fontSize:10, color:'#475569', marginTop:2}}>{p.sector} · {p.year} · {fmt(p.amount)}</p>
              </div>
            )) : (
              <p style={{fontSize:11, color:'#334155', padding:'8px 0'}}>No detailed project data available for {alloc.country} in the current dataset.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

function SignalBar({ label, value, color, tag }) {
  return (
    <div style={{display:'flex', alignItems:'center', gap:8}}>
      <span style={{fontSize:10, color:'#475569', width:82, flexShrink:0}}>{label}</span>
      <div style={{flex:1, background:'rgba(255,255,255,0.05)', borderRadius:3, height:4, overflow:'hidden'}}>
        <div style={{width:`${Math.round(value)}%`, height:'100%', background:color, borderRadius:3}} />
      </div>
      <span style={{fontSize:10, color, width:34, textAlign:'right', flexShrink:0}}>{tag}</span>
    </div>
  )
}

function PortfolioSummary({ portfolio }) {
  const { allocs, uniqueCountries, uniqueSectors, avgConc, divLbl, budgetM } = portfolio
  const divCl  = divColor(divLbl)
  const concLbl = avgConcLabel(avgConc)
  const concCl  = concColor(avgConc)
  return (
    <div style={{background:'#0f1e31', border:'1px solid rgba(35,102,201,0.2)', borderRadius:10, padding:'14px 18px'}}>
      <p style={{fontSize:11, fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12}}>Portfolio Summary</p>
      <div style={{display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:12}}>
        {[
          {label:'Total Budget',          value:fmt(budgetM),      color:'#34d399'},
          {label:'Countries',             value:uniqueCountries,   color:'#60a5fa'},
          {label:'Sectors',               value:uniqueSectors,     color:'#60a5fa'},
          {label:'Diversification',       value:divLbl,            color:divCl    },
          {label:'Avg Concentration Risk',value:concLbl,           color:concCl   },
        ].map(({label,value,color})=>(
          <div key={label} style={{textAlign:'center'}}>
            <p style={{fontSize:10, color:'#475569', marginBottom:4}}>{label}</p>
            <p style={{fontSize:15, fontWeight:700, color}}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
