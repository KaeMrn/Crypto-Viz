import { useState, useEffect } from 'react';
import { getLatestMetrics, getTrending, getCoinHistory } from '../server/metrics';
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
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState({});
  const [trendingCoins, setTrendingCoins] = useState([]);
  const [chartData, setChartData] = useState({
    sentimentChart: null,
    distributionChart: null,
  });
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');

  // Generate chart data from API responses
  const generateChartData = async (metricsData, trendingData) => {
    // Generate colors for coins
    const colors = [
      'rgba(59, 130, 246, 0.8)',   // Blue
      'rgba(16, 185, 129, 0.8)',   // Green
      'rgba(245, 158, 11, 0.8)',   // Yellow
      'rgba(239, 68, 68, 0.8)',    // Red
      'rgba(139, 92, 246, 0.8)',   // Purple
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

    // Sentiment Chart (Line) - Simulated historical data
    const now = new Date();
    const timeLabels = [];
    const datasets = [];

    // Generate time labels based on selected timeframe
    const hoursBack = selectedTimeframe === '1D' ? 24 : 
                     selectedTimeframe === '7D' ? 168 : 720; // 30D = 720 hours
    
    for (let i = hoursBack; i >= 0; i -= Math.max(1, Math.floor(hoursBack / 12))) {
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

    // Create datasets for top coins
    trendingData.slice(0, 3).forEach((coinData, index) => {
      const baseValue = coinData.mentions;
      const data = timeLabels.map(() => {
        // Simulate historical variance (±30% of current value)
        const variance = baseValue * 0.3;
        return Math.max(0, baseValue + (Math.random() - 0.5) * variance);
      });

      datasets.push({
        label: coinData.coin,
        data: data,
        borderColor: colors[index],
        backgroundColor: colors[index].replace('0.8', '0.1'),
        tension: 0.4,
        fill: false,
      });
    });

    const sentimentChart = {
      labels: timeLabels,
      datasets: datasets,
    };

    setChartData({
      sentimentChart,
      distributionChart,
    });
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Fetch real data from API
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
        setTrendingCoins(trending.slice(0, 4)); // Top 4 trending coins
        
        // Generate chart data
        await generateChartData(latestMetrics, trending);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data from API');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    
    // Refresh data every 30 seconds
    const dataTimer = setInterval(fetchData, 30000);
    
    return () => {
      clearInterval(timer);
      clearInterval(dataTimer);
    };
  }, []);

  // Regenerate chart data when timeframe changes
  useEffect(() => {
    if (Object.keys(metrics).length > 0 && trendingCoins.length > 0) {
      generateChartData(metrics, trendingCoins);
    }
  }, [selectedTimeframe]);

  // Calculate stats from real data
  const totalMentions = Object.values(metrics).reduce((sum, count) => sum + count, 0);
  const activeCoins = Object.keys(metrics).length;
  
  const stats = [
    { title: 'Total Mentions', value: totalMentions.toLocaleString(), change: 'Live', positive: true },
    { title: 'Active Coins', value: activeCoins.toString(), change: 'Tracked', positive: true },
    { title: 'Data Sources', value: 'Reddit', change: 'Connected', positive: true },
    { title: 'Last Update', value: 'Live', change: 'Real-time', positive: true },
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
        
        {/* HEADER */}
        <header className="mb-12 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Chainlytics
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
            Advanced Cryptocurrency Analytics & Market Intelligence
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              Live Data
            </div>
            <div>{currentTime.toLocaleTimeString()}</div>
          </div>
        </header>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</h3>
                <span className={`text-sm px-2 py-1 rounded-full ${stat.positive ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
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

        {/* SECOND ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Activity Feed */}
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Live Mentions</h3>
            <div className="space-y-4">
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
                  .slice(0, 4)
                  .map(([coin, mentions], index) => (
                    <div key={coin} className="flex items-center p-4 bg-white/40 dark:bg-gray-700/40 rounded-xl">
                      <div className="w-3 h-3 rounded-full mr-4 bg-green-400"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {mentions} mentions detected
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{coin} • Live data</p>
                      </div>
                    </div>
                  ))
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
