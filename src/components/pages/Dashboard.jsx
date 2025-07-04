import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { differenceInDays } from 'date-fns';
import StatsCard from '@/components/molecules/StatsCard';
import AlertBanner from '@/components/molecules/AlertBanner';
import Card from '@/components/atoms/Card';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import vaccineLotService from '@/services/api/vaccineLotService';
import vaccineService from '@/services/api/vaccineService';
import { administrationService } from '@/services/api/administrationService';

const Dashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    totalDoses: 0,
    availableDoses: 0,
    expiringSoon: 0,
    expired: 0,
    administered: 0,
    lowStock: 0
  });
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [lots, vaccines, administrations] = await Promise.all([
        vaccineLotService.getAll(),
        vaccineService.getAll(),
        administrationService.getAll()
      ]);

      // Calculate stats
      const totalDoses = lots.reduce((sum, lot) => sum + lot.quantityReceived, 0);
      const availableDoses = lots.reduce((sum, lot) => sum + lot.quantityOnHand, 0);
      const administered = administrations.reduce((sum, admin) => sum + admin.dosesAdministered, 0);
      
      const today = new Date();
      let expiringSoon = 0;
      let expired = 0;
      let lowStock = 0;
      const alertList = [];

      lots.forEach(lot => {
        const expirationDate = new Date(lot.expirationDate);
        const daysUntilExpiry = differenceInDays(expirationDate, today);
        
        if (daysUntilExpiry < 0) {
          expired++;
          if (lot.quantityOnHand > 0) {
            alertList.push({
              id: lot.Id,
              type: 'expired',
              severity: 'critical',
              message: `Lot ${lot.lotNumber} expired ${Math.abs(daysUntilExpiry)} days ago`,
              lotNumber: lot.lotNumber,
              daysExpired: Math.abs(daysUntilExpiry)
            });
          }
        } else if (daysUntilExpiry <= 30) {
          expiringSoon++;
          if (lot.quantityOnHand > 0) {
            alertList.push({
              id: lot.Id,
              type: 'expiring',
              severity: 'warning',
              message: `Lot ${lot.lotNumber} expires in ${daysUntilExpiry} days`,
              lotNumber: lot.lotNumber,
              daysToExpiry: daysUntilExpiry
            });
          }
        }
        
        if (lot.quantityOnHand <= 10 && lot.quantityOnHand > 0) {
          lowStock++;
          alertList.push({
            id: lot.Id,
            type: 'low-stock',
            severity: 'warning',
            message: `Lot ${lot.lotNumber} has only ${lot.quantityOnHand} doses remaining`,
            lotNumber: lot.lotNumber,
            quantity: lot.quantityOnHand
          });
        }
      });

      setDashboardData({
        totalDoses,
        availableDoses,
        expiringSoon,
        expired,
        administered,
        lowStock
      });
      
      setAlerts(alertList);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewInventory = () => {
    navigate('/inventory');
  };

  const handleViewReports = () => {
    navigate('/reports');
  };

  const handleReceiveVaccines = () => {
    navigate('/receiving');
  };

  const handleRecordAdministration = () => {
    navigate('/administration');
  };

  if (loading) {
    return <Loading type="dashboard" />;
  }

  if (error) {
    return (
      <Error 
        message={error} 
        onRetry={loadDashboardData}
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
      {/* Alert Banner */}
      <AlertBanner 
        alerts={alerts}
        onViewAll={handleViewInventory}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Doses"
          value={dashboardData.totalDoses.toLocaleString()}
          icon="Package"
          variant="gradient"
          onClick={handleViewInventory}
        />
        
        <StatsCard
          title="Available Doses"
          value={dashboardData.availableDoses.toLocaleString()}
          icon="CheckCircle"
          variant="success"
          onClick={handleViewInventory}
        />
        
        <StatsCard
          title="Administered"
          value={dashboardData.administered.toLocaleString()}
          icon="Syringe"
          trend="up"
          trendValue="+12%"
          onClick={handleRecordAdministration}
        />
        
        <StatsCard
          title="Expiring Soon"
          value={dashboardData.expiringSoon}
          icon="Clock"
          variant="warning"
          onClick={handleViewInventory}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={handleReceiveVaccines}
              className="w-full flex items-center justify-between p-4 bg-primary bg-opacity-5 hover:bg-opacity-10 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">R</span>
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">Receive Vaccines</div>
                  <div className="text-sm text-gray-500">Process new shipments</div>
                </div>
              </div>
            </button>
            
            <button
              onClick={handleRecordAdministration}
              className="w-full flex items-center justify-between p-4 bg-secondary bg-opacity-5 hover:bg-opacity-10 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">A</span>
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">Record Administration</div>
                  <div className="text-sm text-gray-500">Log administered doses</div>
                </div>
              </div>
            </button>
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Low Stock Items</span>
              <span className="font-semibold text-yellow-600">{dashboardData.lowStock}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Expiring Soon</span>
              <span className="font-semibold text-orange-600">{dashboardData.expiringSoon}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Expired</span>
              <span className="font-semibold text-red-600">{dashboardData.expired}</span>
            </div>
            <div className="pt-3 border-t">
              <button
                onClick={handleViewReports}
                className="w-full text-primary hover:text-primary-dark font-medium text-sm"
              >
                View Detailed Reports →
              </button>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

export default Dashboard;