import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Card from '@/components/atoms/Card';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import Button from '@/components/atoms/Button';
import Modal from '@/components/molecules/Modal';
import DataTable from '@/components/molecules/DataTable';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import ApperIcon from '@/components/ApperIcon';
import { vaccineLotService } from '@/services/api/vaccineLotService';
import { vaccineService } from '@/services/api/vaccineService';
import { reconciliationService } from '@/services/api/reconciliationService';

const Reconciliation = () => {
  const [vaccineLots, setVaccineLots] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLot, setSelectedLot] = useState(null);
  const [adjustmentModal, setAdjustmentModal] = useState(false);
  const [adjustmentForm, setAdjustmentForm] = useState({
    physicalCount: '',
    reason: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [lotsData, vaccinesData] = await Promise.all([
        vaccineLotService.getAll(),
        vaccineService.getAll()
      ]);
      
      setVaccineLots(lotsData);
      setVaccines(vaccinesData);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load reconciliation data');
    } finally {
      setLoading(false);
    }
  };

const getVaccineName = (vaccineId) => {
    const vaccine = vaccines.find(v => v.Id === vaccineId);
    return vaccine ? (vaccine.Name || vaccine.name) : 'Unknown';
  };

  const getVaccineGenericName = (vaccineId) => {
    const vaccine = vaccines.find(v => v.Id === vaccineId);
    return vaccine ? vaccine.abbreviation : 'Unknown';
  };

  const handleAdjustment = (lot) => {
    setSelectedLot(lot);
    setAdjustmentForm({
      physicalCount: lot.quantityOnHand.toString(),
      reason: '',
      notes: ''
    });
    setAdjustmentModal(true);
  };

  const handleSubmitAdjustment = async (e) => {
    e.preventDefault();
    
    if (!selectedLot || !adjustmentForm.physicalCount || !adjustmentForm.reason) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const physicalCount = parseInt(adjustmentForm.physicalCount);
      const systemCount = selectedLot.quantityOnHand;
      const adjustment = physicalCount - systemCount;

      if (adjustment !== 0) {
        // Create reconciliation record
        const reconciliationData = {
          lotId: selectedLot.Id,
          previousQuantity: systemCount,
          adjustedQuantity: physicalCount,
          reason: adjustmentForm.reason,
          notes: adjustmentForm.notes,
          dateReconciled: new Date().toISOString(),
          adjustment: adjustment
        };

        await reconciliationService.create(reconciliationData);

        // Update lot inventory
        await vaccineLotService.update(selectedLot.Id, {
          ...selectedLot,
          quantityOnHand: physicalCount
        });

        toast.success(`Inventory adjusted by ${adjustment > 0 ? '+' : ''}${adjustment} doses`);
        
        // Reload data
        await loadData();
      } else {
        toast.info('No adjustment needed - quantities match');
      }

      setAdjustmentModal(false);
      setSelectedLot(null);
    } catch (error) {
      console.error('Error submitting adjustment:', error);
      toast.error('Failed to submit adjustment');
    }
  };

  const reasonOptions = [
    { value: 'physical-count', label: 'Physical Count Discrepancy' },
    { value: 'damaged-doses', label: 'Damaged Doses' },
    { value: 'expired-doses', label: 'Expired Doses' },
    { value: 'administration-error', label: 'Administration Recording Error' },
    { value: 'transfer-error', label: 'Transfer Error' },
    { value: 'other', label: 'Other' }
];

  const columns = [
    {
      key: 'vaccine',
      label: 'Vaccine',
      sortable: true,
      sortFn: (a, b) => {
        const aName = getVaccineName(a.vaccineId);
        const bName = getVaccineName(b.vaccineId);
        return aName.localeCompare(bName);
      },
      render: (value, item) => (
        <div className="font-medium text-gray-900">{getVaccineName(item.vaccineId)}</div>
      )
    },
    {
      key: 'genericName',
      label: 'Generic Name',
      sortable: true,
      sortFn: (a, b) => {
        const aAbbr = getVaccineGenericName(a.vaccineId);
        const bAbbr = getVaccineGenericName(b.vaccineId);
        return aAbbr.localeCompare(bAbbr);
      },
      render: (value, item) => (
        <span className="font-medium text-gray-700">{getVaccineGenericName(item.vaccineId)}</span>
      )
    },
    {
      key: 'lotNumber',
      label: 'Lot Number',
      sortable: true,
      render: (value, item) => (
        <span className="font-mono text-sm">{item.lotNumber}</span>
      )
    },
    {
      key: 'expirationDate',
      label: 'Expiration',
      sortable: true,
      render: (value, item) => (
        <div className="text-sm text-gray-900">{new Date(item.expirationDate).toLocaleDateString()}</div>
      )
    },
    {
      key: 'quantityOnHand',
      label: 'System Count',
      sortable: true,
      render: (value, item) => (
        <div className="text-center">
          <div className="text-lg font-semibold">{item.quantityOnHand}</div>
          <div className="text-sm text-gray-500">doses</div>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (value, item) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleAdjustment(item)}
          icon="Calculator"
        >
          Reconcile
        </Button>
      )
    }
  ];

  if (loading) {
    return <Loading type="table" />;
  }

  if (error) {
    return (
      <Error 
        message={error} 
        onRetry={loadData}
        type="data"
      />
    );
  }

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
          <h2 className="text-2xl font-bold text-gray-900">Monthly Reconciliation</h2>
          <p className="text-gray-600">Reconcile system inventory with physical counts</p>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <ApperIcon name="Clock" className="w-4 h-4" />
          <span>Last updated: {new Date().toLocaleString()}</span>
        </div>
      </div>

      {/* Reconciliation Instructions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reconciliation Process</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">1</div>
            <div>
              <div className="font-medium text-gray-900">Physical Count</div>
              <div className="text-sm text-gray-500">Count actual inventory</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">2</div>
            <div>
              <div className="font-medium text-gray-900">Compare</div>
              <div className="text-sm text-gray-500">Match with system</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">3</div>
            <div>
              <div className="font-medium text-gray-900">Adjust</div>
              <div className="text-sm text-gray-500">Record discrepancies</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-white font-bold">4</div>
            <div>
              <div className="font-medium text-gray-900">Document</div>
              <div className="text-sm text-gray-500">Note reasons</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Inventory Table */}
      <Card>
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Current Inventory</h3>
        </div>
        
