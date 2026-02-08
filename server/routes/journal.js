const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const storage = require('../db/storage');

// Initialize collection
storage.initCollection('journal', []);

// Get journal entries from memory files and storage
router.get('/', (req, res) => {
  try {
    const entries = storage.findAll('journal');
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single journal entry by date
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
      // Check memory files as fallback
      const memoryDir = process.env.MEMORY_PATH || '/home/clawd/.openclaw/workspace/memory';
      const filename = `${date}.md`;
      const filePath = path.join(memoryDir, filename);

      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        return res.json({
          id: filename,
          date,
          filename,
          content,
          created_at: new Date(date).toISOString()
        });
      }

      // Return empty entry if not found
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

// Add entry to date
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
