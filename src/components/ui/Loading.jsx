import { motion } from 'framer-motion';

const Loading = ({ type = 'default' }) => {
  if (type === 'dashboard') {
    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="card p-6 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg shimmer"></div>
                <div className="w-6 h-6 bg-gray-200 rounded-full shimmer"></div>
              </div>
              <div className="space-y-2">
                <div className="h-8 bg-gray-200 rounded shimmer"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 shimmer"></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 shimmer"></div>
            <div className="h-64 bg-gray-200 rounded shimmer"></div>
          </div>
          <div className="card p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 shimmer"></div>
            <div className="h-64 bg-gray-200 rounded shimmer"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (type === 'table') {
    return (
      <div className="card">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="h-6 bg-gray-200 rounded w-1/4 shimmer"></div>
            <div className="h-10 bg-gray-200 rounded w-32 shimmer"></div>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="p-6 animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gray-200 rounded-full shimmer"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4 shimmer"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 shimmer"></div>
                </div>
                <div className="w-20 h-6 bg-gray-200 rounded shimmer"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <motion.div
        className="flex items-center space-x-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full animate-pulse"></div>
        <div className="text-gray-600 font-medium">Loading...</div>
      </motion.div>
    </div>
  );
};

export default Loading;