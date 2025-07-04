import { motion } from 'framer-motion';
import InventoryTable from '@/components/organisms/InventoryTable';
import ApperIcon from '@/components/ApperIcon';

const Inventory = () => {
  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Vaccine Inventory</h2>
          <p className="text-gray-600">Monitor vaccine stock levels, expiration dates, and alerts</p>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <ApperIcon name="Clock" className="w-4 h-4" />
          <span>Last updated: {new Date().toLocaleString()}</span>
        </div>
      </div>

      {/* Inventory Table */}
      <InventoryTable />
    </motion.div>
  );
};

export default Inventory;