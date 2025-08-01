// Generate colors for new reservations
const colors = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444", "#06B6D4", "#84CC16"]
let colorIndex = 0

class ReservationService {
  constructor() {
    const { ApperClient } = window.ApperSDK
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    })
    this.tableName = 'reservation'
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "guestName" } },
          { field: { Name: "roomId" } },
          { field: { Name: "checkIn" } },
          { field: { Name: "checkOut" } },
          { field: { Name: "guests" } },
          { field: { Name: "status" } },
          { field: { Name: "color" } }
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
        console.error("Error fetching reservations:", error?.response?.data?.message)
      } else {
        console.error("Error fetching reservations:", error.message)
      }
      throw error
    }
  }

  async getById(id) {
    try {
      const numericId = typeof id === 'number' ? id : parseInt(id)
      if (isNaN(numericId)) {
        throw new Error('Reservation ID must be a number')
      }

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "guestName" } },
          { field: { Name: "roomId" } },
          { field: { Name: "checkIn" } },
          { field: { Name: "checkOut" } },
          { field: { Name: "guests" } },
          { field: { Name: "status" } },
          { field: { Name: "color" } }
        ]
      }

      const response = await this.apperClient.getRecordById(this.tableName, numericId, params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }

      return response.data
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching reservation with ID ${id}:`, error?.response?.data?.message)
      } else {
        console.error(`Error fetching reservation with ID ${id}:`, error.message)
      }
      throw error
    }
  }

  async create(reservationData) {
    try {
      // Only include Updateable fields
      const updateableData = {
        Name: reservationData.Name,
        Tags: reservationData.Tags,
        Owner: reservationData.Owner,
        guestName: reservationData.guestName,
        roomId: parseInt(reservationData.roomId),
        checkIn: reservationData.checkIn,
        checkOut: reservationData.checkOut,
        guests: parseInt(reservationData.guests),
        status: reservationData.status || "confirmed",
        color: colors[colorIndex % colors.length]
      }

      colorIndex++

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
          console.error(`Failed to create reservation ${failedRecords.length} records:${JSON.stringify(failedRecords)}`)
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
        console.error("Error creating reservation:", error?.response?.data?.message)
      } else {
        console.error("Error creating reservation:", error.message)
      }
      throw error
    }
  }

  async update(id, reservationData) {
    try {
      const numericId = typeof id === 'number' ? id : parseInt(id)
      if (isNaN(numericId)) {
        throw new Error('Reservation ID must be a number')
      }

      // Only include Updateable fields
      const updateableData = {
        Id: numericId,
        ...(reservationData.Name !== undefined && { Name: reservationData.Name }),
        ...(reservationData.Tags !== undefined && { Tags: reservationData.Tags }),
        ...(reservationData.Owner !== undefined && { Owner: reservationData.Owner }),
        ...(reservationData.guestName !== undefined && { guestName: reservationData.guestName }),
        ...(reservationData.roomId !== undefined && { roomId: parseInt(reservationData.roomId) }),
        ...(reservationData.checkIn !== undefined && { checkIn: reservationData.checkIn }),
        ...(reservationData.checkOut !== undefined && { checkOut: reservationData.checkOut }),
        ...(reservationData.guests !== undefined && { guests: parseInt(reservationData.guests) }),
        ...(reservationData.status !== undefined && { status: reservationData.status }),
        ...(reservationData.color !== undefined && { color: reservationData.color })
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
          console.error(`Failed to update reservation ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`)
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
        console.error("Error updating reservation:", error?.response?.data?.message)
      } else {
        console.error("Error updating reservation:", error.message)
      }
      throw error
    }
  }

  async delete(id) {
    try {
      const numericId = typeof id === 'number' ? id : parseInt(id)
      if (isNaN(numericId)) {
        throw new Error('Reservation ID must be a number')
      }

      const params = {
        RecordIds: [numericId]
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
          console.error(`Failed to delete reservation ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`)
        }
        
        return successfulDeletions.length > 0
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting reservation:", error?.response?.data?.message)
      } else {
        console.error("Error deleting reservation:", error.message)
      }
      throw error
    }
  }

  async getByDateRange(startDate, endDate) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "guestName" } },
          { field: { Name: "roomId" } },
          { field: { Name: "checkIn" } },
          { field: { Name: "checkOut" } },
          { field: { Name: "guests" } },
          { field: { Name: "status" } },
          { field: { Name: "color" } }
        ],
        where: [
          {
            FieldName: "checkIn",
            Operator: "LessThanOrEqualTo",
            Values: [endDate]
          },
          {
            FieldName: "checkOut", 
            Operator: "GreaterThanOrEqualTo",
            Values: [startDate]
          }
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
        console.error("Error fetching reservations by date range:", error?.response?.data?.message)
      } else {
        console.error("Error fetching reservations by date range:", error.message)
      }
      throw error
    }
  }

  async getTodayArrivals() {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "guestName" } },
          { field: { Name: "roomId" } },
          { field: { Name: "checkIn" } },
          { field: { Name: "checkOut" } },
          { field: { Name: "guests" } },
          { field: { Name: "status" } },
          { field: { Name: "color" } }
        ],
        where: [
          {
            FieldName: "checkIn",
            Operator: "EqualTo",
            Values: [today]
          }
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
        console.error("Error fetching today's arrivals:", error?.response?.data?.message)
      } else {
        console.error("Error fetching today's arrivals:", error.message)
      }
      throw error
    }
  }

  async getTodayDepartures() {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "guestName" } },
          { field: { Name: "roomId" } },
          { field: { Name: "checkIn" } },
          { field: { Name: "checkOut" } },
          { field: { Name: "guests" } },
          { field: { Name: "status" } },
          { field: { Name: "color" } }
        ],
        where: [
          {
            FieldName: "checkOut",
            Operator: "EqualTo",
            Values: [today]
          }
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
        console.error("Error fetching today's departures:", error?.response?.data?.message)
      } else {
        console.error("Error fetching today's departures:", error.message)
      }
      throw error
    }
  }
}

const reservationService = new ReservationService()
export { reservationService }