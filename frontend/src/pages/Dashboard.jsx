export default function Dashboard() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      
      {/* HEADER */}
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight">
          Chainlytics Dashboard
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Real-time crypto analytics powered by your pipeline.
        </p>
      </header>

      {/* GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Card 1: Latest Metrics */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Latest Mentions</h2>
          <div id="latest-chart-placeholder" className="h-64 flex items-center justify-center text-gray-400">
            (Bar chart loads here)
          </div>
        </div>

        {/* Card 2: Time-Series */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Trend Over Time</h2>
          <div id="history-chart-placeholder" className="h-64 flex items-center justify-center text-gray-400">
            (Line chart loads here)
          </div>
        </div>

      </div>
    </div>
  );
}
