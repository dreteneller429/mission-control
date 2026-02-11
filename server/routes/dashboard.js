const express = require('express');
const { execSync } = require('child_process');
const storage = require('../db/storage');

const router = express.Router();

// GET /api/dashboard/stats - Stat cards data
router.get('/stats', (req, res) => {
  try {
    // FIX 3B: Pull from actual workshop_tasks store
    const tasks = storage.getAll('workshop_tasks') || [];
    const agents = storage.getAll('agents') || [];
    const documents = storage.getAll('documents') || [];

    // Count by actual status
    const queuedTasks = tasks.filter(t => t.status === 'queued').length;
    const activeTasks = tasks.filter(t => t.status === 'active').length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;

    const stats = {
      // Workshop stats
      total_tasks: tasks.length,
      queued_tasks: queuedTasks,
      active_tasks: activeTasks,
      completed_tasks: completedTasks,
      
      // Agents stats
      total_agents: agents.length,
      active_agents: agents.filter(a => a.status === 'active').length,
      
      // Documents stats
      total_documents: documents.length,
      recent_documents: documents.slice(-5).length,
      
      timestamp: new Date().toISOString()
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET /api/dashboard/activity - Activity feed
router.get('/activity', (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 50;
    
    const activities = [];

    // Get recent messages
    const messages = storage.findAll('messages');
    messages.forEach(msg => {
      if (msg.message_text) {
        activities.push({
          type: 'message',
          timestamp: msg.timestamp,
          actor: msg.sender_name || 'Unknown',
          action: 'sent message',
          description: msg.message_text.substring(0, 100),
          avatar: msg.avatar || '💬'
        });
      }
    });

    // Get recent task activities
    const tasks = storage.findAll('tasks');
    tasks.forEach(task => {
      if (task.activity_log) {
        task.activity_log.forEach(log => {
          activities.push({
            type: 'task',
            timestamp: log.timestamp,
            actor: log.user || 'system',
            action: log.action,
            description: `Task: ${task.title}`,
            task_id: task.id
          });
        });
      }
    });

    // Sort by timestamp and apply limit
    const sorted = activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);

    res.json({
      count: sorted.length,
      activities: sorted
    });
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ error: 'Failed to fetch activity feed' });
  }
});

// GET /api/commits - Recent git commits
router.get('/commits', (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;
    
    // FIX 3D: Pull from actual git log with correct format
    try {
      const repoPath = '/home/clawd/.openclaw/workspace/mission-control';
      const gitLog = execSync(
        'git log --oneline --format="%H|%s|%cr|%an" -' + limit,
        { cwd: repoPath, encoding: 'utf-8' }
      );

      const commits = gitLog.trim().split('\n').map(line => {
        const [hash, message, date, author] = line.split('|');
        return {
          hash: hash.substring(0, 7),
          message,
          date,
          author
        };
      });

      res.json(commits);
    } catch (error) {
      // Git not available or not a git repo
      console.warn('Git log not available:', error.message);
      res.json([]);
    }
  } catch (error) {
    console.error('Error fetching commits:', error);
    res.status(500).json({ error: 'Failed to fetch commits' });
  }
});

module.exports = router;
