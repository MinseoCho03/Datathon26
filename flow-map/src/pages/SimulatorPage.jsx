import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(v) {
  v = Number(v || 0)
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}B`
  if (v >= 1) return `$${v.toFixed(1)}M`
  return `$${(v * 1000).toFixed(0)}K`
}

function clamp(v, lo = 0, hi = 100) {
  return Math.max(lo, Math.min(hi, v))
}

// ── Scoring ───────────────────────────────────────────────────────────────────
const scoreWS = (t, max) =>
  clamp(100 - (Math.log1p(t) / Math.log1p(max || 1)) * 100)

const scoreConc = share => clamp(share * 100)

const scoreAct = (t, max) => clamp((t / (max || 1)) * 100)

const scoreMom = (byYear, years) => {
  if (!years?.length) return 50

  const f = byYear[years[0]] || 0
  const l = byYear[years[years.length - 1]] || 0

  return f <= 0 ? 50 : clamp(50 + ((l - f) / f) * 100)
}

const composite = (ws, conc, act, mom, sat, risk) => {
  let s

  if (risk === 'conservative') {
    s = 0.15 * ws + 0.15 * conc + 0.40 * act + 0.30 * mom
  } else if (risk === 'exploratory') {
    s = 0.45 * ws + 0.30 * conc - 0.15 * act + 0.40 * mom
  } else {
    s = 0.30 * ws + 0.25 * conc + 0.20 * act + 0.25 * mom
  }

  return clamp(s - 0.12 * sat)
}

const numSlots = risk =>
  risk === 'conservative' ? 4 : risk === 'exploratory' ? 8 : 6

// ── Goal relevance scoring ────────────────────────────────────────────────────
const GOAL_THEMES = [
  {
    id: 'children',
    keywords: [
      'child',
      'children',
      'kid',
      'kids',
      'youth',
      'young',
      'student',
      'students',
      'school',
      'schools',
      'education',
      'learning',
      'literacy',
      'nutrition',
      'malnutrition',
      'family',
      'families',
      'infant',
      'maternal',
      'pediatric',
      'adolescent',
    ],
    sectors: [
      'Education',
      'Health',
      'Population Policies/Programmes & Reproductive Health',
      'Water Supply & Sanitation',
      'Government & Civil Society',
      'Other Social Infrastructure & Services',
    ],
  },
  {
    id: 'health',
    keywords: [
      'health',
      'healthcare',
      'medical',
      'medicine',
      'hospital',
      'clinic',
      'disease',
      'mortality',
      'care',
      'nutrition',
      'maternal',
      'reproductive',
      'sanitation',
      'water',
    ],
    sectors: [
      'Health',
      'Population Policies/Programmes & Reproductive Health',
      'Water Supply & Sanitation',
    ],
  },
  {
    id: 'education',
    keywords: [
      'education',
      'school',
      'schools',
      'student',
      'students',
      'teacher',
      'teachers',
      'learning',
      'literacy',
      'classroom',
      'university',
      'training',
    ],
    sectors: ['Education'],
  },
  {
    id: 'poverty',
    keywords: [
      'poverty',
      'poor',
      'income',
      'jobs',
      'employment',
      'economic',
      'livelihood',
      'financial',
      'finance',
      'microfinance',
      'small business',
      'entrepreneur',
      'entrepreneurship',
      'household',
      'families',
    ],
    sectors: [
      'Banking & Financial Services',
      'Business & Other Services',
      'Agriculture, Forestry, Fishing',
      'Industry, Mining, Construction',
      'Other Social Infrastructure & Services',
    ],
  },
  {
    id: 'climate',
    keywords: [
      'climate',
      'environment',
      'environmental',
      'clean energy',
      'renewable',
      'carbon',
      'resilience',
      'sustainability',
      'sustainable',
      'green',
      'agriculture',
      'water',
    ],
    sectors: [
      'General Environment Protection',
      'Energy',
      'Agriculture, Forestry, Fishing',
      'Water Supply & Sanitation',
    ],
  },
  {
    id: 'women',
    keywords: [
      'women',
      'woman',
      'girls',
      'girl',
      'gender',
      'female',
      'mother',
      'mothers',
      'maternal',
    ],
    sectors: [
      'Population Policies/Programmes & Reproductive Health',
      'Health',
      'Education',
      'Government & Civil Society',
      'Other Social Infrastructure & Services',
    ],
  },
  {
    id: 'governance',
    keywords: [
      'democracy',
      'governance',
      'rights',
      'justice',
      'civil society',
      'policy',
      'institutions',
      'transparency',
      'accountability',
    ],
    sectors: ['Government & Civil Society'],
  },
]

function normalizeText(value = '') {
  return String(value).toLowerCase().replace(/[^a-z0-9\s&/-]/g, ' ')
}

function textIncludesKeyword(text, keyword) {
  const t = normalizeText(text)
  const k = normalizeText(keyword).trim()

  if (!k) return false
  if (k.includes(' ')) return t.includes(k)

  return new RegExp(`\\b${k}\\b`).test(t)
}

function sectorMatchesTheme(sector, themeSectors = []) {
  const s = normalizeText(sector)

  return themeSectors.some(themeSector => {
    const ts = normalizeText(themeSector)
    return s === ts || s.includes(ts) || ts.includes(s)
  })
}

function inferGoalThemes(goal) {
  if (!goal || goal.trim().length < 3) return []

  return GOAL_THEMES
    .map(theme => {
      const matchedKeywords = theme.keywords.filter(keyword =>
        textIncludesKeyword(goal, keyword)
      )

      return {
        ...theme,
        matchedKeywords,
        strength: matchedKeywords.length,
      }
    })
    .filter(theme => theme.strength > 0)
    .sort((a, b) => b.strength - a.strength)
}

function goalRelevanceScore(goal, candidate) {
  const themes = inferGoalThemes(goal)
  if (!themes.length) return 0

  let score = 0

  themes.forEach((theme, index) => {
    const weight = index === 0 ? 1 : 0.65

    if (sectorMatchesTheme(candidate.sector, theme.sectors)) {
      score += 28 * weight
    } else {
      score += 5 * weight
    }
  })

  if (candidate.country && textIncludesKeyword(goal, candidate.country)) {
    score += 18
  }

  const underservedIntent = [
    'underserved',
    'underfunded',
    'neglected',
    'marginalized',
    'vulnerable',
    'low income',
    'low-income',
    'poor',
  ].some(keyword => textIncludesKeyword(goal, keyword))

  if (underservedIntent) {
    score += Math.min(candidate.wsScore * 0.18, 15)
  }

  return clamp(score, 0, 45)
}

function goalMatchLabel(score) {
  if (score >= 30) return 'Strong'
  if (score >= 15) return 'Medium'
  if (score > 0) return 'Weak'
  return 'Neutral'
}

function goalMatchColor(score) {
  if (score >= 30) return '#34d399'
  if (score >= 15) return '#60a5fa'
  if (score > 0) return '#f59e0b'
  return '#475569'
}

// ── Labels ────────────────────────────────────────────────────────────────────
const wsLabel = s => (s > 60 ? 'High' : s > 35 ? 'Medium' : 'Low')
const wsColor = s => (s > 60 ? '#34d399' : s > 35 ? '#f59e0b' : '#f87171')

const concLabel = p => (p > 0.65 ? 'High' : p > 0.35 ? 'Medium' : 'Low')
const concColor = p => (p > 0.65 ? '#f59e0b' : p > 0.35 ? '#60a5fa' : '#34d399')

const divLabel = (nc, ns) =>
  nc >= 4 && ns >= 2 ? 'Diversified' : nc >= 2 ? 'Moderate' : 'Concentrated'

const divColor = l =>
  l === 'Diversified' ? '#34d399' : l === 'Moderate' ? '#60a5fa' : '#f59e0b'

const avgConcLabel = a => (a > 0.55 ? 'High' : a > 0.35 ? 'Medium' : 'Low')

// ── Budget input with custom +/- ──────────────────────────────────────────────
function BudgetInput({ value, onChange }) {
  const step = value >= 100 ? 50 : value >= 10 ? 5 : 1

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 7,
        overflow: 'hidden',
        background: '#070f1c',
      }}
    >
      <button
        onClick={() => onChange(Math.max(1, value - step))}
        style={{
          width: 34,
          height: 36,
          background: 'rgba(255,255,255,0.05)',
          border: 'none',
          color: '#64748b',
          fontSize: 18,
          cursor: 'pointer',
          lineHeight: 1,
          flexShrink: 0,
        }}
      >
        −
      </button>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flex: 1,
          justifyContent: 'center',
          gap: 4,
        }}
      >
        <span style={{ color: '#475569', fontSize: 13 }}>$</span>
        <input
          type="number"
          min="1"
          value={value}
          onChange={e => onChange(Math.max(1, Number(e.target.value) || 1))}
          style={{
            background: 'none',
            border: 'none',
            outline: 'none',
            color: '#e2eaf4',
            fontSize: 14,
            fontWeight: 600,
            width: 60,
            textAlign: 'center',
            MozAppearance: 'textfield',
          }}
        />
        <span style={{ color: '#475569', fontSize: 12 }}>M</span>
      </div>

      <button
        onClick={() => onChange(value + step)}
        style={{
          width: 34,
          height: 36,
          background: 'rgba(255,255,255,0.05)',
          border: 'none',
          color: '#64748b',
          fontSize: 18,
          cursor: 'pointer',
          lineHeight: 1,
          flexShrink: 0,
        }}
      >
        +
      </button>
    </div>
  )
}

// ── Markdown styling for AI output ────────────────────────────────────────────
const markdownComponents = {
  h1: ({ children }) => (
    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#e2eaf4', margin: '0 0 8px' }}>
      {children}
    </h3>
  ),
  h2: ({ children }) => (
    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#e2eaf4', margin: '0 0 8px' }}>
      {children}
    </h3>
  ),
  h3: ({ children }) => (
    <h3 style={{ fontSize: 13, fontWeight: 700, color: '#e2eaf4', margin: '10px 0 6px' }}>
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p style={{ margin: '0 0 8px', lineHeight: 1.6 }}>
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul style={{ margin: '6px 0 0 16px', padding: 0 }}>
      {children}
    </ul>
  ),
  li: ({ children }) => (
    <li style={{ marginBottom: 5, lineHeight: 1.55 }}>
      {children}
    </li>
  ),
  strong: ({ children }) => (
    <strong style={{ color: '#e2eaf4', fontWeight: 700 }}>
      {children}
    </strong>
  ),
}

// ── AI explanation live streaming ─────────────────────────────────────────────
function AIExplanation({ portfolio, params }) {
  const { goal = '', risk, budget } = params
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [open, setOpen] = useState(true)
  const hasGenerated = useRef(false)

  async function generate() {
    setText('')
    setError(null)
    setLoading(true)

    const portfolioLines = portfolio.allocs
      .map(
        (a, i) =>
          `${i + 1}. ${a.country} — ${a.sector} (${fmt(a.allocation)}, ${a.sharePct}% of budget)\n` +
          `   Goal Match: ${a.goalMatch || 'Neutral'} · White Space: ${wsLabel(a.wsScore)} · ` +
          `Donor Concentration: ${concLabel(a.topDonorShare)} · ` +
          `Sector Activity: ${a.actScore > 60 ? 'High' : a.actScore > 30 ? 'Medium' : 'Low'} · ` +
          `Momentum: ${a.momScore > 60 ? 'Rising' : a.momScore > 45 ? 'Stable' : 'Declining'}\n` +
          `   Top donors: ${a.topDonors.join(', ') || 'none recorded'}`
      )
      .join('\n\n')

    const hasGoal = goal && goal.trim().length > 3
    const goalContext = hasGoal
      ? `\nFoundation's Strategic Goal: "${goal.trim()}"`
      : `\nNo strategic goal specified. Use the ${risk} risk strategy as the default objective.`

    const content = [
      `A foundation is deploying ${fmt(budget)} with a ${risk} risk strategy.${goalContext}`,
      `\nRecommended portfolio:\n`,
      portfolioLines,
      hasGoal
        ? `
Write a clear markdown explanation for a foundation leader.

Use exactly this structure:
### Why this fits
- Explain how the portfolio connects to the foundation goal.
- Explain the data logic behind the recommendation, using white space, donor concentration, sector activity, or sector momentum.
- Mention one practical tradeoff or caveat the foundation should consider.

### First priority
- Pick the first country-sector allocation to prioritize.
- Explain why it is the best starting point in 2 concise sentences.

Rules:
- Maximum 140 words.
- Use concise bullets.
- No duplicated sentences.
- Do not repeat the full country list.
- Do not mention numeric scores.
- Use qualitative labels instead, such as strong goal match, high white space, low donor concentration, or rising momentum.
- Add enough explanation to be useful, but avoid long paragraphs.
`

        : `
Write a clear markdown explanation for a foundation leader.

Use exactly this structure:
### Why this fits
- Explain why this portfolio fits the ${risk} strategy.
- Explain the data logic behind the recommendation, using white space, donor concentration, sector activity, or sector momentum.
- Mention one practical tradeoff or caveat the foundation should consider.

### First priority
- Pick the first country-sector allocation to prioritize.
- Explain why it is the best starting point in 2 concise sentences.

Rules:
- Maximum 110 words.
- Use readable bullets, not long paragraphs.
- Do not repeat every country.
- Do not mention markdown.
`,
    ].join('\n')

    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: `
You are a concise philanthropic strategy advisor.
Return valid markdown only.
Keep the answer readable, specific, and executive-friendly.

Format:
### Why this fits
- One bullet for strategic fit.
- One bullet for portfolio logic.

### First priority
- Recommend one country-sector allocation first.
- Explain why in 2 short sentences.

Rules:
- Maximum 110 words.
- No numeric scores.
- Use qualitative labels only.
- No duplicated sentences.
- Do not repeat the full country list.
- Avoid long paragraphs.
`.trim(),
          messages: [{ role: 'user', content }],
        }),
      })

      if (!res.ok) {
        const msg = await res.text().catch(() => `HTTP ${res.status}`)
        throw new Error(msg || `API error ${res.status}`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue

          const data = line.slice(6).trim()
          if (data === '[DONE]') break

          try {
            const parsed = JSON.parse(data)

            if (parsed.type === 'text' && parsed.text) {
              setText(t => t + parsed.text)
            }

            if (parsed.type === 'error') {
              throw new Error(parsed.message)
            }
          } catch (e) {
            if (!(e instanceof SyntaxError)) throw e
          }
        }
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (hasGenerated.current) return
    hasGenerated.current = true
    generate()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      style={{
        background: 'rgba(35,102,201,0.07)',
        border: '1px solid rgba(35,102,201,0.2)',
        borderRadius: 10,
        overflow: 'hidden',
      }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#7ab4d8',
          fontSize: 13,
          fontWeight: 500,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2a10 10 0 1 1 0 20A10 10 0 0 1 12 2z" />
            <path d="M12 8v4m0 4h.01" />
          </svg>
          AI Strategy Explanation
          {loading && <span style={{ fontSize: 11, color: '#475569' }}>generating…</span>}
        </span>

        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{
            transition: 'transform 0.2s',
            transform: open ? 'rotate(180deg)' : 'none',
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div style={{ padding: '0 16px 16px', borderTop: '1px solid rgba(35,102,201,0.15)' }}>
          {loading && !text && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 0', color: '#475569', fontSize: 12 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  border: '2px solid #2366c9',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  flexShrink: 0,
                }}
              />
              Analyzing portfolio signals…
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </div>
          )}

          {text && (
            <div style={{ paddingTop: 14, fontSize: 13, color: '#c8dff2', lineHeight: 1.6 }}>
              <ReactMarkdown components={markdownComponents}>
                {text}
              </ReactMarkdown>

              {loading && (
                <span style={{ opacity: 0.5, animation: 'blink 1s step-end infinite' }}>
                  ▋
                </span>
              )}

              <style>{`@keyframes blink { 0%,100%{opacity:0.5} 50%{opacity:0} }`}</style>
            </div>
          )}

          {error && (
            <div style={{ paddingTop: 14, fontSize: 12, color: '#f87171', display: 'flex', alignItems: 'center', gap: 10 }}>
              {error}
              <button
                onClick={generate}
                style={{
                  fontSize: 11,
                  color: '#7ab4d8',
                  background: 'none',
                  border: '1px solid rgba(35,102,201,0.3)',
                  borderRadius: 5,
                  padding: '3px 10px',
                  cursor: 'pointer',
                }}
              >
                Retry
              </button>
            </div>
          )}

          {!loading && text && (
            <button
              onClick={generate}
              style={{
                marginTop: 12,
                fontSize: 11,
                color: '#475569',
                background: 'none',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 5,
                padding: '4px 12px',
                cursor: 'pointer',
              }}
            >
              Regenerate
            </button>
          )}
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
  const [goal, setGoal] = useState('')
  const [risk, setRisk] = useState('balanced')
  const [params, setParams] = useState(null)

  const { csMeta, sectorMeta, maxCsTotal, maxSectorTotal } = useMemo(() => {
    const cs = {}
    const sm = {}

    ;(data.records || []).forEach(r => {
      const key = `${r.country}|||${r.sector}`

      if (!cs[key]) {
        cs[key] = {
          country: r.country,
          sector: r.sector,
          total: 0,
          donors: {},
          byYear: {},
        }
      }

      cs[key].total += r.amount
      cs[key].donors[r.donorCountry] =
        (cs[key].donors[r.donorCountry] || 0) + r.amount
      cs[key].byYear[r.year] = (cs[key].byYear[r.year] || 0) + r.amount

      if (!sm[r.sector]) {
        sm[r.sector] = {
          total: 0,
          byYear: {},
        }
      }

      sm[r.sector].total += r.amount
      sm[r.sector].byYear[r.year] =
        (sm[r.sector].byYear[r.year] || 0) + r.amount
    })

    return {
      csMeta: cs,
      sectorMeta: sm,
      maxCsTotal: Math.max(...Object.values(cs).map(c => c.total), 1),
      maxSectorTotal: Math.max(...Object.values(sm).map(s => s.total), 1),
    }
  }, [data])

  const countryMeta = useMemo(
    () => Object.fromEntries((data.recipients || []).map(r => [r.country, r])),
    [data]
  )

  const regions = useMemo(
    () => [
      'All',
      ...[
        ...new Set(
          (data.recipients || []).map(r => r.regionMacro).filter(Boolean)
        ),
      ].sort(),
    ],
    [data]
  )

  const sectorOpts = useMemo(
    () =>
      (data.sectors || ['All']).filter(
        s => s !== 'Unspecified' && s !== 'Other'
      ),
    [data]
  )

  const portfolio = useMemo(() => {
    if (!params) return null

    const {
      budget: bM,
      region: reg,
      sector: sec,
      risk: rsk,
      goal: strategicGoal,
    } = params

    const years = data.years || [2020, 2021, 2022, 2023]
    const n = numSlots(rsk)

    const candidates = Object.values(csMeta)
      .filter(cs => {
        if (sec !== 'All' && cs.sector !== sec) return false

        const meta = countryMeta[cs.country]
        if (reg !== 'All' && meta?.regionMacro !== reg) return false

        return true
      })
      .map(cs => {
        const dVals = Object.values(cs.donors)
        const dTotal = dVals.reduce((s, v) => s + v, 0)
        const topAmt = Math.max(...dVals, 0)
        const topShare = dTotal > 0 ? topAmt / dTotal : 0
        const topDonors = Object.entries(cs.donors)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([k]) => k)

        const ws = scoreWS(cs.total, maxCsTotal)
        const conc = scoreConc(topShare)
        const act = scoreAct(sectorMeta[cs.sector]?.total || 0, maxSectorTotal)
        const mom = scoreMom(sectorMeta[cs.sector]?.byYear || {}, years)
        const sat = clamp((cs.total / maxCsTotal) * 100)

        const baseScore = composite(ws, conc, act, mom, sat, rsk)

        const goalScore = goalRelevanceScore(strategicGoal, {
          country: cs.country,
          sector: cs.sector,
          wsScore: ws,
          concScore: conc,
          actScore: act,
          momScore: mom,
          satScore: sat,
          topDonors,
        })

        const hasStrategicGoal =
          strategicGoal && strategicGoal.trim().length > 3

        const score = hasStrategicGoal
          ? clamp(baseScore * 0.72 + goalScore * 0.85)
          : baseScore

        return {
          ...cs,
          wsScore: ws,
          concScore: conc,
          actScore: act,
          momScore: mom,
          satScore: sat,
          baseScore,
          goalScore,
          goalMatch: goalMatchLabel(goalScore),
          score,
          topDonorShare: topShare,
          topDonors,
          meta: countryMeta[cs.country],
        }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, n)

    if (!candidates.length) return null

    const totalScore = candidates.reduce((s, c) => s + c.score, 0)

    const allocs = candidates.map(c => ({
      ...c,
      allocation: Math.round((c.score / totalScore) * bM * 10) / 10,
      sharePct: Math.round((c.score / totalScore) * 100),
    }))

    const uniqueCountries = new Set(allocs.map(a => a.country)).size
    const uniqueSectors = new Set(allocs.map(a => a.sector)).size
    const avgConc =
      allocs.reduce((s, a) => s + a.topDonorShare, 0) / allocs.length

    return {
      allocs,
      uniqueCountries,
      uniqueSectors,
      avgConc,
      divLbl: divLabel(uniqueCountries, uniqueSectors),
      budgetM: bM,
    }
  }, [
    params,
    csMeta,
    sectorMeta,
    countryMeta,
    maxCsTotal,
    maxSectorTotal,
    data,
  ])

  const handleGenerate = useCallback(() => {
    setParams({
      budget: Number(budget) || 10,
      region,
      sector,
      risk,
      goal,
    })
  }, [budget, region, sector, risk, goal])

  const inputStyle = {
    background: '#070f1c',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 6,
    color: '#c8dff2',
    padding: '8px 10px',
    fontSize: 13,
    outline: 'none',
    width: '100%',
  }

  const lbl = {
    fontSize: 11,
    color: '#475569',
    fontWeight: 500,
    marginBottom: 5,
    display: 'block',
  }

  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.6, maxWidth: 700 }}>
        Test where a new foundation budget could create strategic marginal value
        based on funding gaps, donor concentration, sector activity, and the
        foundation&apos;s stated goal.
      </p>

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div
          style={{
            width: 280,
            flexShrink: 0,
            background: '#0f1e31',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 12,
            padding: '18px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#475569',
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
            }}
          >
            Simulation Inputs
          </p>

          <div>
            <label style={lbl}>Available Budget (USD millions)</label>
            <BudgetInput value={budget} onChange={setBudget} />
          </div>

          <div>
            <label style={lbl}>Region Focus</label>
            <select
              value={region}
              onChange={e => setRegion(e.target.value)}
              style={inputStyle}
            >
              {regions.map(r => (
                <option key={r} value={r} style={{ background: '#070f1c' }}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={lbl}>Sector Focus</label>
            <select
              value={sector}
              onChange={e => setSector(e.target.value)}
              style={inputStyle}
            >
              {sectorOpts.map(s => (
                <option key={s} value={s} style={{ background: '#070f1c' }}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={lbl}>Strategic Goal</label>
            <textarea
              value={goal}
              onChange={e => setGoal(e.target.value)}
              placeholder="e.g. Help children access better education and health outcomes..."
              rows={3}
              style={{
                ...inputStyle,
                resize: 'vertical',
                fontFamily: 'inherit',
                lineHeight: 1.5,
              }}
            />
            <p style={{ fontSize: 10, color: '#334155', marginTop: 4 }}>
              Enter a goal to personalize the portfolio. If left blank, the
              simulator uses the selected risk strategy as the default objective.
            </p>
          </div>

          <div>
            <label style={lbl}>Risk Preference</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                {
                  id: 'conservative',
                  label: 'Conservative',
                  sub: 'Established sectors, fewer bets',
                },
                {
                  id: 'balanced',
                  label: 'Balanced',
                  sub: 'Mix of proven and emerging',
                },
                {
                  id: 'exploratory',
                  label: 'Exploratory',
                  sub: 'Frontier areas, wider spread',
                },
              ].map(({ id, label, sub }) => (
                <button
                  key={id}
                  onClick={() => setRisk(id)}
                  style={{
                    textAlign: 'left',
                    padding: '9px 12px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    border:
                      risk === id
                        ? '1px solid rgba(35,102,201,0.5)'
                        : '1px solid rgba(255,255,255,0.07)',
                    background:
                      risk === id
                        ? 'rgba(35,102,201,0.15)'
                        : 'rgba(255,255,255,0.03)',
                    color: risk === id ? '#e2eaf4' : '#64748b',
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{label}</div>
                  <div style={{ fontSize: 11, marginTop: 2, opacity: 0.7 }}>
                    {sub}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            style={{
              marginTop: 4,
              padding: '11px',
              borderRadius: 8,
              border: 'none',
              background: 'linear-gradient(135deg,#2366c9,#0d846a)',
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.03em',
            }}
          >
            Generate Portfolio
          </button>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10 }}>
            <p style={{ fontSize: 10, color: '#334155', lineHeight: 1.6 }}>
              <strong style={{ color: '#475569' }}>Score components:</strong>
              <br />
              Goal match · White space · Donor concentration · Sector activity ·
              Sector momentum · Saturation penalty
            </p>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {!portfolio ? (
            <div
              style={{
                background: '#0f1e31',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 12,
                padding: 48,
                textAlign: 'center',
              }}
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#334155"
                strokeWidth="1.5"
                style={{ margin: '0 auto 16px', display: 'block' }}
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <p style={{ color: '#475569', fontSize: 13 }}>
                Configure inputs and click{' '}
                <strong style={{ color: '#7ab4d8' }}>Generate Portfolio</strong>{' '}
                to run the simulation.
              </p>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#e2eaf4' }}>
                    Recommended Funding Portfolio
                  </p>
                  <p style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>
                    {portfolio.allocs.length} allocations · {params.risk}{' '}
                    strategy · {fmt(portfolio.budgetM)} total budget
                  </p>
                </div>
              </div>

              <AIExplanation
                key={`${params.risk}-${params.budget}-${params.region}-${params.sector}-${params.goal}`}
                portfolio={portfolio}
                params={params}
              />

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))',
                  gap: 12,
                }}
              >
                {portfolio.allocs.map(alloc => (
                  <AllocationCard
                    key={`${alloc.country}-${alloc.sector}`}
                    alloc={alloc}
                    projects={projects}
                    projectsLoading={projectsLoading}
                  />
                ))}
              </div>

              <PortfolioSummary portfolio={portfolio} />

              <div
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 10,
                  padding: '12px 16px',
                  fontSize: 12,
                  color: '#475569',
                  lineHeight: 1.7,
                }}
              >
                <strong style={{ color: '#64748b' }}>Note: </strong>
                This simulator does not prescribe where funding must go. It uses
                OECD historical funding patterns and goal relevance signals to
                generate strategy scenarios for further investigation. Scores
                reflect relative signals only — all allocations should be
                validated against local context, grantee capacity, and foundation
                strategy before any commitment.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Allocation card flip ──────────────────────────────────────────────────────
const CARD_H = 290

function AllocationCard({ alloc, projects, projectsLoading }) {
  const [flipped, setFlipped] = useState(false)
  const wsCl = wsColor(alloc.wsScore)
  const concCl = concColor(alloc.topDonorShare)

  const countryProjects = useMemo(
    () => (projects || []).filter(p => p.country === alloc.country),
    [projects, alloc.country]
  )

  return (
    <div style={{ perspective: '1200px', height: CARD_H }}>
      <div
        style={{
          position: 'relative',
          height: '100%',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.45s ease',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            background: '#0f1e31',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 10,
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#e2eaf4' }}>
                {alloc.country}
              </p>
              <p style={{ fontSize: 11, color: '#60a5fa', marginTop: 1 }}>
                {alloc.sector}
              </p>
              {alloc.meta?.regionMacro && (
                <p style={{ fontSize: 10, color: '#334155', marginTop: 1 }}>
                  {alloc.meta.regionMacro}
                </p>
              )}
            </div>

            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#34d399' }}>
                {fmt(alloc.allocation)}
              </p>
              <p style={{ fontSize: 10, color: '#475569' }}>
                {alloc.sharePct}% of budget
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <SignalBar
              label="Goal Match"
              value={alloc.goalScore || 0}
              color={goalMatchColor(alloc.goalScore || 0)}
              tag={alloc.goalMatch || 'Neutral'}
            />
            <SignalBar
              label="White Space"
              value={alloc.wsScore}
              color={wsCl}
              tag={wsLabel(alloc.wsScore)}
            />
            <SignalBar
              label="Concentration"
              value={alloc.concScore}
              color={concCl}
              tag={concLabel(alloc.topDonorShare)}
            />
            <SignalBar
              label="Sector Activity"
              value={alloc.actScore}
              color="#60a5fa"
              tag={alloc.actScore > 60 ? 'High' : alloc.actScore > 30 ? 'Med' : 'Low'}
            />
            <SignalBar
              label="Momentum"
              value={alloc.momScore}
              color="#a78bfa"
              tag={alloc.momScore > 60 ? '↑' : alloc.momScore > 45 ? '→' : '↓'}
            />
          </div>

          {alloc.topDonors.length > 0 && (
            <div>
              <p style={{ fontSize: 10, color: '#334155', marginBottom: 4 }}>
                Top existing donors
              </p>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {alloc.topDonors.map(d => (
                  <span
                    key={d}
                    style={{
                      fontSize: 10,
                      padding: '2px 7px',
                      borderRadius: 4,
                      background: 'rgba(255,255,255,0.06)',
                      color: '#64748b',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    {d.replace("China (People's Republic of)", 'China')}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div style={{ flex: 1 }} />

          <button
            onClick={() => setFlipped(true)}
            style={{
              background: 'rgba(35,102,201,0.1)',
              border: '1px solid rgba(35,102,201,0.25)',
              borderRadius: 6,
              color: '#7ab4d8',
              fontSize: 10,
              cursor: 'pointer',
              padding: '5px 0',
              textAlign: 'center',
              width: '100%',
            }}
          >
            ▼ see active projects in {alloc.country}
          </button>
        </div>

        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: '#0f1e31',
            border: '1px solid rgba(35,102,201,0.25)',
            borderRadius: 10,
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#e2eaf4' }}>
                {alloc.country}
              </p>
              <p style={{ fontSize: 10, color: '#60a5fa', marginTop: 1 }}>
                Active Projects ({countryProjects.length})
              </p>
            </div>

            <button
              onClick={() => setFlipped(false)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 6,
                color: '#64748b',
                fontSize: 11,
                cursor: 'pointer',
                padding: '3px 10px',
              }}
            >
              ← back
            </button>
          </div>

          <div style={{ overflowY: 'auto', flex: 1 }}>
            {projectsLoading && !projects ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 0', color: '#475569', fontSize: 11 }}>
                <div
                  style={{
                    width: 12,
                    height: 12,
                    border: '2px solid #2366c9',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                    flexShrink: 0,
                  }}
                />
                Loading projects…
              </div>
            ) : countryProjects.length > 0 ? (
              countryProjects.map((p, i) => (
                <div
                  key={p.id || i}
                  style={{
                    padding: '6px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                  }}
                >
                  <p style={{ fontSize: 11, color: '#c8dff2', lineHeight: 1.4 }}>
                    {p.title}
                  </p>
                  <p style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>
                    {p.sector} · {p.year} · {fmt(p.amount)}
                  </p>
                </div>
              ))
            ) : (
              <p style={{ fontSize: 11, color: '#334155', padding: '8px 0' }}>
                No detailed project data available for {alloc.country} in the
                current dataset.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function SignalBar({ label, value, color, tag }) {
  const displayValue =
    label === 'Goal Match'
      ? clamp((Number(value || 0) / 45) * 100)
      : clamp(Number(value || 0))

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 10, color: '#475569', width: 82, flexShrink: 0 }}>
        {label}
      </span>

      <div
        style={{
          flex: 1,
          background: 'rgba(255,255,255,0.05)',
          borderRadius: 3,
          height: 4,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${Math.round(displayValue)}%`,
            height: '100%',
            background: color,
            borderRadius: 3,
          }}
        />
      </div>

      <span
        style={{
          fontSize: 10,
          color,
          width: 42,
          textAlign: 'right',
          flexShrink: 0,
        }}
      >
        {tag}
      </span>
    </div>
  )
}

function PortfolioSummary({ portfolio }) {
  const { uniqueCountries, uniqueSectors, avgConc, divLbl, budgetM } = portfolio
  const divCl = divColor(divLbl)
  const concLbl = avgConcLabel(avgConc)
  const concCl = concColor(avgConc)

  return (
    <div
      style={{
        background: '#0f1e31',
        border: '1px solid rgba(35,102,201,0.2)',
        borderRadius: 10,
        padding: '14px 18px',
      }}
    >
      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: '#475569',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 12,
        }}
      >
        Portfolio Summary
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12 }}>
        {[
          {
            label: 'Total Budget',
            value: fmt(budgetM),
            color: '#34d399',
          },
          {
            label: 'Countries',
            value: uniqueCountries,
            color: '#60a5fa',
          },
          {
            label: 'Sectors',
            value: uniqueSectors,
            color: '#60a5fa',
          },
          {
            label: 'Diversification',
            value: divLbl,
            color: divCl,
          },
          {
            label: 'Avg Concentration Risk',
            value: concLbl,
            color: concCl,
          },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 10, color: '#475569', marginBottom: 4 }}>
              {label}
            </p>
            <p style={{ fontSize: 15, fontWeight: 700, color }}>
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}