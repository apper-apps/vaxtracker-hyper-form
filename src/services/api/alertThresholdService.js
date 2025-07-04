class AlertThresholdService {
  constructor() {
    // Initialize ApperClient for database operations
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'alert_threshold';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "vaccine" }, referenceField: { field: { Name: "Name" } } },
          { field: { Name: "threshold_type" } },
          { field: { Name: "threshold_value" } },
          { field: { Name: "CreatedOn" } },
          { field: { Name: "ModifiedOn" } }
        ],
        orderBy: [
          { fieldName: "vaccine", sorttype: "ASC" },
          { fieldName: "threshold_type", sorttype: "ASC" }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      console.error('Error fetching alert thresholds:', error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "vaccine" }, referenceField: { field: { Name: "Name" } } },
          { field: { Name: "threshold_type" } },
          { field: { Name: "threshold_value" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, id, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching alert threshold with ID ${id}:`, error);
      throw error;
    }
  }

  async create(thresholdData) {
    try {
      // Only include Updateable fields
      const params = {
        records: [{
          Name: thresholdData.Name,
          vaccine: parseInt(thresholdData.vaccine),
          threshold_type: thresholdData.threshold_type,
          threshold_value: parseFloat(thresholdData.threshold_value)
        }]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message || 'Failed to create alert threshold');
        }

        const successfulRecords = response.results.filter(result => result.success);
        return successfulRecords[0]?.data;
      }
    } catch (error) {
      console.error('Error creating alert threshold:', error);
      throw error;
    }
  }

  async update(id, thresholdData) {
    try {
      // Only include Updateable fields
      const params = {
        records: [{
          Id: parseInt(id),
          Name: thresholdData.Name,
          vaccine: parseInt(thresholdData.vaccine),
          threshold_type: thresholdData.threshold_type,
          threshold_value: parseFloat(thresholdData.threshold_value)
        }]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          throw new Error(failedUpdates[0].message || 'Failed to update alert threshold');
        }

        const successfulUpdates = response.results.filter(result => result.success);
        return successfulUpdates[0]?.data;
      }
    } catch (error) {
      console.error('Error updating alert threshold:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          throw new Error(failedDeletions[0].message || 'Failed to delete alert threshold');
        }

        return true;
      }
    } catch (error) {
      console.error('Error deleting alert threshold:', error);
      throw error;
    }
  }

  async getByVaccineId(vaccineId) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "vaccine" } },
          { field: { Name: "threshold_type" } },
          { field: { Name: "threshold_value" } }
        ],
        where: [
          {
            FieldName: "vaccine",
            Operator: "EqualTo",
            Values: [parseInt(vaccineId)]
          }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      console.error(`Error fetching thresholds for vaccine ${vaccineId}:`, error);
      throw error;
    }
  }
}

export const alertThresholdService = new AlertThresholdService();