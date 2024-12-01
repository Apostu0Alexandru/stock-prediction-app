import { NextResponse } from 'next/server'

function simplePrediction(prices: number[]): number {
  const sum = prices.reduce((a, b) => a + b, 0)
  const avg = sum / prices.length
  const lastPrice = prices[prices.length - 1]
  return lastPrice > avg ? lastPrice * 1.01 : lastPrice * 0.99
}

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()
    const prices = prompt.split(',').map(Number)
    
    if (prices.length < 2 || prices.some(isNaN)) {
      throw new Error('Invalid input: Need at least 2 valid numbers')
    }

    const prediction = simplePrediction(prices)

    return NextResponse.json({ prediction: prediction.toFixed(2) })
  } catch (error) {
    console.error('Prediction error:', error)
    return NextResponse.json({ error: 'Failed to generate prediction' }, { status: 400 })
  }
}

