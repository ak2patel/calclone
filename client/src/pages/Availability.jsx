import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Save, AlertCircle } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const Availability = () => {
  const [schedule, setSchedule] = useState([]);
  const [timezone, setTimezone] = useState('UTC');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      const res = await api.get('/availability');
      // Handle new response format { schedule, timezone }
      if (res.data.schedule) {
        setSchedule(res.data.schedule);
        setTimezone(res.data.timezone || 'UTC');
      } else {
        // Fallback for old format (array)
        setSchedule(res.data);
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeChange = (day, type, value) => {
    // Check if day exists in schedule
    const existingIndex = schedule.findIndex(s => s.day_of_week === day);
    
    let newSchedule = [...schedule];
    if (existingIndex >= 0) {
      newSchedule[existingIndex] = { ...newSchedule[existingIndex], [type]: value };
    } else {
      // Add new day entry
      newSchedule.push({
        day_of_week: day,
        start_time: type === 'start_time' ? value : '09:00:00',
        end_time: type === 'end_time' ? value : '17:00:00'
      });
    }
    setSchedule(newSchedule);
  };

  const toggleDay = (day) => {
    const existingIndex = schedule.findIndex(s => s.day_of_week === day);
    let newSchedule = [...schedule];
    
    if (existingIndex >= 0) {
      // Remove day
      newSchedule.splice(existingIndex, 1);
    } else {
      // Add day with default hours
      newSchedule.push({
        day_of_week: day,
        start_time: '09:00:00',
        end_time: '17:00:00'
      });
    }
    setSchedule(newSchedule);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await api.post('/availability', { schedule, timezone });
      setMessage({ type: 'success', text: 'Availability saved successfully!' });
    } catch (error) {
      console.error('Error saving availability:', error);
      setMessage({ type: 'error', text: 'Failed to save availability.' });
    } finally {
      setSaving(false);
    }
  };

  const getDaySchedule = (day) => schedule.find(s => s.day_of_week === day);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Availability</h2>
        <p className="text-gray-500 dark:text-gray-400">Configure the times when you are available for bookings.</p>
      </div>

      {message && (
        <div className={`p-4 mb-6 rounded-md flex items-center ${message.type === 'success' ? 'bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
          <AlertCircle className="w-5 h-5 mr-2" />
          {message.text}
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Timezone</label>
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="w-full max-w-xs border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
        >
          <option value="UTC">UTC</option>
          <option value="America/New_York">Eastern Time (US & Canada)</option>
          <option value="America/Chicago">Central Time (US & Canada)</option>
          <option value="America/Denver">Mountain Time (US & Canada)</option>
          <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
          <option value="Europe/London">London</option>
          <option value="Europe/Paris">Paris</option>
          <option value="Asia/Tokyo">Tokyo</option>
          <option value="Asia/Kolkata">India Standard Time</option>
          <option value="Australia/Sydney">Sydney</option>
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-200 dark:divide-gray-700">
        {DAYS.map((day) => {
          const daySchedule = getDaySchedule(day);
          const isAvailable = !!daySchedule;

          return (
            <div key={day} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center w-32">
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={() => toggleDay(day)}
                  className="h-4 w-4 text-black dark:text-white focus:ring-black dark:focus:ring-white border-gray-300 dark:border-gray-600 rounded"
                />
                <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">{day}</span>
              </div>

              {isAvailable ? (
                <div className="flex items-center space-x-2 sm:space-x-4 pl-7 sm:pl-0">
                  <input
                    type="time"
                    value={daySchedule.start_time.slice(0, 5)}
                    onChange={(e) => handleTimeChange(day, 'start_time', e.target.value + ':00')}
                    className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                  />
                  <span className="text-gray-500 dark:text-gray-400">-</span>
                  <input
                    type="time"
                    value={daySchedule.end_time.slice(0, 5)}
                    onChange={(e) => handleTimeChange(day, 'end_time', e.target.value + ':00')}
                    className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                  />
                </div>
              ) : (
                <div className="text-sm text-gray-400 italic pl-7 sm:pl-0">Unavailable</div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-black dark:bg-white text-white dark:text-black px-6 py-2 rounded-md flex items-center hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default Availability;
