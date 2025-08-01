import { useState } from "react"
import { toast } from "react-toastify"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import StatusBadge from "@/components/molecules/StatusBadge"
import ApperIcon from "@/components/ApperIcon"
import { roomService } from "@/services/api/roomService"

const RoomDetailModal = ({ room, onClose, onStatusUpdate }) => {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  const handleStatusChange = async (newStatus) => {
    setLoading(true)
    try {
const updatedRoom = await roomService.update(room.Id, { status: newStatus })
      onStatusUpdate(updatedRoom)
      toast.success(`Room ${room.number} status updated to ${newStatus}`)
    } catch (error) {
      toast.error("Failed to update room status")
    } finally {
      setLoading(false)
    }
  }

  const statusActions = [
    { status: "vacant", label: "Mark Vacant", icon: "CheckCircle", variant: "secondary" },
    { status: "occupied", label: "Check In", icon: "User", variant: "primary" },
    { status: "cleaning", label: "Send to Cleaning", icon: "Sparkles", variant: "accent" },
    { status: "maintenance", label: "Maintenance Required", icon: "Wrench", variant: "outline" }
  ]

  const getHousekeepingStatusColor = (status) => {
    switch (status) {
      case "ready": return "text-green-600 bg-green-50"
      case "completed": return "text-blue-600 bg-blue-50"
      case "in-progress": return "text-yellow-600 bg-yellow-50"
      case "pending": return "text-gray-600 bg-gray-50"
      default: return "text-gray-600 bg-gray-50"
    }
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: "Home" },
    { id: "amenities", label: "Amenities", icon: "Star" },
    { id: "maintenance", label: "Maintenance", icon: "Wrench" },
    { id: "housekeeping", label: "Housekeeping", icon: "Sparkles" },
    { id: "reservations", label: "Reservations", icon: "Calendar" }
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <Card className="relative w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <div>
            <CardTitle className="text-2xl font-bold">Room {room.number}</CardTitle>
            <p className="text-gray-600">{room.type} • Floor {room.floor}</p>
          </div>
          <Button variant="ghost" onClick={onClose} className="p-2">
            <ApperIcon name="X" className="h-5 w-5" />
          </Button>
        </CardHeader>

        {/* Tab Navigation */}
        <div className="border-b">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 ${
                  activeTab === tab.id
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <ApperIcon name={tab.icon} className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <CardContent className="p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Current Status</span>
                    <StatusBadge status={room.status} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Housekeeping Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getHousekeepingStatusColor(room.housekeepingStatus)}`}>
                      {room.housekeepingStatus}
                    </span>
                  </div>

                  {room.lastMaintenance && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Last Maintenance</span>
                      <span className="text-sm text-gray-800">
                        {new Date(room.lastMaintenance).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">Room Details</p>
                    <div className="text-sm space-y-1">
                      <p><strong>Type:</strong> {room.type}</p>
                      <p><strong>Floor:</strong> {room.floor}</p>
                      {room.rate && <p><strong>Rate:</strong> ${room.rate}/night</p>}
                    </div>
                  </div>
                </div>
              </div>

              {room.status === "occupied" && room.guestName && (
                <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <ApperIcon name="User" className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900">Current Guest</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {room.guestName}</p>
                    {room.checkIn && (
                      <p><strong>Check-in:</strong> {new Date(room.checkIn).toLocaleDateString()}</p>
                    )}
                    {room.checkOut && (
                      <p><strong>Check-out:</strong> {new Date(room.checkOut).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Change Status</h4>
                <div className="grid grid-cols-2 gap-2">
                  {statusActions
                    .filter(action => action.status !== room.status)
                    .map((action) => (
                      <Button
                        key={action.status}
                        variant={action.variant}
                        size="sm"
                        onClick={() => handleStatusChange(action.status)}
                        disabled={loading}
                        className="justify-start gap-2"
                      >
                        <ApperIcon name={action.icon} className="h-4 w-4" />
                        {action.label}
                      </Button>
                    ))
                  }
                </div>
              </div>
            </div>
          )}

          {/* Amenities Tab */}
          {activeTab === "amenities" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Room Amenities</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {room.amenities?.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <ApperIcon name="Check" className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Maintenance Tab */}
          {activeTab === "maintenance" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Maintenance History</h3>
                {room.lastMaintenance && (
                  <span className="text-sm text-gray-600">
                    Last: {new Date(room.lastMaintenance).toLocaleDateString()}
                  </span>
                )}
              </div>
              
              <div className="space-y-3">
                {room.maintenanceHistory?.map((record, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{record.type}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(record.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{record.notes}</p>
                    <p className="text-xs text-gray-500">Technician: {record.technician}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Housekeeping Tab */}
          {activeTab === "housekeeping" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Cleaning Schedule</h3>
              
              {room.cleaningSchedule && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2">Current Status</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getHousekeepingStatusColor(room.housekeepingStatus)}`}>
                        {room.housekeepingStatus}
                      </span>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2">Assigned Housekeeper</h4>
                      <p className="text-sm">{room.cleaningSchedule.assignedHousekeeper}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <ApperIcon name="Clock" className="h-4 w-4 text-gray-600" />
                        <span className="font-medium">Last Cleaned</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {new Date(room.cleaningSchedule.lastCleaned).toLocaleString()}
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <ApperIcon name="Calendar" className="h-4 w-4 text-gray-600" />
                        <span className="font-medium">Next Cleaning</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {new Date(room.cleaningSchedule.nextCleaning).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reservations Tab */}
          {activeTab === "reservations" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Reservations</h3>
              
              {room.status === "occupied" && room.guestName && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <ApperIcon name="User" className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900">Current Reservation</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><strong>Guest:</strong> {room.guestName}</p>
                    {room.checkIn && (
                      <p><strong>Check-in:</strong> {new Date(room.checkIn).toLocaleDateString()}</p>
                    )}
                    {room.checkOut && (
                      <p><strong>Check-out:</strong> {new Date(room.checkOut).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-medium mb-3">Upcoming Reservations</h4>
                {room.upcomingReservations?.length > 0 ? (
                  <div className="space-y-3">
                    {room.upcomingReservations.map((reservation, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{reservation.guestName}</span>
                          <span className="text-xs text-gray-500">
                            {reservation.guests} guest{reservation.guests > 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><strong>Check-in:</strong> {new Date(reservation.checkIn).toLocaleDateString()}</p>
                          <p><strong>Check-out:</strong> {new Date(reservation.checkOut).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No upcoming reservations</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default RoomDetailModal