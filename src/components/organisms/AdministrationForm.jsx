import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { differenceInDays } from "date-fns";
import { getExpirationStatus } from "@/utils/dateUtils";
import { validateAdministeredDoses } from "@/utils/validationUtils";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Input from "@/components/atoms/Input";
import Empty from "@/components/ui/Empty";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import Inventory from "@/components/pages/Inventory";
import DataTable from "@/components/molecules/DataTable";
import { vaccineLotService } from "@/services/api/vaccineLotService";
import { vaccineService } from "@/services/api/vaccineService";
import { administrationService } from "@/services/api/administrationService";

const AdministrationForm = ({ onSuccess }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vaccineLots, setVaccineLots] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [vaccinesLoading, setVaccinesLoading] = useState(true);
  const [administeredDoses, setAdministeredDoses] = useState({});
  const [submitting, setSubmitting] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadData();
  }, []);

const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const vaccinesData = await vaccineService.getAll();
      
      // Validate vaccine data completeness
      const validVaccines = vaccinesData.filter(v => v.Id && v.name && v.abbreviation);
      if (validVaccines.length < vaccinesData.length) {
        console.warn(`${vaccinesData.length - validVaccines.length} vaccines have incomplete data`);
      }
      
      setVaccines(validVaccines);
      setVaccinesLoading(false);
      
      // Validate and repair data integrity before loading lots
      const integrityResult = await vaccineLotService.validateDataIntegrity();
      if (integrityResult.repaired > 0) {
        console.log(`Data integrity check: ${integrityResult.repaired} lots repaired`);
        toast.info(`Data integrity check: ${integrityResult.repaired} lots repaired`);
      }
      
      const lotsData = await vaccineLotService.getAvailableLots();
      
      // Filter lots to only include those with valid vaccine references
      const lotsWithValidVaccines = lotsData.filter(lot => {
        // Additional safety check for null/undefined vaccine IDs
        if (lot.vaccineId === null || lot.vaccineId === undefined) {
          console.warn(`Lot ${lot.Id} has null/undefined vaccine ID, excluding from available lots`);
          return false;
        }
        
        const vaccine = validVaccines.find(v => v.Id === lot.vaccineId);
        if (!vaccine) {
          console.warn(`Lot ${lot.Id} references non-existent vaccine ID: ${lot.vaccineId}`);
          return false;
        }
        
        return true;
      });
      
      if (lotsWithValidVaccines.length < lotsData.length) {
        const excludedCount = lotsData.length - lotsWithValidVaccines.length;
        console.warn(`${excludedCount} lots have invalid vaccine references and were excluded`);
        toast.warn(`${excludedCount} lots excluded due to invalid vaccine references`);
      }
      
      // Only show lots with available inventory and valid vaccine references
      const availableLots = lotsWithValidVaccines.filter(lot => lot.quantityOnHand > 0);
      console.log('Available lots for administration:', availableLots.length, 'with valid vaccine references');
      setVaccineLots(availableLots);
      
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load inventory data. Please check data integrity and try again.');
    } finally {
      setLoading(false);
      setVaccinesLoading(false);
    }
  };

  // Memoized vaccine map for efficient lookups
  const vaccineMap = useMemo(() => {
    const map = new Map();
    vaccines.forEach(vaccine => {
      if (vaccine?.Id) {
        map.set(vaccine.Id, vaccine);
      }
    });
    return map;
  }, [vaccines]);

  // Memoized vaccine name lookup function
  const getVaccineName = useCallback((vaccineId) => {
    // Handle null/undefined vaccine IDs
    if (vaccineId === null || vaccineId === undefined) {
      console.warn('getVaccineName called with null/undefined vaccine ID - this indicates a data integrity issue');
      return 'Unknown Vaccine (No ID)';
    }
    
    // Enhanced loading state checks with better specificity
    if (vaccinesLoading || loading) {
      return 'Loading...';
    }
    
    if (!vaccines || vaccines.length === 0) {
      return 'Loading vaccines...';
    }
    
    // Handle both string and integer vaccine IDs with comprehensive validation
    const parsedId = typeof vaccineId === 'string' ? parseInt(vaccineId, 10) : vaccineId;
    
    // Validate parsing was successful and ID is valid
    if (isNaN(parsedId) || parsedId <= 0) {
      console.error(`Invalid vaccine ID format in administration: ${vaccineId} (type: ${typeof vaccineId})`);
      return 'Invalid Vaccine ID';
    }
    
    // Use direct array search as fallback if vaccineMap fails
    let vaccine = vaccineMap.get(parsedId);
    if (!vaccine) {
      vaccine = vaccines.find(v => v.Id === parsedId);
    }
    
    if (!vaccine) {
      console.error(`Vaccine not found for ID: ${vaccineId} (parsed: ${parsedId})`);
      return `Vaccine ID ${parsedId} Not Found`;
    }
    
    return vaccine.name || 'Unnamed Vaccine';
  }, [vaccines, vaccineMap, vaccinesLoading, loading]);

  // Memoized vaccine abbreviation lookup function
  const getVaccineAbbreviation = useCallback((vaccineId) => {
    // Handle null/undefined vaccine IDs
    if (vaccineId === null || vaccineId === undefined) {
      console.warn('getVaccineAbbreviation called with null/undefined vaccine ID - this indicates a data integrity issue');
      return 'N/A';
    }
    
    // Enhanced loading state checks with better specificity
    if (vaccinesLoading || loading) {
      return 'Loading...';
    }
    
    if (!vaccines || vaccines.length === 0) {
      return 'Loading...';
    }
    
    // Handle both string and integer vaccine IDs with comprehensive validation
    const parsedId = typeof vaccineId === 'string' ? parseInt(vaccineId, 10) : vaccineId;
    
    // Validate parsing was successful and ID is valid
    if (isNaN(parsedId) || parsedId <= 0) {
      console.error(`Invalid vaccine ID format in administration: ${vaccineId} (type: ${typeof vaccineId})`);
      return 'N/A';
    }
    
    // Use direct array search as fallback if vaccineMap fails
    let vaccine = vaccineMap.get(parsedId);
    if (!vaccine) {
      vaccine = vaccines.find(v => v.Id === parsedId);
    }
    
    if (!vaccine) {
      console.error(`Vaccine abbreviation not found for ID: ${vaccineId} (parsed: ${parsedId})`);
      return 'N/A';
    }
    
    return vaccine.abbreviation || 'N/A';
  }, [vaccines, vaccineMap, vaccinesLoading, loading]);


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

