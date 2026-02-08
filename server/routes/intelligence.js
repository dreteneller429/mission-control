const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const storage = require('../db/storage');

// Initialize intelligence collection
storage.initCollection('intelligence', [
  {
    id: 'intel-1',
    title: 'Market Expansion Strategy Q1 2026',
    description: 'Comprehensive market analysis and expansion plan for Q1 2026',
    content: 'Focus on 3 key markets: Technology, Healthcare, Finance. Allocate 40% budget to digital marketing, 30% to partnerships, 30% to R&D.',
    status: 'active',
    priority: 'high',
    created_at: '2026-02-01T10:00:00Z',
    strategies: [
      {
        id: 'strat-1',
        name: 'Digital Marketing Push',
        description: 'Increase digital presence across platforms',
        tasks: 3,
        effort: 'high'
      },
      {
        id: 'strat-2',
        name: 'Partnership Development',
        description: 'Establish strategic partnerships',
        tasks: 2,
        effort: 'medium'
      }
    ]
  },
  {
    id: 'intel-2',
    title: 'Cost Optimization Initiative',
    description: 'Identify and implement cost reduction strategies',
    content: 'Review operational expenses. Target 15% reduction through automation and process improvement.',
    status: 'draft',
    priority: 'medium',
    created_at: '2026-02-05T14:30:00Z',
    strategies: [
      {
        id: 'strat-3',
        name: 'Process Automation',
        description: 'Automate repetitive processes',
        tasks: 5,
        effort: 'high'
      }
    ]
  }
]);

// Get all intelligence reports
router.get('/', (req, res) => {
  try {
    const reports = storage.findAll('intelligence');
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single intelligence report
router.get('/:id', (req, res) => {
  try {
    const report = storage.findById('intelligence', req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new intelligence report
router.post('/', (req, res) => {
  try {
    const { title, description, content, priority } = req.body;

    const report = {
      id: uuidv4(),
      title: title || 'Untitled Report',
      description: description || '',
      content: content || '',
      status: 'draft',
      priority: priority || 'medium',
      created_at: new Date().toISOString(),
      strategies: []
    };

    storage.add('intelligence', report);
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update intelligence report
router.patch('/:id', (req, res) => {
  try {
    const updates = req.body;
    const updated = storage.update('intelligence', req.params.id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deploy strategy - creates tasks in workshop
router.post('/:id/deploy', (req, res) => {
  try {
    const report = storage.findById('intelligence', req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const { strategyId } = req.body;
    const strategy = report.strategies.find(s => s.id === strategyId);
    if (!strategy) {
      return res.status(404).json({ error: 'Strategy not found' });
    }

    // Create task in workshop
    const tasks = storage.findAll('tasks');
    const newTask = {
      id: uuidv4(),
      title: `Deploy: ${strategy.name}`,
      description: strategy.description,
      tags: ['strategy', 'deployment'],
      priority: report.priority || 'medium',
      progress: 0,
      status: 'queued',
      created_at: new Date().toISOString(),
      started_at: null,
      completed_at: null,
      activity_log: [
        {
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: true }) + ' EST',
          event: 'Task created from Intelligence strategy'
        }
      ]
    };

    storage.add('tasks', newTask);

    res.json({
      success: true,
      task: newTask,
      message: `Strategy "${strategy.name}" deployed to Workshop`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete intelligence report
router.delete('/:id', (req, res) => {
  try {
    const report = storage.remove('intelligence', req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json({ success: true, deleted: report });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
