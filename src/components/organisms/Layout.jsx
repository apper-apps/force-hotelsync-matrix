import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { roomService } from "@/services/api/roomService";
import Sidebar from "@/components/organisms/Sidebar";
import Header from "@/components/organisms/Header";

const Layout = () => {
const [sidebarOpen, setSidebarOpen] = useState(false)
  const [occupancyData, setOccupancyData] = useState({ occupied: 0, total: 0 })

  useEffect(() => {
    const loadOccupancyData = async () => {
try {
        const rooms = await roomService.getAll()
        const occupiedCount = rooms.filter(room => room.status === "occupied").length
        setOccupancyData({ occupied: occupiedCount, total: rooms.length })
      } catch (error) {
        console.error("Failed to load occupancy data:", error)
      }
    }

loadOccupancyData()
    
    // Listen for guest status changes to refresh room data
    const handleGuestStatusChange = () => {
      loadOccupancyData()
    }
    
    // Listen for housekeeping task completion events
    const handleHousekeepingTaskCompleted = () => {
      loadOccupancyData()
    }
    
    window.addEventListener('guestStatusChanged', handleGuestStatusChange)
    window.addEventListener('housekeepingTaskCompleted', handleHousekeepingTaskCompleted)
    
    // Refresh occupancy data every 30 seconds
    const interval = setInterval(loadOccupancyData, 30000)
    return () => {
      clearInterval(interval)
      window.removeEventListener('guestStatusChanged', handleGuestStatusChange)
      window.removeEventListener('housekeepingTaskCompleted', handleHousekeepingTaskCompleted)
    }
  }, [])
  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50">
<Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          onMenuClick={() => setSidebarOpen(true)}
          occupiedRooms={occupancyData.occupied}
          totalRooms={occupancyData.total}
        />
        
        <main className="flex-1 overflow-auto p-6">
<Outlet />
        </main>
      </div>
    </div>
  )
}
export default Layout