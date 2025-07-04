import { useState, useEffect } from 'react';
import { differenceInDays } from 'date-fns';
import { useVaccineInventory } from '@/hooks/useVaccineInventory';

export const useVaccineAlerts = () => {
  const { lots, vaccines, loading } = useVaccineInventory();
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    if (loading || lots.length === 0) return;

    const newAlerts = [];
    const today = new Date();

    lots.forEach(lot => {
      const vaccine = vaccines.find(v => v.Id === lot.vaccineId);
      const vaccineName = vaccine ? vaccine.name : 'Unknown';
      const expirationDate = new Date(lot.expirationDate);
      const daysUntilExpiry = differenceInDays(expirationDate, today);

      // Only create alerts for lots with inventory
      if (lot.quantityOnHand > 0) {
        // Expired vaccines
        if (daysUntilExpiry < 0) {
          newAlerts.push({
            id: `expired-${lot.Id}`,
            type: 'expired',
            severity: 'critical',
            lotId: lot.Id,
            vaccineName,
            lotNumber: lot.lotNumber,
            quantity: lot.quantityOnHand,
            daysExpired: Math.abs(daysUntilExpiry),
            message: `${vaccineName} (Lot ${lot.lotNumber}) expired ${Math.abs(daysUntilExpiry)} days ago`
          });
        }
        // Expiring soon (within 30 days)
        else if (daysUntilExpiry <= 30) {
          newAlerts.push({
            id: `expiring-${lot.Id}`,
            type: 'expiring',
            severity: 'warning',
            lotId: lot.Id,
            vaccineName,
            lotNumber: lot.lotNumber,
            quantity: lot.quantityOnHand,
            daysToExpiry: daysUntilExpiry,
            message: `${vaccineName} (Lot ${lot.lotNumber}) expires in ${daysUntilExpiry} days`
          });
        }

        // Low stock (separate from expiration)
        if (lot.quantityOnHand <= 10) {
          newAlerts.push({
            id: `low-stock-${lot.Id}`,
            type: 'low-stock',
            severity: 'warning',
            lotId: lot.Id,
            vaccineName,
            lotNumber: lot.lotNumber,
            quantity: lot.quantityOnHand,
            message: `${vaccineName} (Lot ${lot.lotNumber}) has only ${lot.quantityOnHand} doses remaining`
          });
        }
      }
    });

    // Sort alerts by severity (critical first) and then by urgency
    newAlerts.sort((a, b) => {
      if (a.severity === 'critical' && b.severity !== 'critical') return -1;
      if (a.severity !== 'critical' && b.severity === 'critical') return 1;
      
      if (a.type === 'expired' && b.type !== 'expired') return -1;
      if (a.type !== 'expired' && b.type === 'expired') return 1;
      
      if (a.type === 'expiring' && b.type === 'expiring') {
        return (a.daysToExpiry || 0) - (b.daysToExpiry || 0);
      }
      
      return 0;
    });

    setAlerts(newAlerts);
  }, [lots, vaccines, loading]);

  const getCriticalAlerts = () => {
    return alerts.filter(alert => alert.severity === 'critical');
  };

  const getWarningAlerts = () => {
    return alerts.filter(alert => alert.severity === 'warning');
  };

  const getAlertsByType = (type) => {
    return alerts.filter(alert => alert.type === type);
  };

  const getAlertCount = () => {
    return alerts.length;
  };

  const getCriticalCount = () => {
    return getCriticalAlerts().length;
  };

  const getWarningCount = () => {
    return getWarningAlerts().length;
  };

  return {
    alerts,
    loading,
    getCriticalAlerts,
    getWarningAlerts,
    getAlertsByType,
    getAlertCount,
    getCriticalCount,
    getWarningCount
  };
};