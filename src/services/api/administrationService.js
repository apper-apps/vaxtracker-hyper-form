import administrationsData from '@/services/mockData/administrations.json';

class AdministrationService {
  constructor() {
    this.administrations = [...administrationsData];
  }

  async getAll() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.administrations];
  }

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const administration = this.administrations.find(a => a.Id === id);
    if (!administration) {
      throw new Error('Administration record not found');
    }
    return { ...administration };
  }

  async create(administrationData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const newId = Math.max(...this.administrations.map(a => a.Id)) + 1;
    const newAdministration = {
      Id: newId,
      ...administrationData,
      createdAt: new Date().toISOString()
    };
    
    this.administrations.push(newAdministration);
    return { ...newAdministration };
  }

  async update(id, administrationData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const index = this.administrations.findIndex(a => a.Id === id);
    if (index === -1) {
      throw new Error('Administration record not found');
    }
    
    this.administrations[index] = {
      ...this.administrations[index],
      ...administrationData,
      updatedAt: new Date().toISOString()
    };
    
    return { ...this.administrations[index] };
  }

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = this.administrations.findIndex(a => a.Id === id);
    if (index === -1) {
      throw new Error('Administration record not found');
    }
    
    this.administrations.splice(index, 1);
    return true;
  }

  async getByLotId(lotId) {
    await new Promise(resolve => setTimeout(resolve, 250));
    return this.administrations.filter(admin => admin.lotId === lotId);
  }

  async getByAgeGroup(ageGroup) {
    await new Promise(resolve => setTimeout(resolve, 250));
    return this.administrations.filter(admin => admin.ageGroup === ageGroup);
  }

  async getByDateRange(startDate, endDate) {
    await new Promise(resolve => setTimeout(resolve, 250));
    return this.administrations.filter(admin => {
      const adminDate = new Date(admin.dateAdministered);
      return adminDate >= startDate && adminDate <= endDate;
    });
  }
}

export const administrationService = new AdministrationService();