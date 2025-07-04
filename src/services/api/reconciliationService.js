import reconciliationsData from '@/services/mockData/reconciliations.json';

class ReconciliationService {
  constructor() {
    this.reconciliations = [...reconciliationsData];
  }

  async getAll() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.reconciliations];
  }

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const reconciliation = this.reconciliations.find(r => r.Id === id);
    if (!reconciliation) {
      throw new Error('Reconciliation record not found');
    }
    return { ...reconciliation };
  }

  async create(reconciliationData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const newId = Math.max(...this.reconciliations.map(r => r.Id)) + 1;
    const newReconciliation = {
      Id: newId,
      ...reconciliationData,
      createdAt: new Date().toISOString()
    };
    
    this.reconciliations.push(newReconciliation);
    return { ...newReconciliation };
  }

  async update(id, reconciliationData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const index = this.reconciliations.findIndex(r => r.Id === id);
    if (index === -1) {
      throw new Error('Reconciliation record not found');
    }
    
    this.reconciliations[index] = {
      ...this.reconciliations[index],
      ...reconciliationData,
      updatedAt: new Date().toISOString()
    };
    
    return { ...this.reconciliations[index] };
  }

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = this.reconciliations.findIndex(r => r.Id === id);
    if (index === -1) {
      throw new Error('Reconciliation record not found');
    }
    
    this.reconciliations.splice(index, 1);
    return true;
  }

  async getByLotId(lotId) {
    await new Promise(resolve => setTimeout(resolve, 250));
    return this.reconciliations.filter(rec => rec.lotId === lotId);
  }

  async getByDateRange(startDate, endDate) {
    await new Promise(resolve => setTimeout(resolve, 250));
    return this.reconciliations.filter(rec => {
      const recDate = new Date(rec.dateReconciled);
      return recDate >= startDate && recDate <= endDate;
    });
  }
}

export const reconciliationService = new ReconciliationService();