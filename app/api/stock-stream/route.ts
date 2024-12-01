import { NextResponse } from 'next/server'

// Add export config to mark this route as dynamic
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export async function GET() {
  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      const startTime = Date.now();
      let isStreaming = true;
      
      try {
        while (isStreaming) {
          const price = 100 + Math.random() * 10
          const data = JSON.stringify({ price, timestamp: Date.now() })
          controller.enqueue(encoder.encode(`data: ${data}\n\n`))
          
          // Add a shorter timeout for development/testing
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Limit stream duration to 5 minutes
          if (Date.now() - startTime > 300000) {
            isStreaming = false;
          }
        }
      } catch (error) {
        console.error('Stream error:', error);
      } finally {
        controller.close();
      }
    },
  })

  return new NextResponse(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  })
}

