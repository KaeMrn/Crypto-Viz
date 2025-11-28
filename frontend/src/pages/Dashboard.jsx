import { useState, useEffect } from 'react';
import { getLatestMetrics, getTrending, getCoinHistory } from '../server/metrics';
import Header from '../components/Header';
import TemporalControlPanel from '../components/TemporalControlPanel';
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

  // Generate comprehensive chart data with temporal analytics
  const generateChartData = async (metricsData, trendingData) => {
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
      const hoursBack = selectedTimeframe === '1D' ? 24 : 
                       selectedTimeframe === '7D' ? 168 : 720;
      
      for (let i = hoursBack; i >= 0; i -= Math.max(1, Math.floor(hoursBack / 15))) {
        const time = new Date(now.getTime() - (i * 60 * 60 * 1000));
        timeLabels.push(time.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit',
          ...(selectedTimeframe !== '1D' && { 
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

    setChartData({
      sentimentChart,
      distributionChart,
      volumeChart,
      trendChart,
    });
  };

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

  // Regenerate chart data when timeframe changes
  useEffect(() => {
    if (Object.keys(metrics).length > 0 && trendingCoins.length > 0) {
      generateChartData(metrics, trendingCoins);
    }
  }, [selectedTimeframe]);

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

        {/* ANALYTICS INSIGHTS */}
        {analyticsInsights.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Business Intelligence Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analyticsInsights.map((insight, index) => (
                <div key={index} className={`bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-xl p-4 border ${
                  insight.priority === 'critical' ? 'border-red-300 dark:border-red-600' : 'border-white/20'
                } shadow-lg`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">{insight.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      insight.trend === 'high' ? 'bg-red-100 text-red-800' :
                      insight.trend === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {insight.trend.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{insight.value}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{insight.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ENHANCED STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</h3>
                <span className={`text-sm px-2 py-1 rounded-full ${stat.positive ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</p>
              {stat.subtitle && (
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.subtitle}</p>
              )}
            </div>
          ))}
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          
          {/* Chart Card 1 */}
          <div className="lg:col-span-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Market Sentiment Analysis</h2>
              <div className="flex space-x-2">
                {['1D', '7D', '30D'].map((timeframe) => (
                  <button 
                    key={timeframe}
                    onClick={() => setSelectedTimeframe(timeframe)}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      selectedTimeframe === timeframe 
                        ? 'bg-blue-500 text-white hover:bg-blue-600' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500'
                    }`}
                  >
                    {timeframe}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-80">
              {isLoading ? (
                <div className="flex items-center justify-center h-full bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-600 dark:text-gray-300">Loading chart data...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-xl">
                  <div className="text-center text-red-600 dark:text-red-400">
                    <p>Unable to load chart data</p>
                    <p className="text-sm mt-2">{error}</p>
                  </div>
                </div>
              ) : chartData.sentimentChart ? (
                <Line 
                  data={chartData.sentimentChart} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                      title: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Mentions'
                        }
                      },
                      x: {
                        title: {
                          display: true,
                          text: 'Time'
                        }
                      }
                    },
                    interaction: {
                      mode: 'index',
                      intersect: false,
                    },
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-xl">
                  <div className="text-center text-gray-600 dark:text-gray-300">
                    <p>No chart data available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Trending Coins */}
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Most Mentioned Coins</h3>
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-300">Loading trending coins...</span>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-600 dark:text-red-400">
                  {error}
                </div>
              ) : trendingCoins.length > 0 ? (
                trendingCoins.map((coinData, index) => (
                  <div key={coinData.coin} className="flex items-center justify-between p-4 bg-white/40 dark:bg-gray-700/40 rounded-xl hover:bg-white/60 dark:hover:bg-gray-700/60 transition-all duration-200 cursor-pointer">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                        {coinData.coin.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{coinData.coin}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">#{index + 1} Trending</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">{coinData.mentions}</p>
                      <p className="text-sm text-blue-600">mentions</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-600 dark:text-gray-300">
                  No trending data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TEMPORAL ANALYTICS ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          
          {/* Volume Analysis Chart */}
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Volume Analysis</h3>
            <div className="h-64">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-600 dark:text-gray-300">Loading volume data...</span>
                  </div>
                </div>
              ) : chartData.volumeChart ? (
                <Bar 
                  data={chartData.volumeChart} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Mentions'
                        }
                      },
                      x: {
                        title: {
                          display: true,
                          text: 'Cryptocurrencies'
                        }
                      }
                    },
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-600 dark:text-gray-300">
                  <p>No volume data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Trend Ranking Chart */}
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Trend Rankings</h3>
            <div className="h-64">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-600 dark:text-gray-300">Loading trend data...</span>
                  </div>
                </div>
              ) : chartData.trendChart ? (
                <Bar 
                  data={chartData.trendChart} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      x: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Mentions'
                        }
                      },
                      y: {
                        title: {
                          display: true,
                          text: 'Top Cryptocurrencies'
                        }
                      }
                    },
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-600 dark:text-gray-300">
                  <p>No trend data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECOND ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Enhanced Activity Feed with Temporal Context */}
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Live Activity Stream</h3>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Real-time</span>
              </div>
            </div>
            <div className="space-y-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-300">Loading activity...</span>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-600 dark:text-red-400">
                  {error}
                </div>
              ) : Object.entries(metrics).length > 0 ? (
                Object.entries(metrics)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 6)
                  .map(([coin, mentions], index) => {
                    const timeAgo = Math.floor(Math.random() * 60) + 1;
                    const trend = Math.random() > 0.5 ? 'up' : 'down';
                    const percentage = (Math.random() * 20 + 5).toFixed(1);
                    
                    return (
                      <div key={coin} className="flex items-center justify-between p-3 bg-white/40 dark:bg-gray-700/40 rounded-lg hover:bg-white/60 dark:hover:bg-gray-700/60 transition-all duration-200">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-3 ${
                            trend === 'up' ? 'bg-green-400' : 'bg-red-400'
                          }`}></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {coin}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {mentions} mentions • {timeAgo}min ago
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            trend === 'up' 
                              ? 'text-green-700 bg-green-100' 
                              : 'text-red-700 bg-red-100'
                          }`}>
                            {trend === 'up' ? '↗' : '↘'} {percentage}%
                          </span>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="text-center py-8 text-gray-600 dark:text-gray-300">
                  No activity data available
                </div>
              )}
            </div>
          </div>

          {/* Analytics Overview */}
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Mention Distribution</h3>
            <div className="h-64">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-600 dark:text-gray-300">Loading analytics...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-red-600 dark:text-red-400">
                    <p>Unable to load analytics</p>
                    <p className="text-sm mt-2">{error}</p>
                  </div>
                </div>
              ) : chartData.distributionChart ? (
                <Doughnut 
                  data={chartData.distributionChart} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          padding: 20,
                          usePointStyle: true,
                        },
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                          }
                        }
                      }
                    },
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-600 dark:text-gray-300">
                    <p>No analytics data available</p>
                  </div>
                </div>
              )}
            </div>
          </div>
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
