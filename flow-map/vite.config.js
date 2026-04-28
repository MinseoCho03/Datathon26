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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  process.env.ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY

  return {
    plugins: [react(), claudeApiPlugin()],
    base: '/',
  }
})
