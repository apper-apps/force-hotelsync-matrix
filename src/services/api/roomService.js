class RoomService {
  constructor() {
    const { ApperClient } = window.ApperSDK
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    })
    this.tableName = 'room'
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } }, 
          { field: { Name: "number" } },
          { field: { Name: "type" } },
          { field: { Name: "status" } },
          { field: { Name: "floor" } },
          { field: { Name: "guestName" } },
          { field: { Name: "checkIn" } },
          { field: { Name: "checkOut" } },
          { field: { Name: "rate" } },
          { field: { Name: "housekeepingStatus" } },
          { field: { Name: "lastMaintenance" } },
          { field: { Name: "amenities" } },
          { field: { Name: "maintenanceHistory" } },
          { field: { Name: "cleaningSchedule" } },
          { field: { Name: "upcomingReservations" } }
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
        console.error("Error fetching rooms:", error?.response?.data?.message)
      } else {
        console.error("Error fetching rooms:", error.message)
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
          { field: { Name: "number" } },
          { field: { Name: "type" } },
          { field: { Name: "status" } },
          { field: { Name: "floor" } },
          { field: { Name: "guestName" } },
          { field: { Name: "checkIn" } },
          { field: { Name: "checkOut" } },
          { field: { Name: "rate" } },
          { field: { Name: "housekeepingStatus" } },
          { field: { Name: "lastMaintenance" } },
          { field: { Name: "amenities" } },
          { field: { Name: "maintenanceHistory" } },
          { field: { Name: "cleaningSchedule" } },
          { field: { Name: "upcomingReservations" } }
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
        console.error(`Error fetching room with ID ${id}:`, error?.response?.data?.message)
      } else {
        console.error(`Error fetching room with ID ${id}:`, error.message)
      }
      throw error
    }
  }

  async create(roomData) {
    try {
      // Only include Updateable fields
      const updateableData = {
        Name: roomData.Name,
        Tags: roomData.Tags,
        Owner: roomData.Owner,
        number: roomData.number,
        type: roomData.type,
        status: roomData.status || "vacant",
        floor: roomData.floor,
        guestName: roomData.guestName,
        checkIn: roomData.checkIn,
        checkOut: roomData.checkOut,
        rate: roomData.rate,
        housekeepingStatus: roomData.housekeepingStatus,
        lastMaintenance: roomData.lastMaintenance,
        amenities: roomData.amenities,
        maintenanceHistory: roomData.maintenanceHistory,
        cleaningSchedule: roomData.cleaningSchedule,
        upcomingReservations: roomData.upcomingReservations
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
          console.error(`Failed to create room ${failedRecords.length} records:${JSON.stringify(failedRecords)}`)
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
        console.error("Error creating room:", error?.response?.data?.message)
      } else {
        console.error("Error creating room:", error.message)
      }
      throw error
    }
  }

  async update(id, roomData) {
    try {
      // Only include Updateable fields
      const updateableData = {
        Id: parseInt(id),
        ...(roomData.Name !== undefined && { Name: roomData.Name }),
        ...(roomData.Tags !== undefined && { Tags: roomData.Tags }),
        ...(roomData.Owner !== undefined && { Owner: roomData.Owner }),
        ...(roomData.number !== undefined && { number: roomData.number }),
        ...(roomData.type !== undefined && { type: roomData.type }),
        ...(roomData.status !== undefined && { status: roomData.status }),
        ...(roomData.floor !== undefined && { floor: roomData.floor }),
        ...(roomData.guestName !== undefined && { guestName: roomData.guestName }),
        ...(roomData.checkIn !== undefined && { checkIn: roomData.checkIn }),
        ...(roomData.checkOut !== undefined && { checkOut: roomData.checkOut }),
        ...(roomData.rate !== undefined && { rate: roomData.rate }),
        ...(roomData.housekeepingStatus !== undefined && { housekeepingStatus: roomData.housekeepingStatus }),
        ...(roomData.lastMaintenance !== undefined && { lastMaintenance: roomData.lastMaintenance }),
        ...(roomData.amenities !== undefined && { amenities: roomData.amenities }),
        ...(roomData.maintenanceHistory !== undefined && { maintenanceHistory: roomData.maintenanceHistory }),
        ...(roomData.cleaningSchedule !== undefined && { cleaningSchedule: roomData.cleaningSchedule }),
        ...(roomData.upcomingReservations !== undefined && { upcomingReservations: roomData.upcomingReservations })
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
          console.error(`Failed to update room ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`)
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
        console.error("Error updating room:", error?.response?.data?.message)
      } else {
        console.error("Error updating room:", error.message)
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
          console.error(`Failed to delete room ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`)
        }
        
        return successfulDeletions.length > 0
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting room:", error?.response?.data?.message)
      } else {
        console.error("Error deleting room:", error.message)
      }
      throw error
    }
  }

  async updateRoomStatusFromTask(roomNumber, newStatus) {
    try {
      // First find the room by number
      const params = {
        fields: [{ field: { Name: "Id" } }],
        where: [
          {
            FieldName: "number",
            Operator: "EqualTo",
            Values: [roomNumber]
          }
        ]
      }

      const response = await this.apperClient.fetchRecords(this.tableName, params)
      
      if (!response.success || !response.data || response.data.length === 0) {
        throw new Error(`Room ${roomNumber} not found`)
      }

      const roomId = response.data[0].Id
      return await this.update(roomId, { status: newStatus })
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating room status from task:", error?.response?.data?.message)
      } else {
        console.error("Error updating room status from task:", error.message)
      }
      throw error
    }
  }
}

export const roomService = new RoomService()