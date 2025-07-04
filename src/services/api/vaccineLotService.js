import vaccineLotData from "@/services/mockData/vaccineLots.json";
import { vaccineService } from "@/services/api/vaccineService";
class VaccineLotService {
  constructor() {
    this.vaccineLots = [...vaccineLotData];
    this.dataIntegrityChecked = false;
  }

async validateDataIntegrity() {
    console.log('Performing comprehensive vaccine lot data integrity check...');
    
    try {
      // Get current vaccines to validate against
      const vaccines = await vaccineService.getAll();
      const validVaccineIds = new Set(vaccines.map(v => v.Id));
      
      console.log(`Validating ${this.vaccineLots.length} lots against ${vaccines.length} vaccines`);
      console.log('Valid vaccine IDs:', Array.from(validVaccineIds));
      
      let repairedCount = 0;
      const issues = [];
      
      // Check each lot for data integrity issues
      for (let i = 0; i < this.vaccineLots.length; i++) {
        const lot = this.vaccineLots[i];
        let needsRepair = false;
        const originalVaccineId = lot.vaccineId;
        
        // Check for missing or invalid vaccine ID
        if (lot.vaccineId === null || lot.vaccineId === undefined) {
          issues.push(`Lot ${lot.Id} (${lot.lotNumber}) has null/undefined vaccine ID`);
          needsRepair = true;
          console.warn(`Data integrity issue: Lot ${lot.Id} has no vaccine ID`);
        } else {
          // Handle string vaccine IDs that need parsing
          const parsedVaccineId = typeof lot.vaccineId === 'string' ? parseInt(lot.vaccineId, 10) : lot.vaccineId;
          
          if (isNaN(parsedVaccineId) || parsedVaccineId <= 0) {
            issues.push(`Lot ${lot.Id} (${lot.lotNumber}) has invalid vaccine ID format: ${lot.vaccineId}`);
            needsRepair = true;
            console.warn(`Data integrity issue: Lot ${lot.Id} has invalid vaccine ID format`);
          } else if (!validVaccineIds.has(parsedVaccineId)) {
            issues.push(`Lot ${lot.Id} (${lot.lotNumber}) references non-existent vaccine ID: ${parsedVaccineId}`);
            needsRepair = true;
            console.warn(`Data integrity issue: Lot ${lot.Id} references non-existent vaccine ID ${parsedVaccineId}`);
          } else if (typeof lot.vaccineId === 'string') {
            // Convert string IDs to integers for consistency
            console.log(`Converting string vaccine ID to integer for lot ${lot.Id}: ${lot.vaccineId} -> ${parsedVaccineId}`);
            this.vaccineLots[i] = { ...lot, vaccineId: parsedVaccineId };
            repairedCount++;
          }
        }
        
        // Attempt to repair by finding a suitable vaccine match
        if (needsRepair) {
          const repairedVaccineId = this.findSuitableVaccineId(lot, vaccines);
          if (repairedVaccineId) {
            console.log(`Repairing lot ${lot.Id} (${lot.lotNumber}): ${originalVaccineId} -> ${repairedVaccineId}`);
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
      
      // Final validation pass
      const remainingIssues = this.vaccineLots.filter(lot => {
        const vaccineId = typeof lot.vaccineId === 'string' ? parseInt(lot.vaccineId, 10) : lot.vaccineId;
        return !validVaccineIds.has(vaccineId) || lot.vaccineId === null || lot.vaccineId === undefined;
      });
      
      if (remainingIssues.length > 0) {
        console.error(`${remainingIssues.length} lots still have unresolved vaccine ID issues after repair attempt`);
        remainingIssues.forEach(lot => {
          console.error(`Unresolved: Lot ${lot.Id} (${lot.lotNumber}) vaccine ID: ${lot.vaccineId}`);
        });
      }
      
      return { repaired: repairedCount, issues };
    } catch (error) {
      console.error('Error during data integrity validation:', error);
      throw new Error('Failed to validate vaccine lot data integrity');
    }
  }

  findSuitableVaccineId(lot, vaccines) {
    console.log(`Finding suitable vaccine for lot ${lot.Id} (${lot.lotNumber})`);
    
    // Try to match based on lot number patterns or manufacturer codes
    for (const vaccine of vaccines) {
      // Look for manufacturer patterns in lot numbers
      if (lot.lotNumber && vaccine.manufacturer) {
        // Sanofi Pasteur lots often start with specific patterns
        if (vaccine.manufacturer === 'Sanofi Pasteur' && 
            (lot.lotNumber.match(/^[34][A-Z]+[0-9]/i) || lot.lotNumber.match(/^U[0-9]/i))) {
          console.log(`Matched lot ${lot.lotNumber} to ${vaccine.name} based on Sanofi pattern`);
          return vaccine.Id;
        }
        
        // Merck lots often have specific patterns
        if (vaccine.manufacturer === 'Merck' && 
            (lot.lotNumber.match(/^[YZ][0-9]/i))) {
          console.log(`Matched lot ${lot.lotNumber} to ${vaccine.name} based on Merck pattern`);
          return vaccine.Id;
        }
        
        // GSK lots often have specific patterns
        if (vaccine.manufacturer === 'GSK' && 
            (lot.lotNumber.match(/^[CX][A-Z0-9]/i))) {
          console.log(`Matched lot ${lot.lotNumber} to ${vaccine.name} based on GSK pattern`);
          return vaccine.Id;
        }
      }
    }
    
    // Fallback: assign to most common vaccine type as safe default
    // Prioritize DTaP vaccines as they're commonly used
    const dtapVaccine = vaccines.find(v => v.family === 'DTaP');
    if (dtapVaccine) {
      console.warn(`Using DTaP vaccine (${dtapVaccine.name}) as fallback for lot ${lot.lotNumber}`);
      return dtapVaccine.Id;
    }
    
// Last resort: assign the first available vaccine
    if (vaccines.length > 0) {
      console.warn(`Using first available vaccine (${vaccines[0].name}) as final fallback for lot ${lot.lotNumber}`);
      return vaccines[0].Id;
    }
    
    return null;
  }

  async getAvailableLots() {
    try {
      // Ensure data integrity before returning available lots
      if (!this.dataIntegrityChecked) {
        await this.validateDataIntegrity();
      }
      
      const allLots = await this.getAll();
      const today = new Date();
      
      return allLots.filter(lot => {
        // Additional safety check for null/undefined vaccine IDs
        if (lot.vaccineId === null || lot.vaccineId === undefined) {
          console.warn(`Filtering out lot ${lot.Id} with null/undefined vaccine ID`);
          return false;
        }
        
        const expirationDate = new Date(lot.expirationDate);
return lot.availableQuantity > 0 && expirationDate > today;
      });
    } catch (error) {
      console.error('Error getting available lots:', error);
      throw new Error('Failed to get available lots');
    }
  }

  async getAll() {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Ensure data integrity
    if (!this.dataIntegrityChecked) {
      await this.validateDataIntegrity();
    }
    
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
    
    // Ensure data integrity before searching
    await this.validateDataIntegrity();
    
    if (vaccineId === null || vaccineId === undefined) {
      console.warn('Null/undefined vaccine ID provided to getByVaccineId');
      return [];
    }
    
    // Handle both string and integer vaccine IDs for data integrity
    const parsedId = typeof vaccineId === 'string' ? parseInt(vaccineId, 10) : vaccineId;
    
    if (isNaN(parsedId) || parsedId <= 0) {
      console.error(`Invalid vaccine ID provided to getByVaccineId: ${vaccineId} (type: ${typeof vaccineId})`);
      console.error('Available vaccine IDs in lots:', [...new Set(this.vaccineLots.map(lot => lot.vaccineId))]);
      return [];
    }
    
    console.log(`Searching for lots with vaccine ID: ${parsedId}`);
    
    const matchingLots = this.vaccineLots.filter(lot => {
      if (lot.vaccineId === null || lot.vaccineId === undefined) {
        console.warn(`Lot ${lot.Id} (${lot.lotNumber}) has null/undefined vaccine ID - should have been repaired`);
        return false;
      }
      
      // Ensure consistent comparison by parsing lot vaccine ID
      const lotVaccineId = typeof lot.vaccineId === 'string' ? parseInt(lot.vaccineId, 10) : lot.vaccineId;
      
      if (isNaN(lotVaccineId)) {
        console.warn(`Lot ${lot.Id} (${lot.lotNumber}) has non-numeric vaccine ID: ${lot.vaccineId}`);
        return false;
      }
      
      return lotVaccineId === parsedId;
    });
    
    console.log(`Found ${matchingLots.length} lots for vaccine ID ${parsedId}`);
    
    // Log details for debugging
    if (matchingLots.length === 0) {
      console.warn(`No lots found for vaccine ID ${parsedId}`);
      console.warn('All lot vaccine IDs:', this.vaccineLots.map(lot => ({ lotId: lot.Id, vaccineId: lot.vaccineId })));
    } else {
      console.log('Matching lots:', matchingLots.map(lot => ({ lotId: lot.Id, lotNumber: lot.lotNumber, vaccineId: lot.vaccineId })));
    }
    
    return matchingLots.map(lot => ({ ...lot }));
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

async getAvailableQuantity() {
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