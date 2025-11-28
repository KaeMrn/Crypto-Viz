import React from 'react';

const StatsGrid = ({ stats = [] }) => {
  if (!stats || stats.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {stats.map((stat, index) => (
        <div 
          key={index} 
          className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {stat.title}
            </h3>
            <span 
              className={`text-sm px-2 py-1 rounded-full transition-colors ${
                stat.positive 
                  ? 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400' 
                  : 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400'
              }`}
            >
              {stat.change}
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {stat.value}
          </p>
          {stat.subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {stat.subtitle}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;