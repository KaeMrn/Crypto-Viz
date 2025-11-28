import React from 'react';
import { Bar } from 'react-chartjs-2';

const VolumeAnalysisChart = ({ 
  isLoading = false, 
  chartData = null,
  title = "Volume Analysis" 
}) => {
  const chartOptions = {
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
  };

  return (
    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        {title}
      </h3>
      <div className="h-64">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-600 dark:text-gray-300">Loading volume data...</span>
            </div>
          </div>
        ) : chartData ? (
          <Bar 
            data={chartData} 
            options={chartOptions}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-600 dark:text-gray-300">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p>No volume data available</p>
              <p className="text-xs mt-1 opacity-75">Data will appear when metrics are loaded</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VolumeAnalysisChart;