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
    const lot = this.vaccineLots.find(l => l.Id === id);
    if (!lot) {
      throw new Error('Vaccine lot not found');
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
    return this.vaccineLots.filter(lot => lot.vaccineId === vaccineId);
  }

  async getAvailableLots() {
    await new Promise(resolve => setTimeout(resolve, 250));
    return this.vaccineLots.filter(lot => lot.quantityOnHand > 0);
  }
}

export const vaccineLotService = new VaccineLotService();