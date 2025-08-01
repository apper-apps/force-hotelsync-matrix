import { useState, useEffect } from "react"
import RoomGrid from "@/components/organisms/RoomGrid"
import SearchBar from "@/components/molecules/SearchBar"
import Button from "@/components/atoms/Button"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import ApperIcon from "@/components/ApperIcon"
import { roomService } from "@/services/api/roomService"

const Rooms = () => {
  const [rooms, setRooms] = useState([])
  const [filteredRooms, setFilteredRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const loadData = async () => {
    setLoading(true)
    setError("")
    try {
      const roomsData = await roomService.getAll()
      setRooms(roomsData)
      setFilteredRooms(roomsData)
    } catch (err) {
      setError("Failed to load rooms data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    let filtered = rooms

    // Filter by search term
    if (searchTerm) {
filtered = filtered.filter(room =>
        room.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (room.guestName && room.guestName.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(room => room.status === statusFilter)
    }

    setFilteredRooms(filtered)
  }, [rooms, searchTerm, statusFilter])

  const handleRoomUpdate = (updatedRoom) => {
    setRooms(prev => prev.map(room => 
      room.Id === updatedRoom.Id ? updatedRoom : room
    ))
  }

  const statusCounts = {
    all: rooms.length,
    occupied: rooms.filter(room => room.status === "occupied").length,
    vacant: rooms.filter(room => room.status === "vacant").length,
    cleaning: rooms.filter(room => room.status === "cleaning").length,
    maintenance: rooms.filter(room => room.status === "maintenance").length
  }

  const statusFilters = [
    { key: "all", label: "All Rooms", color: "bg-gray-500" },
    { key: "occupied", label: "Occupied", color: "bg-red-500" },
    { key: "vacant", label: "Vacant", color: "bg-green-500" },
    { key: "cleaning", label: "Cleaning", color: "bg-yellow-500" },
    { key: "maintenance", label: "Maintenance", color: "bg-orange-500" }
  ]

  if (loading) return <Loading message="Loading rooms..." />
  if (error) return <Error message={error} onRetry={loadData} />

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-display bg-gradient-to-r from-navy-600 to-navy-800 bg-clip-text text-transparent mb-2">
          Room Management
        </h1>
        <p className="text-gray-600">Manage all hotel rooms and their current status</p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between">
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((filter) => (
            <Button
              key={filter.key}
              variant={statusFilter === filter.key ? "primary" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(filter.key)}
              className="gap-2"
            >
              <div className={`h-3 w-3 rounded-full ${filter.color}`} />
              {filter.label}
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                {statusCounts[filter.key]}
              </span>
            </Button>
          ))}
        </div>

        <div className="flex gap-4">
          <SearchBar
            placeholder="Search rooms, guests, or types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full lg:w-80"
          />
          <Button variant="accent" className="gap-2 whitespace-nowrap">
            <ApperIcon name="Plus" className="h-4 w-4" />
            Add Room
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statusFilters.map((filter) => (
          <div
            key={filter.key}
            className="bg-white/80 backdrop-blur-sm p-4 rounded-lg border border-white/20 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className={`h-4 w-4 rounded-full ${filter.color}`} />
              <div>
                <p className="text-2xl font-bold font-display text-navy-700 number-transition">
                  {statusCounts[filter.key]}
                </p>
                <p className="text-xs text-gray-600 uppercase tracking-wide">
                  {filter.label}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Room Grid */}
      {filteredRooms.length > 0 ? (
        <RoomGrid rooms={filteredRooms} onRoomUpdate={handleRoomUpdate} />
      ) : (
        <Empty
          title="No rooms found"
          description="No rooms match your current search and filter criteria."
          icon="Bed"
          action={() => {
            setSearchTerm("")
            setStatusFilter("all")
          }}
          actionLabel="Clear Filters"
        />
      )}
    </div>
  )
}

export default Rooms