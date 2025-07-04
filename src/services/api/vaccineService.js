import { toast } from 'react-toastify';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const vaccineService = {
  async getAll() {
    try {
      await delay(300);
      
      // Check if SDK is available
      if (!window.ApperSDK) {
        throw new Error('Apper SDK not loaded');
      }
      
      // Initialize ApperClient within the method
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "CreatedOn" } },
          { field: { Name: "CreatedBy" } },
          { field: { Name: "ModifiedOn" } },
          { field: { Name: "ModifiedBy" } },
          { field: { Name: "abbreviation" } },
          { field: { Name: "family" } },
          { field: { Name: "manufacturer" } },
          { field: { Name: "doses_per_vial" } },
          { field: { Name: "min_stock" } },
          { field: { Name: "storage_temp" } },
          { field: { Name: "vaccineId" } },
          { field: { Name: "commercialName" } },
          { field: { Name: "genericName" } }
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

      const response = await apperClient.fetchRecords('vaccine', params);
      
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
  },

  async getById(id) {
    try {
      await delay(200);
      
      // Check if SDK is available
      if (!window.ApperSDK) {
        throw new Error('Apper SDK not loaded');
      }
      
      // Initialize ApperClient within the method
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "CreatedOn" } },
          { field: { Name: "CreatedBy" } },
          { field: { Name: "ModifiedOn" } },
          { field: { Name: "ModifiedBy" } },
          { field: { Name: "abbreviation" } },
          { field: { Name: "family" } },
          { field: { Name: "manufacturer" } },
          { field: { Name: "doses_per_vial" } },
          { field: { Name: "min_stock" } },
          { field: { Name: "storage_temp" } },
          { field: { Name: "vaccineId" } },
          { field: { Name: "commercialName" } },
          { field: { Name: "genericName" } }
        ]
      };

      const response = await apperClient.getRecordById('vaccine', id, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching vaccine with ID ${id}:`, error);
      toast.error("Failed to fetch vaccine");
      return null;
    }
  },

  async create(vaccineData) {
    try {
      await delay(300);
      
      // Check if SDK is available
      if (!window.ApperSDK) {
        throw new Error('Apper SDK not loaded');
      }
      
      // Initialize ApperClient within the method
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      // Only include Updateable fields
      const updateableData = {
        Name: vaccineData.Name || '',
        Tags: vaccineData.Tags || '',
        Owner: vaccineData.Owner || null,
        abbreviation: vaccineData.abbreviation || '',
        family: vaccineData.family || '',
        manufacturer: vaccineData.manufacturer || '',
        doses_per_vial: vaccineData.doses_per_vial || 0,
        min_stock: vaccineData.min_stock || 0,
        storage_temp: vaccineData.storage_temp || '',
        vaccineId: vaccineData.vaccineId || '',
        commercialName: vaccineData.commercialName || '',
        genericName: vaccineData.genericName || ''
      };

      const params = {
        records: [updateableData]
      };

      const response = await apperClient.createRecord('vaccine', params);
if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulRecords.length > 0) {
          toast.success('Vaccine created successfully');
          return successfulRecords[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error creating vaccine:", error);
      toast.error("Failed to create vaccine");
      return null;
    }
  },

  async update(id, vaccineData) {
    try {
      await delay(300);
      
      // Check if SDK is available
      if (!window.ApperSDK) {
        throw new Error('Apper SDK not loaded');
      }
      
      // Initialize ApperClient within the method
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      // Only include Updateable fields plus Id
      const updateableData = {
        Id: id,
        Name: vaccineData.Name || '',
        Tags: vaccineData.Tags || '',
        Owner: vaccineData.Owner || null,
        abbreviation: vaccineData.abbreviation || '',
        family: vaccineData.family || '',
        manufacturer: vaccineData.manufacturer || '',
        doses_per_vial: vaccineData.doses_per_vial || 0,
        min_stock: vaccineData.min_stock || 0,
        storage_temp: vaccineData.storage_temp || '',
        vaccineId: vaccineData.vaccineId || '',
        commercialName: vaccineData.commercialName || '',
        genericName: vaccineData.genericName || ''
      };

      const params = {
        records: [updateableData]
      };

      const response = await apperClient.updateRecord('vaccine', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulUpdates.length > 0) {
          toast.success('Vaccine updated successfully');
          return successfulUpdates[0].data;
        }
      }
      
      return null;
} catch (error) {
      console.error(`Error updating vaccine with ID ${id}:`, error);
      toast.error("Failed to update vaccine");
      return null;
    }
  },

  async delete(recordIds) {
    try {
      await delay(300);
      
      // Check if SDK is available
      if (!window.ApperSDK) {
        throw new Error('Apper SDK not loaded');
      }
      
      // Initialize ApperClient within the method
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        RecordIds: Array.isArray(recordIds) ? recordIds : [recordIds]
      };

      const response = await apperClient.deleteRecord('vaccine', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulDeletions.length > 0) {
          toast.success(`Successfully deleted ${successfulDeletions.length} vaccine(s)`);
        }
        
        return successfulDeletions.length === params.RecordIds.length;
}
      
      return false;
    } catch (error) {
      console.error("Error deleting vaccines:", error);
      toast.error("Failed to delete vaccines");
      return false;
    }
  }
};
export default vaccineService;