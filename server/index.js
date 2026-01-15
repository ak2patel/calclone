const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const eventTypesRoutes = require('./routes/eventTypes');
const availabilityRoutes = require('./routes/availability');
const bookingsRoutes = require('./routes/bookings');

app.use(cors({
  origin: process.env.FRONTEND_URL || '*', // Allow all if not specified (for dev/public)
  credentials: true
}));
app.use(express.json());

app.use('/api/event-types', eventTypesRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/bookings', bookingsRoutes);

// Test DB Connection
app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(500).json({ status: 'error', db: 'disconnected', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