// Memoized columns definition to prevent unnecessary re-renders
  const columns = useMemo(() => [
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
            {getVaccineName(lot?.vaccineId)}
          </div>
        </div>
      )
    },
{
      key: 'genericName',
      label: 'Generic Name',
      render: (lot) => (
        <span className="text-gray-600">
          {getVaccineAbbreviation(lot?.vaccineId)}
        </span>
      ),
      sortable: true,
      sortKey: 'vaccineId',
      sortFn: (a, b) => {
        const aAbbr = getVaccineAbbreviation(a?.vaccineId);
        const bAbbr = getVaccineAbbreviation(b?.vaccineId);
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
      render: (lot) => (
        <div className="flex items-center space-x-2">
          <div className="text-sm">{lot?.expirationDate || 'N/A'}</div>
          {lot && getStatusBadge(lot)}
        </div>
      )
    },
    {
      key: 'quantityOnHand',
      label: 'Available Doses',
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
    }
  ], [getVaccineName, getVaccineAbbreviation, administeredDoses, errors, submitting, handleDoseChange, handleAdminister]);

  if (loading) {
    return <Loading message="Loading inventory data..." />;
  }

  if (error) {
    return <Error message={error} onRetry={loadData} />;
  }

if (vaccinesLoading || !vaccines.length) {
    return <Loading message="Loading vaccine information..." />;
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