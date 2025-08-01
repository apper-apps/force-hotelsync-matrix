class GuestService {
  constructor() {
    const { ApperClient } = window.ApperSDK
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    })
    this.tableName = 'guest'
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "email" } },
          { field: { Name: "phone" } },
          { field: { Name: "roomNumber" } },
          { field: { Name: "checkInDate" } },
          { field: { Name: "checkOutDate" } },
          { field: { Name: "status" } },
          { field: { Name: "vip" } },
          { field: { Name: "specialRequests" } }
        ]
      }

      const response = await this.apperClient.fetchRecords(this.tableName, params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }

      return response.data || []
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching guests:", error?.response?.data?.message)
      } else {
        console.error("Error fetching guests:", error.message)
      }
      throw error
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "email" } },
          { field: { Name: "phone" } },
          { field: { Name: "roomNumber" } },
          { field: { Name: "checkInDate" } },
          { field: { Name: "checkOutDate" } },
          { field: { Name: "status" } },
          { field: { Name: "vip" } },
          { field: { Name: "specialRequests" } }
        ]
      }

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }

      return response.data
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching guest with ID ${id}:`, error?.response?.data?.message)
      } else {
        console.error(`Error fetching guest with ID ${id}:`, error.message)
      }
      throw error
    }
  }

  async create(guestData) {
    try {
      // Only include Updateable fields
      const updateableData = {
        Name: guestData.Name,
        Tags: guestData.Tags,
        Owner: guestData.Owner,
        email: guestData.email,
        phone: guestData.phone,
        roomNumber: guestData.roomNumber,
        checkInDate: guestData.checkInDate,
        checkOutDate: guestData.checkOutDate,
        status: guestData.status || "checked-in",
        vip: guestData.vip || "false",
        specialRequests: guestData.specialRequests || ""
      }

      const params = {
        records: [updateableData]
      }

      const response = await this.apperClient.createRecord(this.tableName, params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success)
        const failedRecords = response.results.filter(result => !result.success)
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create guest ${failedRecords.length} records:${JSON.stringify(failedRecords)}`)
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              console.error(`${error.fieldLabel}: ${error.message}`)
            })
          })
        }
        
        return successfulRecords.length > 0 ? successfulRecords[0].data : null
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating guest:", error?.response?.data?.message)
      } else {
        console.error("Error creating guest:", error.message)
      }
      throw error
    }
  }

  async update(id, guestData) {
    try {
      // Only include Updateable fields
      const updateableData = {
        Id: parseInt(id),
        ...(guestData.Name !== undefined && { Name: guestData.Name }),
        ...(guestData.Tags !== undefined && { Tags: guestData.Tags }),
        ...(guestData.Owner !== undefined && { Owner: guestData.Owner }),
        ...(guestData.email !== undefined && { email: guestData.email }),
        ...(guestData.phone !== undefined && { phone: guestData.phone }),
        ...(guestData.roomNumber !== undefined && { roomNumber: guestData.roomNumber }),
        ...(guestData.checkInDate !== undefined && { checkInDate: guestData.checkInDate }),
        ...(guestData.checkOutDate !== undefined && { checkOutDate: guestData.checkOutDate }),
        ...(guestData.status !== undefined && { status: guestData.status }),
        ...(guestData.vip !== undefined && { vip: guestData.vip }),
        ...(guestData.specialRequests !== undefined && { specialRequests: guestData.specialRequests })
      }

      const params = {
        records: [updateableData]
      }

      const response = await this.apperClient.updateRecord(this.tableName, params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success)
        const failedUpdates = response.results.filter(result => !result.success)
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update guest ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`)
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              console.error(`${error.fieldLabel}: ${error.message}`)
            })
          })
        }
        
        return successfulUpdates.length > 0 ? successfulUpdates[0].data : null
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating guest:", error?.response?.data?.message)
      } else {
        console.error("Error updating guest:", error.message)
      }
      throw error
    }
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      }

      const response = await this.apperClient.deleteRecord(this.tableName, params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success)
        const failedDeletions = response.results.filter(result => !result.success)
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete guest ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`)
        }
        
        return successfulDeletions.length > 0
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting guest:", error?.response?.data?.message)
      } else {
        console.error("Error deleting guest:", error.message)
      }
      throw error
    }
  }

  async checkIn(id) {
    const guest = await this.update(id, { status: "checked-in" })
    // Dispatch custom event for room status updates
    if (typeof window !== 'undefined' && window.CustomEvent) {
      window.dispatchEvent(new window.CustomEvent('guestStatusChanged', { 
        detail: { guestId: id, roomNumber: guest.roomNumber, status: 'checked-in' } 
      }))
    }
    return guest
  }

  async checkOut(id) {
    const guest = await this.update(id, { status: "checked-out" })
    // Dispatch custom event for room status updates
    if (typeof window !== 'undefined' && window.CustomEvent) {
      window.dispatchEvent(new window.CustomEvent('guestStatusChanged', { 
        detail: { guestId: id, roomNumber: guest.roomNumber, status: 'checked-out' } 
      }))
    }
    return guest
  }
}

export const guestService = new GuestService()