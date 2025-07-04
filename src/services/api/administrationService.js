class AdministrationService {
  constructor() {
    // Initialize ApperClient for administration operations
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'administration';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "age_group" } },
          { field: { Name: "doses_administered" } },
          { field: { Name: "date_administered" } },
          { field: { Name: "administered_by" } },
          { 
            field: { Name: "lot_id" },
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
        console.error('Failed to fetch administration records:', response.message);
        throw new Error(response.message);
      }

      // Map database fields to component-expected format
      return (response.data || []).map(admin => ({
        Id: admin.Id,
        lotId: admin.lot_id?.Id || admin.lot_id,
        ageGroup: admin.age_group,
        dosesAdministered: admin.doses_administered,
        dateAdministered: admin.date_administered,
        administeredBy: admin.administered_by,
        name: admin.Name,
        tags: admin.Tags,
        owner: admin.Owner
      }));
    } catch (error) {
      console.error('Error fetching administration records:', error);
      throw new Error('Failed to load administration records');
    }
  }

  async getById(id) {
    try {
      if (id === null || id === undefined) {
        throw new Error('Administration ID cannot be null or undefined');
      }

      const parsedId = typeof id === 'string' ? parseInt(id, 10) : id;
      if (isNaN(parsedId) || parsedId <= 0) {
        throw new Error(`Invalid administration ID: ${id}`);
      }

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "age_group" } },
          { field: { Name: "doses_administered" } },
          { field: { Name: "date_administered" } },
          { field: { Name: "administered_by" } },
          { 
            field: { Name: "lot_id" },
            referenceField: { field: { Name: "Name" } }
          },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parsedId, params);
      
      if (!response.success) {
        console.error('Failed to fetch administration by ID:', response.message);
        throw new Error(response.message);
      }

      // Map database fields to component-expected format
      const admin = response.data;
      return {
        Id: admin.Id,
        lotId: admin.lot_id?.Id || admin.lot_id,
        ageGroup: admin.age_group,
        dosesAdministered: admin.doses_administered,
        dateAdministered: admin.date_administered,
        administeredBy: admin.administered_by,
        name: admin.Name,
        tags: admin.Tags,
        owner: admin.Owner
      };
    } catch (error) {
      console.error(`Error fetching administration with ID ${id}:`, error);
      throw new Error('Failed to load administration record');
    }
  }

  async create(administrationData) {
    try {
      // Only include Updateable fields
      const recordData = {
        Name: administrationData.Name || administrationData.name || `Administration ${new Date().toLocaleDateString()}`,
        age_group: administrationData.ageGroup || administrationData.age_group,
        doses_administered: administrationData.dosesAdministered || administrationData.doses_administered,
        date_administered: administrationData.dateAdministered || administrationData.date_administered,
        administered_by: administrationData.administeredBy || administrationData.administered_by,
        lot_id: administrationData.lotId || administrationData.lot_id,
        Tags: administrationData.Tags || administrationData.tags || '',
        Owner: administrationData.Owner || administrationData.owner || null
      };

      const params = {
        records: [recordData]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error('Failed to create administration:', response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        if (failedRecords.length > 0) {
          console.error(`Failed to create administration:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to create administration');
        }
        return response.results[0].data;
      }

      return response.data;
    } catch (error) {
      console.error('Error creating administration:', error);
      throw new Error('Failed to create administration record');
    }
  }

  async update(id, administrationData) {
    try {
      const parsedId = typeof id === 'string' ? parseInt(id, 10) : id;
      if (isNaN(parsedId) || parsedId <= 0) {
        throw new Error(`Invalid administration ID: ${id}`);
      }

      // Only include Updateable fields
      const recordData = {
        Id: parsedId,
        Name: administrationData.Name || administrationData.name || `Administration ${new Date().toLocaleDateString()}`,
        age_group: administrationData.ageGroup || administrationData.age_group,
        doses_administered: administrationData.dosesAdministered || administrationData.doses_administered,
        date_administered: administrationData.dateAdministered || administrationData.date_administered,
        administered_by: administrationData.administeredBy || administrationData.administered_by,
        lot_id: administrationData.lotId || administrationData.lot_id,
        Tags: administrationData.Tags || administrationData.tags || '',
        Owner: administrationData.Owner || administrationData.owner || null
      };

      const params = {
        records: [recordData]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error('Failed to update administration:', response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        if (failedRecords.length > 0) {
          console.error(`Failed to update administration:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to update administration');
        }
        return response.results[0].data;
      }

      return response.data;
    } catch (error) {
      console.error(`Error updating administration with ID ${id}:`, error);
      throw new Error('Failed to update administration record');
    }
  }

  async delete(id) {
    try {
      const parsedId = typeof id === 'string' ? parseInt(id, 10) : id;
      if (isNaN(parsedId) || parsedId <= 0) {
        throw new Error(`Invalid administration ID: ${id}`);
      }

      const params = {
        RecordIds: [parsedId]
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error('Failed to delete administration:', response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        if (failedRecords.length > 0) {
          console.error(`Failed to delete administration:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to delete administration');
        }
      }

      return true;
    } catch (error) {
      console.error(`Error deleting administration with ID ${id}:`, error);
      throw new Error('Failed to delete administration record');
    }
  }

  async getByLotId(lotId) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "age_group" } },
          { field: { Name: "doses_administered" } },
          { field: { Name: "date_administered" } },
          { field: { Name: "administered_by" } },
          { field: { Name: "lot_id" } }
        ],
        where: [
          {
            FieldName: "lot_id",
            Operator: "EqualTo",
            Values: [lotId],
            Include: true
          }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error('Failed to fetch administrations by lot ID:', response.message);
        throw new Error(response.message);
      }

      return (response.data || []).map(admin => ({
        Id: admin.Id,
        lotId: admin.lot_id,
        ageGroup: admin.age_group,
        dosesAdministered: admin.doses_administered,
        dateAdministered: admin.date_administered,
        administeredBy: admin.administered_by,
        name: admin.Name
      }));
    } catch (error) {
      console.error(`Error fetching administrations for lot ID ${lotId}:`, error);
      throw new Error('Failed to load administrations by lot');
    }
  }
}

export const administrationService = new AdministrationService();