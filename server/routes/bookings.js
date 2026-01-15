const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all bookings (for admin dashboard)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT b.*, e.title as event_title 
      FROM bookings b 
      JOIN event_types e ON b.event_type_id = e.id 
      WHERE e.user_id = ? 
      ORDER BY b.start_time DESC
    `, [1]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a booking (Public)
router.post('/', async (req, res) => {
  const { event_type_id, booker_name, booker_email, start_time, end_time } = req.body;
  try {
    // Get user_id for this event type
    const [events] = await db.query('SELECT user_id FROM event_types WHERE id = ?', [event_type_id]);
    if (events.length === 0) return res.status(404).json({ error: 'Event type not found' });
    const userId = events[0].user_id;

    // Check for double booking across ALL event types for this user
    const [existing] = await db.query(`
      SELECT b.* FROM bookings b
      JOIN event_types e ON b.event_type_id = e.id
      WHERE e.user_id = ? 
      AND b.status = 'confirmed'
      AND (
        (b.start_time < ? AND b.end_time > ?)
      )
    `, [userId, end_time, start_time]);

    if (existing.length > 0) {
      return res.status(409).json({ error: 'Time slot already booked' });
    }

    const [result] = await db.query(
      'INSERT INTO bookings (event_type_id, booker_name, booker_email, start_time, end_time) VALUES (?, ?, ?, ?, ?)',
      [event_type_id, booker_name, booker_email, start_time, end_time]
    );
    res.status(201).json({ id: result.insertId, message: 'Booking confirmed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel booking
router.delete('/:id', async (req, res) => {
  try {
    await db.query('UPDATE bookings SET status = "cancelled" WHERE id = ?', [req.params.id]);
    res.json({ message: 'Booking cancelled' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
