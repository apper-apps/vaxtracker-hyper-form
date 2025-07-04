import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { differenceInDays } from 'date-fns';
import DataTable from '@/components/molecules/DataTable';
import SearchBar from '@/components/molecules/SearchBar';
import Badge from '@/components/atoms/Badge';
import Card from '@/components/atoms/Card';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import { vaccineLotService } from '@/services/api/vaccineLotService';
import { vaccineService } from '@/services/api/vaccineService';

const InventoryTable = () => {
  const [vaccineLots, setVaccineLots] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [filteredLots, setFilteredLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

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
      
      // Check if any data integrity repairs were made
      const integrityResult = await vaccineLotService.validateDataIntegrity();
      if (integrityResult.repaired > 0) {
        toast.success(`Data integrity check completed: ${integrityResult.repaired} vaccine lot(s) repaired`);
        console.log('Vaccine lot data integrity repairs:', integrityResult);
      }
      
      setVaccineLots(lotsData);
      setVaccines(vaccinesData);
      setFilteredLots(lotsData);
    } catch (error) {
      console.error('Error loading inventory:', error);
      setError('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    filterLots();
  }, [vaccineLots, searchTerm, activeFilter]);

const filterLots = () => {
    let filtered = [...vaccineLots];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(lot => {
        const vaccine = getVaccineName(lot.vaccineId);
        const abbreviation = getVaccineAbbreviation(lot.vaccineId);
        return vaccine.toLowerCase().includes(searchTerm.toLowerCase()) ||
               abbreviation.toLowerCase().includes(searchTerm.toLowerCase()) ||
               lot.lotNumber.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    // Apply status filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(lot => {
        const status = getVaccineStatus(lot);
        return status === activeFilter;
      });
    }

    setFilteredLots(filtered);
  };

const getVaccineName = (vaccineId) => {
    if (!vaccines.length) return 'Loading...';
    if (vaccineId === null || vaccineId === undefined) {
      console.error('Vaccine ID is null/undefined - this indicates a data integrity issue in lot creation');
      return 'No Vaccine ID';
    }
    
    // Handle both string and integer vaccine IDs consistently
    const parsedId = typeof vaccineId === 'string' ? parseInt(vaccineId, 10) : vaccineId;
    
    // Validate parsing was successful
    if (isNaN(parsedId)) {
      console.error(`Invalid vaccine ID format in inventory: ${vaccineId} (type: ${typeof vaccineId})`);
      console.error('This suggests the vaccine ID was not properly set during lot creation');
      return 'Invalid Vaccine ID';
    }
    
    const vaccine = vaccines.find(v => v.Id === parsedId);
    if (!vaccine) {
      console.error(`Vaccine not found for ID: ${vaccineId} (parsed: ${parsedId}) in inventory`);
      console.error('Available vaccine IDs:', vaccines.map(v => v.Id).sort((a, b) => a - b));
      console.error('Available vaccines:', vaccines.map(v => ({ Id: v.Id, name: v.name })));
      console.error('This indicates either:');
      console.error('1. The vaccine was deleted after the lot was created');
      console.error('2. The lot was created with an incorrect vaccine ID');
      console.error('3. There is a data synchronization issue between vaccines and lots');
      return `Vaccine ID ${parsedId} Not Found`;
    }
    return vaccine.name || 'Unnamed Vaccine';
  };

const getVaccineAbbreviation = (vaccineId) => {
    if (!vaccines.length) return 'Loading...';
    if (vaccineId === null || vaccineId === undefined) {
      console.error('Vaccine ID is null/undefined for abbreviation lookup');
      return 'N/A';
    }
    
    // Handle both string and integer vaccine IDs consistently
    const parsedId = typeof vaccineId === 'string' ? parseInt(vaccineId, 10) : vaccineId;
    
    // Validate parsing was successful
    if (isNaN(parsedId)) {
      console.error(`Invalid vaccine ID format for abbreviation in inventory: ${vaccineId} (type: ${typeof vaccineId})`);
      return 'N/A';
    }
    
    const vaccine = vaccines.find(v => v.Id === parsedId);
    if (!vaccine) {
      console.error(`Vaccine abbreviation not found for ID: ${vaccineId} (parsed: ${parsedId}) in inventory`);
      return 'N/A';
    }
    return vaccine.abbreviation || 'N/A';
  };

