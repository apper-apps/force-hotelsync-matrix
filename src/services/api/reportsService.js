import { reservationService } from './reservationService';
import { roomService } from './roomService';

// Mock historical revenue data for the past 30 days
const generateRevenueHistory = () => {
  const data = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Generate realistic revenue data with some variation
    const baseRevenue = 12000 + Math.random() * 8000;
    const weekendMultiplier = (date.getDay() === 5 || date.getDay() === 6) ? 1.3 : 1;
    const revenue = Math.round(baseRevenue * weekendMultiplier);
    
    data.push({
      date: date.toISOString().split('T')[0],
      revenue: revenue,
      formattedDate: date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    });
  }
  
  return data;
};

const revenueHistory = generateRevenueHistory();

class ReportsService {
  async getMetrics() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      const [reservations, rooms] = await Promise.all([
        reservationService.getAll(),
        roomService.getAll()
      ]);
      
      const today = new Date().toISOString().split('T')[0];
      const todayReservations = reservations.filter(r => 
        r.checkIn <= today && r.checkOut > today && r.status === 'confirmed'
      );
      
      const totalRooms = rooms.length;
      const occupiedRooms = todayReservations.length;
      const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms * 100) : 0;
      
      // Calculate today's revenue (realistic hotel pricing)
const todayRevenue = todayReservations.reduce((total, reservation) => {
        const room = rooms.find(r => r.Id === reservation.roomId)
        const baseRate = room ? (room.type === 'Suite' ? 350 : room.type === 'Deluxe' ? 250 : 180) : 200
        return total + baseRate
      }, 0)
      
      // Calculate ADR (Average Daily Rate)
      const adr = occupiedRooms > 0 ? todayRevenue / occupiedRooms : 0;
      
      // Calculate RevPAR (Revenue Per Available Room)
      const revpar = totalRooms > 0 ? todayRevenue / totalRooms : 0;
      
      return {
        todayRevenue,
        occupancyRate: Math.round(occupancyRate * 10) / 10,
        adr: Math.round(adr * 100) / 100,
        revpar: Math.round(revpar * 100) / 100,
        occupiedRooms,
        totalRooms
      };
    } catch (error) {
      throw new Error('Failed to fetch metrics data');
    }
  }
  
  async getRevenueHistory() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return revenueHistory;
  }
  
  async getRevenueComparison() {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const currentMonthRevenue = revenueHistory.slice(-30).reduce((sum, day) => sum + day.revenue, 0);
    const lastMonthRevenue = currentMonthRevenue * (0.85 + Math.random() * 0.3); // Simulate previous month
    
    const change = ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
    
    return {
      current: currentMonthRevenue,
      previous: Math.round(lastMonthRevenue),
      changePercent: Math.round(change * 10) / 10
    };
  }
}

export const reportsService = new ReportsService();