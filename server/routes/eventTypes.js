const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all event types for a user (assuming single user for now or passed via query/auth)
router.get('/', async (req, res) => {
  try {
    // Hardcoded user_id 1 for now as per "No Login Required" assumption for admin
    const [rows] = await db.query('SELECT * FROM event_types WHERE user_id = ?', [1]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single event type by slug (public access)
router.get('/:slug', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM event_types WHERE slug = ?', [req.params.slug]);
    if (rows.length === 0) return res.status(404).json({ error: 'Event type not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create event type
router.post('/', async (req, res) => {
  const { title, slug, duration, description } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO event_types (user_id, title, slug, duration, description) VALUES (?, ?, ?, ?, ?)',
      [1, title, slug, duration, description]
    );
    res.status(201).json({ id: result.insertId, title, slug, duration, description });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update event type
router.put('/:id', async (req, res) => {
  const { title, slug, duration, description } = req.body;
  try {
    await db.query(
      'UPDATE event_types SET title = ?, slug = ?, duration = ?, description = ? WHERE id = ? AND user_id = ?',
      [title, slug, duration, description, req.params.id, 1]
    );
    res.json({ message: 'Event type updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete event type
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM event_types WHERE id = ? AND user_id = ?', [req.params.id, 1]);
    res.json({ message: 'Event type deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
