const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get availability and timezone
router.get('/', async (req, res) => {
  try {
    const userId = 1; // Default admin user
    
    // Get schedule
    const [schedule] = await db.query(
      'SELECT day_of_week, start_time, end_time FROM availability WHERE user_id = ?', 
      [userId]
    );

    // Get timezone
    const [users] = await db.query('SELECT timezone FROM users WHERE id = ?', [userId]);
    const timezone = users[0]?.timezone || 'UTC';

    res.json({ schedule, timezone });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update availability and timezone
router.post('/', async (req, res) => {
  const { schedule, timezone } = req.body;
  const userId = 1; // Default admin user

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Update timezone
    if (timezone) {
      await connection.query('UPDATE users SET timezone = ? WHERE id = ?', [timezone, userId]);
    }

    // Clear existing availability
    await connection.query('DELETE FROM availability WHERE user_id = ?', [userId]);

    // Insert new availability
    if (schedule && schedule.length > 0) {
      const values = schedule.map(s => [userId, s.day_of_week, s.start_time, s.end_time]);
      await connection.query(
        'INSERT INTO availability (user_id, day_of_week, start_time, end_time) VALUES ?',
        [values]
      );
    }

    await connection.commit();
    res.json({ message: 'Availability updated successfully' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

module.exports = router;
