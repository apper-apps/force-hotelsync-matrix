import { Card, CardContent } from "@/components/atoms/Card"
import StatusBadge from "@/components/molecules/StatusBadge"
import ApperIcon from "@/components/ApperIcon"

const RoomCard = ({ room, onClick }) => {
  const statusColors = {
    occupied: "border-l-red-500 bg-red-50/50",
    vacant: "border-l-green-500 bg-green-50/50", 
    cleaning: "border-l-yellow-500 bg-yellow-50/50",
    maintenance: "border-l-orange-500 bg-orange-50/50"
  }

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-l-4 ${statusColors[room.status]} group`}
      onClick={() => onClick(room)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
<h3 className="font-display text-lg font-bold text-navy-700">{room.number}</h3>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {room.type}
            </span>
          </div>
          <StatusBadge status={room.status} showIcon={false} />
        </div>
        
        {room.status === "occupied" && room.guestName && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <ApperIcon name="User" className="w-4 h-4" />
              <span className="font-medium">{room.guestName}</span>
            </div>
            {room.checkOut && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <ApperIcon name="Clock" className="w-4 h-4" />
                <span>Checkout: {new Date(room.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            )}
          </div>
        )}
        
        {room.status === "vacant" && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <ApperIcon name="CheckCircle" className="w-4 h-4" />
            <span className="font-medium">Ready for guest</span>
          </div>
        )}
        
        {room.status === "cleaning" && (
          <div className="flex items-center gap-2 text-sm text-yellow-600">
            <ApperIcon name="Sparkles" className="w-4 h-4" />
            <span className="font-medium">Housekeeping in progress</span>
          </div>
        )}
        
        {room.status === "maintenance" && (
          <div className="flex items-center gap-2 text-sm text-orange-600">
            <ApperIcon name="Wrench" className="w-4 h-4" />
            <span className="font-medium">Under maintenance</span>
          </div>
        )}
        
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-500">Floor {room.floor}</span>
          {room.rate && (
            <span className="text-sm font-semibold text-navy-600">${room.rate}/night</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default RoomCard