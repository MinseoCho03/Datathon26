import Anthropic from '@anthropic-ai/sdk'

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    return res.status(204).end()
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' })

  const { candidates, numSlots, budget, sector, region, risk, goal } = req.body

  const sectorLine = sector && sector !== 'All'
    ? `Required sector: ${sector} — only select this sector for every country.`
    : 'No sector constraint — pick the best sector per country based on the goal and project data.'
  const regionLine = region && region !== 'All' ? `Region filter: ${region} only.` : 'All regions eligible.'
  const goalLine = goal
    ? `Strategic goal: "${goal}"\nUse project titles and descriptions to judge how well each country's actual work aligns with this goal.`
    : 'No strategic goal — use the risk preference as the primary guide.'
  const riskDesc = {
    conservative: 'high sector activity, proven funding flows, lower white space',
    exploratory:  'high white space (underfunded), low donor concentration, emerging areas',
    balanced:     'balance between established and underfunded opportunities',
  }[risk] || 'balanced approach'

  const candidateText = candidates.map(c => {
    const sectorLines = c.sectors.slice(0, 5).map(s =>
      `    • ${s.sector}: ${s.projectCount > 0 ? s.projectCount + ' projects, ' : ''}$${s.amount.toFixed(1)}M`
    ).join('\n')
    const projLines = c.projectSamples.length
      ? c.projectSamples.map(p => `    – ${p}`).join('\n')
      : '    – (no project descriptions available)'
    return `${c.country} [${c.region}]
  Funding gap (white space): ${c.wsLabel} | Donor concentration: ${c.concLabel} | Top donors: ${c.topDonors.join(', ') || 'none'}
  Active sectors:\n${sectorLines}
  Most relevant sample projects:\n${projLines}`
  }).join('\n\n')

  const prompt = `You are a philanthropic strategy advisor selecting where a foundation should invest.

Foundation parameters:
- Budget: $${budget}M
- Risk preference: ${risk} (favor ${riskDesc})
- ${sectorLine}
- ${regionLine}
- ${goalLine}

Select exactly ${numSlots} country-sector investment opportunities from the candidates below.

Selection criteria (in order of importance):
1. Alignment of actual project work with the strategic goal — look at project titles/descriptions
2. ${risk === 'exploratory' ? 'High white space (underfunded countries where new funding creates most marginal value)' : risk === 'conservative' ? 'Strong sector activity and proven funding flows' : 'Balance of white space opportunity and sector activity'}
3. Donor concentration — prefer low concentration (more room to add unique value)
4. Geographic diversity — avoid clustering all picks in one region

Allocation rules:
- Assign an allocationPct for each selection; all values must sum to exactly 100
- DO NOT spread budget equally — weight by strategic importance
- The top pick should receive at least 2× the smallest allocation
- For each selection write a "reason": a brief phrase of 10 words max referencing the project data

Candidates:
${candidateText}

Respond with ONLY valid JSON, no other text:
{
  "selections": [
    { "country": "...", "sector": "...", "allocationPct": 35, "reason": "..." }
  ]
}`

  try {
    const client = new Anthropic({ apiKey })
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 900,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = msg.content[0]?.text || ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return res.status(500).json({ error: 'No JSON in response', raw: text.slice(0, 500) })

    const result = JSON.parse(jsonMatch[0])
    if (!Array.isArray(result.selections) || !result.selections.length) {
      return res.status(500).json({ error: 'Empty selections in response' })
    }

    // Normalize allocations to sum to exactly 100
    const total = result.selections.reduce((s, c) => s + (Number(c.allocationPct) || 0), 0)
    if (total > 0 && Math.abs(total - 100) > 1) {
      let running = 0
      result.selections = result.selections.map((s, i, arr) => {
        if (i === arr.length - 1) {
          return { ...s, allocationPct: 100 - running }
        }
        const pct = Math.round((Number(s.allocationPct) / total) * 100)
        running += pct
        return { ...s, allocationPct: pct }
      })
    }

    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.json(result)
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
