import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Card from '@/components/atoms/Card';
import Input from '@/components/atoms/Input';
import Button from '@/components/atoms/Button';
import FormSection from '@/components/molecules/FormSection';
import ApperIcon from '@/components/ApperIcon';

const Settings = () => {
  const [settings, setSettings] = useState({
    facilityName: 'VaxTracker Healthcare Facility',
    facilityAddress: '123 Medical Center Dr, Healthcare City, HC 12345',
    contactPhone: '(555) 123-4567',
    contactEmail: 'admin@vaxtracker.com',
    lowStockThreshold: 10,
    expirationWarningDays: 30,
    autoBackup: true,
    emailNotifications: true,
    smsNotifications: false
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save to localStorage for persistence
      localStorage.setItem('vaxtracker-settings', JSON.stringify(settings));
      
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSettings({
      facilityName: 'VaxTracker Healthcare Facility',
      facilityAddress: '123 Medical Center Dr, Healthcare City, HC 12345',
      contactPhone: '(555) 123-4567',
      contactEmail: 'admin@vaxtracker.com',
      lowStockThreshold: 10,
      expirationWarningDays: 30,
      autoBackup: true,
      emailNotifications: true,
      smsNotifications: false
    });
    toast.info('Settings reset to defaults');
  };

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('vaxtracker-settings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

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
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <p className="text-gray-600">Configure system preferences and facility information</p>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <ApperIcon name="Settings" className="w-4 h-4" />
          <span>System Configuration</span>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Facility Information */}
        <Card className="p-6">
          <FormSection
            title="Facility Information"
            description="Basic information about your healthcare facility"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Facility Name"
                value={settings.facilityName}
                onChange={(e) => handleInputChange('facilityName', e.target.value)}
                placeholder="Enter facility name"
              />
              
              <Input
                label="Contact Phone"
                value={settings.contactPhone}
                onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                placeholder="Enter contact phone"
              />
              
              <div className="md:col-span-2">
                <Input
                  label="Facility Address"
                  value={settings.facilityAddress}
                  onChange={(e) => handleInputChange('facilityAddress', e.target.value)}
                  placeholder="Enter facility address"
                />
              </div>
              
              <Input
                label="Contact Email"
                type="email"
                value={settings.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                placeholder="Enter contact email"
              />
            </div>
          </FormSection>
        </Card>

        {/* Alert Settings */}
        <Card className="p-6">
          <FormSection
            title="Alert Settings"
            description="Configure thresholds for inventory alerts and notifications"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Low Stock Threshold"
                type="number"
                value={settings.lowStockThreshold}
                onChange={(e) => handleInputChange('lowStockThreshold', parseInt(e.target.value))}
                placeholder="10"
                min="1"
                max="100"
              />
              
              <Input
                label="Expiration Warning Days"
                type="number"
                value={settings.expirationWarningDays}
                onChange={(e) => handleInputChange('expirationWarningDays', parseInt(e.target.value))}
                placeholder="30"
                min="1"
                max="365"
              />
            </div>
          </FormSection>
        </Card>

        {/* System Preferences */}
        <Card className="p-6">
          <FormSection
            title="System Preferences"
            description="Configure system behavior and backup settings"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-semibold text-gray-700">Auto Backup</label>
                  <p className="text-sm text-gray-500">Automatically backup data daily</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleInputChange('autoBackup', !settings.autoBackup)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    settings.autoBackup ? 'bg-primary' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.autoBackup ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-semibold text-gray-700">Email Notifications</label>
                  <p className="text-sm text-gray-500">Receive alert notifications via email</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleInputChange('emailNotifications', !settings.emailNotifications)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    settings.emailNotifications ? 'bg-primary' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.emailNotifications ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-semibold text-gray-700">SMS Notifications</label>
                  <p className="text-sm text-gray-500">Receive urgent alerts via SMS</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleInputChange('smsNotifications', !settings.smsNotifications)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    settings.smsNotifications ? 'bg-primary' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.smsNotifications ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </FormSection>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
          >
            Reset to Defaults
          </Button>
          
          <Button
            type="submit"
            loading={loading}
            icon="Save"
          >
            Save Settings
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default Settings;