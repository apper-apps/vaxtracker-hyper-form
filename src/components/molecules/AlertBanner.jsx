import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const AlertBanner = ({ alerts = [], onViewAll }) => {
  if (alerts.length === 0) return null;

  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');
  const warningAlerts = alerts.filter(alert => alert.severity === 'warning');

  return (
    <motion.div
      className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4 mb-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-accent to-red-500 rounded-lg flex items-center justify-center">
            <ApperIcon name="AlertTriangle" className="w-5 h-5 text-white" />
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900">
              {criticalAlerts.length > 0 ? 'Critical Alerts' : 'Inventory Alerts'}
            </h3>
            <p className="text-sm text-gray-600">
              {criticalAlerts.length > 0 && (
                <span className="text-red-600 font-medium">
                  {criticalAlerts.length} expired
                </span>
              )}
              {criticalAlerts.length > 0 && warningAlerts.length > 0 && ', '}
              {warningAlerts.length > 0 && (
                <span className="text-orange-600 font-medium">
                  {warningAlerts.length} expiring soon
                </span>
              )}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex space-x-2">
            {criticalAlerts.length > 0 && (
              <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded-full">
                {criticalAlerts.length}
              </span>
            )}
            {warningAlerts.length > 0 && (
              <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-2 py-1 rounded-full">
                {warningAlerts.length}
              </span>
            )}
          </div>
          
          <button
            onClick={onViewAll}
            className="text-sm text-primary hover:text-primary-dark font-medium"
          >
            View All
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default AlertBanner;