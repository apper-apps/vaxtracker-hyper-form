import lossesData from '@/services/mockData/losses.json';

class LossService {
  constructor() {
    this.losses = [...lossesData];
  }

  async getAll() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.losses];
  }

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const loss = this.losses.find(l => l.Id === id);
    if (!loss) {
      throw new Error('Loss record not found');
    }
    return { ...loss };
  }

  async create(lossData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const newId = Math.max(...this.losses.map(l => l.Id)) + 1;
    const newLoss = {
      Id: newId,
      ...lossData,
      createdAt: new Date().toISOString()
    };
    
    this.losses.push(newLoss);
    return { ...newLoss };
  }

  async update(id, lossData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const index = this.losses.findIndex(l => l.Id === id);
    if (index === -1) {
      throw new Error('Loss record not found');
    }
    
    this.losses[index] = {
      ...this.losses[index],
      ...lossData,
      updatedAt: new Date().toISOString()
    };
    
    return { ...this.losses[index] };
  }

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = this.losses.findIndex(l => l.Id === id);
    if (index === -1) {
      throw new Error('Loss record not found');
    }
    
    this.losses.splice(index, 1);
    return true;
  }

  async getByLotId(lotId) {
    await new Promise(resolve => setTimeout(resolve, 250));
    return this.losses.filter(loss => loss.lotId === lotId);
  }

  async getByReason(reason) {
    await new Promise(resolve => setTimeout(resolve, 250));
    return this.losses.filter(loss => loss.reason === reason);
  }
}

export const lossService = new LossService();