import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendUp, TrendDown, Minus, Sparkle, CalendarDots, ChartLine } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useLocalStorage } from '@/lib/useLocalStorage'

interface SentimentDataPoint {
  timestamp: number
  date: string
  sentiment: number
  label: string
  confidence: number
}

interface ForecastPoint {
  date: string
  predicted: number
  confidence: number
  trend: 'up' | 'down' | 'stable'
  label: string
}

interface ModelMetrics {
  accuracy: number
  mape: number
  rmse: number
}

export function SentimentForecaster() {
  const [historicalData, setHistoricalData] = useLocalStorage<SentimentDataPoint[]>('sentiment-history', [])
  const [forecasts, setForecasts] = useState<ForecastPoint[]>([])
  const [isForecasting, setIsForecasting] = useState(false)
  const [forecastPeriod, setForecastPeriod] = useState<'7' | '14' | '30'>('7')
  const [modelMetrics, setModelMetrics] = useState<ModelMetrics | null>(null)
  const [selectedModel, setSelectedModel] = useState<'linear' | 'exponential' | 'moving-average'>('linear')

  const data = historicalData || []

  useEffect(() => {
    if (data.length === 0) {
      generateSampleData()
    }
  }, [])

  const generateSampleData = () => {
    const now = Date.now()
    const data: SentimentDataPoint[] = []
    
    for (let i = 30; i >= 0; i--) {
      const timestamp = now - (i * 24 * 60 * 60 * 1000)
      const date = new Date(timestamp)
      const baseValue = 0.5 + Math.sin(i / 5) * 0.2
      const noise = (Math.random() - 0.5) * 0.2
      const sentiment = Math.max(0, Math.min(1, baseValue + noise))
      
      data.push({
        timestamp,
        date: date.toLocaleDateString(),
        sentiment,
        label: sentiment > 0.6 ? 'Positive' : sentiment < 0.4 ? 'Negative' : 'Neutral',
        confidence: 0.7 + Math.random() * 0.25
      })
    }
    
    setHistoricalData(data)
  }

  const linearRegression = (data: SentimentDataPoint[]) => {
    const n = data.length
    const x = data.map((_, i) => i)
    const y = data.map(d => d.sentiment)
    
    const sumX = x.reduce((a, b) => a + b, 0)
    const sumY = y.reduce((a, b) => a + b, 0)
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0)
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n
    
    return { slope, intercept }
  }

  const exponentialSmoothing = (data: SentimentDataPoint[], alpha: number = 0.3) => {
    const values = data.map(d => d.sentiment)
    const smoothed = [values[0]]
    
    for (let i = 1; i < values.length; i++) {
      smoothed.push(alpha * values[i] + (1 - alpha) * smoothed[i - 1])
    }
    
    return smoothed[smoothed.length - 1]
  }

  const movingAverage = (data: SentimentDataPoint[], window: number = 7) => {
    const values = data.map(d => d.sentiment)
    const recent = values.slice(-window)
    return recent.reduce((a, b) => a + b, 0) / recent.length
  }

  const calculateMetrics = (actual: number[], predicted: number[]): ModelMetrics => {
    const n = Math.min(actual.length, predicted.length)
    
    const errors = actual.slice(0, n).map((a, i) => a - predicted[i])
    const mse = errors.reduce((sum, e) => sum + e * e, 0) / n
    const rmse = Math.sqrt(mse)
    
    const mape = errors.reduce((sum, e, i) => {
      return sum + Math.abs(e / (actual[i] || 0.001))
    }, 0) / n * 100
    
    const accuracy = Math.max(0, Math.min(100, 100 - mape))
    
    return { accuracy, mape, rmse }
  }

  const generateForecast = async () => {
    if (data.length < 7) {
      toast.error('Need at least 7 days of historical data to forecast')
      return
    }

    setIsForecasting(true)

    try {
      const days = parseInt(forecastPeriod)
      const forecasts: ForecastPoint[] = []
      const lastDate = new Date(data[data.length - 1].timestamp)
      
      let baseValue: number
      let trend: number = 0
      
      if (selectedModel === 'linear') {
        const { slope, intercept } = linearRegression(data)
        baseValue = slope * data.length + intercept
        trend = slope
      } else if (selectedModel === 'exponential') {
        baseValue = exponentialSmoothing(data, 0.3)
        const recentTrend = data.slice(-5).map(d => d.sentiment)
        trend = (recentTrend[recentTrend.length - 1] - recentTrend[0]) / recentTrend.length
      } else {
        baseValue = movingAverage(data, 7)
        const ma14 = movingAverage(data, 14)
        trend = (baseValue - ma14) / 14
      }

      const prompt = `Analyze this sentiment data and provide insights for the next ${days} days:
Historical average: ${(data.reduce((sum, d) => sum + d.sentiment, 0) / data.length).toFixed(3)}
Recent trend: ${trend > 0 ? 'upward' : trend < 0 ? 'downward' : 'stable'}
Last value: ${data[data.length - 1].sentiment.toFixed(3)}
Model prediction base: ${baseValue.toFixed(3)}

Provide brief insight about expected emotional patterns.`

      const insight = await window.spark.llm(prompt, 'gpt-4o-mini')

      for (let i = 1; i <= days; i++) {
        const futureDate = new Date(lastDate)
        futureDate.setDate(futureDate.getDate() + i)
        
        const trendEffect = trend * i
        const cyclical = Math.sin((data.length + i) / 5) * 0.15
        const randomWalk = (Math.random() - 0.5) * 0.05
        
        let predicted = baseValue + trendEffect + cyclical + randomWalk
        predicted = Math.max(0.1, Math.min(0.9, predicted))
        
        const confidenceDecay = Math.exp(-i / (days * 0.5))
        const confidence = 0.7 * confidenceDecay + 0.3
        
        const label = predicted > 0.6 ? 'Positive' : predicted < 0.4 ? 'Negative' : 'Neutral'
        const trendDirection = i === 1 
          ? (predicted > data[data.length - 1].sentiment ? 'up' : predicted < data[data.length - 1].sentiment ? 'down' : 'stable')
          : (predicted > forecasts[i - 2].predicted ? 'up' : predicted < forecasts[i - 2].predicted ? 'down' : 'stable')
        
        forecasts.push({
          date: futureDate.toLocaleDateString(),
          predicted,
          confidence,
          trend: trendDirection,
          label
        })
      }

      const testSize = Math.min(7, Math.floor(data.length * 0.2))
      const testData = data.slice(-testSize)
      const trainData = data.slice(0, -testSize)
      
      let testPredictions: number[] = []
      if (selectedModel === 'linear') {
        const { slope, intercept } = linearRegression(trainData)
        testPredictions = testData.map((_, i) => slope * (trainData.length + i) + intercept)
      } else if (selectedModel === 'exponential') {
        const base = exponentialSmoothing(trainData, 0.3)
        testPredictions = testData.map(() => base)
      } else {
        const base = movingAverage(trainData, 7)
        testPredictions = testData.map(() => base)
      }
      
      const metrics = calculateMetrics(
        testData.map(d => d.sentiment),
        testPredictions
      )
      
      setModelMetrics(metrics)
      setForecasts(forecasts)
      
      toast.success(insight, { duration: 8000 })
      toast.success(`Forecast generated for next ${days} days with ${metrics.accuracy.toFixed(1)}% accuracy`)
    } catch (error) {
      console.error('Forecast error:', error)
      toast.error('Failed to generate forecast')
    } finally {
      setIsForecasting(false)
    }
  }

  const getSentimentColor = (value: number) => {
    if (value > 0.6) return 'text-green-600'
    if (value < 0.4) return 'text-red-600'
    return 'text-yellow-600'
  }

  const getSentimentBg = (value: number) => {
    if (value > 0.6) return 'bg-green-100 border-green-300'
    if (value < 0.4) return 'bg-red-100 border-red-300'
    return 'bg-yellow-100 border-yellow-300'
  }

  return (
    <div className="space-y-6">
      <Card className="gradient-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Sparkle size={24} weight="duotone" className="text-accent" />
                Predictive Sentiment Forecasting
              </CardTitle>
              <CardDescription>
                AI-powered emotional pattern prediction using {data.length} days of historical data
              </CardDescription>
            </div>
            <ChartLine size={32} weight="duotone" className="text-primary opacity-50" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Forecast Period</label>
              <Select value={forecastPeriod} onValueChange={(v: any) => setForecastPeriod(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="14">14 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Prediction Model</label>
              <Select value={selectedModel} onValueChange={(v: any) => setSelectedModel(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linear">Linear Regression</SelectItem>
                  <SelectItem value="exponential">Exponential Smoothing</SelectItem>
                  <SelectItem value="moving-average">Moving Average</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={generateForecast} 
                disabled={isForecasting || data.length < 7}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              >
                {isForecasting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Forecasting...
                  </>
                ) : (
                  <>
                    <Sparkle size={18} weight="duotone" className="mr-2" />
                    Generate Forecast
                  </>
                )}
              </Button>
            </div>
          </div>

          {modelMetrics && (
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg border">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{modelMetrics.accuracy.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">Model Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">{modelMetrics.mape.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">Prediction Error</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{modelMetrics.rmse.toFixed(3)}</div>
                <div className="text-xs text-muted-foreground">RMSE Score</div>
              </div>
            </div>
          )}

          {forecasts.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Predicted Emotional Patterns</h3>
                <Badge variant="outline" className="gap-1">
                  <CalendarDots size={16} weight="duotone" />
                  Next {forecastPeriod} Days
                </Badge>
              </div>

              <div className="grid gap-3">
                {forecasts.map((forecast, index) => (
                  <Card 
                    key={index}
                    className={`transition-all hover:shadow-md ${getSentimentBg(forecast.predicted)}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            {forecast.trend === 'up' && (
                              <TrendUp size={24} weight="duotone" className="text-green-600" />
                            )}
                            {forecast.trend === 'down' && (
                              <TrendDown size={24} weight="duotone" className="text-red-600" />
                            )}
                            {forecast.trend === 'stable' && (
                              <Minus size={24} weight="duotone" className="text-gray-600" />
                            )}
                            <div>
                              <div className="font-semibold text-sm">{forecast.date}</div>
                              <div className="text-xs text-muted-foreground">Day {index + 1}</div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${getSentimentColor(forecast.predicted)}`}>
                              {(forecast.predicted * 100).toFixed(0)}%
                            </div>
                            <div className="text-xs text-muted-foreground">Sentiment Score</div>
                          </div>

                          <div className="text-right">
                            <Badge variant={forecast.label === 'Positive' ? 'default' : forecast.label === 'Negative' ? 'destructive' : 'secondary'}>
                              {forecast.label}
                            </Badge>
                            <div className="text-xs text-muted-foreground mt-1">
                              {(forecast.confidence * 100).toFixed(0)}% confidence
                            </div>
                          </div>

                          <div className="w-32 bg-background/50 rounded-full h-3 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${
                                forecast.predicted > 0.6 ? 'bg-green-500' : 
                                forecast.predicted < 0.4 ? 'bg-red-500' : 'bg-yellow-500'
                              }`}
                              style={{ width: `${forecast.predicted * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {forecasts.length === 0 && !isForecasting && (
            <div className="text-center py-12 text-muted-foreground">
              <Sparkle size={48} weight="duotone" className="mx-auto mb-4 opacity-50" />
              <p>Configure your forecast settings and click "Generate Forecast"</p>
              <p className="text-sm mt-2">Using {selectedModel.replace('-', ' ')} model with {data.length} data points</p>
            </div>
          )}

          {isForecasting && (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Historical Sentiment Data</CardTitle>
          <CardDescription>Last 30 days of emotional patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {data.slice(-10).reverse().map((point, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                <span className="text-sm">{point.date}</span>
                <div className="flex items-center gap-3">
                  <Badge variant={point.label === 'Positive' ? 'default' : point.label === 'Negative' ? 'destructive' : 'secondary'}>
                    {point.label}
                  </Badge>
                  <span className={`font-semibold ${getSentimentColor(point.sentiment)}`}>
                    {(point.sentiment * 100).toFixed(0)}%
                  </span>
                  <div className="w-24 bg-background rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full ${
                        point.sentiment > 0.6 ? 'bg-green-500' : 
                        point.sentiment < 0.4 ? 'bg-red-500' : 'bg-yellow-500'
                      }`}
                      style={{ width: `${point.sentiment * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          {data.length > 10 && (
            <div className="text-center text-xs text-muted-foreground mt-2">
              Showing 10 of {data.length} data points
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
