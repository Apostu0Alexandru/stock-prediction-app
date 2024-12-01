import { NextResponse } from 'next/server'

export async function GET() {
  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      while (true) {
        const price = 100 + Math.random() * 10
        const data = JSON.stringify({ price, timestamp: Date.now() })
        controller.enqueue(encoder.encode(`data: ${data}\n\n`))
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    },
  })

  return new NextResponse(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

