import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const Empty = ({ 
  title = "No data available", 
  description = "Get started by adding your first item.",
  actionText = "Add Item",
  onAction,
  icon = "Package",
  type = 'default'
}) => {
  const getEmptyConfig = () => {
    switch (type) {
      case 'vaccines':
        return {
          icon: 'Syringe',
          title: 'No vaccines found',
          description: 'Start by receiving your first vaccine shipment to begin tracking inventory.',
          actionText: 'Receive Vaccines'
        };
      case 'lots':
        return {
          icon: 'Package',
          title: 'No vaccine lots available',
          description: 'Receive vaccine shipments to create lot records for administration tracking.',
          actionText: 'View Receiving'
        };
      case 'administration':
        return {
          icon: 'Activity',
          title: 'No doses administered',
          description: 'Record vaccine administrations to track usage and maintain accurate inventory.',
          actionText: 'Record Doses'
        };
      case 'reports':
        return {
          icon: 'FileText',
          title: 'No reports available',
          description: 'Generate reports to analyze vaccine inventory and administration data.',
          actionText: 'Generate Report'
        };
      default:
        return { icon, title, description, actionText };
    }
  };

  const config = getEmptyConfig();

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-[400px] p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-20 h-20 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mb-6">
        <ApperIcon name={config.icon} className="w-10 h-10 text-white" />
      </div>
      
      <h3 className="text-2xl font-bold text-gray-900 mb-3">
        {config.title}
      </h3>
      
      <p className="text-gray-600 text-center mb-8 max-w-md">
        {config.description}
      </p>
      
      {onAction && (
        <motion.button
          onClick={onAction}
          className="btn-primary flex items-center space-x-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ApperIcon name="Plus" className="w-4 h-4" />
          <span>{config.actionText}</span>
        </motion.button>
      )}
    </motion.div>
  );
};

export default Empty;