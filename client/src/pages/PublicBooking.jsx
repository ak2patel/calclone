import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { format, addDays, startOfDay, isSameDay, parseISO, addMinutes } from 'date-fns';
import { Calendar as CalendarIcon, Clock, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const PublicBooking = () => {
  const { slug } = useParams();
  const [eventType, setEventType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Booking State
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [hostTimezone, setHostTimezone] = useState('UTC');
  const [bookingForm, setBookingForm] = useState({ name: '', email: '' });
  const [bookingStatus, setBookingStatus] = useState('idle'); // idle, submitting, success, error

  // Calendar State (simple implementation)
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchEventType();
  }, [slug]);

  useEffect(() => {
    if (selectedDate && eventType) {
      generateTimeSlots(selectedDate);
    }
  }, [selectedDate, eventType]);

  const fetchEventType = async () => {
    try {
      const res = await api.get(`/event-types/${slug}`);
      setEventType(res.data);
    } catch (error) {
      setError('Event type not found');
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = async (date) => {
    // In a real app, we'd fetch availability from backend for this specific date
    // For this clone, we'll fetch general availability and generate slots client-side
    // checking against existing bookings would also happen here or on backend
    try {
      const availRes = await api.get('/availability');
      const { schedule: availability, timezone } = availRes.data;
      
      const dayName = format(date, 'EEEE');
      const dayAvail = availability.find(d => d.day_of_week === dayName);
      
      if (!dayAvail) {
        setAvailableSlots([]);
        return;
      }

      const slots = [];
      let current = parseISO(`${format(date, 'yyyy-MM-dd')}T${dayAvail.start_time}`);
      const end = parseISO(`${format(date, 'yyyy-MM-dd')}T${dayAvail.end_time}`);
      
      // Fetch existing bookings to filter out taken slots
      // Note: This is a simplified check. Ideally backend handles this logic.
      const bookingsRes = await api.get('/bookings');
      const existingBookings = bookingsRes.data.filter(b => 
        b.status === 'confirmed' &&
        isSameDay(parseISO(b.start_time), date)
      );

      while (addMinutes(current, eventType.duration) <= end) {
        const slotStart = current;
        const slotEnd = addMinutes(current, eventType.duration);
        
        // Check collision
        const isTaken = existingBookings.some(b => {
          const bStart = parseISO(b.start_time);
          const bEnd = parseISO(b.end_time);
          return (
            (slotStart < bEnd && slotEnd > bStart)
          );
        });

        if (!isTaken) {
          slots.push(slotStart);
        }
        
        current = addMinutes(current, eventType.duration);
      }
      
      setAvailableSlots(slots);
      setHostTimezone(timezone || 'UTC');
    } catch (error) {
      console.error('Error generating slots:', error);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setBookingStatus('submitting');
    
    try {
      const startTime = selectedTime;
      const endTime = addMinutes(selectedTime, eventType.duration);
      
      await api.post('/bookings', {
        event_type_id: eventType.id,
        booker_name: bookingForm.name,
        booker_email: bookingForm.email,
        start_time: format(startTime, "yyyy-MM-dd HH:mm:ss"),
        end_time: format(endTime, "yyyy-MM-dd HH:mm:ss")
      });
      
      setBookingStatus('success');
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Booking failed. The slot might have been taken.');
      setBookingStatus('error');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-600">{error}</div>;

  if (bookingStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 mb-4">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Booking Confirmed!</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            You are scheduled with Admin User.
          </p>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md text-left mb-6">
            <p className="font-semibold text-gray-900 dark:text-white">{eventType.title}</p>
            <p className="text-gray-600 dark:text-gray-300 flex items-center mt-2">
              <CalendarIcon className="w-4 h-4 mr-2" />
              {format(selectedTime, 'EEEE, MMMM d, yyyy')}
            </p>
            <p className="text-gray-600 dark:text-gray-300 flex items-center mt-1">
              <Clock className="w-4 h-4 mr-2" />
              {format(selectedTime, 'h:mm a')} - {format(addMinutes(selectedTime, eventType.duration), 'h:mm a')}
            </p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-black dark:bg-white text-white dark:text-black py-2 rounded-md hover:bg-gray-800 dark:hover:bg-gray-200"
          >
            Book Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full flex flex-col md:flex-row overflow-hidden min-h-[600px]">
        
        {/* Left Panel: Event Details */}
        <div className="w-full md:w-1/3 p-8 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="mb-6">
            <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">Admin User</p>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{eventType.title}</h1>
            <div className="flex items-center text-gray-600 dark:text-gray-300 mb-2">
              <Clock className="w-4 h-4 mr-2" />
              <span>{eventType.duration} min</span>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm whitespace-pre-wrap">{eventType.description}</p>
        </div>

        {/* Right Panel: Calendar & Slots & Form */}
        <div className="w-full md:w-2/3 p-8">
          {!selectedDate ? (
            // Step 1: Select Date
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Select a Date</h3>
              {/* Simplified Calendar UI */}
              <div className="grid grid-cols-7 gap-2 text-center mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                  <div key={d} className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {/* Just showing next 14 days for simplicity */}
                {[...Array(14)].map((_, i) => {
                  const date = addDays(new Date(), i);
                  const isSelected = isSameDay(date, selectedDate);
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedDate(date)}
                      className={`p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none text-gray-900 dark:text-white ${
                        isSelected ? 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200' : ''
                      }`}
                    >
                      <div className="text-sm">{format(date, 'd')}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : !selectedTime ? (
            // Step 2: Select Time
            <div className="flex h-full">
              <div className="flex-1 pr-4 border-r border-gray-200 dark:border-gray-700">
                 <button onClick={() => setSelectedDate(null)} className="mb-4 text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white flex items-center">
                   <ChevronLeft className="w-4 h-4 mr-1" /> Back to Calendar
                 </button>
                 <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{format(selectedDate, 'EEEE, MMMM d')}</h3>
                 <div className="space-y-2 max-h-[400px] overflow-y-auto">
                   {availableSlots.length > 0 ? (
                     availableSlots.map((slot, i) => (
                       <button
                         key={i}
                         onClick={() => setSelectedTime(slot)}
                         className="w-full text-left px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md hover:border-black dark:hover:border-white hover:ring-1 hover:ring-black dark:hover:ring-white transition-all font-medium text-gray-900 dark:text-white"
                       >
                         {format(slot, 'h:mm a')}
                       </button>
                     ))
                   ) : (
                     <p className="text-gray-500 dark:text-gray-400">No slots available for this day.</p>
                   )}
                 </div>
                 <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 text-center">
                    All times are in {hostTimezone}
                 </div>
              </div>
            </div>
          ) : (
            // Step 3: Booking Form
            <div>
              <button onClick={() => setSelectedTime(null)} className="mb-4 text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white flex items-center">
                <ChevronLeft className="w-4 h-4 mr-1" /> Back to Times
              </button>
              <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Enter Details</h3>
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
                 <p className="font-medium text-gray-900 dark:text-white">{format(selectedTime, 'EEEE, MMMM d, yyyy')}</p>
                 <p className="text-gray-600 dark:text-gray-300">{format(selectedTime, 'h:mm a')} - {format(addMinutes(selectedTime, eventType.duration), 'h:mm a')}</p>
              </div>
              <form onSubmit={handleBooking} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    value={bookingForm.name}
                    onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    value={bookingForm.email}
                    onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                  />
                </div>
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={bookingStatus === 'submitting'}
                    className="w-full bg-black dark:bg-white text-white dark:text-black py-3 rounded-md font-medium hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50"
                  >
                    {bookingStatus === 'submitting' ? 'Confirming...' : 'Confirm Booking'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicBooking;
