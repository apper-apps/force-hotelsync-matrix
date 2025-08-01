import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card"
import SearchBar from "@/components/molecules/SearchBar"
import Button from "@/components/atoms/Button"
import ApperIcon from "@/components/ApperIcon"
import { guestService } from "@/services/api/guestService"
import { toast } from "react-toastify"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"

const Guests = () => {
  const [guests, setGuests] = useState([])
  const [filteredGuests, setFilteredGuests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [processingIds, setProcessingIds] = useState(new Set())

  const loadGuests = async () => {
    try {
      setLoading(true)
      setError(null)
      const guestData = await guestService.getAll()
      setGuests(guestData)
      setFilteredGuests(guestData)
    } catch (err) {
      setError("Failed to load guests")
      console.error("Error loading guests:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGuests()
  }, [])

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredGuests(guests)
    } else {
const filtered = guests.filter(guest =>
        guest.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.roomNumber?.includes(searchTerm) ||
        guest.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredGuests(filtered)
    }
  }, [searchTerm, guests])

  const handleCheckIn = async (guestId) => {
    try {
      setProcessingIds(prev => new Set(prev).add(guestId))
      await guestService.checkIn(guestId)
      await loadGuests()
      toast.success("Guest checked in successfully")
    } catch (err) {
      toast.error("Failed to check in guest")
      console.error("Error checking in guest:", err)
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(guestId)
        return newSet
      })
    }
  }

  const handleCheckOut = async (guestId) => {
    try {
      setProcessingIds(prev => new Set(prev).add(guestId))
      await guestService.checkOut(guestId)
      await loadGuests()
      toast.success("Guest checked out successfully")
    } catch (err) {
      toast.error("Failed to check out guest")
      console.error("Error checking out guest:", err)
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(guestId)
        return newSet
      })
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      "checked-in": {
        bg: "bg-green-100",
        text: "text-green-800",
        dot: "bg-green-500",
        label: "Checked In"
      },
      "checked-out": {
        bg: "bg-gray-100",
        text: "text-gray-800",
        dot: "bg-gray-500",
        label: "Checked Out"
      },
      "no-show": {
        bg: "bg-red-100",
        text: "text-red-800",
        dot: "bg-red-500",
        label: "No Show"
      }
    }

    const config = statusConfig[status] || statusConfig["no-show"]

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <div className={`h-2 w-2 rounded-full ${config.dot} mr-1`} />
        {config.label}
      </span>
    )
  }

  const checkedInGuests = guests.filter(guest => guest.status === "checked-in")
  const todayDepartures = guests.filter(guest => {
    const today = new Date().toISOString().split('T')[0]
    return guest.checkOutDate === today && guest.status === "checked-in"
  })

const vipGuests = guests.filter(guest => guest.vip === "true")
  const guestsWithRequests = guests.filter(guest => guest.specialRequests && guest.specialRequests.length > 0)

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadGuests} />

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-display bg-gradient-to-r from-navy-600 to-navy-800 bg-clip-text text-transparent mb-2">
          Guest Directory
        </h1>
        <p className="text-gray-600">Manage guest information and check-in status</p>
      </div>

      {/* Guest Count Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <ApperIcon name="Users" className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Checked In</p>
                <p className="text-2xl font-bold text-blue-600 number-transition">
                  {checkedInGuests.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <ApperIcon name="Calendar" className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Departures Today</p>
                <p className="text-2xl font-bold text-orange-600 number-transition">
                  {todayDepartures.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-lg">
                <ApperIcon name="Star" className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">VIP Guests</p>
                <p className="text-2xl font-bold text-amber-600 number-transition">
                  {vipGuests.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <ApperIcon name="MessageSquare" className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Special Requests</p>
                <p className="text-2xl font-bold text-green-600 number-transition">
                  {guestsWithRequests.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between">
        <SearchBar
          placeholder="Search guests by name or room number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full lg:w-96"
        />
        <div className="flex gap-2">
          <Button variant="secondary" className="gap-2">
            <ApperIcon name="Filter" className="h-4 w-4" />
            Filter
          </Button>
          <Button variant="accent" className="gap-2">
            <ApperIcon name="UserPlus" className="h-4 w-4" />
            Add Guest
          </Button>
        </div>
      </div>

      {/* Guest Table */}
      <Card>
        <CardHeader>
          <CardTitle>Guest Directory ({filteredGuests.length} guests)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Guest Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Room Number</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Check-in Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Check-out Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGuests.map((guest) => (
                  <tr key={guest.Id} className="border-b border-gray-100 hover:bg-gray-50">
<td className="py-3 px-4">
                       <div className="flex items-center gap-2">
                         <span className="font-medium">{guest.Name}</span>
                         {guest.vip === "true" && (
                           <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                             <ApperIcon name="Star" className="h-3 w-3 mr-1" />
                             VIP
                           </span>
                         )}
                       </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-navy-600">{guest.roomNumber}</td>
                    <td className="py-3 px-4 text-gray-600">{guest.checkInDate}</td>
                    <td className="py-3 px-4 text-gray-600">{guest.checkOutDate}</td>
                    <td className="py-3 px-4">
                      {getStatusBadge(guest.status)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        {guest.status === "checked-out" && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleCheckIn(guest.Id)}
                            disabled={processingIds.has(guest.Id)}
                            className="gap-1 text-xs"
                          >
                            {processingIds.has(guest.Id) ? (
                              <ApperIcon name="Loader2" className="h-3 w-3 animate-spin" />
                            ) : (
                              <ApperIcon name="LogIn" className="h-3 w-3" />
                            )}
                            Check In
                          </Button>
                        )}
                        {guest.status === "checked-in" && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleCheckOut(guest.Id)}
                            disabled={processingIds.has(guest.Id)}
                            className="gap-1 text-xs"
                          >
                            {processingIds.has(guest.Id) ? (
                              <ApperIcon name="Loader2" className="h-3 w-3 animate-spin" />
                            ) : (
                              <ApperIcon name="LogOut" className="h-3 w-3" />
                            )}
                            Check Out
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <ApperIcon name="Eye" className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <ApperIcon name="MessageSquare" className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Guests