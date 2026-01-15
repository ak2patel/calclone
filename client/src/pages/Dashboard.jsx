import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Clock, Trash2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newEventType, setNewEventType] = useState({
    title: '',
    slug: '',
    duration: 15,
    description: ''
  });

  useEffect(() => {
    fetchEventTypes();
  }, []);

  const fetchEventTypes = async () => {
    try {
      const res = await api.get('/event-types');
      setEventTypes(res.data);
    } catch (error) {
      console.error('Error fetching event types:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/event-types', newEventType);
      setShowModal(false);
      setNewEventType({ title: '', slug: '', duration: 15, description: '' });
      fetchEventTypes();
    } catch (error) {
      console.error('Error creating event type:', error);
      alert('Error creating event type');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event type?')) return;
    try {
      await api.delete(`/event-types/${id}`);
      fetchEventTypes();
    } catch (error) {
      console.error('Error deleting event type:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Event Types</h2>
          <p className="text-gray-500 dark:text-gray-400">Create and manage your event types.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-md flex items-center hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Event Type
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {eventTypes.map((event) => (
          <div key={event.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{event.title}</h3>
              <div className="flex space-x-2">
                <Link 
                  to={`/${event.slug}`} 
                  target="_blank"
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  title="View Booking Page"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
                <button 
                  onClick={() => handleDelete(event.id)}
                  className="text-gray-400 hover:text-red-600"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center text-gray-500 dark:text-gray-400 mb-2">
              <Clock className="w-4 h-4 mr-2" />
              <span>{event.duration} mins</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">{event.description}</p>
            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
              <Link 
                to={`/${event.slug}`}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
              >
                /{event.slug}
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Create Event Type</h3>
            <form onSubmit={handleCreate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    value={newEventType.title}
                    onChange={(e) => setNewEventType({ ...newEventType, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL Slug</label>
                  <div className="flex items-center">
                    <span className="text-gray-500 dark:text-gray-400 mr-2">/</span>
                    <input
                      type="text"
                      required
                      className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                      value={newEventType.slug}
                      onChange={(e) => setNewEventType({ ...newEventType, slug: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    value={newEventType.duration}
                    onChange={(e) => setNewEventType({ ...newEventType, duration: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    rows="3"
                    value={newEventType.description}
                    onChange={(e) => setNewEventType({ ...newEventType, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-md hover:bg-gray-800 dark:hover:bg-gray-200"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
