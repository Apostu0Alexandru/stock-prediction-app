'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface StockData {
  date: string;
  price: number;
}

export default function Home() {
  const [stockData, setStockData] = useState<StockData[]>([])
  const [symbol, setSymbol] = useState<string>('AAPL')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/stock-data?symbol=${symbol}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      if (data.error) {
        throw new Error(data.error)
      }

      setStockData(data)
    } catch (error) {
      console.error('Error fetching stock data:', error)
      setError(error instanceof Error ? error.message : 'An unknown error occurred')
      setStockData([])
    } finally {
      setIsLoading(false)
    }
  }, [symbol])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 300000) // 5 minutes

    return () => clearInterval(interval)
  }, [fetchData])

  return (
    <div className="container mx-auto p-4 bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-4 text-primary">Real-Time Stock Price Prediction</h1>
      <div className="mb-4">
        <label htmlFor="symbol" className="mr-2">Stock Symbol:</label>
        <input
          type="text"
          id="symbol"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          className="border rounded px-2 py-1"
        />
        <button 
          onClick={fetchData} 
          className="ml-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>
      {error && (
        <div className="mb-4 text-red-500">
          Error: {error}
        </div>
      )}
      {stockData.length > 0 && (
        <div className="mb-4">
          <p>Symbol: {symbol}</p>
          <p>Latest Price: ${stockData[stockData.length - 1]?.price?.toFixed(2) ?? 'N/A'}</p>
          <p>Date Range: {stockData[0]?.date ?? 'N/A'} to {stockData[stockData.length - 1]?.date ?? 'N/A'}</p>
        </div>
      )}
      <div className="w-full h-[400px] bg-card rounded-lg shadow-md p-4">
        {stockData.length > 0 ? (
          <ChartContainer
            config={{
              price: {
                label: "Stock Price",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stockData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  className="text-sm"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  className="text-sm"
                  tickFormatter={(value) => `$${value.toFixed(2)}`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="var(--color-price)"
                  strokeWidth={2}
                  dot={{
                    r: 2,
                    fill: "var(--color-price)",
                    strokeWidth: 0,
                  }}
                  activeDot={{
                    r: 4,
                    fill: "var(--color-price)",
                    stroke: "var(--background)",
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>{isLoading ? 'Loading...' : 'No data available. Please try a different stock symbol.'}</p>
          </div>
        )}
      </div>
    </div>
  )
}