const getVaccineFamily = (vaccineId) => {
    if (!vaccines.length) return 'Loading...';
    if (vaccineId === null || vaccineId === undefined) {
      console.error('Vaccine ID is null/undefined for family lookup');
      return 'N/A';
    }
    
    // Handle both string and integer vaccine IDs consistently
    const parsedId = typeof vaccineId === 'string' ? parseInt(vaccineId, 10) : vaccineId;
    
    // Validate parsing was successful
    if (isNaN(parsedId)) {
      console.error(`Invalid vaccine ID format for family in inventory: ${vaccineId} (type: ${typeof vaccineId})`);
      return 'N/A';
    }
    
    const vaccine = vaccines.find(v => v.Id === parsedId);
    if (!vaccine) {
      console.error(`Vaccine family not found for ID: ${vaccineId} (parsed: ${parsedId}) in inventory`);
      return 'N/A';
    }
    return vaccine.family || 'N/A';
  };

  const getVaccineStatus = (lot) => {
    const today = new Date();
    const expirationDate = new Date(lot.expirationDate);
    const daysUntilExpiry = differenceInDays(expirationDate, today);
    
    if (daysUntilExpiry < 0) {
      return 'expired';
    } else if (daysUntilExpiry <= 30) {
      return 'expiring';
    } else if (lot.quantityOnHand <= 10) {
      return 'low-stock';
    } else {
      return 'in-stock';
    }
  };

  const getStatusBadge = (lot) => {
    const status = getVaccineStatus(lot);
    
    switch (status) {
      case 'expired':
        return <Badge variant="expired">Expired</Badge>;
      case 'expiring':
        return <Badge variant="expiring">Expiring Soon</Badge>;
      case 'low-stock':
        return <Badge variant="low-stock">Low Stock</Badge>;
      case 'in-stock':
        return <Badge variant="in-stock">In Stock</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const getExpirationInfo = (lot) => {
    const today = new Date();
    const expirationDate = new Date(lot.expirationDate);
    const daysUntilExpiry = differenceInDays(expirationDate, today);
    
    if (daysUntilExpiry < 0) {
      return {
        text: `Expired ${Math.abs(daysUntilExpiry)} days ago`,
        color: 'text-red-600'
      };
    } else if (daysUntilExpiry <= 30) {
      return {
        text: `Expires in ${daysUntilExpiry} days`,
        color: 'text-orange-600'
      };
    } else {
      return {
        text: `Expires in ${daysUntilExpiry} days`,
        color: 'text-green-600'
      };
    }
  };

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
      render: (value, lot) => (
        <div>
          <div className="font-medium text-gray-900">{getVaccineName(lot.vaccineId)}</div>
          <div className="text-sm text-gray-500">{getVaccineAbbreviation(lot.vaccineId)}</div>
        </div>
      )
    },
    {
      key: 'genericName',
      label: 'Generic Name',
      render: (value, lot) => (
        <span className="font-medium text-gray-700">{getVaccineAbbreviation(lot.vaccineId)}</span>
      ),
      sortable: true,
      sortKey: 'vaccineId',
      sortFn: (a, b) => {
        const aAbbr = getVaccineAbbreviation(a.vaccineId);
        const bAbbr = getVaccineAbbreviation(b.vaccineId);
        return aAbbr.localeCompare(bAbbr);
      }
    },
    {
      key: 'lotNumber',
      label: 'Lot Number',
      sortable: true,
      render: (value) => (
        <span className="font-mono text-sm">{value}</span>
      )
    },
    {
      key: 'expirationDate',
      label: 'Expiration',
      sortable: true,
      render: (value, lot) => {
        const expInfo = getExpirationInfo(lot);
        return (
          <div>
            <div className="font-medium">{new Date(value).toLocaleDateString()}</div>
            <div className={`text-sm ${expInfo.color}`}>{expInfo.text}</div>
          </div>
        );
      }
    },
    {
      key: 'quantityOnHand',
      label: 'On Hand',
      sortable: true,
      render: (value, lot) => (
        <div className="text-center">
          <div className="text-lg font-semibold">{value}</div>
          <div className="text-sm text-gray-500">doses</div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value, lot) => getStatusBadge(lot),
      sortable: false
    }
  ];

  const filters = [
    { value: 'all', label: 'All' },
    { value: 'in-stock', label: 'In Stock' },
    { value: 'low-stock', label: 'Low Stock' },
    { value: 'expiring', label: 'Expiring Soon' },
    { value: 'expired', label: 'Expired' }
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
    <div className="space-y-6">
<SearchBar
        onSearch={setSearchTerm}
        onFilter={setActiveFilter}
        placeholder="Search vaccines, generic names, or lot numbers..."
        filters={filters}
      />

      <Card>
        {filteredLots.length === 0 ? (
          <Empty
            type="lots"
            title="No vaccine lots found"
            description="No vaccine lots match your current filters."
          />
        ) : (
          <DataTable
            data={filteredLots}
            columns={columns}
            sortable={true}
          />
        )}
      </Card>
    </div>
  );
};

export default InventoryTable;