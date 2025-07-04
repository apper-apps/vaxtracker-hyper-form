import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import Button from '@/components/atoms/Button';
import FormSection from '@/components/molecules/FormSection';
import Card from '@/components/atoms/Card';
import { vaccineLotService } from '@/services/api/vaccineLotService';
import { administrationService } from '@/services/api/administrationService';
import { vaccineService } from '@/services/api/vaccineService';

const AdministrationForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    lotId: '',
    ageGroup: '',
    dosesAdministered: '',
    administeredBy: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [vaccineLots, setVaccineLots] = useState([]);
  const [vaccines, setVaccines] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [lotsData, vaccinesData] = await Promise.all([
          vaccineLotService.getAll(),
          vaccineService.getAll()
        ]);
        
        // Only show lots with available inventory
        const availableLots = lotsData.filter(lot => lot.quantityOnHand > 0);
        setVaccineLots(availableLots);
        setVaccines(vaccinesData);
      } catch (error) {
        toast.error('Failed to load data');
      }
    };
    loadData();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.lotId || !formData.ageGroup || !formData.dosesAdministered || !formData.administeredBy) {
        toast.error('Please fill in all required fields');
        return;
      }

      const dosesAdministered = parseInt(formData.dosesAdministered);
      const selectedLot = vaccineLots.find(lot => lot.Id === parseInt(formData.lotId));

      if (!selectedLot) {
        toast.error('Selected lot not found');
        return;
      }

      if (dosesAdministered > selectedLot.quantityOnHand) {
        toast.error(`Not enough doses available. Only ${selectedLot.quantityOnHand} doses in stock.`);
        return;
      }

      // Create administration record
      const adminData = {
        lotId: parseInt(formData.lotId),
        ageGroup: formData.ageGroup,
        dosesAdministered: dosesAdministered,
        dateAdministered: new Date().toISOString(),
        administeredBy: formData.administeredBy
      };

      await administrationService.create(adminData);
      
      // Update lot inventory
      const updatedQuantity = selectedLot.quantityOnHand - dosesAdministered;
      await vaccineLotService.update(selectedLot.Id, {
        ...selectedLot,
        quantityOnHand: updatedQuantity
      });
      
      toast.success('Doses administered successfully');
      
      // Reset form
      setFormData({
        lotId: '',
        ageGroup: '',
        dosesAdministered: '',
        administeredBy: ''
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error recording administration:', error);
      toast.error('Failed to record administration');
    } finally {
      setLoading(false);
    }
  };

  const getVaccineName = (vaccineId) => {
    const vaccine = vaccines.find(v => v.Id === vaccineId);
    return vaccine ? vaccine.name : 'Unknown';
  };

  const lotOptions = vaccineLots.map(lot => ({
    value: lot.Id,
    label: `${getVaccineName(lot.vaccineId)} - Lot ${lot.lotNumber} (${lot.quantityOnHand} available)`
  }));

  const ageGroupOptions = [
    { value: '0-6 months', label: '0-6 months' },
    { value: '6-12 months', label: '6-12 months' },
    { value: '1-2 years', label: '1-2 years' },
    { value: '2-5 years', label: '2-5 years' },
    { value: '5-11 years', label: '5-11 years' },
    { value: '12-17 years', label: '12-17 years' },
    { value: '18-64 years', label: '18-64 years' },
    { value: '65+ years', label: '65+ years' }
  ];

  const selectedLot = vaccineLots.find(lot => lot.Id === parseInt(formData.lotId));

  return (
    <Card className="p-6">
      <motion.form
        onSubmit={handleSubmit}
        className="space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <FormSection
          title="Administration Details"
          description="Record vaccine doses administered"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Vaccine Lot"
              value={formData.lotId}
              onChange={(e) => handleInputChange('lotId', e.target.value)}
              options={lotOptions}
              placeholder="Select vaccine lot"
              required
            />
            
            <Select
              label="Age Group"
              value={formData.ageGroup}
              onChange={(e) => handleInputChange('ageGroup', e.target.value)}
              options={ageGroupOptions}
              placeholder="Select age group"
              required
            />
            
            <Input
              label="Doses Administered"
              type="number"
              value={formData.dosesAdministered}
              onChange={(e) => handleInputChange('dosesAdministered', e.target.value)}
              placeholder="0"
              min="1"
              max={selectedLot?.quantityOnHand || 999}
              required
            />
            
            <Input
              label="Administered By"
              value={formData.administeredBy}
              onChange={(e) => handleInputChange('administeredBy', e.target.value)}
              placeholder="Healthcare provider name"
              required
            />
          </div>
          
          {selectedLot && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Selected Lot Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-blue-700 font-medium">Vaccine:</span>
                  <span className="ml-2">{getVaccineName(selectedLot.vaccineId)}</span>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Available:</span>
                  <span className="ml-2">{selectedLot.quantityOnHand} doses</span>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Expires:</span>
                  <span className="ml-2">{new Date(selectedLot.expirationDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}
        </FormSection>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setFormData({
              lotId: '',
              ageGroup: '',
              dosesAdministered: '',
              administeredBy: ''
            })}
          >
            Reset
          </Button>
          
          <Button
            type="submit"
            loading={loading}
            icon="Syringe"
          >
            Record Administration
          </Button>
        </div>
      </motion.form>
    </Card>
  );
};

export default AdministrationForm;