import { useState, useEffect } from "react"
import MetricCard from "@/components/molecules/MetricCard"
import RoomGrid from "@/components/organisms/RoomGrid"
import StatusLegend from "@/components/molecules/StatusLegend"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import { roomService } from "@/services/api/roomService"

const Dashboard = () => {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadData = async () => {
    setLoading(true)
    setError("")
    try {
      const roomsData = await roomService.getAll()
      setRooms(roomsData)
    } catch (err) {
      setError("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
loadData()
    
    // Listen for housekeeping task completion events
    const handleHousekeepingTaskCompleted = () => {
      loadData()
    }
    
    window.addEventListener('housekeepingTaskCompleted', handleHousekeepingTaskCompleted)
    
    return () => {
      window.removeEventListener('housekeepingTaskCompleted', handleHousekeepingTaskCompleted)
    }
  }, [])
  const handleRoomUpdate = (updatedRoom) => {
    setRooms(prev => prev.map(room => 
      room.Id === updatedRoom.Id ? updatedRoom : room
    ))
  }

  if (loading) return <Loading message="Loading dashboard..." />
  if (error) return <Error message={error} onRetry={loadData} />

  const occupiedRooms = rooms.filter(room => room.status === "occupied").length
  const vacantRooms = rooms.filter(room => room.status === "vacant").length
  const cleaningRooms = rooms.filter(room => room.status === "cleaning").length
  const maintenanceRooms = rooms.filter(room => room.status === "maintenance").length
  
  const occupancyRate = rooms.length > 0 ? Math.round((occupiedRooms / rooms.length) * 100) : 0
  const todayRevenue = rooms
    .filter(room => room.status === "occupied" && room.rate)
    .reduce((sum, room) => sum + room.rate, 0)
  
const todayCheckouts = rooms.filter(room => 
    room.status === "occupied" && 
    room.checkOut &&
    new Date(room.checkOut).toDateString() === new Date().toDateString()
  ).length

  const todayArrivals = 8 // Mock data for arrivals

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-display bg-gradient-to-r from-navy-600 to-navy-800 bg-clip-text text-transparent mb-2">
          Dashboard Overview
        </h1>
        <p className="text-gray-600">Real-time hotel operations and room status monitoring</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Occupancy Rate"
          value={`${occupancyRate}%`}
          icon="TrendingUp"
          change="+2.5% from yesterday"
          changeType="positive"
          gradient="blue"
        />
        <MetricCard
          title="Today's Revenue"
          value={`$${todayRevenue.toLocaleString()}`}
          icon="DollarSign"
          change="+$1,240 from yesterday"
          changeType="positive"
          gradient="green"
        />
        <MetricCard
          title="Checkouts Today"
          value={todayCheckouts.toString()}
          icon="LogOut"
          change="3 completed"
          changeType="neutral"
          gradient="amber"
        />
        <MetricCard
          title="Arrivals Today"
          value={todayArrivals.toString()}
          icon="LogIn"
          change="5 expected"
          changeType="positive"
          gradient="blue"
        />
      </div>

<div className="space-y-8">
        {/* Room Status Overview - Full Width */}
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold font-display text-navy-700">Room Status Overview</h2>
              <p className="text-gray-600">Click any room for details and quick actions</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 lg:gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500 flex-shrink-0"></div>
                <span className="whitespace-nowrap">Occupied ({occupiedRooms})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500 flex-shrink-0"></div>
                <span className="whitespace-nowrap">Vacant ({vacantRooms})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-yellow-500 flex-shrink-0"></div>
                <span className="whitespace-nowrap">Cleaning ({cleaningRooms})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-orange-500 flex-shrink-0"></div>
                <span className="whitespace-nowrap">Maintenance ({maintenanceRooms})</span>
              </div>
            </div>
          </div>
          
          <RoomGrid rooms={rooms} onRoomUpdate={handleRoomUpdate} />
        </div>

        {/* Bottom Section - Status Legend and Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <StatusLegend />
          
          <div className="bg-gradient-to-br from-navy-50 to-blue-50 p-6 rounded-xl border border-navy-100">
            <h3 className="font-semibold text-navy-700 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Rooms</span>
                <span className="font-semibold">{rooms.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Available Tonight</span>
                <span className="font-semibold text-green-600">{vacantRooms}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Needs Attention</span>
                <span className="font-semibold text-orange-600">{cleaningRooms + maintenanceRooms}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard