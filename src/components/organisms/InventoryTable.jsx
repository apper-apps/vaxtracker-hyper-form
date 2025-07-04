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
        return vaccine.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    const vaccine = vaccines.find(v => v.Id === vaccineId);
    return vaccine ? vaccine.name : 'Unknown';
  };

  const getVaccineFamily = (vaccineId) => {
    const vaccine = vaccines.find(v => v.Id === vaccineId);
    return vaccine ? vaccine.family : 'Unknown';
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
      render: (value, lot) => (
        <div>
          <div className="font-medium text-gray-900">{getVaccineName(lot.vaccineId)}</div>
          <div className="text-sm text-gray-500">{getVaccineFamily(lot.vaccineId)}</div>
        </div>
      )
    },
    {
      key: 'lotNumber',
      label: 'Lot Number',
      render: (value) => (
        <span className="font-mono text-sm">{value}</span>
      )
    },
    {
      key: 'expirationDate',
      label: 'Expiration',
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
        placeholder="Search vaccines or lot numbers..."
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