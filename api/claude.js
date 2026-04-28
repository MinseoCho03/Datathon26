import Anthropic from '@anthropic-ai/sdk'

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    return res.status(204).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' })
  }

  const { system, messages, tools } = req.body

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('Access-Control-Allow-Origin', '*')

  try {
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
}
