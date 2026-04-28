import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'
import Anthropic from '@anthropic-ai/sdk'

// Serve the parent Datathon26 directory as static files so that
// /funder/index.html, /styles.css, /app.js, /data/... all resolve correctly
// from within the dev server — enabling seamless navigation between the
// React map page and the vanilla-JS funder portal.
function serveParentStatic() {
  const projectRoot = path.resolve(__dirname, '..')
  const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css':  'text/css',
    '.js':   'application/javascript',
    '.json': 'application/json',
    '.png':  'image/png',
    '.svg':  'image/svg+xml',
    '.ico':  'image/x-icon',
  }
  return {
    name: 'serve-parent-static',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = decodeURIComponent(req.url.split('?')[0])
        // Never intercept Vite-internal routes or the React entry
        if (
          url === '/' ||
          url === '/index.html' ||
          url.startsWith('/@') ||
          url.startsWith('/src') ||
          url.startsWith('/node_modules') ||
          url.startsWith('/flow-data.json') ||
          url.startsWith('/api/')
        ) return next()

        const filePath = path.join(projectRoot, url)
        // Security: stay inside projectRoot
        if (!filePath.startsWith(projectRoot)) return next()

        try {
          const stat = fs.statSync(filePath)
          if (stat.isFile()) {
            const ext = path.extname(filePath)
            res.setHeader('Content-Type', MIME[ext] || 'text/plain')
            res.end(fs.readFileSync(filePath))
            return
          }
        } catch (_) { /* file not found → fall through */ }
        next()
      })
    },
  }
}

// Proxy /api/claude to Anthropic in dev — same shape as the Vercel function
// so the frontend code is identical in dev and production.
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

            // Forward tool-call events for the future Network tab
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

// export default defineConfig({
//   plugins: [react(), serveParentStatic(), claudeApiPlugin()],
//   base: './',
// })

export default defineConfig(({ mode }) => {
  // 2. Load env file based on the current working directory
  // The third argument '' loads all variables regardless of VITE_ prefix
  const env = loadEnv(mode, process.cwd(), '');
  
  // 3. Manually inject it into process.env so your plugin can see it
  process.env.ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY;

  return {
    plugins: [react(), serveParentStatic(), claudeApiPlugin()],
    base: './',
  }
})