class LossService {
  constructor() {
    // Initialize ApperClient for loss operations
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'loss';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "quantity" } },
          { field: { Name: "reason" } },
          { field: { Name: "details" } },
          { field: { Name: "date_reported" } },
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
        console.error('Failed to fetch loss records:', response.message);
        throw new Error(response.message);
      }

      // Map database fields to component-expected format
      return (response.data || []).map(loss => ({
        Id: loss.Id,
        lotId: loss.lot_id?.Id || loss.lot_id,
        quantity: loss.quantity,
        reason: loss.reason,
        details: loss.details,
        dateReported: loss.date_reported,
        name: loss.Name,
        tags: loss.Tags,
        owner: loss.Owner
      }));
    } catch (error) {
      console.error('Error fetching loss records:', error);
      throw new Error('Failed to load loss records');
    }
  }

  async getById(id) {
    try {
      if (id === null || id === undefined) {
        throw new Error('Loss ID cannot be null or undefined');
      }

      const parsedId = typeof id === 'string' ? parseInt(id, 10) : id;
      if (isNaN(parsedId) || parsedId <= 0) {
        throw new Error(`Invalid loss ID: ${id}`);
      }

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "quantity" } },
          { field: { Name: "reason" } },
          { field: { Name: "details" } },
          { field: { Name: "date_reported" } },
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
        console.error('Failed to fetch loss by ID:', response.message);
        throw new Error(response.message);
      }

      // Map database fields to component-expected format
      const loss = response.data;
      return {
        Id: loss.Id,
        lotId: loss.lot_id?.Id || loss.lot_id,
        quantity: loss.quantity,
        reason: loss.reason,
        details: loss.details,
        dateReported: loss.date_reported,
        name: loss.Name,
        tags: loss.Tags,
        owner: loss.Owner
      };
    } catch (error) {
      console.error(`Error fetching loss with ID ${id}:`, error);
      throw new Error('Failed to load loss record');
    }
  }

  async create(lossData) {
    try {
      // Only include Updateable fields
      const recordData = {
        Name: lossData.Name || lossData.name || `Loss ${new Date().toLocaleDateString()}`,
        quantity: lossData.quantity,
        reason: lossData.reason,
        details: lossData.details || '',
        date_reported: lossData.dateReported || lossData.date_reported,
        lot_id: lossData.lotId || lossData.lot_id,
        Tags: lossData.Tags || lossData.tags || '',
        Owner: lossData.Owner || lossData.owner || null
      };

      const params = {
        records: [recordData]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error('Failed to create loss:', response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        if (failedRecords.length > 0) {
          console.error(`Failed to create loss:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to create loss');
        }
        return response.results[0].data;
      }

      return response.data;
    } catch (error) {
      console.error('Error creating loss:', error);
      throw new Error('Failed to create loss record');
    }
  }

  async update(id, lossData) {
    try {
      const parsedId = typeof id === 'string' ? parseInt(id, 10) : id;
      if (isNaN(parsedId) || parsedId <= 0) {
        throw new Error(`Invalid loss ID: ${id}`);
      }

      // Only include Updateable fields
      const recordData = {
        Id: parsedId,
        Name: lossData.Name || lossData.name || `Loss ${new Date().toLocaleDateString()}`,
        quantity: lossData.quantity,
        reason: lossData.reason,
        details: lossData.details || '',
        date_reported: lossData.dateReported || lossData.date_reported,
        lot_id: lossData.lotId || lossData.lot_id,
        Tags: lossData.Tags || lossData.tags || '',
        Owner: lossData.Owner || lossData.owner || null
      };

      const params = {
        records: [recordData]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error('Failed to update loss:', response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        if (failedRecords.length > 0) {
          console.error(`Failed to update loss:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to update loss');
        }
        return response.results[0].data;
      }

      return response.data;
    } catch (error) {
      console.error(`Error updating loss with ID ${id}:`, error);
      throw new Error('Failed to update loss record');
    }
  }

  async delete(id) {
    try {
      const parsedId = typeof id === 'string' ? parseInt(id, 10) : id;
      if (isNaN(parsedId) || parsedId <= 0) {
        throw new Error(`Invalid loss ID: ${id}`);
      }

      const params = {
        RecordIds: [parsedId]
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error('Failed to delete loss:', response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        if (failedRecords.length > 0) {
          console.error(`Failed to delete loss:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to delete loss');
        }
      }

      return true;
    } catch (error) {
      console.error(`Error deleting loss with ID ${id}:`, error);
      throw new Error('Failed to delete loss record');
    }
  }

  async getByLotId(lotId) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "quantity" } },
          { field: { Name: "reason" } },
          { field: { Name: "details" } },
          { field: { Name: "date_reported" } },
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
        console.error('Failed to fetch losses by lot ID:', response.message);
        throw new Error(response.message);
      }

      return (response.data || []).map(loss => ({
        Id: loss.Id,
        lotId: loss.lot_id,
        quantity: loss.quantity,
        reason: loss.reason,
        details: loss.details,
        dateReported: loss.date_reported,
        name: loss.Name
      }));
    } catch (error) {
      console.error(`Error fetching losses for lot ID ${lotId}:`, error);
      throw new Error('Failed to load losses by lot');
    }
  }
}

export const lossService = new LossService();