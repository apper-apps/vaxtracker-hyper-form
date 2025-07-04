import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const Error = ({ message = "Something went wrong", onRetry, type = 'default' }) => {
  const getErrorIcon = () => {
    switch (type) {
      case 'network':
        return 'Wifi';
      case 'data':
        return 'Database';
      case 'permission':
        return 'Lock';
      default:
        return 'AlertTriangle';
    }
  };

  const getErrorTitle = () => {
    switch (type) {
      case 'network':
        return 'Connection Error';
      case 'data':
        return 'Data Error';
      case 'permission':
        return 'Access Denied';
      default:
        return 'Error';
    }
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-[300px] p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-16 h-16 bg-gradient-to-r from-error to-red-500 rounded-full flex items-center justify-center mb-4">
        <ApperIcon name={getErrorIcon()} className="w-8 h-8 text-white" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {getErrorTitle()}
      </h3>
      
      <p className="text-gray-600 text-center mb-6 max-w-md">
        {message}
      </p>
      
      {onRetry && (
        <motion.button
          onClick={onRetry}
          className="btn-primary flex items-center space-x-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ApperIcon name="RefreshCw" className="w-4 h-4" />
          <span>Try Again</span>
        </motion.button>
      )}
    </motion.div>
  );
};

export default Error;