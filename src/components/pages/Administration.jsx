import { useState } from 'react';
import { motion } from 'framer-motion';
import AdministrationForm from '@/components/organisms/AdministrationForm';
import Card from '@/components/atoms/Card';
import ApperIcon from '@/components/ApperIcon';

const Administration = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

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
          <h2 className="text-2xl font-bold text-gray-900">Dose Administration</h2>
          <p className="text-gray-600">View current inventory and record administered doses</p>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <ApperIcon name="Clock" className="w-4 h-4" />
          <span>Last updated: {new Date().toLocaleString()}</span>
        </div>
      </div>

      {/* Administration Table */}
      <AdministrationForm 
        key={refreshKey}
        onSuccess={handleSuccess} 
      />

      {/* Best Practices */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Best Practices</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Documentation</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Record immediately after administration</li>
              <li>• Verify lot numbers before use</li>
              <li>• Document healthcare provider name</li>
              <li>• Note any adverse reactions</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Inventory Management</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Use oldest lots first (FIFO)</li>
              <li>• Check expiration dates</li>
              <li>• Monitor stock levels</li>
              <li>• Report low inventory promptly</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Quality Control</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Verify age group appropriateness</li>
              <li>• Check dose calculations</li>
              <li>• Maintain cold chain</li>
              <li>• Follow safety protocols</li>
            </ul>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default Administration;