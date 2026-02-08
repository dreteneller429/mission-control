const express = require('express');
const { v4: uuidv4 } = require('uuid');
const storage = require('../db/storage');

const router = express.Router();

// Initialize collection
storage.initCollection('weekly_recaps', []);

// GET /api/weekly-recaps/:week - Get week summary
router.get('/:week', (req, res) => {
  try {
    const { week } = req.params;
    
    // Validate week format (YYYY-Www)
    if (!week.match(/^\d{4}-W\d{2}$/)) {
      return res.status(400).json({ error: 'Invalid week format. Use YYYY-Www' });
    }

    const recaps = storage.findAll('weekly_recaps');
    const recap = recaps.find(r => r.week === week);

    if (!recap) {
      return res.status(404).json({ error: 'Weekly recap not found' });
    }

    res.json(recap);
  } catch (error) {
    console.error('Error fetching weekly recap:', error);
    res.status(500).json({ error: 'Failed to fetch weekly recap' });
  }
});

// POST /api/weekly-recaps - Create weekly recap
router.post('/', (req, res) => {
  try {
    const { week, start_date, end_date, summary, metrics } = req.body;

    if (!week || !start_date || !end_date) {
      return res.status(400).json({ 
        error: 'week, start_date, and end_date are required' 
      });
    }

    const recap = {
      id: uuidv4(),
      week,
      start_date,
      end_date,
      summary: summary || '',
      metrics: metrics || {
        tasks_completed: 0,
        tasks_created: 0,
        focus_time_hours: 0,
        intelligence_deployed: 0
      }
    };

    const saved = storage.add('weekly_recaps', recap);
    res.status(201).json(saved);
  } catch (error) {
    console.error('Error creating weekly recap:', error);
    res.status(500).json({ error: 'Failed to create weekly recap' });
  }
});

// PUT /api/weekly-recaps/:week - Update weekly recap
router.put('/:week', (req, res) => {
  try {
    const { week } = req.params;
    const { summary, metrics } = req.body;

    const recaps = storage.findAll('weekly_recaps');
    const recap = recaps.find(r => r.week === week);

    if (!recap) {
      return res.status(404).json({ error: 'Weekly recap not found' });
    }

    const updates = {};
    if (summary !== undefined) updates.summary = summary;
    if (metrics !== undefined) updates.metrics = metrics;

    const updated = storage.update('weekly_recaps', recap.id, updates);
    res.json(updated);
  } catch (error) {
    console.error('Error updating weekly recap:', error);
    res.status(500).json({ error: 'Failed to update weekly recap' });
  }
});

// GET /api/weekly-recaps - List all recaps
router.get('/', (req, res) => {
  try {
    const recaps = storage.findAll('weekly_recaps');
    res.json(recaps);
  } catch (error) {
    console.error('Error fetching recaps:', error);
    res.status(500).json({ error: 'Failed to fetch weekly recaps' });
  }
});

module.exports = router;