{vaccineLots.length === 0 ? (
          <Empty
            type="lots"
            title="No vaccine lots to reconcile"
            description="There are no vaccine lots in the system to reconcile."
          />
        ) : (
          <DataTable
            data={vaccineLots}
            columns={columns}
            sortable={true}
          />
        )}
      </Card>

      {/* Adjustment Modal */}
      <Modal
        isOpen={adjustmentModal}
        onClose={() => setAdjustmentModal(false)}
        title="Reconcile Inventory"
        size="md"
      >
        {selectedLot && (
          <form onSubmit={handleSubmitAdjustment} className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Lot Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Vaccine:</span>
                  <span className="ml-2 font-medium">{getVaccineName(selectedLot.vaccineId)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Lot Number:</span>
                  <span className="ml-2 font-medium">{selectedLot.lotNumber}</span>
                </div>
                <div>
                  <span className="text-gray-600">System Count:</span>
                  <span className="ml-2 font-medium">{selectedLot.quantityOnHand} doses</span>
                </div>
                <div>
                  <span className="text-gray-600">Expiration:</span>
                  <span className="ml-2 font-medium">{new Date(selectedLot.expirationDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <Input
              label="Physical Count"
              type="number"
              value={adjustmentForm.physicalCount}
              onChange={(e) => setAdjustmentForm(prev => ({ ...prev, physicalCount: e.target.value }))}
              placeholder="Enter actual physical count"
              min="0"
              required
            />

            <Select
              label="Reason for Adjustment"
              value={adjustmentForm.reason}
              onChange={(e) => setAdjustmentForm(prev => ({ ...prev, reason: e.target.value }))}
              options={reasonOptions}
              placeholder="Select reason"
              required
            />

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Additional Notes
              </label>
              <textarea
                value={adjustmentForm.notes}
                onChange={(e) => setAdjustmentForm(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter any additional details..."
              />
            </div>

            {adjustmentForm.physicalCount && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-blue-900 font-medium">Adjustment:</span>
                  <span className={`font-bold ${
                    parseInt(adjustmentForm.physicalCount) - selectedLot.quantityOnHand === 0 
                      ? 'text-green-600' 
                      : 'text-blue-600'
                  }`}>
                    {parseInt(adjustmentForm.physicalCount) - selectedLot.quantityOnHand > 0 ? '+' : ''}
                    {parseInt(adjustmentForm.physicalCount) - selectedLot.quantityOnHand} doses
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAdjustmentModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                icon="Check"
              >
                Submit Adjustment
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </motion.div>
  );
};

export default Reconciliation;