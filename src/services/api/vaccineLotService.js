import vaccineLotsData from '@/services/mockData/vaccineLots.json';

class VaccineLotService {
  constructor() {
    // Initialize with deep copy to ensure data integrity
    this.vaccineLots = JSON.parse(JSON.stringify(vaccineLotsData));
    this.lastId = Math.max(...this.vaccineLots.map(l => l.Id || 0), 0);
  }

  async getAll() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    // Return deep copy to prevent external mutations
    return JSON.parse(JSON.stringify(this.vaccineLots));
  }

async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Validate ID parameter
    const parsedId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (isNaN(parsedId) || parsedId <= 0) {
      console.error(`Invalid lot ID provided to getById: ${id} (type: ${typeof id})`);
      throw new Error(`Invalid lot ID: ${id}`);
    }
    
    const lot = this.vaccineLots.find(l => l.Id === parsedId);
    if (!lot) {
      console.error(`Vaccine lot not found for ID: ${id} (parsed: ${parsedId})`);
      console.error('Available lot IDs:', this.vaccineLots.map(l => l.Id));
      throw new Error(`Vaccine lot not found for ID: ${parsedId}`);
    }
    
    // Validate lot data integrity
    if (lot.vaccineId === null || lot.vaccineId === undefined) {
      console.warn(`Lot ${lot.Id} has null/undefined vaccine ID - data integrity issue`);
    }
    
    return { ...lot };
  }

  async create(lotData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
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
    
    if (vaccineId === null || vaccineId === undefined) {
      console.warn('getByVaccineId called with null/undefined vaccine ID');
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

  async getAvailableLots() {
    await new Promise(resolve => setTimeout(resolve, 250));
    return this.vaccineLots.filter(lot => lot.quantityOnHand > 0);
  }
}

export const vaccineLotService = new VaccineLotService();