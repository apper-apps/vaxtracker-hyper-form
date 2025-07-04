import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import DataTable from '@/components/molecules/DataTable';
import SearchBar from '@/components/molecules/SearchBar';
import Card from '@/components/atoms/Card';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import ApperIcon from '@/components/ApperIcon';
import { vaccineService } from '@/services/api/vaccineService';

const Vaccines = () => {
  const [vaccines, setVaccines] = useState([]);
  const [filteredVaccines, setFilteredVaccines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadVaccines();
  }, []);

  const loadVaccines = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const vaccinesData = await vaccineService.getAll();
      setVaccines(vaccinesData);
      setFilteredVaccines(vaccinesData);
    } catch (error) {
      console.error('Error loading vaccines:', error);
      setError('Failed to load vaccine information');
      toast.error('Failed to load vaccine information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    filterVaccines();
  }, [vaccines, searchTerm]);

  const filterVaccines = () => {
    let filtered = [...vaccines];

    if (searchTerm) {
      filtered = filtered.filter(vaccine => {
        const name = vaccine.Name || '';
        const abbreviation = vaccine.abbreviation || '';
        const manufacturer = vaccine.manufacturer || '';
        const family = vaccine.family || '';
        
        return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               abbreviation.toLowerCase().includes(searchTerm.toLowerCase()) ||
               manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
               family.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    setFilteredVaccines(filtered);
  };

  const columns = [
    {
      key: 'Name',
      label: 'Vaccine Name',
      sortable: true,
      render: (value, vaccine) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          {vaccine.abbreviation && (
            <div className="text-sm text-gray-500">{vaccine.abbreviation}</div>
          )}
        </div>
      )
    },
    {
      key: 'family',
      label: 'Family',
      sortable: true,
      render: (value) => (
        <span className="text-gray-700">{value || 'N/A'}</span>
      )
    },
    {
      key: 'manufacturer',
      label: 'Manufacturer',
      sortable: true,
      render: (value) => (
        <span className="font-medium text-gray-800">{value || 'N/A'}</span>
      )
    },
    {
      key: 'doses_per_vial',
      label: 'Doses/Vial',
      sortable: true,
      render: (value) => (
        <div className="text-center">
          <span className="text-lg font-semibold text-primary">{value || 'N/A'}</span>
        </div>
      )
    },
    {
      key: 'min_stock',
      label: 'Min Stock',
      sortable: true,
      render: (value) => (
        <div className="text-center">
          <span className="font-medium text-orange-600">{value || 'N/A'}</span>
        </div>
      )
    },
    {
      key: 'storage_temp',
      label: 'Storage Temp',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-1">
          <ApperIcon name="Thermometer" size={16} className="text-blue-500" />
          <span className="text-sm text-gray-700">{value || 'N/A'}</span>
        </div>
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
        onRetry={loadVaccines}
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
      <div className="flex items-center space-x-3">
        <ApperIcon name="Syringe" className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold text-gray-900">Vaccine Information</h1>
      </div>

      <SearchBar
        onSearch={setSearchTerm}
        placeholder="Search vaccines by name, abbreviation, manufacturer, or family..."
      />

      <Card>
        {filteredVaccines.length === 0 ? (
          <Empty
            type="vaccines"
            title="No vaccines found"
            description="No vaccines match your current search criteria."
          />
        ) : (
          <DataTable
            data={filteredVaccines}
            columns={columns}
            sortable={true}
          />
        )}
      </Card>
    </motion.div>
  );
};

export default Vaccines;