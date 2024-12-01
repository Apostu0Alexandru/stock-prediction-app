export function predictNextPrice(prices: number[]): number {
    // Simple moving average with trend
    const windowSize = Math.min(10, prices.length)
    const recentPrices = prices.slice(-windowSize)
    const sum = recentPrices.reduce((a, b) => a + b, 0)
    const avg = sum / windowSize
  
    // Calculate trend
    const trend = recentPrices[recentPrices.length - 1] - recentPrices[0]
    const trendFactor = trend / windowSize
  
    // Predict next value based on average and trend
    return avg + trendFactor
  }
  
  export function calculateAccuracy(actualPrices: number[], predictedPrices: number[]): number {
    const errors = actualPrices.map((actual, index) => 
      Math.abs(actual - predictedPrices[index])
    )
    const meanError = errors.reduce((sum, error) => sum + error, 0) / errors.length
    const accuracy = 100 - (meanError / (Math.max(...actualPrices) - Math.min(...actualPrices))) * 100
    return Math.max(0, Math.min(100, accuracy))
  }
  
  