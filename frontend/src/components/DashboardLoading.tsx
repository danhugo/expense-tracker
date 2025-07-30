// components/DashboardLoading.tsx
const DashboardLoading = () => {
  return (
    <div className="space-y-4 animate-pulse">

      {/* Blurred Header */}
      <div className="bg-gradient-to-r from-primary-green to-accent-yellow p-6 rounded-lg text-white backdrop-blur-sm bg-opacity-80">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 w-40 bg-white/30 rounded-md"></div>
            <div className="h-4 w-60 bg-white/20 rounded-md"></div>
          </div>
          <div className="h-10 w-40 bg-white/30 rounded-lg"></div>
        </div>
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, idx) => (
          <div
            key={idx}
            className="h-24 bg-white border border-gray-200 rounded-lg shadow-sm backdrop-blur-sm bg-opacity-60"
          ></div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 mb-4">
        <div className="h-64 bg-white border border-gray-200 rounded-lg shadow-sm backdrop-blur-sm bg-opacity-60"></div>
        <div className="h-64 bg-white border border-gray-200 rounded-lg shadow-sm backdrop-blur-sm bg-opacity-60"></div>
      </div>

      {/* Transactions Table Skeleton */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 backdrop-blur-sm bg-opacity-60">
        <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
        {[...Array(5)].map((_, idx) => (
          <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100">
            <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
            <div className="h-4 w-1/6 bg-gray-200 rounded"></div>
            <div className="h-4 w-1/6 bg-gray-200 rounded"></div>
            <div className="h-4 w-1/6 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardLoading;
