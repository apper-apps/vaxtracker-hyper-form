import { useState } from 'react';
import { motion } from 'framer-motion';
import VaccineReceivingForm from '@/components/organisms/VaccineReceivingForm';
import Card from '@/components/atoms/Card';
import ApperIcon from '@/components/ApperIcon';

const Receiving = () => {
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
          <h2 className="text-2xl font-bold text-gray-900">Vaccine Receiving</h2>
          <p className="text-gray-600">Process incoming vaccine shipments and record inspection results</p>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <ApperIcon name="Clock" className="w-4 h-4" />
          <span>Last updated: {new Date().toLocaleString()}</span>
        </div>
      </div>

      {/* Process Steps */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Receiving Process</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">1</div>
            <div>
              <div className="font-medium text-gray-900">Select Vaccine</div>
              <div className="text-sm text-gray-500">Choose from catalog</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">2</div>
            <div>
              <div className="font-medium text-gray-900">Enter Details</div>
              <div className="text-sm text-gray-500">Lot, expiry, quantity</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">3</div>
            <div>
              <div className="font-medium text-gray-900">Inspect</div>
              <div className="text-sm text-gray-500">Record pass/fail</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-white font-bold">4</div>
            <div>
              <div className="font-medium text-gray-900">Complete</div>
              <div className="text-sm text-gray-500">Add to inventory</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Receiving Form */}
      <VaccineReceivingForm 
        key={refreshKey}
        onSuccess={handleSuccess} 
      />

      {/* Guidelines */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Receiving Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Inspection Requirements</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Verify lot numbers match shipping documents</li>
              <li>• Check expiration dates for validity</li>
              <li>• Inspect packaging for damage</li>
              <li>• Ensure proper temperature during transport</li>
              <li>• Document any discrepancies immediately</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Documentation</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Record exact quantities received</li>
              <li>• Note any failed inspection doses</li>
              <li>• Provide detailed discrepancy reasons</li>
              <li>• Maintain chain of custody records</li>
              <li>• Store in appropriate conditions immediately</li>
            </ul>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default Receiving;