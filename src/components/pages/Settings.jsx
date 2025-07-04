import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { alertThresholdService } from "@/services/api/alertThresholdService";
import ApperIcon from "@/components/ApperIcon";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Input from "@/components/atoms/Input";
import FormSection from "@/components/molecules/FormSection";
import Modal from "@/components/molecules/Modal";
import { vaccineService } from "@/services/api/vaccineService";

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
  const [thresholds, setThresholds] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [thresholdsLoading, setThresholdsLoading] = useState(true);
  const [showThresholdModal, setShowThresholdModal] = useState(false);
  const [editingThreshold, setEditingThreshold] = useState(null);
  const [thresholdForm, setThresholdForm] = useState({
    Name: '',
    vaccine: '',
    threshold_type: 'low_stock',
    threshold_value: ''
  });

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

  const loadThresholds = async () => {
    try {
      setThresholdsLoading(true);
      const [thresholdsData, vaccinesData] = await Promise.all([
        alertThresholdService.getAll(),
        vaccineService.getAll()
      ]);
      setThresholds(thresholdsData);
      setVaccines(vaccinesData);
    } catch (error) {
      console.error('Error loading thresholds:', error);
      toast.error('Failed to load alert thresholds');
    } finally {
      setThresholdsLoading(false);
    }
  };

  const handleThresholdFormChange = (field, value) => {
    setThresholdForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveThreshold = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (editingThreshold) {
        await alertThresholdService.update(editingThreshold.Id, thresholdForm);
        toast.success('Threshold updated successfully');
      } else {
        await alertThresholdService.create(thresholdForm);
        toast.success('Threshold created successfully');
      }
      
      await loadThresholds();
      setShowThresholdModal(false);
      setEditingThreshold(null);
      setThresholdForm({
        Name: '',
        vaccine: '',
        threshold_type: 'low_stock',
        threshold_value: ''
      });
    } catch (error) {
      console.error('Error saving threshold:', error);
      toast.error('Failed to save threshold');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteThreshold = async (thresholdId) => {
    if (!confirm('Are you sure you want to delete this threshold?')) return;
    
    try {
      setLoading(true);
      await alertThresholdService.delete(thresholdId);
      toast.success('Threshold deleted successfully');
      await loadThresholds();
    } catch (error) {
      console.error('Error deleting threshold:', error);
      toast.error('Failed to delete threshold');
    } finally {
      setLoading(false);
    }
  };

  const openThresholdModal = (threshold = null) => {
    if (threshold) {
      setEditingThreshold(threshold);
      setThresholdForm({
        Name: threshold.Name || '',
        vaccine: threshold.vaccine?.Id || '',
        threshold_type: threshold.threshold_type || 'low_stock',
        threshold_value: threshold.threshold_value || ''
      });
    } else {
      setEditingThreshold(null);
      setThresholdForm({
        Name: '',
        vaccine: '',
        threshold_type: 'low_stock',
        threshold_value: ''
      });
    }
    setShowThresholdModal(true);
  };

  const getVaccineName = (vaccineId) => {
    const vaccine = vaccines.find(v => v.Id === vaccineId);
    return vaccine ? vaccine.Name : 'Unknown';
  };

  const groupedThresholds = thresholds.reduce((acc, threshold) => {
    const vaccineId = threshold.vaccine?.Id || threshold.vaccine;
    const vaccineName = getVaccineName(vaccineId);
    
    if (!acc[vaccineId]) {
      acc[vaccineId] = {
        vaccineName,
        thresholds: []
      };
    }
    
    acc[vaccineId].thresholds.push(threshold);
    return acc;
  }, {});

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
    
    // Load thresholds data
    loadThresholds();
  }, []);

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}

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

        {/* Vaccine Alert Thresholds */}
        <Card className="p-6">
          <FormSection
            title="Vaccine Alert Thresholds"
            description="Configure individual alert thresholds for each vaccine type"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Set custom low stock and expiration warning thresholds for each vaccine
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => openThresholdModal()}
                  icon="Plus"
                >
                  Add Threshold
                </Button>
              </div>

              {thresholdsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : Object.keys(groupedThresholds).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ApperIcon name="AlertCircle" className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No alert thresholds configured</p>
                  <p className="text-sm">Click "Add Threshold" to create your first threshold</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(groupedThresholds).map(([vaccineId, group]) => (
                    <div key={vaccineId} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">{group.vaccineName}</h4>
                      <div className="space-y-2">
                        {group.thresholds.map((threshold) => (
                          <div key={threshold.Id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md">
                            <div className="flex items-center space-x-3">
                              <ApperIcon 
                                name={threshold.threshold_type === 'low_stock' ? 'Package' : 'Calendar'} 
                                className="w-4 h-4 text-gray-500" 
                              />
                              <div>
                                <span className="text-sm font-medium text-gray-900">
                                  {threshold.threshold_type === 'low_stock' ? 'Low Stock' : 'Expiration Warning'}
                                </span>
                                <span className="text-sm text-gray-600 ml-2">
                                  {threshold.threshold_value} {threshold.threshold_type === 'low_stock' ? 'doses' : 'days'}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                type="button"
                                onClick={() => openThresholdModal(threshold)}
                                className="text-primary hover:text-primary-dark transition-colors"
                              >
                                <ApperIcon name="Edit" className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteThreshold(threshold.Id)}
                                className="text-red-600 hover:text-red-700 transition-colors"
                              >
                                <ApperIcon name="Trash2" className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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

      {/* Threshold Modal */}
      <Modal
        isOpen={showThresholdModal}
        onClose={() => setShowThresholdModal(false)}
        title={editingThreshold ? 'Edit Alert Threshold' : 'Add Alert Threshold'}
        size="md"
      >
        <form onSubmit={handleSaveThreshold} className="space-y-4">
          <Input
            label="Threshold Name"
            value={thresholdForm.Name}
            onChange={(e) => handleThresholdFormChange('Name', e.target.value)}
            placeholder="Enter threshold name"
            required
          />

          <Select
            label="Vaccine"
            value={thresholdForm.vaccine}
            onChange={(e) => handleThresholdFormChange('vaccine', e.target.value)}
            options={vaccines.map(vaccine => ({
              value: vaccine.Id,
              label: vaccine.Name
            }))}
            placeholder="Select vaccine"
            required
          />

          <Select
            label="Threshold Type"
            value={thresholdForm.threshold_type}
            onChange={(e) => handleThresholdFormChange('threshold_type', e.target.value)}
            options={[
              { value: 'low_stock', label: 'Low Stock Alert' },
              { value: 'expiration', label: 'Expiration Warning' }
            ]}
            required
          />

          <Input
            label={`Threshold Value ${thresholdForm.threshold_type === 'low_stock' ? '(doses)' : '(days)'}`}
            type="number"
            value={thresholdForm.threshold_value}
            onChange={(e) => handleThresholdFormChange('threshold_value', e.target.value)}
            placeholder={thresholdForm.threshold_type === 'low_stock' ? 'Enter minimum stock level' : 'Enter days before expiration'}
            min="1"
            required
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowThresholdModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              icon="Save"
            >
              {editingThreshold ? 'Update' : 'Create'} Threshold
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

export default Settings;