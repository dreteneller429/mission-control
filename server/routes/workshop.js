const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const storage = require('../db/storage');

// Initialize tasks collection
storage.initCollection('tasks', [
  {
    id: 'task-phase1-ui',
    title: 'Phase 1: Glassmorphism Framework',
    description: 'Design and implement the complete glassmorphism CSS framework with theme variables, glass effects, and component library.',
    tags: ['building', 'ui'],
    priority: 'critical',
    progress: 100,
    status: 'completed',
    created_at: '2026-02-08T18:00:00Z',
    started_at: '2026-02-08T18:00:00Z',
    completed_at: '2026-02-08T18:30:00Z',
    activity_log: [
      { timestamp: '18:00 EST', event: 'Task created by User' },
      { timestamp: '18:05 EST', event: 'Task started by DAVE' },
      { timestamp: '18:15 EST', event: 'Progress updated to 50%' },
      { timestamp: '18:30 EST', event: 'Task completed' }
    ]
  },
  {
    id: 'task-phase2-nav',
    title: 'Phase 2: Navigation + Dashboard',
    description: 'Build frosted glass sidebar with DAVE status, main dashboard with stat cards, and responsive navigation.',
    tags: ['building', 'ui'],
    priority: 'high',
    progress: 65,
    status: 'active',
    created_at: '2026-02-08T18:00:00Z',
    started_at: '2026-02-08T18:35:00Z',
    completed_at: null,
    activity_log: [
      { timestamp: '18:35 EST', event: 'Task started by DAVE' },
      { timestamp: '18:40 EST', event: 'Progress updated to 25%' },
      { timestamp: '18:45 EST', event: 'Progress updated to 50%' },
      { timestamp: '18:50 EST', event: 'Progress updated to 65%' }
    ]
  },
  {
    id: 'task-phase3-workshop',
    title: 'Phase 3: Workshop Page (Task Queue)',
    description: 'Create the Workshop page with three-column task queue layout, auto-pickup logic, task detail modal, and live feed view.',
    tags: ['building', 'deep work'],
    priority: 'high',
    progress: 30,
    status: 'queued',
    created_at: '2026-02-08T18:00:00Z',
    started_at: null,
    completed_at: null,
    activity_log: [
      { timestamp: '18:00 EST', event: 'Task created by User' }
    ]
  }
]);

// Get all tasks organized by status
router.get('/tasks', (req, res) => {
  try {
    const tasks = storage.findAll('tasks');
    const queued = tasks.filter(t => t.status === 'queued').sort(sortByPriority);
    const active = tasks.filter(t => t.status === 'active').sort(sortByPriority);
    const completed = tasks.filter(t => t.status === 'completed').sort((a, b) =>
      new Date(b.completed_at) - new Date(a.completed_at)
    );

    res.json({
      queued,
      active,
      completed,
      stats: {
        total: tasks.length,
        queued: queued.length,
        active: active.length,
        completed: completed.length,
        bandwidth: calculateBandwidth(active)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single task
router.get('/tasks/:id', (req, res) => {
  try {
    const task = storage.findById('tasks', req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new task
router.post('/tasks', (req, res) => {
  try {
    const { title, description, tags, priority, progress } = req.body;

    const task = {
      id: uuidv4(),
      title: title || 'Untitled Task',
      description: description || '',
      tags: tags || [],
      priority: priority || 'medium',
      progress: progress || 0,
      status: 'queued',
      created_at: new Date().toISOString(),
      started_at: null,
      completed_at: null,
      activity_log: [
        { timestamp: formatTime(new Date()), event: 'Task created by User' }
      ]
    };

    storage.add('tasks', task);
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a task
router.patch('/tasks/:id', (req, res) => {
  try {
    const { progress, status, activity_log } = req.body;
    const task = storage.findById('tasks', req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const updates = {};

    // Update progress
    if (progress !== undefined && progress !== task.progress) {
      updates.progress = Math.min(100, Math.max(0, progress));
      task.activity_log.push({
        timestamp: formatTime(new Date()),
        event: `Progress updated to ${updates.progress}%`
      });
    }

    // Update status
    if (status !== undefined && status !== task.status) {
      updates.status = status;
      if (status === 'active' && !task.started_at) {
        updates.started_at = new Date().toISOString();
        task.activity_log.push({
          timestamp: formatTime(new Date()),
          event: 'Task started by DAVE'
        });
      }
      if (status === 'completed' && !task.completed_at) {
        updates.completed_at = new Date().toISOString();
        updates.progress = 100;
        task.activity_log.push({
          timestamp: formatTime(new Date()),
          event: 'Task completed'
        });
      }
    }

    // Add custom activity log entry
    if (activity_log) {
      task.activity_log.push(activity_log);
    }

    const updated = storage.update('tasks', req.params.id, { ...updates });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start a task
router.post('/tasks/:id/start', (req, res) => {
  try {
    const task = storage.findById('tasks', req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const updates = {
      status: 'active',
      started_at: new Date().toISOString()
    };

    task.activity_log.push({
      timestamp: formatTime(new Date()),
      event: 'Task started by DAVE'
    });

    const updated = storage.update('tasks', req.params.id, updates);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Complete a task
router.post('/tasks/:id/complete', (req, res) => {
  try {
    const task = storage.findById('tasks', req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const updates = {
      status: 'completed',
      progress: 100,
      completed_at: new Date().toISOString()
    };

    task.activity_log.push({
      timestamp: formatTime(new Date()),
      event: 'Task completed'
    });

    const updated = storage.update('tasks', req.params.id, updates);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a task
router.delete('/tasks/:id', (req, res) => {
  try {
    const task = storage.remove('tasks', req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ success: true, deleted: task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search tasks
router.get('/tasks/search', (req, res) => {
  try {
    const query = req.query.q || '';
    const tasks = storage.findAll('tasks');

    if (!query) {
      return res.json(tasks);
    }

    const q = query.toLowerCase();
    const results = tasks.filter(task =>
      task.title.toLowerCase().includes(q) ||
      task.description.toLowerCase().includes(q) ||
      task.tags.some(tag => tag.toLowerCase().includes(q))
    );

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper functions
function formatTime(date) {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }) + ' EST';
}

function sortByPriority(a, b) {
  const priorityMap = { critical: 0, high: 1, medium: 2, low: 3 };
  return priorityMap[a.priority] - priorityMap[b.priority];
}

function calculateBandwidth(activeTasks) {
  return Math.min(100, activeTasks.length * 25 + Math.floor(Math.random() * 20));
}

module.exports = router;
