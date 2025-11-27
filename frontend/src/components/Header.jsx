import { useState, useEffect } from 'react';

export default function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
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
  );
}
