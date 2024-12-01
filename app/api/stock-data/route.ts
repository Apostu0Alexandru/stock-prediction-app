type StockData = {
  date: string;
  price: number;
};

type TimeSeriesData = {
  '4. close': string;
  [key: string]: string;
};

import { NextResponse } from 'next/server'

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

const cache: { [symbol: string]: { data: StockData[]; timestamp: number } } = {}

export async function GET(request: Request) {
  console.log('API route called')
  console.log('API_KEY:', API_KEY ? 'Set' : 'Not set')

  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol')

  console.log('Requested symbol:', symbol)

  if (!symbol) {
    return NextResponse.json({ error: 'Stock symbol is required' }, { status: 400 })
  }

  if (!API_KEY) {
    console.error('Alpha Vantage API key is not set')
    return NextResponse.json({ error: 'API key is not configured' }, { status: 500 })
  }

  // Check cache
  if (cache[symbol] && Date.now() - cache[symbol].timestamp < CACHE_DURATION) {
    console.log('Returning cached data for', symbol)
    return NextResponse.json(cache[symbol].data)
  }

  try {
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}`
    console.log('Fetching data from:', url)

    const response = await fetch(url)
    const data = await response.json()

    console.log('API Response:', JSON.stringify(data, null, 2))

    if (data['Information']) {
      console.log('Rate limit reached:', data['Information'])
      return NextResponse.json({ error: 'API rate limit reached. Please try again later.' }, { status: 429 })
    }

    if (data['Error Message']) {
      throw new Error(data['Error Message'])
    }

    const timeSeries = data['Time Series (Daily)'] as Record<string, TimeSeriesData>
    if (!timeSeries || Object.keys(timeSeries).length === 0) {
      return NextResponse.json({ error: 'No data available for the given symbol' }, { status: 404 })
    }

    const formattedData: StockData[] = Object.entries(timeSeries).map(([date, values]) => ({
      date,
      price: parseFloat(values['4. close'])
    })).reverse().slice(0, 30) // Get last 30 days of data

    // Update cache
    cache[symbol] = { data: formattedData, timestamp: Date.now() }

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error('Error fetching stock data:', error)
    return NextResponse.json({ error: 'Failed to fetch stock data', details: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}

