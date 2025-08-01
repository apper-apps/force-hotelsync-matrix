import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths, isSameDay } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card'
import Button from '@/components/atoms/Button'
import ApperIcon from '@/components/ApperIcon'
import { reservationService } from '@/services/api/reservationService'
import { roomService } from '@/services/api/roomService';
import ReservationModal from '@/components/organisms/ReservationModal';
import { toast } from 'react-toastify';

const CalendarReservation = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reservations, setReservations] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [todayArrivals, setTodayArrivals] = useState([]);
  const [todayDepartures, setTodayDepartures] = useState([]);

  useEffect(() => {
    loadData();
  }, [currentDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      
      const [reservationsData, roomsData, arrivals, departures] = await Promise.all([
        reservationService.getByDateRange(monthStart.toISOString().split('T')[0], monthEnd.toISOString().split('T')[0]),
        roomService.getAll(),
        reservationService.getTodayArrivals(),
        reservationService.getTodayDepartures()
      ]);
      
      setReservations(reservationsData);
      setRooms(roomsData);
      setTodayArrivals(arrivals);
      setTodayDepartures(departures);
    } catch (error) {
      console.error('Error loading calendar data:', error);
      toast.error('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleReservationClick = (reservation) => {
    setSelectedReservation(reservation);
    setIsModalOpen(true);
  };

  const handleAddReservation = () => {
    setSelectedReservation(null);
    setIsModalOpen(true);
  };

  const handleModalSave = async (reservationData) => {
    try {
      if (selectedReservation) {
        await reservationService.update(selectedReservation.Id, reservationData);
        toast.success('Reservation updated successfully');
      } else {
        await reservationService.create(reservationData);
        toast.success('Reservation created successfully');
      }
      setIsModalOpen(false);
      setSelectedReservation(null);
      loadData();
    } catch (error) {
      console.error('Error saving reservation:', error);
      toast.error('Failed to save reservation');
    }
  };

  const handleModalDelete = async (reservationId) => {
    try {
      await reservationService.delete(reservationId);
      toast.success('Reservation deleted successfully');
      setIsModalOpen(false);
      setSelectedReservation(null);
      loadData();
    } catch (error) {
      console.error('Error deleting reservation:', error);
      toast.error('Failed to delete reservation');
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getReservationsForDate = (date) => {
    return reservations.filter(reservation => {
      const checkIn = new Date(reservation.checkIn);
      const checkOut = new Date(reservation.checkOut);
      return date >= checkIn && date < checkOut;
    });
  };

  const getReservationPosition = (reservation, date) => {
    const checkIn = new Date(reservation.checkIn);
    const checkOut = new Date(reservation.checkOut);
    const isStart = isSameDay(date, checkIn);
    const isEnd = isSameDay(date, new Date(checkOut.getTime() - 24 * 60 * 60 * 1000));
    
    return {
      isStart,
      isEnd,
      isMiddle: !isStart && !isEnd
    };
  };

  const getRoomNumber = (roomId) => {
const room = rooms.find(r => r.Id === roomId)
    return room ? room.number : roomId
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-96">
            <CardContent className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card className="h-96">
            <CardContent className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ApperIcon name="Calendar" className="h-5 w-5" />
                Reservation Calendar
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousMonth}
                  className="h-8 w-8 p-0"
                >
                  <ApperIcon name="ChevronLeft" className="h-4 w-4" />
                </Button>
                <span className="text-lg font-semibold min-w-[140px] text-center">
                  {format(currentDate, 'MMMM yyyy')}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextMonth}
                  className="h-8 w-8 p-0"
                >
                  <ApperIcon name="ChevronRight" className="h-4 w-4" />
                </Button>
              </div>
              <Button onClick={handleAddReservation} size="sm">
                <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
                Add Reservation
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-600 border-b">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map(date => {
                const dayReservations = getReservationsForDate(date);
                const isCurrentMonth = isSameMonth(date, currentDate);
                const isTodayDate = isToday(date);
                
                return (
                  <div
                    key={date.toISOString()}
                    className={`min-h-[80px] p-1 border border-gray-200 relative ${
                      !isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'
                    } ${isTodayDate ? 'bg-blue-50 border-blue-300' : ''}`}
                  >
                    <div className={`text-sm font-medium mb-1 ${isTodayDate ? 'text-blue-600' : ''}`}>
                      {format(date, 'd')}
                    </div>
                    
                    <div className="space-y-1">
                      {dayReservations.map(reservation => {
                        const position = getReservationPosition(reservation, date);
                        return (
                          <div
                            key={`${reservation.Id}-${date.toISOString()}`}
                            onClick={() => handleReservationClick(reservation)}
                            className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity ${
                              position.isStart ? 'rounded-l' : ''
                            } ${position.isEnd ? 'rounded-r' : ''} ${
                              position.isMiddle ? 'rounded-none' : ''
                            }`}
                            style={{ backgroundColor: reservation.color, color: 'white' }}
                            title={`${reservation.guestName} - Room ${getRoomNumber(reservation.roomId)}`}
                          >
                            {position.isStart && (
                              <div className="truncate font-medium">
                                {reservation.guestName}
                              </div>
                            )}
                            {position.isStart && (
                              <div className="truncate">
                                Room {getRoomNumber(reservation.roomId)}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ApperIcon name="Clock" className="h-5 w-5" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Arrivals */}
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <ApperIcon name="LogIn" className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-900">
                  Check-ins ({todayArrivals.length})
                </span>
              </div>
              {todayArrivals.length > 0 ? (
                <div className="space-y-2">
                  {todayArrivals.map(arrival => (
                    <div key={arrival.Id} className="text-sm text-green-700">
                      <div className="font-medium">{arrival.guestName}</div>
                      <div>Room {getRoomNumber(arrival.roomId)} • {arrival.guests} guests</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-green-700">No arrivals scheduled</p>
              )}
            </div>
            
            {/* Departures */}
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <ApperIcon name="LogOut" className="h-4 w-4 text-amber-600" />
                <span className="font-medium text-amber-900">
                  Check-outs ({todayDepartures.length})
                </span>
              </div>
              {todayDepartures.length > 0 ? (
                <div className="space-y-2">
                  {todayDepartures.map(departure => (
                    <div key={departure.Id} className="text-sm text-amber-700">
                      <div className="font-medium">{departure.guestName}</div>
                      <div>Room {getRoomNumber(departure.roomId)} • {departure.guests} guests</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-amber-700">No departures scheduled</p>
              )}
            </div>
            
            {/* Summary */}
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <ApperIcon name="BarChart3" className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">Monthly Summary</span>
              </div>
              <div className="text-sm text-blue-700">
                <div>Total Reservations: {reservations.length}</div>
                <div>Occupancy Rate: {Math.round((reservations.length / (rooms.length * calendarDays.length)) * 100)}%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reservation Modal */}
      {isModalOpen && (
        <ReservationModal
          reservation={selectedReservation}
          rooms={rooms}
          onSave={handleModalSave}
          onDelete={handleModalDelete}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedReservation(null);
          }}
        />
      )}
    </div>
  );
};

export default CalendarReservation;