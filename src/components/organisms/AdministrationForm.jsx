import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { differenceInDays } from 'date-fns';
import Input from '@/components/atoms/Input';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import Badge from '@/components/atoms/Badge';
import DataTable from '@/components/molecules/DataTable';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import ApperIcon from '@/components/ApperIcon';
import { vaccineLotService } from '@/services/api/vaccineLotService';
import { administrationService } from '@/services/api/administrationService';
import { vaccineService } from '@/services/api/vaccineService';
import { validateAdministeredDoses } from '@/utils/validationUtils';

const AdministrationForm = ({ onSuccess }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vaccineLots, setVaccineLots] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [administeredDoses, setAdministeredDoses] = useState({});
  const [submitting, setSubmitting] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [lotsData, vaccinesData] = await Promise.all([
        vaccineLotService.getAll(),
        vaccineService.getAll()
      ]);
      
      // Only show lots with available inventory
      const availableLots = lotsData.filter(lot => lot.quantityOnHand > 0);
      setVaccineLots(availableLots);
      setVaccines(vaccinesData);
      setError(null);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

const getVaccineName = (vaccineId) => {
    if (!vaccines.length) return 'Loading...';
    if (!vaccineId && vaccineId !== 0) return 'Unknown';
    
    // Handle both string and integer vaccine IDs
    const parsedId = typeof vaccineId === 'string' ? parseInt(vaccineId, 10) : vaccineId;
    
    // Check if parsing was successful
    if (isNaN(parsedId)) {
      console.warn(`Invalid vaccine ID format: ${vaccineId}`);
      return 'Invalid ID';
    }
    
    const vaccine = vaccines.find(v => v.Id === parsedId);
    if (!vaccine) {
      console.warn(`Vaccine not found for ID: ${vaccineId} (parsed: ${parsedId}). Available vaccines:`, vaccines.map(v => ({ Id: v.Id, name: v.name })));
      return 'Unknown Vaccine';
    }
    return vaccine.name || 'Unnamed Vaccine';
  };

  const getVaccineAbbreviation = (vaccineId) => {
    if (!vaccines.length) return 'Loading...';
    if (!vaccineId && vaccineId !== 0) return 'N/A';
    
    // Handle both string and integer vaccine IDs
    const parsedId = typeof vaccineId === 'string' ? parseInt(vaccineId, 10) : vaccineId;
    
    // Check if parsing was successful
    if (isNaN(parsedId)) {
      console.warn(`Invalid vaccine ID format for abbreviation: ${vaccineId}`);
      return 'N/A';
    }
    
    const vaccine = vaccines.find(v => v.Id === parsedId);
    if (!vaccine) {
      console.warn(`Vaccine abbreviation not found for ID: ${vaccineId} (parsed: ${parsedId})`);
      return 'N/A';
    }
    return vaccine.abbreviation || 'N/A';
  };

  const getExpirationStatus = (lot) => {
    const today = new Date();
    const expirationDate = new Date(lot.expirationDate);
    const daysUntilExpiry = differenceInDays(expirationDate, today);
    
    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 30) return 'expiring-soon';
    if (daysUntilExpiry <= 90) return 'warning';
    return 'good';
  };

  const getStatusBadge = (lot) => {
    const status = getExpirationStatus(lot);
    const daysUntilExpiry = differenceInDays(new Date(lot.expirationDate), new Date());
    
    switch (status) {
      case 'expired':
        return <Badge variant="error">Expired</Badge>;
      case 'expiring-soon':
        return <Badge variant="error">{daysUntilExpiry} days</Badge>;
      case 'warning':
        return <Badge variant="warning">{daysUntilExpiry} days</Badge>;
      default:
        return <Badge variant="success">{daysUntilExpiry} days</Badge>;
    }
  };

