const express = require('express');
const { execSync } = require('child_process');
const storage = require('../db/storage');

const router = express.Router();

// GET /api/dashboard/stats - Stat cards data
router.get('/stats', (req, res) => {
  try {
    const tasks = storage.findAll('tasks');
    const intelligence = storage.findAll('intelligence');
    const clients = storage.findAll('clients');
    const messages = storage.findAll('messages');

    const activeTasks = tasks.filter(t => t.status === 'active').length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const deployedIntelligence = intelligence.filter(i => i.deployed).length;
    const activeClients = clients.filter(c => c.status === 'active').length;

    const stats = {
      total_tasks: tasks.length,
      active_tasks: activeTasks,
      completed_tasks: completedTasks,
      task_completion_rate: tasks.length > 0 ? ((completedTasks / tasks.length) * 100).toFixed(1) : 0,
      intelligence_reports: intelligence.length,
      intelligence_deployed: deployedIntelligence,
      total_clients: clients.length,
      active_clients: activeClients,
      total_messages: messages.length,
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
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    
    // Try to get git log
    try {
      const cwd = process.cwd();
      const gitLog = execSync(
        `git log --oneline -${limit} --pretty=format:"%H|%an|%ae|%ai|%s"`,
        { cwd, encoding: 'utf8' }
      );

      const commits = gitLog.trim().split('\n').map(line => {
        const [hash, author, email, date, message] = line.split('|');
        return {
          hash: hash.substring(0, 7),
          author,
          email,
          timestamp: date,
          message
        };
      });

      res.json({
        count: commits.length,
        commits
      });
    } catch (error) {
      // Git not available or not a git repo
      console.warn('Git log not available:', error.message);
      res.json({
        count: 0,
        commits: [],
        note: 'Git repository not available'
      });
    }
  } catch (error) {
    console.error('Error fetching commits:', error);
    res.status(500).json({ error: 'Failed to fetch commits' });
  }
});

module.exports = router;
