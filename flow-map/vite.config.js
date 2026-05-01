import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import Anthropic from '@anthropic-ai/sdk'

// Dev-only: forwards /api/claude to Anthropic.
// On Vercel, /api/claude is handled by api/claude.js serverless function.
function claudeApiPlugin() {
  return {
    name: 'claude-api',
    configureServer(server) {
      server.middlewares.use('/api/claude', (req, res) => {
        if (req.method === 'OPTIONS') {
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
          res.statusCode = 204
          res.end()
          return
        }

        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method Not Allowed')
          return
        }

        const apiKey = process.env.ANTHROPIC_API_KEY
        if (!apiKey) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'ANTHROPIC_API_KEY is not set. Add it to flow-map/.env' }))
          return
        }

        let body = ''
        req.on('data', chunk => { body += chunk })
        req.on('end', async () => {
          try {
            const { system, messages, tools } = JSON.parse(body)

            res.setHeader('Content-Type', 'text/event-stream')
            res.setHeader('Cache-Control', 'no-cache')
            res.setHeader('Connection', 'keep-alive')
            res.setHeader('Access-Control-Allow-Origin', '*')

            const client = new Anthropic({ apiKey })
            const streamParams = {
              model: 'claude-sonnet-4-6',
              max_tokens: 200,
              system,
              messages,
            }
            if (tools?.length) streamParams.tools = tools

            const stream = client.messages.stream(streamParams)

            stream.on('text', (text) => {
              res.write(`data: ${JSON.stringify({ type: 'text', text })}\n\n`)
            })

            stream.on('inputJson', (delta) => {
              res.write(`data: ${JSON.stringify({ type: 'tool_delta', delta })}\n\n`)
            })

            await stream.finalMessage()
            res.write('data: [DONE]\n\n')
            res.end()
          } catch (e) {
            try {
              res.write(`data: ${JSON.stringify({ type: 'error', message: e.message })}\n\n`)
              res.end()
            } catch (_) { res.end() }
          }
        })
      })
    },
  }
}

function recommendApiPlugin() {
  return {
    name: 'recommend-api',
    configureServer(server) {
      server.middlewares.use('/api/recommend', (req, res) => {
        if (req.method === 'OPTIONS') {
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
          res.statusCode = 204
          res.end()
          return
        }
        if (req.method !== 'POST') { res.statusCode = 405; res.end('Method Not Allowed'); return }

        const apiKey = process.env.ANTHROPIC_API_KEY
        if (!apiKey) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'ANTHROPIC_API_KEY not set' }))
          return
        }

        let body = ''
        req.on('data', chunk => { body += chunk })
        req.on('end', async () => {
          try {
            const { candidates, numSlots, budget, sector, region, risk, goal } = JSON.parse(body)

            const sectorLine = sector && sector !== 'All'
              ? `Required sector: ${sector} — only select this sector for every country.`
              : 'No sector constraint — pick the best sector per country.'
            const goalLine = goal
              ? `Strategic goal: "${goal}"\nUse project titles/descriptions to judge alignment.`
              : 'No strategic goal — use risk preference as guide.'
            const riskDesc = { conservative: 'high sector activity, proven flows', exploratory: 'high white space, low donor concentration', balanced: 'balance of established and underfunded' }[risk] || 'balanced'

            const candidateText = candidates.map(c => {
              const sLines = c.sectors.slice(0, 5).map(s => `    • ${s.sector}: ${s.projectCount > 0 ? s.projectCount + ' projects, ' : ''}$${s.amount.toFixed(1)}M`).join('\n')
              const pLines = c.projectSamples.length ? c.projectSamples.map(p => `    – ${p}`).join('\n') : '    – (no project data)'
              return `${c.country} [${c.region}]\n  White space: ${c.wsLabel} | Concentration: ${c.concLabel} | Top donors: ${c.topDonors.join(', ') || 'none'}\n  Sectors:\n${sLines}\n  Sample projects:\n${pLines}`
            }).join('\n\n')

            const prompt = `You are a philanthropic strategy advisor.\n\nFoundation: $${budget}M, ${risk} risk (favor ${riskDesc})\n${sectorLine}\n${region && region !== 'All' ? `Region: ${region}` : 'All regions'}\n${goalLine}\n\nSelect exactly ${numSlots} country-sector pairs from below. Allocation rules: sum to 100, top pick ≥ 2× smallest, do NOT spread equally.\n\nCandidates:\n${candidateText}\n\nJSON only:\n{"selections":[{"country":"...","sector":"...","allocationPct":35,"reason":"10 words max"}]}`

            const client = new Anthropic({ apiKey })
            const msg = await client.messages.create({
              model: 'claude-sonnet-4-6',
              max_tokens: 900,
              messages: [{ role: 'user', content: prompt }],
            })

            const text = msg.content[0]?.text || ''
            const jsonMatch = text.match(/\{[\s\S]*\}/)
            if (!jsonMatch) throw new Error('No JSON in response')
            const result = JSON.parse(jsonMatch[0])
            if (!Array.isArray(result.selections) || !result.selections.length) throw new Error('Empty selections')

            const total = result.selections.reduce((s, c) => s + (Number(c.allocationPct) || 0), 0)
            if (total > 0 && Math.abs(total - 100) > 1) {
              let running = 0
              result.selections = result.selections.map((s, i, arr) => {
                if (i === arr.length - 1) return { ...s, allocationPct: 100 - running }
                const pct = Math.round((Number(s.allocationPct) / total) * 100)
                running += pct
                return { ...s, allocationPct: pct }
              })
            }

            res.setHeader('Content-Type', 'application/json')
            res.setHeader('Access-Control-Allow-Origin', '*')
            res.end(JSON.stringify(result))
          } catch (e) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: e.message }))
          }
        })
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  process.env.ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY

  return {
    plugins: [react(), claudeApiPlugin(), recommendApiPlugin()],
    base: '/',
  }
})
