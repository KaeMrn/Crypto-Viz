import React from 'react';

const AnalyticsInsights = ({ insights = [] }) => {
  if (!insights || insights.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Business Intelligence Insights
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.map((insight, index) => (
          <div 
            key={index} 
            className={`bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-xl p-4 border ${
              insight.priority === 'critical' 
                ? 'border-red-300 dark:border-red-600' 
                : 'border-white/20'
            } shadow-lg hover:shadow-xl transition-shadow duration-300`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                {insight.title}
              </h3>
              <span 
                className={`px-2 py-1 text-xs rounded-full font-medium ${
                  insight.trend === 'high' 
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                  insight.trend === 'medium' 
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                }`}
              >
                {insight.trend.toUpperCase()}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {insight.value}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {insight.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalyticsInsights;