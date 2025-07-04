import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Select from '@/components/atoms/Select';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import ApperIcon from '@/components/ApperIcon';
import { vaccineLotService } from '@/services/api/vaccineLotService';
import { vaccineService } from '@/services/api/vaccineService';
import { administrationService } from '@/services/api/administrationService';

const Reports = () => {
  const [reportData, setReportData] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState('inventory');
  const [dateRange, setDateRange] = useState('all');

  useEffect(() => {
    loadReportData();
  }, [selectedReport, dateRange]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [lotsData, vaccinesData, adminData] = await Promise.all([
        vaccineLotService.getAll(),
        vaccineService.getAll(),
        administrationService.getAll()
      ]);
      
      setVaccines(vaccinesData);
      
      let data = [];
      
      switch (selectedReport) {
        case 'inventory':
          data = generateInventoryReport(lotsData, vaccinesData);
          break;
        case 'administration':
          data = generateAdministrationReport(adminData, lotsData, vaccinesData);
          break;
        case 'expiration':
          data = generateExpirationReport(lotsData, vaccinesData);
          break;
        default:
          data = generateInventoryReport(lotsData, vaccinesData);
      }
      
      setReportData(data);
    } catch (error) {
      console.error('Error loading report data:', error);
      setError('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

const generateInventoryReport = (lots, vaccines) => {
    return lots.map(lot => {
      const vaccine = vaccines.find(v => v.Id === lot.vaccineId);
      return {
        vaccine: vaccine?.Name || vaccine?.name || 'Unknown',
        lotNumber: lot.lotNumber,
        expirationDate: lot.expirationDate,
        quantityOnHand: lot.quantityOnHand,
        quantityReceived: lot.quantityReceived,
        dateReceived: lot.dateReceived
      };
    });
  };

const generateAdministrationReport = (administrations, lots, vaccines) => {
    return administrations.map(admin => {
      const lot = lots.find(l => l.Id === admin.lotId);
      const vaccine = vaccines.find(v => v.Id === lot?.vaccineId);
      return {
vaccine: vaccine?.Name || vaccine?.name || 'Unknown',
        lotNumber: lot?.lotNumber || 'Unknown',
        ageGroup: admin.ageGroup,
        dosesAdministered: admin.dosesAdministered,
        dateAdministered: admin.dateAdministered,
        administeredBy: admin.administeredBy
      };
    });
  };

const generateExpirationReport = (lots, vaccines) => {
    const today = new Date();
    return lots
      .filter(lot => {
        const expDate = new Date(lot.expirationDate);
        const daysUntilExpiry = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry <= 60; // Show items expiring within 60 days
      })
      .map(lot => {
        const vaccine = vaccines.find(v => v.Id === lot.vaccineId);
        const expDate = new Date(lot.expirationDate);
        const daysUntilExpiry = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
        return {
vaccine: vaccine?.Name || vaccine?.name || 'Unknown',
          lotNumber: lot.lotNumber,
          expirationDate: lot.expirationDate,
          quantityOnHand: lot.quantityOnHand,
          daysUntilExpiry: daysUntilExpiry,
          status: daysUntilExpiry < 0 ? 'Expired' : daysUntilExpiry <= 30 ? 'Expiring Soon' : 'Expiring'
        };
      })
      .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  };

  const handleExport = () => {
    if (reportData.length === 0) {
      toast.error('No data to export');
      return;
    }

    const csvContent = convertToCSV(reportData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedReport}-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Report exported successfully');
  };

  const convertToCSV = (data) => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        return `"${value}"`;
      });
      csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
  };

  const reportOptions = [
    { value: 'inventory', label: 'Inventory Report' },
    { value: 'administration', label: 'Administration Report' },
    { value: 'expiration', label: 'Expiration Report' }
  ];

  const dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 90 Days' },
    { value: 'ytd', label: 'Year to Date' }
  ];

  if (loading) {
    return <Loading type="table" />;
  }

  if (error) {
    return (
      <Error 
        message={error} 
        onRetry={loadReportData}
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
          <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
          <p className="text-gray-600">Generate and export inventory and administration reports</p>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <ApperIcon name="Clock" className="w-4 h-4" />
          <span>Generated: {new Date().toLocaleString()}</span>
        </div>
      </div>

      {/* Report Controls */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <Select
              label="Report Type"
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              options={reportOptions}
            />
          </div>
          
          <div className="flex-1">
            <Select
              label="Date Range"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              options={dateRangeOptions}
            />
          </div>
          
          <Button
            onClick={handleExport}
            icon="Download"
            className="whitespace-nowrap"
            disabled={reportData.length === 0}
          >
            Export CSV
          </Button>
        </div>
      </Card>

      {/* Report Data */}
      <Card>
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {reportOptions.find(option => option.value === selectedReport)?.label}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {reportData.length} records found
          </p>
        </div>
        
        {reportData.length === 0 ? (
          <Empty
            type="reports"
            title="No data available"
            description="No data found for the selected report type and date range."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {Object.keys(reportData[0]).map((key) => (
                    <th
                      key={key}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    {Object.values(row).map((value, cellIndex) => (
                      <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {typeof value === 'string' && value.includes('T') && value.includes('Z') 
                          ? new Date(value).toLocaleDateString()
                          : value
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Report Summary */}
      {reportData.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{reportData.length}</div>
              <div className="text-sm text-gray-500">Total Records</div>
            </div>
            
            {selectedReport === 'inventory' && (
              <>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">
                    {reportData.reduce((sum, item) => sum + item.quantityOnHand, 0)}
                  </div>
                  <div className="text-sm text-gray-500">Available Doses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning">
                    {reportData.filter(item => item.quantityOnHand <= 10).length}
                  </div>
                  <div className="text-sm text-gray-500">Low Stock Items</div>
                </div>
              </>
            )}
            
            {selectedReport === 'administration' && (
              <>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">
                    {reportData.reduce((sum, item) => sum + item.dosesAdministered, 0)}
                  </div>
                  <div className="text-sm text-gray-500">Doses Administered</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-info">
                    {new Set(reportData.map(item => item.ageGroup)).size}
                  </div>
                  <div className="text-sm text-gray-500">Age Groups</div>
                </div>
              </>
            )}
            
            {selectedReport === 'expiration' && (
              <>
                <div className="text-center">
                  <div className="text-2xl font-bold text-error">
                    {reportData.filter(item => item.daysUntilExpiry < 0).length}
                  </div>
                  <div className="text-sm text-gray-500">Expired Items</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning">
                    {reportData.filter(item => item.daysUntilExpiry >= 0 && item.daysUntilExpiry <= 30).length}
                  </div>
                  <div className="text-sm text-gray-500">Expiring Soon</div>
                </div>
              </>
            )}
          </div>
        </Card>
      )}
    </motion.div>
  );
};

export default Reports;