'use client'

import { useState, useEffect, useCallback } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const FETCH_INTERVAL = 60000 // 1 minute in milliseconds

interface StockData {
  symbol: string
  price: number
  change: number
  changePercent: string
  lastUpdated: string
}

export default function Home() {
  const [stockData, setStockData] = useState<StockData | null>(null)
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
      setStockData(null)
    } finally {
      setIsLoading(false)
    }
  }, [symbol])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, FETCH_INTERVAL)

    return () => clearInterval(interval)
  }, [fetchData])

  const chartData = {
    labels: stockData ? ['Previous Close', 'Current Price'] : [],
    datasets: [
      {
        label: 'Stock Price',
        data: stockData ? [stockData.price - stockData.change, stockData.price] : [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1,
      },
    ],
  }

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: stockData ? `${stockData.symbol} Stock Price` : 'Stock Price',
      },
    },
  }

  return (
    <div className="container mx-auto p-4 bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-4 text-primary">Real-Time Stock Price Tracker</h1>
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
      {stockData && (
        <div className="mb-4">
          <p>Symbol: {stockData.symbol}</p>
          <p>Price: ${stockData.price.toFixed(2)}</p>
          <p>Change: ${stockData.change.toFixed(2)} ({stockData.changePercent})</p>
          <p>Last Updated: {new Date(stockData.lastUpdated).toLocaleString()}</p>
        </div>
      )}
      <div className="w-full h-[400px] bg-card rounded-lg shadow-md p-4">
        {stockData ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>{isLoading ? 'Loading...' : 'No data available. Please try a different stock symbol.'}</p>
          </div>
        )}
      </div>
    </div>
  )
}

