import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Label from '@/components/atoms/Label';
import ApperIcon from '@/components/ApperIcon';
import { format, addDays } from 'date-fns';

const ReservationModal = ({ reservation, rooms, onSave, onDelete, onClose }) => {
  const [formData, setFormData] = useState({
    guestName: '',
    roomId: '',
    checkIn: '',
    checkOut: '',
    guests: 1
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (reservation) {
      setFormData({
        guestName: reservation.guestName || '',
        roomId: reservation.roomId || '',
        checkIn: reservation.checkIn || '',
        checkOut: reservation.checkOut || '',
        guests: reservation.guests || 1
      });
    } else {
      // Set default dates for new reservations
      const today = new Date();
      const tomorrow = addDays(today, 1);
      setFormData({
        guestName: '',
        roomId: '',
        checkIn: format(today, 'yyyy-MM-dd'),
        checkOut: format(tomorrow, 'yyyy-MM-dd'),
        guests: 1
      });
    }
  }, [reservation]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.guestName.trim()) {
      newErrors.guestName = 'Guest name is required';
    }

    if (!formData.roomId) {
      newErrors.roomId = 'Room selection is required';
    }

    if (!formData.checkIn) {
      newErrors.checkIn = 'Check-in date is required';
    }

    if (!formData.checkOut) {
      newErrors.checkOut = 'Check-out date is required';
    }

    if (formData.checkIn && formData.checkOut) {
      const checkInDate = new Date(formData.checkIn);
      const checkOutDate = new Date(formData.checkOut);
      
      if (checkOutDate <= checkInDate) {
        newErrors.checkOut = 'Check-out date must be after check-in date';
      }
    }

    if (!formData.guests || formData.guests < 1) {
      newErrors.guests = 'Number of guests must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSave({
        ...formData,
        roomId: parseInt(formData.roomId),
        guests: parseInt(formData.guests)
      });
    } catch (error) {
      console.error('Error saving reservation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!reservation || !window.confirm('Are you sure you want to delete this reservation?')) {
      return;
    }

    setLoading(true);
    try {
      await onDelete(reservation.Id);
    } catch (error) {
      console.error('Error deleting reservation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const selectedRoom = rooms.find(room => room.Id === parseInt(formData.roomId));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ApperIcon name="Calendar" className="h-5 w-5" />
              {reservation ? 'Edit Reservation' : 'Add Reservation'}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <ApperIcon name="X" className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Guest Name */}
            <div className="space-y-2">
              <Label htmlFor="guestName">Guest Name</Label>
              <Input
                id="guestName"
                type="text"
                value={formData.guestName}
                onChange={(e) => handleInputChange('guestName', e.target.value)}
                placeholder="Enter guest name"
                className={errors.guestName ? 'border-red-500' : ''}
              />
              {errors.guestName && (
                <p className="text-sm text-red-600">{errors.guestName}</p>
              )}
            </div>

            {/* Room Selection */}
            <div className="space-y-2">
              <Label htmlFor="roomId">Room</Label>
              <select
                id="roomId"
                value={formData.roomId}
                onChange={(e) => handleInputChange('roomId', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.roomId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a room</option>
                {rooms.map(room => (
<option key={room.Id} value={room.Id}>
                    Room {room.number} - {room.type} (${room.rate}/night)
                  </option>
                ))}
              </select>
              {errors.roomId && (
                <p className="text-sm text-red-600">{errors.roomId}</p>
              )}
              {selectedRoom && (
                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
<div className="font-medium">Room {selectedRoom.number}</div>
                  <div>{selectedRoom.type} • ${selectedRoom.rate}/night</div>
                  <div>Floor: {selectedRoom.floor}</div>
                </div>
              )}
            </div>

            {/* Check-in Date */}
            <div className="space-y-2">
              <Label htmlFor="checkIn">Check-in Date</Label>
              <Input
                id="checkIn"
                type="date"
                value={formData.checkIn}
                onChange={(e) => handleInputChange('checkIn', e.target.value)}
                className={errors.checkIn ? 'border-red-500' : ''}
              />
              {errors.checkIn && (
                <p className="text-sm text-red-600">{errors.checkIn}</p>
              )}
            </div>

            {/* Check-out Date */}
            <div className="space-y-2">
              <Label htmlFor="checkOut">Check-out Date</Label>
              <Input
                id="checkOut"
                type="date"
                value={formData.checkOut}
                onChange={(e) => handleInputChange('checkOut', e.target.value)}
                className={errors.checkOut ? 'border-red-500' : ''}
              />
              {errors.checkOut && (
                <p className="text-sm text-red-600">{errors.checkOut}</p>
              )}
            </div>

            {/* Number of Guests */}
            <div className="space-y-2">
              <Label htmlFor="guests">Number of Guests</Label>
              <Input
                id="guests"
                type="number"
min="1"
                max="10"
                value={formData.guests}
                onChange={(e) => handleInputChange('guests', e.target.value)}
                className={errors.guests ? 'border-red-500' : ''}
              />
              {errors.guests && (
                <p className="text-sm text-red-600">{errors.guests}</p>
              )}
{selectedRoom && formData.guests > 10 && (
                <p className="text-sm text-amber-600">
                  Warning: Exceeds maximum capacity (10)
                </p>
              )}
            </div>

            {/* Stay Summary */}
            {formData.checkIn && formData.checkOut && selectedRoom && (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="text-sm text-blue-900">
                  <div className="font-medium mb-1">Reservation Summary</div>
                  <div>
                    {format(new Date(formData.checkIn), 'MMM dd')} - {format(new Date(formData.checkOut), 'MMM dd, yyyy')}
                  </div>
                  <div>
                    {Math.ceil((new Date(formData.checkOut) - new Date(formData.checkIn)) / (1000 * 60 * 60 * 24))} nights
<div>
                    {Math.ceil((new Date(formData.checkOut) - new Date(formData.checkIn)) / (1000 * 60 * 60 * 24))} nights
                  </div>
                  <div className="font-medium mt-1">
                    Total: ${(Math.ceil((new Date(formData.checkOut) - new Date(formData.checkIn)) / (1000 * 60 * 60 * 24)) * selectedRoom.rate).toLocaleString()}
                  </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </div>
                ) : (
                  <>
                    <ApperIcon name="Save" className="h-4 w-4 mr-2" />
                    {reservation ? 'Update' : 'Create'} Reservation
                  </>
                )}
              </Button>
              
              {reservation && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDelete}
                  disabled={loading}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <ApperIcon name="Trash2" className="h-4 w-4" />
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReservationModal;