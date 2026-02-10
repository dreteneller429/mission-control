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

// Get journal statistics
router.get('/stats', (req, res) => {
  try {
    const memoryDir = process.env.MEMORY_PATH || '/home/clawd/.openclaw/workspace/memory';
    const files = fs.readdirSync(memoryDir).filter(f => f.match(/^\d{4}-\d{2}-\d{2}\.md$/));
    
    const today = new Date();
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());
    thisWeekStart.setHours(0, 0, 0, 0);
    
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    let entriesThisWeek = 0;
    let entriesThisMonth = 0;
    let longestStreak = 0;
    let currentStreak = 0;
    let lastDate = null;
    
    // Sort files in ascending order
    const sortedFiles = files.sort();
    
    sortedFiles.forEach(file => {
      const dateStr = file.replace('.md', '');
      const date = new Date(dateStr);
      
      if (date >= thisWeekStart) {
        entriesThisWeek++;
      }
      
      if (date >= thisMonthStart) {
        entriesThisMonth++;
      }
      
      // Calculate streak
      if (lastDate === null) {
        currentStreak = 1;
      } else {
        const dayDiff = Math.floor((lastDate - date) / (1000 * 60 * 60 * 24));
        if (dayDiff === 1) {
          currentStreak++;
        } else {
          currentStreak = 1;
        }
      }
      
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }
      
      lastDate = date;
    });
    
    res.json({
      entriesThisWeek,
      entriesThisMonth,
      totalEntries: files.length,
      longestStreak,
      lastEntry: files.length > 0 ? files[files.length - 1].replace('.md', '') : null
    });
  } catch (error) {
    console.error('Error loading journal stats:', error);
    res.status(500).json({ 
      error: 'Failed to load journal stats',
      entriesThisWeek: 0,
      entriesThisMonth: 0,
      totalEntries: 0,
      longestStreak: 0
    });
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
