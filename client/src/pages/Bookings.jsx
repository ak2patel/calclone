import { useState, useEffect } from 'react';
import api from '../api/axios';
import { format } from 'date-fns';
import { Calendar, Clock, XCircle } from 'lucide-react';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings');
      setBookings(res.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.delete(`/bookings/${id}`);
      fetchBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bookings</h2>
        <p className="text-gray-500 dark:text-gray-400">View and manage your scheduled events.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        {bookings.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No bookings found.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {bookings.map((booking) => (
              <li key={booking.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full mr-3 ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {booking.status.toUpperCase()}
                      </span>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{booking.event_title}</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {format(new Date(booking.start_time), 'EEEE, MMMM d, yyyy')}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        {format(new Date(booking.start_time), 'h:mm a')} - {format(new Date(booking.end_time), 'h:mm a')}
                      </div>
                      <div className="col-span-1 md:col-span-2 flex flex-col md:flex-row md:items-center">
                        <span className="font-medium text-gray-900 dark:text-white">{booking.booker_name}</span>
                        <span className="hidden md:inline mx-2">•</span>
                        <span className="text-xs md:text-sm">{booking.booker_email}</span>
                      </div>
                    </div>
                  </div>
                  
                  {booking.status === 'confirmed' && (
                    <div className="flex justify-end md:block">
                      <button
                        onClick={() => handleCancel(booking.id)}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Cancel Booking"
                      >
                        <XCircle className="w-6 h-6" />
                        <span className="md:hidden ml-2 text-sm font-medium">Cancel Booking</span>
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Bookings;
