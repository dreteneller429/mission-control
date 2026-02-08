/**
 * Journal API Endpoints
 * GET /api/journal/:date - Get journal entry for a specific date
 * GET /api/journal/stats - Get journal statistics
 */

const fs = require('fs').promises;
const path = require('path');

// Memory directory where journal files are stored
const MEMORY_DIR = path.join(process.env.HOME || '/home/clawd', '.openclaw', 'workspace', 'memory');

/**
 * Get journal entry for a specific date
 * Date format: YYYY-MM-DD
 */
async function getJournalEntry(req, res) {
  try {
    const { date } = req.params;

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    // Try to read the journal file
    const journalPath = path.join(MEMORY_DIR, `${date}.md`);
    
    try {
      const content = await fs.readFile(journalPath, 'utf-8');
      res.json({ content, date });
    } catch (error) {
      if (error.code === 'ENOENT') {
        res.status(404).json({ error: 'No entry for this date' });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Error fetching journal entry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get journal statistics
 */
async function getJournalStats(req, res) {
  try {
    const stats = {
      entriesThisWeek: 0,
      entriesThisMonth: 0,
      totalEntries: 0,
      longestStreak: 0
    };

    try {
      const files = await fs.readdir(MEMORY_DIR);
      const dateFiles = files.filter(f => /^\d{4}-\d{2}-\d{2}\.md$/.test(f));
      
      stats.totalEntries = dateFiles.length;

      // Calculate this week and month
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      dateFiles.forEach(file => {
        const dateStr = file.replace('.md', '');
        const fileDate = new Date(dateStr);

        if (fileDate >= weekStart) stats.entriesThisWeek++;
        if (fileDate >= monthStart) stats.entriesThisMonth++;
      });

      // Calculate longest streak
      if (dateFiles.length > 0) {
        const sortedDates = dateFiles
          .map(f => f.replace('.md', ''))
          .sort()
          .reverse();

        let longestStreak = 1;
        let currentStreak = 1;

        for (let i = 0; i < sortedDates.length - 1; i++) {
          const current = new Date(sortedDates[i]);
          const next = new Date(sortedDates[i + 1]);
          const diff = (current - next) / (1000 * 60 * 60 * 24);

          if (Math.abs(diff - 1) < 0.1) {
            currentStreak++;
            longestStreak = Math.max(longestStreak, currentStreak);
          } else {
            currentStreak = 1;
          }
        }

        stats.longestStreak = longestStreak;
      }
    } catch (error) {
      console.error('Error reading memory directory:', error);
    }

    res.json(stats);
  } catch (error) {
    console.error('Error calculating stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  routes: [
    { method: 'GET', path: '/api/journal/:date', handler: getJournalEntry },
    { method: 'GET', path: '/api/journal/stats', handler: getJournalStats }
  ]
};
