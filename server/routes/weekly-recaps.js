const express = require('express');
const router = express.Router();
const storage = require('../db/storage');

// Initialize weekly recaps collection
storage.initCollection('weekly-recaps', [
  {
    id: 'recap-w6-2026',
    week: 'Week 6 (Feb 1-7, 2026)',
    period: '2026-02-01T00:00:00Z to 2026-02-07T23:59:59Z',
    summary: 'Major progress on Mission Control V4. Completed UI framework and began dashboard development. System health excellent.',
    tasks_completed: 4,
    tasks_active: 2,
    highlights: [
      'Completed Glassmorphism CSS Framework (Phase 1)',
      'Navigation & Dashboard started (Phase 2 - 65% complete)',
      'API integration planning complete',
      'Team expanded with new sub-agents'
    ],
    metrics: {
      completion_rate: '85%',
      productivity: 'high',
      bandwidth: '72%',
      uptime: '99.8%'
    },
    focus_areas: [
      'UI/UX Excellence',
      'System Stability',
      'Developer Experience'
    ],
    next_week_goals: [
      'Complete Phase 2 (Dashboard)',
      'Begin Phase 3 (Workshop Page)',
      'Full API integration',
      'Performance optimization'
    ],
    created_at: '2026-02-07T20:00:00Z'
  },
  {
    id: 'recap-w5-2026',
    week: 'Week 5 (Jan 26-Feb 1, 2026)',
    period: '2026-01-26T00:00:00Z to 2026-02-01T23:59:59Z',
    summary: 'Project kickoff and initial planning. Team formation and architecture decisions.',
    tasks_completed: 2,
    tasks_active: 3,
    highlights: [
      'Mission Control V4 project initiated',
      'Design system established',
      'Team structure defined',
      'Development environment ready'
    ],
    metrics: {
      completion_rate: '65%',
      productivity: 'medium',
      bandwidth: '45%',
      uptime: '99.9%'
    },
    focus_areas: [
      'Planning & Design',
      'Environment Setup',
      'Team Coordination'
    ],
    next_week_goals: [
      'Phase 1 UI Framework',
      'Component library creation',
      'Dashboard mockups'
    ],
    created_at: '2026-02-01T20:00:00Z'
  }
]);

// Get all weekly recaps
router.get('/', (req, res) => {
  try {
    const recaps = storage.findAll('weekly-recaps');
    res.json(recaps.sort((a, b) =>
      new Date(b.created_at) - new Date(a.created_at)
    ));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single weekly recap by ID or week format
router.get('/:week', (req, res) => {
  try {
    const param = req.params.week;
    let recap;
    
    // Try to find by ID first
    recap = storage.findById('weekly-recaps', param);
    
    // If not found, try to find by week field (e.g., YYYY-Www or "Week X")
    if (!recap) {
      const recaps = storage.findAll('weekly-recaps');
      recap = recaps.find(r => 
        r.week === param || 
        r.week.includes(param) ||
        r.id.includes(param)
      );
    }
    
    if (!recap) {
      return res.status(404).json({ error: 'Weekly recap not found' });
    }
    res.json(recap);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get most recent weekly recap
router.get('/latest', (req, res) => {
  try {
    const recaps = storage.findAll('weekly-recaps');
    const latest = recaps.sort((a, b) =>
      new Date(b.created_at) - new Date(a.created_at)
    )[0];
    if (!latest) {
      return res.status(404).json({ error: 'No weekly recaps found' });
    }
    res.json(latest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new weekly recap
router.post('/', (req, res) => {
  try {
    const { week, period, summary, tasks_completed, highlights, metrics } = req.body;
    const recap = {
      id: `recap-w${Math.floor((Date.now() / 604800000) % 52)}`,
      week,
      period,
      summary,
      tasks_completed,
      tasks_active: 0,
      highlights: highlights || [],
      metrics: metrics || {},
      focus_areas: [],
      next_week_goals: [],
      created_at: new Date().toISOString()
    };

    storage.add('weekly-recaps', recap);
    res.status(201).json(recap);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update weekly recap
router.patch('/:id', (req, res) => {
  try {
    const updates = req.body;
    const updated = storage.update('weekly-recaps', req.params.id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Weekly recap not found' });
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
