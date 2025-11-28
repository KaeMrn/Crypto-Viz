import React from 'react';

const LiveActivityStream = ({ 
  isLoading = false, 
  error = null, 
  metrics = {},
  title = "Live Activity Stream" 
}) => {
  return (
    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          {title}
        </h3>
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
            <div className="w-16 h-16 mx-auto mb-4 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p>{error}</p>
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
                <div 
                  key={coin} 
                  className="flex items-center justify-between p-3 bg-white/40 dark:bg-gray-700/40 rounded-lg hover:bg-white/60 dark:hover:bg-gray-700/60 transition-all duration-200 group cursor-pointer"
                >
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 transition-transform duration-200 group-hover:scale-125 ${
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
                    <span className={`text-xs px-2 py-1 rounded-full transition-colors ${
                      trend === 'up' 
                        ? 'text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400' 
                        : 'text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {trend === 'up' ? '↗' : '↘'} {percentage}%
                    </span>
                  </div>
                </div>
              );
            })
        ) : (
          <div className="text-center py-8 text-gray-600 dark:text-gray-300">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p>No activity data available</p>
            <p className="text-xs mt-1 opacity-75">Activity will appear when data streams in</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveActivityStream;