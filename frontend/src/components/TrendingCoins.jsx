import React from 'react';

const TrendingCoins = ({ 
  isLoading = false, 
  error = null, 
  trendingCoins = [],
  onCoinSelect = () => {} 
}) => {
  return (
    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Most Mentioned Coins
      </h3>
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
            <div 
              key={coinData.coin} 
              className="flex items-center justify-between p-4 bg-white/40 dark:bg-gray-700/40 rounded-xl hover:bg-white/60 dark:hover:bg-gray-700/60 transition-all duration-200 cursor-pointer group"
              onClick={() => onCoinSelect(coinData)}
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3 group-hover:scale-110 transition-transform duration-200">
                  {coinData.coin.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {coinData.coin}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    #{index + 1} Trending
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {coinData.mentions}
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  mentions
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-600 dark:text-gray-300">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p>No trending data available</p>
            <p className="text-xs mt-1 opacity-75">Check back later for updates</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendingCoins;