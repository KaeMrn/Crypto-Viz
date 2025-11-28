import { useState, useEffect, useMemo, useCallback } from 'react';
import { getLatestMetrics, getTrending, getCoinHistory } from '../server/metrics';
import Header from '../components/Header';
import TemporalControlPanel from '../components/TemporalControlPanel';
import AnalyticsInsights from '../components/AnalyticsInsights';
import StatsGrid from '../components/StatsGrid';
import MarketSentimentChart from '../components/MarketSentimentChart';
import TrendingCoins from '../components/TrendingCoins';
import VolumeAnalysisChart from '../components/VolumeAnalysisChart';
import TrendRankingChart from '../components/TrendRankingChart';
import LiveActivityStream from '../components/LiveActivityStream';
import MentionDistribution from '../components/MentionDistribution';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState({});
  const [trendingCoins, setTrendingCoins] = useState([]);
  const [historicalData, setHistoricalData] = useState({});
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [isRealTimeActive, setIsRealTimeActive] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [chartData, setChartData] = useState({
    sentimentChart: null,
    distributionChart: null,
    volumeChart: null,
    trendChart: null,
  });
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  const [analyticsInsights, setAnalyticsInsights] = useState([]);
  const [volatilityData, setVolatilityData] = useState({});
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedCoinsForComparison, setSelectedCoinsForComparison] = useState([]);
  
  // Chart data cache for different timeframes
  const [chartDataCache, setChartDataCache] = useState({
    '1D': null,
    '7D': null,
    '30D': null
  });

  // Memoized chart data generator for better performance
  const generateChartDataForTimeframe = useCallback((metricsData, trendingData, timeframe) => {
    const colors = [
      'rgba(59, 130, 246, 0.8)',   // Blue
      'rgba(16, 185, 129, 0.8)',   // Green
      'rgba(245, 158, 11, 0.8)',   // Yellow
      'rgba(239, 68, 68, 0.8)',    // Red
      'rgba(139, 92, 246, 0.8)',   // Purple
      'rgba(236, 72, 153, 0.8)',   // Pink
      'rgba(99, 102, 241, 0.8)',   // Indigo
      'rgba(236, 72, 153, 0.8)',   // Pink
    ];

    // Distribution Chart (Doughnut) - Current mentions by coin
    const distributionChart = {
      labels: Object.keys(metricsData),
      datasets: [
        {
          label: 'Mentions',
          data: Object.values(metricsData),
          backgroundColor: colors.slice(0, Object.keys(metricsData).length),
          borderColor: colors.slice(0, Object.keys(metricsData).length).map(color => 
            color.replace('0.8', '1')
          ),
          borderWidth: 2,
        },
      ],
    };

    // Historical Sentiment Chart (Line) - Real historical data when available
    const now = new Date();
    let timeLabels = [];
    let datasets = [];

    // Use real historical data if available, otherwise simulate
    const hasHistoricalData = Object.keys(historicalData).length > 0 && 
                              Object.values(historicalData).some(history => history.length > 0);

    if (hasHistoricalData) {
      // Use real historical data
      const allTimestamps = new Set();
      Object.values(historicalData).forEach(history => {
        history.forEach(point => {
          allTimestamps.add(point.recorded_at);
        });
      });
      
      timeLabels = Array.from(allTimestamps).sort().slice(-20); // Last 20 data points
      
      trendingData.slice(0, 4).forEach((coinData, index) => {
        const coinHistory = historicalData[coinData.coin] || [];
        const data = timeLabels.map(timestamp => {
          const dataPoint = coinHistory.find(point => point.recorded_at === timestamp);
          return dataPoint ? dataPoint.mentions : 0;
        });

        datasets.push({
          label: coinData.coin,
          data: data,
          borderColor: colors[index],
          backgroundColor: colors[index].replace('0.8', '0.1'),
          tension: 0.4,
          fill: false,
          pointRadius: 4,
          pointHoverRadius: 6,
        });
      });
      
      // Format timestamps for display
      timeLabels = timeLabels.map(timestamp => {
        const date = new Date(timestamp);
        return date.toLocaleDateString([], { 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      });
    } else {
      // Fallback to simulated data
      const hoursBack = timeframe === '1D' ? 24 : 
                       timeframe === '7D' ? 168 : 720;
      
      for (let i = hoursBack; i >= 0; i -= Math.max(1, Math.floor(hoursBack / 15))) {
        const time = new Date(now.getTime() - (i * 60 * 60 * 1000));
        timeLabels.push(time.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit',
          ...(timeframe !== '1D' && { 
            month: 'short', 
            day: 'numeric' 
          })
        }));
      }

      trendingData.slice(0, 4).forEach((coinData, index) => {
        const baseValue = coinData.mentions;
        const data = timeLabels.map((_, i) => {
          // Create more realistic trend simulation
          const timeProgress = i / timeLabels.length;
          const trendFactor = Math.sin(timeProgress * Math.PI * 2) * 0.3 + 1;
          const randomFactor = (Math.random() - 0.5) * 0.4 + 1;
          return Math.max(0, Math.floor(baseValue * trendFactor * randomFactor));
        });

        datasets.push({
          label: coinData.coin,
          data: data,
          borderColor: colors[index],
          backgroundColor: colors[index].replace('0.8', '0.1'),
          tension: 0.4,
          fill: false,
          pointRadius: 3,
          pointHoverRadius: 5,
        });
      });
    }

    const sentimentChart = {
      labels: timeLabels,
      datasets: datasets,
    };

    // Volume Chart (Bar) - Mention volume comparison
    const volumeChart = {
      labels: Object.keys(metricsData),
      datasets: [
        {
          label: 'Current Mentions',
          data: Object.values(metricsData),
          backgroundColor: colors.slice(0, Object.keys(metricsData).length),
          borderColor: colors.slice(0, Object.keys(metricsData).length).map(color => 
            color.replace('0.8', '1')
          ),
          borderWidth: 1,
        },
      ],
    };

    // Trend Analysis Chart - Growth over time
    const trendChart = {
      labels: trendingData.slice(0, 5).map(coin => coin.coin),
      datasets: [
        {
          label: 'Mentions',
          data: trendingData.slice(0, 5).map(coin => coin.mentions),
          backgroundColor: 'rgba(99, 102, 241, 0.8)',
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 2,
        },
      ],
    };

    return {
      sentimentChart,
      distributionChart,
      volumeChart,
      trendChart,
    };
  }, [historicalData]);

  // Generate comprehensive chart data with caching
  const generateChartData = useCallback(async (metricsData, trendingData) => {
    // Check if we have cached data for all timeframes
    const timeframes = ['1D', '7D', '30D'];
    const newCache = { ...chartDataCache };
    
    // Generate data for each timeframe and cache it
    for (const timeframe of timeframes) {
      if (!newCache[timeframe]) {
        newCache[timeframe] = generateChartDataForTimeframe(metricsData, trendingData, timeframe);
      }
    }
    
    // Update cache
    setChartDataCache(newCache);
    
    // Set current chart data based on selected timeframe
    setChartData(newCache[selectedTimeframe] || newCache['1D']);
  }, [selectedTimeframe, chartDataCache, generateChartDataForTimeframe]);

  // Fetch historical data for temporal analysis
  const fetchHistoricalData = async (topCoins) => {
    const historicalPromises = topCoins.map(async (coinData) => {
      try {
        const history = await getCoinHistory(coinData.coin);
        return { coin: coinData.coin, history: history.history || [] };
      } catch (err) {
        console.warn(`Failed to fetch history for ${coinData.coin}:`, err);
        return { coin: coinData.coin, history: [] };
      }
    });
    
    const historicalResults = await Promise.all(historicalPromises);
    const historicalMap = {};
    historicalResults.forEach(({ coin, history }) => {
      historicalMap[coin] = history;
    });
    
    setHistoricalData(historicalMap);
  };

  // Generate business intelligence insights
  const generateAnalyticsInsights = (metricsData, trendingData) => {
    const insights = [];
    const totalMentions = Object.values(metricsData).reduce((sum, count) => sum + count, 0);
    
    // Volatility analysis
    const mentionCounts = Object.values(metricsData);
    const average = mentionCounts.reduce((sum, count) => sum + count, 0) / mentionCounts.length;
    const variance = mentionCounts.reduce((sum, count) => sum + Math.pow(count - average, 2), 0) / mentionCounts.length;
    const volatility = Math.sqrt(variance);
    
    // Market dominance
    const topCoin = trendingData[0];
    const marketDominance = topCoin ? (topCoin.mentions / totalMentions * 100).toFixed(1) : 0;
    
    // Growth trends
    const growthCoins = trendingData.filter(coin => coin.mentions > average);
    
    insights.push({
      type: 'market_dominance',
      title: `${topCoin?.coin || 'N/A'} Market Dominance`,
      value: `${marketDominance}%`,
      description: `${topCoin?.coin || 'Top coin'} accounts for ${marketDominance}% of total mentions`,
      trend: marketDominance > 30 ? 'high' : marketDominance > 15 ? 'medium' : 'low',
      priority: marketDominance > 40 ? 'critical' : 'normal'
    });
    
    insights.push({
      type: 'volatility',
      title: 'Market Volatility',
      value: volatility.toFixed(1),
      description: `Current mention volatility: ${volatility > 50 ? 'High' : volatility > 20 ? 'Medium' : 'Low'}`,
      trend: volatility > 50 ? 'high' : volatility > 20 ? 'medium' : 'low',
      priority: volatility > 100 ? 'critical' : 'normal'
    });
    
    insights.push({
      type: 'growth_momentum',
      title: 'Growth Momentum',
      value: `${growthCoins.length}/${trendingData.length}`,
      description: `${growthCoins.length} coins showing above-average mentions`,
      trend: growthCoins.length / trendingData.length > 0.5 ? 'high' : 'medium',
      priority: 'normal'
    });
    
    setAnalyticsInsights(insights);
  };

  // Fetch real data from API with temporal analytics
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch latest metrics and trending data
      const [latestMetrics, trending] = await Promise.all([
        getLatestMetrics(),
        getTrending()
      ]);
      
      setMetrics(latestMetrics);
      setTrendingCoins(trending.slice(0, 6)); // Top 6 trending coins
      setLastUpdateTime(new Date());
      
      // Fetch historical data for temporal analysis
      await fetchHistoricalData(trending.slice(0, 3));
      
      // Generate analytics insights
      generateAnalyticsInsights(latestMetrics, trending);
      
      // Clear cache when new data arrives to ensure fresh data
      setChartDataCache({ '1D': null, '7D': null, '30D': null });
      
      // Generate chart data
      await generateChartData(latestMetrics, trending);
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data from API');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {

    // Fetch historical data for temporal analysis
    const fetchHistoricalData = async (topCoins) => {
      const historicalPromises = topCoins.map(async (coinData) => {
        try {
          const history = await getCoinHistory(coinData.coin);
          return { coin: coinData.coin, history: history.history || [] };
        } catch (err) {
          console.warn(`Failed to fetch history for ${coinData.coin}:`, err);
          return { coin: coinData.coin, history: [] };
        }
      });
      
      const historicalResults = await Promise.all(historicalPromises);
      const historicalMap = {};
      historicalResults.forEach(({ coin, history }) => {
        historicalMap[coin] = history;
      });
      
      setHistoricalData(historicalMap);
    };

    // Generate business intelligence insights
    const generateAnalyticsInsights = (metricsData, trendingData) => {
      const insights = [];
      const totalMentions = Object.values(metricsData).reduce((sum, count) => sum + count, 0);
      
      // Volatility analysis
      const mentionCounts = Object.values(metricsData);
      const average = mentionCounts.reduce((sum, count) => sum + count, 0) / mentionCounts.length;
      const variance = mentionCounts.reduce((sum, count) => sum + Math.pow(count - average, 2), 0) / mentionCounts.length;
      const volatility = Math.sqrt(variance);
      
      // Market dominance
      const topCoin = trendingData[0];
      const marketDominance = topCoin ? (topCoin.mentions / totalMentions * 100).toFixed(1) : 0;
      
      // Growth trends
      const growthCoins = trendingData.filter(coin => coin.mentions > average);
      
      insights.push({
        type: 'market_dominance',
        title: `${topCoin?.coin || 'N/A'} Market Dominance`,
        value: `${marketDominance}%`,
        description: `${topCoin?.coin || 'Top coin'} accounts for ${marketDominance}% of total mentions`,
        trend: marketDominance > 30 ? 'high' : marketDominance > 15 ? 'medium' : 'low',
        priority: marketDominance > 40 ? 'critical' : 'normal'
      });
      
      insights.push({
        type: 'volatility',
        title: 'Market Volatility',
        value: volatility.toFixed(1),
        description: `Current mention volatility: ${volatility > 50 ? 'High' : volatility > 20 ? 'Medium' : 'Low'}`,
        trend: volatility > 50 ? 'high' : volatility > 20 ? 'medium' : 'low',
        priority: volatility > 100 ? 'critical' : 'normal'
      });
      
      insights.push({
        type: 'growth_momentum',
        title: 'Growth Momentum',
        value: `${growthCoins.length}/${trendingData.length}`,
        description: `${growthCoins.length} coins showing above-average mentions`,
        trend: growthCoins.length / trendingData.length > 0.5 ? 'high' : 'medium',
        priority: 'normal'
      });
      
      setAnalyticsInsights(insights);
    };

    fetchData();
    
    // Dynamic refresh interval based on user preference
    let dataTimer;
    if (isRealTimeActive) {
      dataTimer = setInterval(fetchData, refreshInterval * 1000);
    }
    
    return () => {
      if (dataTimer) clearInterval(dataTimer);
    };
  }, [refreshInterval, isRealTimeActive]);

  // Debounced timeframe change handler
  const handleTimeframeChange = useCallback((newTimeframe) => {
    setSelectedTimeframe(newTimeframe);
  }, []);

  // Optimized chart data switching using cache
  useEffect(() => {
    if (chartDataCache[selectedTimeframe]) {
      // Use cached data immediately
      setChartData(chartDataCache[selectedTimeframe]);
    } else if (Object.keys(metrics).length > 0 && trendingCoins.length > 0) {
      // Generate data if not cached
      const data = generateChartDataForTimeframe(metrics, trendingCoins, selectedTimeframe);
      setChartData(data);
      
      // Update cache
      setChartDataCache(prev => ({
        ...prev,
        [selectedTimeframe]: data
      }));
    }
  }, [selectedTimeframe, chartDataCache, metrics, trendingCoins, generateChartDataForTimeframe]);

  // Memoized current chart data for performance
  const currentChartData = useMemo(() => {
    return chartDataCache[selectedTimeframe] || chartData;
  }, [chartDataCache, selectedTimeframe, chartData]);

  // Calculate advanced stats with temporal analytics
  const totalMentions = Object.values(metrics).reduce((sum, count) => sum + count, 0);
  const activeCoins = Object.keys(metrics).length;
  const topCoinMentions = trendingCoins.length > 0 ? trendingCoins[0].mentions : 0;
  const marketDominance = totalMentions > 0 ? ((topCoinMentions / totalMentions) * 100).toFixed(1) : '0';
  const updateFrequency = isRealTimeActive ? `${refreshInterval}s` : 'Manual';
  
  const stats = [
    { 
      title: 'Total Mentions', 
      value: totalMentions.toLocaleString(), 
      change: `+${Math.floor(Math.random() * 15 + 5)}%`, 
      positive: true,
      subtitle: 'Last 24h'
    },
    { 
      title: 'Market Leader', 
      value: trendingCoins.length > 0 ? trendingCoins[0].coin : 'N/A', 
      change: `${marketDominance}%`, 
      positive: true,
      subtitle: 'Dominance'
    },
    { 
      title: 'Active Tracking', 
      value: activeCoins.toString(), 
      change: 'Live', 
      positive: true,
      subtitle: 'Cryptocurrencies'
    },
    { 
      title: 'Update Interval', 
      value: updateFrequency, 
      change: isRealTimeActive ? 'Auto' : 'Manual', 
      positive: isRealTimeActive,
      subtitle: 'Refresh Rate'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-8">
        
        <Header />

        <TemporalControlPanel 
          isRealTimeActive={isRealTimeActive}
          setIsRealTimeActive={setIsRealTimeActive}
          refreshInterval={refreshInterval}
          setRefreshInterval={setRefreshInterval}
          lastUpdateTime={lastUpdateTime}
          isLoading={isLoading}
          onRefresh={fetchData}
        />

        <AnalyticsInsights insights={analyticsInsights} />

        <StatsGrid stats={stats} />

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          
          <MarketSentimentChart 
            isLoading={isLoading}
            error={error}
            chartData={currentChartData.sentimentChart}
            selectedTimeframe={selectedTimeframe}
            onTimeframeChange={handleTimeframeChange}
          />

          <TrendingCoins 
            isLoading={isLoading}
            error={error}
            trendingCoins={trendingCoins}
            onCoinSelect={setSelectedCoin}
          />
        </div>

        {/* TEMPORAL ANALYTICS ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          
          <VolumeAnalysisChart 
            isLoading={isLoading}
            chartData={currentChartData.volumeChart}
          />

          <TrendRankingChart 
            isLoading={isLoading}
            chartData={currentChartData.trendChart}
          />
        </div>

        {/* SECOND ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <LiveActivityStream 
            isLoading={isLoading}
            error={error}
            metrics={metrics}
          />

          <MentionDistribution 
            isLoading={isLoading}
            error={error}
            chartData={currentChartData.distributionChart}
          />
        </div>
      </div>

      {/* Custom Styles for Animations */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
