import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Availability from './pages/Availability';
import Bookings from './pages/Bookings';
import PublicBooking from './pages/PublicBooking';

function App() {
  return (
    <Router>
      <Routes>
        {/* Admin Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="availability" element={<Availability />} />
          <Route path="bookings" element={<Bookings />} />
        </Route>
        
        {/* Public Routes */}
        <Route path="/:slug" element={<PublicBooking />} />
      </Routes>
    </Router>
  );
}

export default App;
