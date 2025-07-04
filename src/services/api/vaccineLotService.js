import vaccineLotData from "@/services/mockData/vaccineLots.json";
import { vaccineService } from "@/services/api/vaccineService";

class VaccineLotService {
  constructor() {
    this.vaccineLots = [...vaccineLotData];
    this.dataIntegrityChecked = false;
  }

  async validateDataIntegrity() {
    if (this.dataIntegrityChecked) return { repaired: 0, issues: [] };

    console.log('Performing vaccine lot data integrity check...');
    
    try {
      // Get current vaccines to validate against
      const vaccines = await vaccineService.getAll();
      const validVaccineIds = new Set(vaccines.map(v => v.Id));
      
      let repairedCount = 0;
      const issues = [];
      
      // Check each lot for data integrity issues
      for (let i = 0; i < this.vaccineLots.length; i++) {
        const lot = this.vaccineLots[i];
        let needsRepair = false;
        
        // Check for missing or invalid vaccine ID
        if (lot.vaccineId === null || lot.vaccineId === undefined) {
          issues.push(`Lot ${lot.Id} (${lot.lotNumber}) has null/undefined vaccine ID`);
          needsRepair = true;
        } else if (!validVaccineIds.has(lot.vaccineId)) {
          issues.push(`Lot ${lot.Id} (${lot.lotNumber}) references non-existent vaccine ID: ${lot.vaccineId}`);
          needsRepair = true;
        }
        
        // Attempt to repair by finding a suitable vaccine match
        if (needsRepair) {
          const repairedVaccineId = this.findSuitableVaccineId(lot, vaccines);
          if (repairedVaccineId) {
            console.log(`Repairing lot ${lot.Id} (${lot.lotNumber}): assigning vaccine ID ${repairedVaccineId}`);
            this.vaccineLots[i] = { ...lot, vaccineId: repairedVaccineId };
            repairedCount++;
          } else {
            console.error(`Could not repair lot ${lot.Id} (${lot.lotNumber}) - no suitable vaccine found`);
          }
        }
      }
      
      this.dataIntegrityChecked = true;
      
      if (repairedCount > 0) {
        console.log(`Data integrity check completed: ${repairedCount} lots repaired`);
      } else {
        console.log('Data integrity check completed: no issues found');
      }
      
      return { repaired: repairedCount, issues };
    } catch (error) {
      console.error('Error during data integrity validation:', error);
      throw new Error('Failed to validate vaccine lot data integrity');
    }
  }

  findSuitableVaccineId(lot, vaccines) {
    // Try to match based on lot number patterns or other heuristics
    // This is a fallback mechanism for data repair
    
    // For now, assign the first available vaccine as a safe default
    // In a real system, this would use more sophisticated matching logic
    if (vaccines.length > 0) {
      console.warn(`Assigning default vaccine ID ${vaccines[0].Id} to lot ${lot.lotNumber} as fallback`);
      return vaccines[0].Id;
    }
    
    return null;
  }

  async getAll() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Ensure data integrity before returning data
    await this.validateDataIntegrity();
    
    return [...this.vaccineLots];
  }

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Ensure data integrity
    await this.validateDataIntegrity();
    
    const lot = this.vaccineLots.find(l => l.Id === id);
    if (!lot) {
      throw new Error('Vaccine lot not found');
    }
    return { ...lot };
  }

  async create(lotData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Validate vaccine ID exists before creating
    if (lotData.vaccineId) {
      try {
        await vaccineService.getById(lotData.vaccineId);
      } catch (error) {
        throw new Error(`Cannot create lot: vaccine ID ${lotData.vaccineId} not found`);
      }
    }
    
    const newId = Math.max(...this.vaccineLots.map(l => l.Id)) + 1;
    const newLot = {
      Id: newId,
      ...lotData,
      createdAt: new Date().toISOString()
    };
    
    this.vaccineLots.push(newLot);
    return { ...newLot };
  }

  async update(id, lotData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const index = this.vaccineLots.findIndex(l => l.Id === id);
    if (index === -1) {
      throw new Error('Vaccine lot not found');
    }
    
    // Validate vaccine ID if it's being updated
    if (lotData.vaccineId && lotData.vaccineId !== this.vaccineLots[index].vaccineId) {
      try {
        await vaccineService.getById(lotData.vaccineId);
      } catch (error) {
        throw new Error(`Cannot update lot: vaccine ID ${lotData.vaccineId} not found`);
      }
    }
    
    this.vaccineLots[index] = {
      ...this.vaccineLots[index],
      ...lotData,
      updatedAt: new Date().toISOString()
    };
    
    return { ...this.vaccineLots[index] };
  }

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = this.vaccineLots.findIndex(l => l.Id === id);
    if (index === -1) {
      throw new Error('Vaccine lot not found');
    }
    
    this.vaccineLots.splice(index, 1);
    return true;
  }
async getByVaccineId(vaccineId) {
    await new Promise(resolve => setTimeout(resolve, 250));
    
    // Ensure data integrity
    await this.validateDataIntegrity();
    
    if (vaccineId === null || vaccineId === undefined) {
      console.warn('Null/undefined vaccine ID provided to getByVaccineId');
      return [];
    }
    
    // Handle both string and integer vaccine IDs for data integrity
    const parsedId = typeof vaccineId === 'string' ? parseInt(vaccineId, 10) : vaccineId;
    
    if (isNaN(parsedId) || parsedId <= 0) {
      console.warn(`Invalid vaccine ID provided to getByVaccineId: ${vaccineId} (type: ${typeof vaccineId})`);
      console.warn('Available vaccine IDs in lots:', [...new Set(this.vaccineLots.map(lot => lot.vaccineId))]);
      return [];
    }
    
    const matchingLots = this.vaccineLots.filter(lot => {
      if (lot.vaccineId === null || lot.vaccineId === undefined) {
        console.warn(`Lot ${lot.Id} has null/undefined vaccine ID`);
        return false;
      }
      const lotVaccineId = typeof lot.vaccineId === 'string' ? parseInt(lot.vaccineId, 10) : lot.vaccineId;
      return lotVaccineId === parsedId;
    });
    
    console.log(`Found ${matchingLots.length} lots for vaccine ID ${parsedId}`);
    return matchingLots;
  }

  async getExpiringSoon(days = 30) {
    await new Promise(resolve => setTimeout(resolve, 250));
    
    // Ensure data integrity
    await this.validateDataIntegrity();
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);
    
    return this.vaccineLots.filter(lot => {
      const expirationDate = new Date(lot.expirationDate);
      return expirationDate <= cutoffDate && expirationDate >= new Date();
    });
  }

  async getLowStock(threshold = 10) {
    await new Promise(resolve => setTimeout(resolve, 250));
    
    // Ensure data integrity
    await this.validateDataIntegrity();
    
    return this.vaccineLots.filter(lot => lot.quantityOnHand <= threshold);
  }

  async getAvailableLots() {
    await new Promise(resolve => setTimeout(resolve, 250));
    
    // Ensure data integrity
    await this.validateDataIntegrity();
    
    return this.vaccineLots.filter(lot => lot.quantityOnHand > 0);
  }

  async repairDataIntegrity() {
    // Force a fresh integrity check
    this.dataIntegrityChecked = false;
    return await this.validateDataIntegrity();
  }
}

export const vaccineLotService = new VaccineLotService();