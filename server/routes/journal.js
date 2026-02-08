const express = require('express');
const { v4: uuidv4 } = require('uuid');
const storage = require('../db/storage');

const router = express.Router();

// Initialize collection
storage.initCollection('journal', []);

// GET /api/journal/:date - Get daily entry
router.get('/:date', (req, res) => {
  try {
    const { date } = req.params;
    
    // Validate date format (YYYY-MM-DD)
    if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    const allEntries = storage.findAll('journal');
    let entry = allEntries.find(e => e.date === date);

    if (!entry) {
      // Create empty entry if doesn't exist
      entry = {
        id: uuidv4(),
        date,
        entries: []
      };
    }

    res.json(entry);
  } catch (error) {
    console.error('Error fetching journal entry:', error);
    res.status(500).json({ error: 'Failed to fetch journal entry' });
  }
});

// POST /api/journal/:date - Add entry to date
router.post('/:date', (req, res) => {
  try {
    const { date } = req.params;
    const { entry: entryText, tags = [] } = req.body;

    if (!entryText) {
      return res.status(400).json({ error: 'Entry text is required' });
    }

    // Validate date format
    if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    let allEntries = storage.findAll('journal');
    let dayEntry = allEntries.find(e => e.date === date);

    if (!dayEntry) {
      dayEntry = {
        id: uuidv4(),
        date,
        entries: []
      };
      storage.add('journal', dayEntry);
      allEntries = storage.findAll('journal');
    }

    const newJournalEntry = {
      timestamp: new Date().toISOString(),
      entry: entryText,
      tags
    };

    const index = allEntries.findIndex(e => e.date === date);
    allEntries[index].entries.push(newJournalEntry);
    storage.writeCollection('journal', allEntries);

    res.status(201).json(allEntries[index]);
  } catch (error) {
    console.error('Error adding journal entry:', error);
    res.status(500).json({ error: 'Failed to add journal entry' });
  }
});

module.exports = router;
