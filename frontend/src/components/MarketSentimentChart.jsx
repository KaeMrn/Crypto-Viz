import React from 'react';
import { Line } from 'react-chartjs-2';

const MarketSentimentChart = ({ 
  isLoading = false, 
  error = null, 
  chartData = null,
  selectedTimeframe = '1D',
  onTimeframeChange = () => {}
}) => {
  const timeframes = ['1D', '7D', '30D'];

  const chartOptions = {
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
  };

  return (
    <div className="lg:col-span-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Market Sentiment Analysis
        </h2>
        <div className="flex space-x-2">
          {timeframes.map((timeframe) => (
            <button 
              key={timeframe}
              onClick={() => onTimeframeChange(timeframe)}
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
        ) : chartData ? (
          <Line 
            data={chartData} 
            options={chartOptions}
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
  );
};

export default MarketSentimentChart;