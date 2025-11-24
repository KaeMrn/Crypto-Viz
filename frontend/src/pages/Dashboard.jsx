import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const loadTimer = setTimeout(() => setIsLoading(false), 2000);
    return () => {
      clearInterval(timer);
      clearTimeout(loadTimer);
    };
  }, []);

  const stats = [
    { title: 'Total Volume', value: '$2.4M', change: '+12.5%', positive: true },
    { title: 'Active Mentions', value: '1,247', change: '+8.2%', positive: true },
    { title: 'Sentiment Score', value: '78.3', change: '-2.1%', positive: false },
    { title: 'Market Cap', value: '$1.2B', change: '+15.7%', positive: true },
  ];

  const trendingCoins = [
    { name: 'Bitcoin', symbol: 'BTC', price: '$43,250', change: '+2.4%', positive: true },
    { name: 'Ethereum', symbol: 'ETH', price: '$2,680', change: '+1.8%', positive: true },
    { name: 'Solana', symbol: 'SOL', price: '$98.45', change: '-0.9%', positive: false },
    { name: 'Cardano', symbol: 'ADA', price: '$0.52', change: '+4.2%', positive: true },
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
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors">1D</button>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition-colors">7D</button>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition-colors">30D</button>
              </div>
            </div>
            <div className="h-80 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center">
              {isLoading ? (
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-600 dark:text-gray-300">Loading sentiment data...</span>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">Interactive chart will render here</p>
                </div>
              )}
            </div>
          </div>

          {/* Trending Coins */}
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Top Performers</h3>
            <div className="space-y-4">
              {trendingCoins.map((coin, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-white/40 dark:bg-gray-700/40 rounded-xl hover:bg-white/60 dark:hover:bg-gray-700/60 transition-all duration-200 cursor-pointer">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                      {coin.symbol.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{coin.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{coin.symbol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">{coin.price}</p>
                    <p className={`text-sm ${coin.positive ? 'text-green-600' : 'text-red-600'}`}>{coin.change}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECOND ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Activity Feed */}
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {[
                { action: 'New mention detected', asset: 'BTC', time: '2 minutes ago', type: 'positive' },
                { action: 'Price alert triggered', asset: 'ETH', time: '5 minutes ago', type: 'neutral' },
                { action: 'Sentiment spike', asset: 'SOL', time: '12 minutes ago', type: 'positive' },
                { action: 'Volume increase', asset: 'ADA', time: '18 minutes ago', type: 'positive' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center p-4 bg-white/40 dark:bg-gray-700/40 rounded-xl">
                  <div className={`w-3 h-3 rounded-full mr-4 ${activity.type === 'positive' ? 'bg-green-400' : activity.type === 'negative' ? 'bg-red-400' : 'bg-blue-400'}`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.action}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{activity.asset} • {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Analytics Overview */}
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Analytics Overview</h3>
            <div className="h-64 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center">
              {isLoading ? (
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-600 dark:text-gray-300">Processing analytics...</span>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">Time-series visualization</p>
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
