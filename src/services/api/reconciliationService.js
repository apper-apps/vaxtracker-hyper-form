class ReconciliationService {
  constructor() {
    // Initialize ApperClient for reconciliation operations
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'reconciliation';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "previous_quantity" } },
          { field: { Name: "adjusted_quantity" } },
          { field: { Name: "reason" } },
          { field: { Name: "notes" } },
          { field: { Name: "date_reconciled" } },
          { field: { Name: "adjustment" } },
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
        console.error('Failed to fetch reconciliation records:', response.message);
        throw new Error(response.message);
      }

      // Map database fields to component-expected format
      return (response.data || []).map(rec => ({
        Id: rec.Id,
        lotId: rec.lot_id?.Id || rec.lot_id,
        previousQuantity: rec.previous_quantity,
        adjustedQuantity: rec.adjusted_quantity,
        reason: rec.reason,
        notes: rec.notes,
        dateReconciled: rec.date_reconciled,
        adjustment: rec.adjustment,
        name: rec.Name,
        tags: rec.Tags,
        owner: rec.Owner
      }));
    } catch (error) {
      console.error('Error fetching reconciliation records:', error);
      throw new Error('Failed to load reconciliation records');
    }
  }

  async getById(id) {
    try {
      if (id === null || id === undefined) {
        throw new Error('Reconciliation ID cannot be null or undefined');
      }

      const parsedId = typeof id === 'string' ? parseInt(id, 10) : id;
      if (isNaN(parsedId) || parsedId <= 0) {
        throw new Error(`Invalid reconciliation ID: ${id}`);
      }

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "previous_quantity" } },
          { field: { Name: "adjusted_quantity" } },
          { field: { Name: "reason" } },
          { field: { Name: "notes" } },
          { field: { Name: "date_reconciled" } },
          { field: { Name: "adjustment" } },
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
        console.error('Failed to fetch reconciliation by ID:', response.message);
        throw new Error(response.message);
      }

      // Map database fields to component-expected format
      const rec = response.data;
      return {
        Id: rec.Id,
        lotId: rec.lot_id?.Id || rec.lot_id,
        previousQuantity: rec.previous_quantity,
        adjustedQuantity: rec.adjusted_quantity,
        reason: rec.reason,
        notes: rec.notes,
        dateReconciled: rec.date_reconciled,
        adjustment: rec.adjustment,
        name: rec.Name,
        tags: rec.Tags,
        owner: rec.Owner
      };
    } catch (error) {
      console.error(`Error fetching reconciliation with ID ${id}:`, error);
      throw new Error('Failed to load reconciliation record');
    }
  }

  async create(reconciliationData) {
    try {
      // Only include Updateable fields
      const recordData = {
        Name: reconciliationData.Name || reconciliationData.name || `Reconciliation ${new Date().toLocaleDateString()}`,
        previous_quantity: reconciliationData.previousQuantity || reconciliationData.previous_quantity,
        adjusted_quantity: reconciliationData.adjustedQuantity || reconciliationData.adjusted_quantity,
        reason: reconciliationData.reason,
        notes: reconciliationData.notes || '',
        date_reconciled: reconciliationData.dateReconciled || reconciliationData.date_reconciled,
        adjustment: reconciliationData.adjustment,
        lot_id: reconciliationData.lotId || reconciliationData.lot_id,
        Tags: reconciliationData.Tags || reconciliationData.tags || '',
        Owner: reconciliationData.Owner || reconciliationData.owner || null
      };

      const params = {
        records: [recordData]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error('Failed to create reconciliation:', response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        if (failedRecords.length > 0) {
          console.error(`Failed to create reconciliation:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to create reconciliation');
        }
        return response.results[0].data;
      }

      return response.data;
    } catch (error) {
      console.error('Error creating reconciliation:', error);
      throw new Error('Failed to create reconciliation record');
    }
  }

  async update(id, reconciliationData) {
    try {
      const parsedId = typeof id === 'string' ? parseInt(id, 10) : id;
      if (isNaN(parsedId) || parsedId <= 0) {
        throw new Error(`Invalid reconciliation ID: ${id}`);
      }

      // Only include Updateable fields
      const recordData = {
        Id: parsedId,
        Name: reconciliationData.Name || reconciliationData.name || `Reconciliation ${new Date().toLocaleDateString()}`,
        previous_quantity: reconciliationData.previousQuantity || reconciliationData.previous_quantity,
        adjusted_quantity: reconciliationData.adjustedQuantity || reconciliationData.adjusted_quantity,
        reason: reconciliationData.reason,
        notes: reconciliationData.notes || '',
        date_reconciled: reconciliationData.dateReconciled || reconciliationData.date_reconciled,
        adjustment: reconciliationData.adjustment,
        lot_id: reconciliationData.lotId || reconciliationData.lot_id,
        Tags: reconciliationData.Tags || reconciliationData.tags || '',
        Owner: reconciliationData.Owner || reconciliationData.owner || null
      };

      const params = {
        records: [recordData]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error('Failed to update reconciliation:', response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        if (failedRecords.length > 0) {
          console.error(`Failed to update reconciliation:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to update reconciliation');
        }
        return response.results[0].data;
      }

      return response.data;
    } catch (error) {
      console.error(`Error updating reconciliation with ID ${id}:`, error);
      throw new Error('Failed to update reconciliation record');
    }
  }

  async delete(id) {
    try {
      const parsedId = typeof id === 'string' ? parseInt(id, 10) : id;
      if (isNaN(parsedId) || parsedId <= 0) {
        throw new Error(`Invalid reconciliation ID: ${id}`);
      }

      const params = {
        RecordIds: [parsedId]
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error('Failed to delete reconciliation:', response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        if (failedRecords.length > 0) {
          console.error(`Failed to delete reconciliation:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to delete reconciliation');
        }
      }

      return true;
    } catch (error) {
      console.error(`Error deleting reconciliation with ID ${id}:`, error);
      throw new Error('Failed to delete reconciliation record');
    }
  }

  async getByLotId(lotId) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "previous_quantity" } },
          { field: { Name: "adjusted_quantity" } },
          { field: { Name: "reason" } },
          { field: { Name: "notes" } },
          { field: { Name: "date_reconciled" } },
          { field: { Name: "adjustment" } },
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
        console.error('Failed to fetch reconciliations by lot ID:', response.message);
        throw new Error(response.message);
      }

      return (response.data || []).map(rec => ({
        Id: rec.Id,
        lotId: rec.lot_id,
        previousQuantity: rec.previous_quantity,
        adjustedQuantity: rec.adjusted_quantity,
        reason: rec.reason,
        notes: rec.notes,
        dateReconciled: rec.date_reconciled,
        adjustment: rec.adjustment,
        name: rec.Name
      }));
    } catch (error) {
      console.error(`Error fetching reconciliations for lot ID ${lotId}:`, error);
      throw new Error('Failed to load reconciliations by lot');
    }
  }
}

export const reconciliationService = new ReconciliationService();