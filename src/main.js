// @ts-nocheck
import fetch from 'node-fetch'
import { getStaticFile } from './utils/staticFile.js'

// In-memory storage for conversation context
let conversationContext = []

export default async ({ req, res, log, error }) => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY

  /* Handle GET request */
  if (req.method === 'GET') {
    return res.send(getStaticFile('index.html'), 200, {
      'Content-Type': 'text/html; charset=utf-8',
    })
  }

  /* Handle POST request */
  if (req.method === 'POST') {
    const body = req.body

    // Add the new prompt to the conversation context
    conversationContext.push(`User: ${body.prompt}`)
    // Keep only the last 5 messages to save API cost
    const context = conversationContext.slice(-5).join('\n')

    const prompt =
      context +
      `\nAI: Your output should be HTML. Do not include any heading or body tags. Just the content.
      Respond to greetings with a polite greeting.`

    const url =
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=' +
      GEMINI_API_KEY

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      })

      const data = await response.json()

      const generatedText =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        'No response received'

      // Add the response to the conversation context
      conversationContext.push(`AI: ${generatedText}`)

      return res.json({ ok: true, output: generatedText })
    } catch (err) {
      error('Error fetching response from Gemini API:', err)
      return res.json({ ok: false, error: err.message }, 500, {
        'Access-Control-Allow-Origin': '*',
      })
    }
  }

  /* Handle unsupported HTTP methods */
  return res.json({ ok: false, error: 'Method Not Allowed' }, 405, {
    'Access-Control-Allow-Origin': '*',
  })
}
