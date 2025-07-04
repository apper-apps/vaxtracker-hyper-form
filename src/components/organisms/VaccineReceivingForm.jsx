import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Input from "@/components/atoms/Input";
import FormSection from "@/components/molecules/FormSection";
import { vaccineLotService } from "@/services/api/vaccineLotService";
import { vaccineService } from "@/services/api/vaccineService";

const VaccineReceivingForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    vaccineId: '',
    lotNumber: '',
    expirationDate: '',
    quantityReceived: '',
    passedInspection: '',
    failedInspection: '',
    discrepancyReason: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [vaccines, setVaccines] = useState([]);

useEffect(() => {
    const loadVaccines = async () => {
      try {
        const data = await vaccineService.getAll();
        setVaccines(data);
      } catch (error) {
        toast.error('Failed to load vaccines');
      }
    };
    loadVaccines();
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
      if (!formData.vaccineId || !formData.lotNumber || !formData.expirationDate || !formData.quantityReceived) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Validate quantities
      const quantityReceived = parseInt(formData.quantityReceived);
      const passedInspection = parseInt(formData.passedInspection) || 0;
      const failedInspection = parseInt(formData.failedInspection) || 0;

      if (passedInspection + failedInspection !== quantityReceived) {
        toast.error('Passed + Failed quantities must equal quantity received');
        return;
      }

      // Create vaccine lot record
      const lotData = {
        vaccineId: formData.vaccineId,
        lotNumber: formData.lotNumber,
        expirationDate: formData.expirationDate,
        quantityReceived: quantityReceived,
        quantityOnHand: passedInspection, // Only passed doses go to inventory
        dateReceived: new Date().toISOString(),
        passedInspection: passedInspection,
        failedInspection: failedInspection,
        discrepancyReason: formData.discrepancyReason
      };

      await vaccineLotService.create(lotData);
      
      toast.success('Vaccine shipment received successfully');
      
      // Reset form
      setFormData({
        vaccineId: '',
        lotNumber: '',
        expirationDate: '',
        quantityReceived: '',
        passedInspection: '',
        failedInspection: '',
        discrepancyReason: ''
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error receiving vaccine:', error);
      toast.error('Failed to receive vaccine shipment');
    } finally {
      setLoading(false);
    }
  };

const vaccineOptions = vaccines.map(vaccine => ({
    value: vaccine.Id,
    label: `${vaccine.Name || vaccine.name} - ${vaccine.manufacturer}`
  }));

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
          title="Vaccine Information"
          description="Enter details about the vaccine shipment"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Vaccine"
              value={formData.vaccineId}
              onChange={(e) => handleInputChange('vaccineId', e.target.value)}
              options={vaccineOptions}
              placeholder="Select vaccine"
              required
            />
            
            <Input
              label="Lot Number"
              value={formData.lotNumber}
              onChange={(e) => handleInputChange('lotNumber', e.target.value)}
              placeholder="Enter lot number"
              required
            />
            
            <Input
              label="Expiration Date"
              type="date"
              value={formData.expirationDate}
              onChange={(e) => handleInputChange('expirationDate', e.target.value)}
              required
            />
            
            <Input
              label="Quantity Received"
              type="number"
              value={formData.quantityReceived}
              onChange={(e) => handleInputChange('quantityReceived', e.target.value)}
              placeholder="0"
              min="0"
              required
            />
          </div>
        </FormSection>

        <FormSection
          title="Inspection Results"
          description="Record the inspection results for received doses"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Doses Passed Inspection"
              type="number"
              value={formData.passedInspection}
              onChange={(e) => handleInputChange('passedInspection', e.target.value)}
              placeholder="0"
              min="0"
            />
            
            <Input
              label="Doses Failed Inspection"
              type="number"
              value={formData.failedInspection}
              onChange={(e) => handleInputChange('failedInspection', e.target.value)}
              placeholder="0"
              min="0"
            />
          </div>
          
          {(parseInt(formData.failedInspection) || 0) > 0 && (
            <div className="mt-4">
              <Input
                label="Discrepancy Reason"
                value={formData.discrepancyReason}
                onChange={(e) => handleInputChange('discrepancyReason', e.target.value)}
                placeholder="Explain reason for failed inspection"
              />
            </div>
          )}
        </FormSection>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setFormData({
              vaccineId: '',
              lotNumber: '',
              expirationDate: '',
              quantityReceived: '',
              passedInspection: '',
              failedInspection: '',
              discrepancyReason: ''
            })}
          >
            Reset
          </Button>
          
          <Button
            type="submit"
            loading={loading}
            icon="PackageCheck"
          >
            Receive Shipment
          </Button>
        </div>
      </motion.form>
    </Card>
  );
};

export default VaccineReceivingForm;