class VaccineLotService {
  constructor() {
    // Initialize ApperClient for vaccine lot operations
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'vaccine_lot';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "lot_number" } },
          { field: { Name: "expiration_date" } },
          { field: { Name: "quantity_received" } },
          { field: { Name: "quantity_on_hand" } },
          { field: { Name: "date_received" } },
          { field: { Name: "passed_inspection" } },
          { field: { Name: "failed_inspection" } },
          { field: { Name: "discrepancy_reason" } },
          { 
            field: { Name: "vaccine_id" },
            referenceField: { field: { Name: "Name" } }
          },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "CreatedOn" } },
          { field: { Name: "CreatedBy" } },
          { field: { Name: "ModifiedOn" } },
          { field: { Name: "ModifiedBy" } }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error('Failed to fetch vaccine lots:', response.message);
        throw new Error(response.message);
      }

      // Map database fields to component-expected format
      return (response.data || []).map(lot => ({
        Id: lot.Id,
        vaccineId: lot.vaccine_id?.Id || lot.vaccine_id,
        lotNumber: lot.lot_number,
        expirationDate: lot.expiration_date,
        quantityReceived: lot.quantity_received,
        quantityOnHand: lot.quantity_on_hand,
        dateReceived: lot.date_received,
        passedInspection: lot.passed_inspection,
        failedInspection: lot.failed_inspection,
        discrepancyReason: lot.discrepancy_reason,
        name: lot.Name,
        tags: lot.Tags,
        owner: lot.Owner
      }));
    } catch (error) {
      console.error('Error fetching vaccine lots:', error);
      throw new Error('Failed to load vaccine lots');
    }
  }

  async getById(id) {
    try {
      if (id === null || id === undefined) {
        throw new Error('Vaccine lot ID cannot be null or undefined');
      }

      const parsedId = typeof id === 'string' ? parseInt(id, 10) : id;
      if (isNaN(parsedId) || parsedId <= 0) {
        throw new Error(`Invalid vaccine lot ID: ${id}`);
      }

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "lot_number" } },
          { field: { Name: "expiration_date" } },
          { field: { Name: "quantity_received" } },
          { field: { Name: "quantity_on_hand" } },
          { field: { Name: "date_received" } },
          { field: { Name: "passed_inspection" } },
          { field: { Name: "failed_inspection" } },
          { field: { Name: "discrepancy_reason" } },
          { 
            field: { Name: "vaccine_id" },
            referenceField: { field: { Name: "Name" } }
          },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parsedId, params);
      
      if (!response.success) {
        console.error('Failed to fetch vaccine lot by ID:', response.message);
        throw new Error(response.message);
      }

      // Map database fields to component-expected format
      const lot = response.data;
      return {
        Id: lot.Id,
        vaccineId: lot.vaccine_id?.Id || lot.vaccine_id,
        lotNumber: lot.lot_number,
        expirationDate: lot.expiration_date,
        quantityReceived: lot.quantity_received,
        quantityOnHand: lot.quantity_on_hand,
        dateReceived: lot.date_received,
        passedInspection: lot.passed_inspection,
        failedInspection: lot.failed_inspection,
        discrepancyReason: lot.discrepancy_reason,
        name: lot.Name,
        tags: lot.Tags,
        owner: lot.Owner
      };
    } catch (error) {
      console.error(`Error fetching vaccine lot with ID ${id}:`, error);
      throw new Error('Failed to load vaccine lot');
    }
  }

  async create(lotData) {
    try {
      // Only include Updateable fields
      const recordData = {
        Name: lotData.Name || lotData.name || `Lot ${lotData.lotNumber || lotData.lot_number}`,
        lot_number: lotData.lotNumber || lotData.lot_number,
        expiration_date: lotData.expirationDate || lotData.expiration_date,
        quantity_received: lotData.quantityReceived || lotData.quantity_received,
        quantity_on_hand: lotData.quantityOnHand || lotData.quantity_on_hand,
        date_received: lotData.dateReceived || lotData.date_received,
        passed_inspection: lotData.passedInspection || lotData.passed_inspection,
        failed_inspection: lotData.failedInspection || lotData.failed_inspection,
        discrepancy_reason: lotData.discrepancyReason || lotData.discrepancy_reason || '',
        vaccine_id: lotData.vaccineId || lotData.vaccine_id,
        Tags: lotData.Tags || lotData.tags || '',
        Owner: lotData.Owner || lotData.owner || null
      };

      const params = {
        records: [recordData]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error('Failed to create vaccine lot:', response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        if (failedRecords.length > 0) {
          console.error(`Failed to create vaccine lot:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to create vaccine lot');
        }
        return response.results[0].data;
      }

      return response.data;
    } catch (error) {
      console.error('Error creating vaccine lot:', error);
      throw new Error('Failed to create vaccine lot');
    }
  }

  async update(id, lotData) {
    try {
      const parsedId = typeof id === 'string' ? parseInt(id, 10) : id;
      if (isNaN(parsedId) || parsedId <= 0) {
        throw new Error(`Invalid vaccine lot ID: ${id}`);
      }

      // Only include Updateable fields
      const recordData = {
        Id: parsedId,
        Name: lotData.Name || lotData.name || `Lot ${lotData.lotNumber || lotData.lot_number}`,
        lot_number: lotData.lotNumber || lotData.lot_number,
        expiration_date: lotData.expirationDate || lotData.expiration_date,
        quantity_received: lotData.quantityReceived || lotData.quantity_received,
        quantity_on_hand: lotData.quantityOnHand || lotData.quantity_on_hand,
        date_received: lotData.dateReceived || lotData.date_received,
        passed_inspection: lotData.passedInspection || lotData.passed_inspection,
        failed_inspection: lotData.failedInspection || lotData.failed_inspection,
        discrepancy_reason: lotData.discrepancyReason || lotData.discrepancy_reason || '',
        vaccine_id: lotData.vaccineId || lotData.vaccine_id,
        Tags: lotData.Tags || lotData.tags || '',
        Owner: lotData.Owner || lotData.owner || null
      };

      const params = {
        records: [recordData]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error('Failed to update vaccine lot:', response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        if (failedRecords.length > 0) {
          console.error(`Failed to update vaccine lot:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to update vaccine lot');
        }
        return response.results[0].data;
      }

      return response.data;
    } catch (error) {
      console.error(`Error updating vaccine lot with ID ${id}:`, error);
      throw new Error('Failed to update vaccine lot');
    }
  }

  async delete(id) {
    try {
      const parsedId = typeof id === 'string' ? parseInt(id, 10) : id;
      if (isNaN(parsedId) || parsedId <= 0) {
        throw new Error(`Invalid vaccine lot ID: ${id}`);
      }

      const params = {
        RecordIds: [parsedId]
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error('Failed to delete vaccine lot:', response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        if (failedRecords.length > 0) {
          console.error(`Failed to delete vaccine lot:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to delete vaccine lot');
        }
      }

      return true;
    } catch (error) {
      console.error(`Error deleting vaccine lot with ID ${id}:`, error);
      throw new Error('Failed to delete vaccine lot');
    }
  }

  async getAvailableLots() {
    try {
      const allLots = await this.getAll();
      const today = new Date();
      
      return allLots.filter(lot => {
        if (!lot.vaccineId) {
          console.warn(`Filtering out lot ${lot.Id} with null/undefined vaccine ID`);
          return false;
        }
        
        const expirationDate = new Date(lot.expirationDate);
        return lot.quantityOnHand > 0 && expirationDate > today;
      });
    } catch (error) {
      console.error('Error getting available lots:', error);
      throw new Error('Failed to get available lots');
    }
  }

  async validateDataIntegrity() {
    // For ApperClient, data integrity is maintained by the database
    // This method exists for compatibility but returns success
    return { repaired: 0, issues: [] };
  }
}

export const vaccineLotService = new VaccineLotService();