const handleDoseChange = (lotId, value) => {
    setAdministeredDoses(prev => ({
      ...prev,
      [lotId]: value
    }));

    // Validate input
    const lot = vaccineLots.find(l => l?.Id === lotId);
    if (lot) {
      const error = validateAdministeredDoses(value, lot.quantityOnHand, lot.lotNumber);
      setErrors(prev => ({
        ...prev,
        [lotId]: error
      }));
    }
  };

  const handleAdminister = async (lot) => {
    const doses = administeredDoses[lot.Id];
    if (!doses || doses.toString().trim() === '') {
      toast.error('Please enter the number of doses to administer');
      return;
    }

    const error = validateAdministeredDoses(doses, lot.quantityOnHand, lot.lotNumber);
    if (error) {
      toast.error(error);
      return;
    }

    setSubmitting(prev => ({ ...prev, [lot.Id]: true }));

    try {
      const dosesNum = parseInt(doses);
      
      // Create administration record
      const adminData = {
        lotId: lot.Id,
        dosesAdministered: dosesNum,
        dateAdministered: new Date().toISOString(),
        administeredBy: 'Current User' // In real app, get from auth context
      };

      await administrationService.create(adminData);
      
      // Update lot inventory
      const updatedQuantity = lot.quantityOnHand - dosesNum;
      await vaccineLotService.update(lot.Id, {
        ...lot,
        quantityOnHand: updatedQuantity
      });
      
      toast.success(`${dosesNum} doses administered successfully`);
      
      // Clear input and refresh data
      setAdministeredDoses(prev => ({
        ...prev,
        [lot.Id]: ''
      }));
      setErrors(prev => ({
        ...prev,
        [lot.Id]: null
      }));
      
      if (onSuccess) {
        onSuccess();
      }
      
      // Reload data to get updated quantities
      loadData();
    } catch (error) {
      console.error('Error recording administration:', error);
      toast.error('Failed to record administration');
    } finally {
      setSubmitting(prev => ({ ...prev, [lot.Id]: false }));
    }
  };

  const columns = [
    {
      key: 'vaccine',
      label: 'Vaccine Name',
      sortable: true,
sortFn: (a, b) => {
        if (!a || !b) return 0;
        const aName = getVaccineName(a.vaccineId) || '';
        const bName = getVaccineName(b.vaccineId) || '';
        return aName.localeCompare(bName);
      },
      render: (lot) => (
        <div>
          <div className="font-medium text-gray-900">
            {lot && lot.vaccineId ? getVaccineName(lot.vaccineId) : 'Unknown Vaccine'}
          </div>
        </div>
      )
    },
    {
      key: 'genericName',
      label: 'Generic Name',
render: (lot) => (
        <span className="text-gray-600">
          {lot && lot.vaccineId ? getVaccineAbbreviation(lot.vaccineId) : 'N/A'}
        </span>
      ),
      sortable: true,
      sortKey: 'vaccineId',
      sortFn: (a, b) => {
        if (!a || !b) return 0;
        const aAbbr = getVaccineAbbreviation(a.vaccineId) || '';
        const bAbbr = getVaccineAbbreviation(b.vaccineId) || '';
        return aAbbr.localeCompare(bAbbr);
      }
    },
    {
      key: 'lotNumber',
      label: 'Lot Number',
      sortable: true,
render: (lot) => (
        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
          {lot?.lotNumber || 'N/A'}
        </span>
      )
    },
    {
      key: 'expirationDate',
      label: 'Expiration Date',
      sortable: true,
render: (lot) => {
        if (!lot) return <span className="text-gray-500">N/A</span>;
        return (
          <div className="space-y-1">
            <div className="text-sm text-gray-900">
              {lot.expirationDate ? new Date(lot.expirationDate).toLocaleDateString() : 'N/A'}
            </div>
            {getStatusBadge(lot)}
          </div>
        );
      },
      sortFn: (a, b) => {
        if (!a || !b) return 0;
        return new Date(a.expirationDate || 0) - new Date(b.expirationDate || 0);
      }
    },
    {
      key: 'quantityOnHand',
      label: 'Quantity On Hand',
      sortable: true,
render: (lot) => (
        <div className="text-center">
          <span className="text-lg font-semibold text-gray-900">
            {lot?.quantityOnHand ?? 0}
          </span>
          <div className="text-xs text-gray-500">doses</div>
        </div>
      )
    },
    {
      key: 'adminDoses',
      label: 'Administered Doses',
render: (lot) => {
        if (!lot) return <span className="text-gray-500">N/A</span>;
        return (
          <div className="flex items-center space-x-2 min-w-[200px]">
            <div className="flex-1">
              <Input
                type="number"
                value={administeredDoses[lot.Id] || ''}
                onChange={(e) => handleDoseChange(lot.Id, e.target.value)}
                placeholder="0"
                min="1"
                max={lot.quantityOnHand}
                className={errors[lot.Id] ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
              />
              {errors[lot.Id] && (
                <div className="text-xs text-red-600 mt-1">
                  {errors[lot.Id]}
                </div>
              )}
            </div>
            <Button
              size="sm"
              onClick={() => handleAdminister(lot)}
              loading={submitting[lot.Id]}
              disabled={!administeredDoses[lot.Id] || errors[lot.Id] || submitting[lot.Id]}
              icon="Syringe"
            >
              Record
            </Button>
          </div>
        );
      }
    }
  ];

  if (loading) {
    return <Loading message="Loading inventory..." />;
  }

  if (error) {
    return <Error message={error} onRetry={loadData} />;
  }

  if (vaccineLots.length === 0) {
    return (
      <Empty 
        icon="Package"
        title="No Available Inventory"
        description="There are no vaccine lots with available inventory for administration."
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Available Inventory</h3>
              <p className="text-sm text-gray-600">
                Record doses administered by entering quantities and clicking Record
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <ApperIcon name="Package" className="w-4 h-4" />
              <span>{vaccineLots.length} lots available</span>
            </div>
          </div>
        </div>

        <DataTable
          data={vaccineLots}
          columns={columns}
          searchKeys={['lotNumber']}
          defaultSort={{ key: 'expirationDate', direction: 'asc' }}
          className="min-w-full"
        />
      </Card>
    </motion.div>
  );
};

export default AdministrationForm;