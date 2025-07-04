import { toast } from 'react-toastify';

class VaccineService {
  constructor() {
    // Initialize ApperClient for database operations
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
          { field: { Name: "vaccineId" } },
          { field: { Name: "commercialName" } },
          { field: { Name: "genericName" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "CreatedOn" } },
          { field: { Name: "CreatedBy" } },
          { field: { Name: "ModifiedOn" } },
          { field: { Name: "ModifiedBy" } }
        ],
        orderBy: [
          {
            fieldName: "Name",
            sorttype: "ASC"
          }
        ],
        pagingInfo: {
          limit: 100,
          offset: 0
        }
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching vaccines:", error);
      toast.error("Failed to fetch vaccines");
      return [];
    }
  }

  async getById(id) {
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
          { field: { Name: "vaccineId" } },
          { field: { Name: "commercialName" } },
          { field: { Name: "genericName" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "CreatedOn" } },
          { field: { Name: "CreatedBy" } },
          { field: { Name: "ModifiedOn" } },
          { field: { Name: "ModifiedBy" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, id, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching vaccine with ID ${id}:`, error);
      toast.error("Failed to fetch vaccine details");
      return null;
    }
  }

  async create(vaccineData) {
    try {
      // Only include Updateable fields for create operation
      const params = {
        records: [{
          Name: vaccineData.Name || "",
          abbreviation: vaccineData.abbreviation || "",
          family: vaccineData.family || "",
          manufacturer: vaccineData.manufacturer || "",
          doses_per_vial: vaccineData.doses_per_vial || 0,
          min_stock: vaccineData.min_stock || 0,
          storage_temp: vaccineData.storage_temp || "",
          vaccineId: vaccineData.vaccineId || "",
          commercialName: vaccineData.commercialName || "",
          genericName: vaccineData.genericName || "",
          Tags: vaccineData.Tags || "",
          Owner: vaccineData.Owner || null
        }]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} vaccine records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulRecords.length > 0) {
          toast.success("Vaccine created successfully");
          return successfulRecords[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error creating vaccine:", error);
      toast.error("Failed to create vaccine");
      return null;
    }
  }

  async update(id, vaccineData) {
    try {
      // Only include Updateable fields for update operation
      const params = {
        records: [{
          Id: id,
          Name: vaccineData.Name,
          abbreviation: vaccineData.abbreviation,
          family: vaccineData.family,
          manufacturer: vaccineData.manufacturer,
          doses_per_vial: vaccineData.doses_per_vial,
          min_stock: vaccineData.min_stock,
          storage_temp: vaccineData.storage_temp,
          vaccineId: vaccineData.vaccineId,
          commercialName: vaccineData.commercialName,
          genericName: vaccineData.genericName,
          Tags: vaccineData.Tags,
          Owner: vaccineData.Owner
        }]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} vaccine records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulUpdates.length > 0) {
          toast.success("Vaccine updated successfully");
          return successfulUpdates[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error updating vaccine:", error);
      toast.error("Failed to update vaccine");
      return null;
    }
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [id]
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} vaccine records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulDeletions.length > 0) {
          toast.success("Vaccine deleted successfully");
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error("Error deleting vaccine:", error);
      toast.error("Failed to delete vaccine");
      return false;
    }
  }
}

export const vaccineService = new VaccineService();