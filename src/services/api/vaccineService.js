class VaccineService {
  constructor() {
    // Initialize ApperClient for vaccine operations
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'vaccine';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "abbreviation" } },
          { field: { Name: "family" } },
          { field: { Name: "manufacturer" } },
          { field: { Name: "doses_per_vial" } },
          { field: { Name: "min_stock" } },
          { field: { Name: "storage_temp" } },
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
        console.error('Failed to fetch vaccines:', response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      console.error('Error fetching vaccines:', error);
      throw new Error('Failed to load vaccines');
    }
  }

  async getById(id) {
    try {
      if (id === null || id === undefined) {
        throw new Error('Vaccine ID cannot be null or undefined');
      }

      const parsedId = typeof id === 'string' ? parseInt(id, 10) : id;
      if (isNaN(parsedId) || parsedId <= 0) {
        throw new Error(`Invalid vaccine ID: ${id}`);
      }

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "abbreviation" } },
          { field: { Name: "family" } },
          { field: { Name: "manufacturer" } },
          { field: { Name: "doses_per_vial" } },
          { field: { Name: "min_stock" } },
          { field: { Name: "storage_temp" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "CreatedOn" } },
          { field: { Name: "CreatedBy" } },
          { field: { Name: "ModifiedOn" } },
          { field: { Name: "ModifiedBy" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parsedId, params);
      
      if (!response.success) {
        console.error('Failed to fetch vaccine by ID:', response.message);
        throw new Error(response.message);
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching vaccine with ID ${id}:`, error);
      throw new Error('Failed to load vaccine');
    }
  }

  async create(vaccineData) {
    try {
      // Only include Updateable fields
      const recordData = {
        Name: vaccineData.Name || vaccineData.name,
        abbreviation: vaccineData.abbreviation,
        family: vaccineData.family,
        manufacturer: vaccineData.manufacturer,
        doses_per_vial: vaccineData.doses_per_vial || vaccineData.dosesPerVial,
        min_stock: vaccineData.min_stock || vaccineData.minStock,
        storage_temp: vaccineData.storage_temp || vaccineData.storageTemp,
        Tags: vaccineData.Tags || '',
        Owner: vaccineData.Owner || null
      };

      const params = {
        records: [recordData]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error('Failed to create vaccine:', response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        if (failedRecords.length > 0) {
          console.error(`Failed to create vaccine:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to create vaccine');
        }
        return response.results[0].data;
      }

      return response.data;
    } catch (error) {
      console.error('Error creating vaccine:', error);
      throw new Error('Failed to create vaccine');
    }
  }

  async update(id, vaccineData) {
    try {
      const parsedId = typeof id === 'string' ? parseInt(id, 10) : id;
      if (isNaN(parsedId) || parsedId <= 0) {
        throw new Error(`Invalid vaccine ID: ${id}`);
      }

      // Only include Updateable fields
      const recordData = {
        Id: parsedId,
        Name: vaccineData.Name || vaccineData.name,
        abbreviation: vaccineData.abbreviation,
        family: vaccineData.family,
        manufacturer: vaccineData.manufacturer,
        doses_per_vial: vaccineData.doses_per_vial || vaccineData.dosesPerVial,
        min_stock: vaccineData.min_stock || vaccineData.minStock,
        storage_temp: vaccineData.storage_temp || vaccineData.storageTemp,
        Tags: vaccineData.Tags || '',
        Owner: vaccineData.Owner || null
      };

      const params = {
        records: [recordData]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error('Failed to update vaccine:', response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        if (failedRecords.length > 0) {
          console.error(`Failed to update vaccine:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to update vaccine');
        }
        return response.results[0].data;
      }

      return response.data;
    } catch (error) {
      console.error(`Error updating vaccine with ID ${id}:`, error);
      throw new Error('Failed to update vaccine');
    }
  }

  async delete(id) {
    try {
      const parsedId = typeof id === 'string' ? parseInt(id, 10) : id;
      if (isNaN(parsedId) || parsedId <= 0) {
        throw new Error(`Invalid vaccine ID: ${id}`);
      }

      const params = {
        RecordIds: [parsedId]
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error('Failed to delete vaccine:', response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        if (failedRecords.length > 0) {
          console.error(`Failed to delete vaccine:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to delete vaccine');
        }
      }

      return true;
    } catch (error) {
      console.error(`Error deleting vaccine with ID ${id}:`, error);
      throw new Error('Failed to delete vaccine');
    }
  }
}

export const vaccineService = new VaccineService();