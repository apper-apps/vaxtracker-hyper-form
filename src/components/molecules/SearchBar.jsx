import { useState } from 'react';
import Input from '@/components/atoms/Input';
import Button from '@/components/atoms/Button';
import Select from '@/components/atoms/Select';
import ApperIcon from '@/components/ApperIcon';

const SearchBar = ({ 
  onSearch, 
  onFilter,
  onAdvancedFilter,
  onSort,
  placeholder = 'Search vaccines...',
  filters = [],
  vaccines = [],
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    family: '',
    lotNumber: '',
    expirationFrom: '',
    expirationTo: '',
    quantityMin: '',
    quantityMax: ''
  });
  const [sortConfig, setSortConfig] = useState({
    field: '',
    direction: 'asc'
  });

  const handleSearch = (value) => {
    setSearchTerm(value);
    onSearch(value);
  };

  const handleFilter = (filter) => {
    setActiveFilter(filter);
    onFilter(filter);
  };

  const handleAdvancedFilterChange = (field, value) => {
    const updatedFilters = { ...advancedFilters, [field]: value };
    setAdvancedFilters(updatedFilters);
    onAdvancedFilter?.(updatedFilters);
  };

  const handleSort = (field, direction) => {
    const newSortConfig = { field, direction };
    setSortConfig(newSortConfig);
    onSort?.(newSortConfig);
  };

  const clearAdvancedFilters = () => {
    const clearedFilters = {
      family: '',
      lotNumber: '',
      expirationFrom: '',
      expirationTo: '',
      quantityMin: '',
      quantityMax: ''
    };
    setAdvancedFilters(clearedFilters);
    onAdvancedFilter?.(clearedFilters);
    setSortConfig({ field: '', direction: 'asc' });
    onSort?.({ field: '', direction: 'asc' });
  };

  // Get unique vaccine families for the dropdown
  const vaccineFamilies = [...new Set(vaccines.map(v => v.family).filter(Boolean))];
  const familyOptions = vaccineFamilies.map(family => ({
    value: family,
    label: family
  }));

  const sortOptions = [
    { value: 'name', label: 'Vaccine Name' },
    { value: 'family', label: 'Vaccine Family' },
    { value: 'lotNumber', label: 'Lot Number' },
    { value: 'expirationDate', label: 'Expiration Date' },
    { value: 'quantityOnHand', label: 'Quantity on Hand' }
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Search and Basic Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            icon="Search"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        
        {filters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <Button
                key={filter.value}
                variant={activeFilter === filter.value ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleFilter(filter.value)}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2"
        >
          <ApperIcon name="Filter" size={16} />
          Advanced Filters
          <ApperIcon 
            name={showAdvanced ? "ChevronUp" : "ChevronDown"} 
            size={16} 
          />
        </Button>
      </div>

      {/* Advanced Filter Panel */}
      {showAdvanced && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {/* Vaccine Family Filter */}
            <Select
              label="Vaccine Family"
              placeholder="Select family"
              options={familyOptions}
              value={advancedFilters.family}
              onChange={(e) => handleAdvancedFilterChange('family', e.target.value)}
            />

            {/* Lot Number Filter */}
            <Input
              label="Lot Number"
              placeholder="Enter lot number"
              value={advancedFilters.lotNumber}
              onChange={(e) => handleAdvancedFilterChange('lotNumber', e.target.value)}
            />

            {/* Expiration Date From */}
            <Input
              type="date"
              label="Expires From"
              value={advancedFilters.expirationFrom}
              onChange={(e) => handleAdvancedFilterChange('expirationFrom', e.target.value)}
            />

            {/* Expiration Date To */}
            <Input
              type="date"
              label="Expires To"
              value={advancedFilters.expirationTo}
              onChange={(e) => handleAdvancedFilterChange('expirationTo', e.target.value)}
            />

            {/* Minimum Quantity */}
            <Input
              type="number"
              label="Min Quantity"
              placeholder="Minimum doses"
              value={advancedFilters.quantityMin}
              onChange={(e) => handleAdvancedFilterChange('quantityMin', e.target.value)}
            />

            {/* Maximum Quantity */}
            <Input
              type="number"
              label="Max Quantity"
              placeholder="Maximum doses"
              value={advancedFilters.quantityMax}
              onChange={(e) => handleAdvancedFilterChange('quantityMax', e.target.value)}
            />
          </div>

          {/* Sorting Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Sort By"
                placeholder="Select field"
                options={sortOptions}
                value={sortConfig.field}
                onChange={(e) => handleSort(e.target.value, sortConfig.direction)}
              />

              <Select
                label="Direction"
                placeholder="Select direction"
                options={[
                  { value: 'asc', label: 'Ascending' },
                  { value: 'desc', label: 'Descending' }
                ]}
                value={sortConfig.direction}
                onChange={(e) => handleSort(sortConfig.field, e.target.value)}
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={clearAdvancedFilters}
              className="flex items-center gap-2"
            >
              <ApperIcon name="X" size={16} />
              Clear Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;