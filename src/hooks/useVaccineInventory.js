import { useState, useEffect } from 'react';
import { vaccineLotService } from '@/services/api/vaccineLotService';
import { vaccineService } from '@/services/api/vaccineService';

export const useVaccineInventory = () => {
  const [lots, setLots] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [lotsData, vaccinesData] = await Promise.all([
        vaccineLotService.getAll(),
        vaccineService.getAll()
      ]);
      
      setLots(lotsData);
      setVaccines(vaccinesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getVaccineName = (vaccineId) => {
    const vaccine = vaccines.find(v => v.Id === vaccineId);
    return vaccine ? vaccine.name : 'Unknown';
  };

  const getVaccineFamily = (vaccineId) => {
    const vaccine = vaccines.find(v => v.Id === vaccineId);
    return vaccine ? vaccine.family : 'Unknown';
  };

  const getAvailableLots = () => {
    return lots.filter(lot => lot.quantityOnHand > 0);
  };

  const getLowStockLots = (threshold = 10) => {
    return lots.filter(lot => lot.quantityOnHand <= threshold && lot.quantityOnHand > 0);
  };

  const getExpiringLots = (days = 30) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);
    
    return lots.filter(lot => {
      const expDate = new Date(lot.expirationDate);
      return expDate <= cutoffDate && lot.quantityOnHand > 0;
    });
  };

  const getExpiredLots = () => {
    const today = new Date();
    return lots.filter(lot => {
      const expDate = new Date(lot.expirationDate);
      return expDate < today && lot.quantityOnHand > 0;
    });
  };

  const getTotalDoses = () => {
    return lots.reduce((total, lot) => total + lot.quantityOnHand, 0);
  };

  const getTotalReceived = () => {
    return lots.reduce((total, lot) => total + lot.quantityReceived, 0);
  };

  return {
    lots,
    vaccines,
    loading,
    error,
    refetch: loadData,
    getVaccineName,
    getVaccineFamily,
    getAvailableLots,
    getLowStockLots,
    getExpiringLots,
    getExpiredLots,
    getTotalDoses,
    getTotalReceived
  };
};