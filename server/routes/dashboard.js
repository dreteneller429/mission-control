const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const storage = require('../db/storage');

// Initialize activity collection
storage.initCollection('activity', [
  {
    id: '1',
    action: 'Commit',
    description: 'feat(design): iOS Liquid Glass Design System',
    source: 'DAVE',
    timestamp: '2026-02-08T18:10:30Z',
    color: '#64D2FF'
  },
  {
    id: '2',
    action: 'Task Updated',
    description: 'Dashboard implementation started',
    source: 'DAVE',
    timestamp: '2026-02-08T18:05:00Z',
    color: '#FF9F0A'
  },
  {
    id: '3',
    action: 'Status Updated',
    description: 'System online, services running',
    source: 'Gateway',
    timestamp: '2026-02-08T18:00:00Z',
    color: 'rgba(255,255,255,0.3)'
  }
]);

// Get dashboard activity feed
router.get('/activity', (req, res) => {
  try {
    const activity = storage.findAll('activity');
    res.json(activity.reverse());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recent commits from git
router.get('/commits', (req, res) => {
  try {
    // Run git log
    const repoPath = process.env.REPO_PATH || '/home/clawd/.openclaw/workspace/mission-control';
    exec(`cd ${repoPath} && git log --format='%h|%an|%ae|%ai|%s' -20`, (error, stdout, stderr) => {
      if (error) {
        console.error('Git error:', error);
        return res.status(500).json({ error: 'Could not fetch commits' });
      }

      const commits = stdout.trim().split('\n').filter(line => line.length > 0).map(line => {
        const [hash, author, email, timestamp, subject] = line.split('|');
        return {
          id: hash,
          hash: hash.substring(0, 7),
          author,
          email,
          timestamp,
          subject,
          url: `#` // Link to git repo if needed
        };
      });

      res.json(commits);
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get dashboard stats
router.get('/stats', (req, res) => {
  try {
    const tasks = storage.findAll('tasks');
    const queued = tasks.filter(t => t.status === 'queued').length;
    const active = tasks.filter(t => t.status === 'active').length;
    const completed = tasks.filter(t => t.status === 'completed').length;

    res.json({
      tasks: {
        total: tasks.length,
        queued,
        active,
        completed
      },
      uptime: calculateUptime(),
      health: 'good'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function calculateUptime() {
  // Mock uptime calculation
  return '24 days 12h';
}

module.exports = router;
