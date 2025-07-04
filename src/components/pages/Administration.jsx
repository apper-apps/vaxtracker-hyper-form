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
          <p className="text-gray-600">Record vaccine doses administered by age group and provider</p>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <ApperIcon name="Clock" className="w-4 h-4" />
          <span>Last updated: {new Date().toLocaleString()}</span>
        </div>
      </div>

      {/* Process Steps */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Administration Process</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">1</div>
            <div>
              <div className="font-medium text-gray-900">Select Lot</div>
              <div className="text-sm text-gray-500">Choose available inventory</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">2</div>
            <div>
              <div className="font-medium text-gray-900">Age Group</div>
              <div className="text-sm text-gray-500">Select patient category</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">3</div>
            <div>
              <div className="font-medium text-gray-900">Record Doses</div>
              <div className="text-sm text-gray-500">Enter quantity administered</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-white font-bold">4</div>
            <div>
              <div className="font-medium text-gray-900">Update</div>
              <div className="text-sm text-gray-500">Adjust inventory</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Administration Form */}
      <AdministrationForm 
        key={refreshKey}
        onSuccess={handleSuccess} 
      />

      {/* Age Group Guidelines */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Age Group Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Pediatric Groups</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>0-6 months</span>
                <span className="text-blue-600">Limited vaccines</span>
              </div>
              <div className="flex justify-between">
                <span>6-12 months</span>
                <span className="text-blue-600">Start series</span>
              </div>
              <div className="flex justify-between">
                <span>1-2 years</span>
                <span className="text-blue-600">Multiple doses</span>
              </div>
              <div className="flex justify-between">
                <span>2-5 years</span>
                <span className="text-blue-600">Booster shots</span>
              </div>
              <div className="flex justify-between">
                <span>5-11 years</span>
                <span className="text-blue-600">School requirements</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Adult Groups</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>12-17 years</span>
                <span className="text-green-600">Adolescent vaccines</span>
              </div>
              <div className="flex justify-between">
                <span>18-64 years</span>
                <span className="text-green-600">Adult schedule</span>
              </div>
              <div className="flex justify-between">
                <span>65+ years</span>
                <span className="text-green-600">High-risk priority</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

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