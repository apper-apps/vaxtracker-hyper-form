import vaccinesData from '@/services/mockData/vaccines.json';

class VaccineService {
  constructor() {
    this.vaccines = [...vaccinesData];
  }

  async getAll() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.vaccines];
  }

async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (id === null || id === undefined) {
      console.error('getById called with null/undefined vaccine ID');
      throw new Error('Vaccine ID cannot be null or undefined');
    }
    
    // Handle both string and integer IDs with validation
    const parsedId = typeof id === 'string' ? parseInt(id, 10) : id;
    
    if (isNaN(parsedId) || parsedId <= 0) {
      console.error(`Invalid vaccine ID provided to getById: ${id} (type: ${typeof id})`);
      console.error('Available vaccine IDs:', this.vaccines.map(v => v.Id));
      throw new Error(`Invalid vaccine ID: ${id}`);
    }
    
    const vaccine = this.vaccines.find(v => v.Id === parsedId);
    if (!vaccine) {
      console.error(`Vaccine not found for ID: ${id} (parsed: ${parsedId})`);
      console.error('Available vaccines:', this.vaccines.map(v => ({ Id: v.Id, name: v.name })));
      console.error('This may indicate a reference to a deleted or non-existent vaccine');
      throw new Error(`Vaccine not found for ID: ${parsedId}`);
    }
    
    // Validate vaccine data integrity
    if (!vaccine.name || !vaccine.abbreviation) {
      console.warn(`Vaccine ${vaccine.Id} has missing name or abbreviation - data integrity issue`);
    }
    
    return { ...vaccine };
  }

async create(vaccineData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Ensure proper ID generation accounting for pre-loaded vaccines (IDs 1-19)
    // and any vaccines added during runtime
    let newId;
    if (this.vaccines.length === 0) {
      newId = 1;
    } else {
      const maxId = Math.max(...this.vaccines.map(v => v.Id));
      newId = maxId + 1;
    }
    
    const newVaccine = {
      Id: newId,
      ...vaccineData,
      createdAt: new Date().toISOString()
    };
    
    this.vaccines.push(newVaccine);
    return { ...newVaccine };
  }

  async update(id, vaccineData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const index = this.vaccines.findIndex(v => v.Id === id);
    if (index === -1) {
      throw new Error('Vaccine not found');
    }
    
    this.vaccines[index] = {
      ...this.vaccines[index],
      ...vaccineData,
      updatedAt: new Date().toISOString()
    };
    
    return { ...this.vaccines[index] };
  }

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = this.vaccines.findIndex(v => v.Id === id);
    if (index === -1) {
      throw new Error('Vaccine not found');
    }
    
    this.vaccines.splice(index, 1);
    return true;
  }
}

export const vaccineService = new VaccineService();