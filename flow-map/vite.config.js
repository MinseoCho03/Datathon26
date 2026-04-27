import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

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
          url.startsWith('/flow-data.json')
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

export default defineConfig({
  plugins: [react(), serveParentStatic()],
  base: './',
})
