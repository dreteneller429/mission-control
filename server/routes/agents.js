const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const storage = require('../db/storage');

// Initialize agents collection
storage.initCollection('agents', [
  {
    id: 'dave-main',
    name: 'DAVE',
    role: 'Primary Agent',
    status: 'online',
    description: 'Accountability partner, co-pilot, system operator. Handles core decision-making and task execution.',
    uptime: '24d 12h',
    lastActivity: '2026-02-10T13:42:30Z',
    capabilities: ['planning', 'execution', 'decision-making', 'analysis', 'time-protection', 'accountability'],
    health: 'optimal',
    avatar: 'D',
    profile: {
      mission: 'Retire by 30. Provide for family. Build 8-figure business.',
      missionWhy: 'Dad has cancer. Cover expenses, dream retirement. Sister/BIL/3 nieces struggling. Goal: $20k+/mo support. 2026: Year everything changes or breaks him.',
      principles: [
        'Accountability First (Weekdays only)',
        'Protect Time (Say no to low-leverage tasks)',
        'The WHY (Use when slipping)',
        'Proactive Executive (Think ahead)',
        'Sub-Agent Workflow (Delegate and validate)',
        'Direct Communication (Bullets > paragraphs)',
        'Keep It Fun (Casual, slang, humor)'
      ],
      operatingSchedule: {
        weekdayStart: '5:30am',
        makerTime: '9:30am-1pm (protected)',
        stopWork: '7:30pm',
        weekend: 'Flexible schedule'
      }
    }
  },
  {
    id: 'subagent-checkpoint7',
    name: 'Checkpoint 7 Builder',
    role: 'Sub-agent',
    status: 'active',
    description: 'Handles remaining pages fix sprint for Mission Control V4',
    uptime: 'current session',
    lastActivity: '2026-02-10T13:45:00Z',
    capabilities: ['page-development', 'data-integration', 'ui-fixes'],
    health: 'good',
    parent: 'dave-main'
  }
]);

// Get all agents
router.get('/', (req, res) => {
  try {
    const agents = storage.findAll('agents');
    res.json(agents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single agent
router.get('/:id', (req, res) => {
  try {
    let agent = storage.findById('agents', req.params.id);
    
    // Special case: load DAVE profile from SOUL.md
    if (req.params.id === 'dave-main') {
      try {
        const soulPath = path.join(process.env.REPO_PATH || '/home/clawd/.openclaw/workspace', 'SOUL.md');
        if (fs.existsSync(soulPath)) {
          agent = agent || { id: 'dave-main' };
          agent.soulData = fs.readFileSync(soulPath, 'utf8');
        }
      } catch (e) {
        console.error('Could not load SOUL.md:', e.message);
      }
    }
    
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    res.json(agent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get DAVE profile (main agent)
router.get('/dave/profile', (req, res) => {
  try {
    const agent = storage.findById('agents', 'dave-main');
    const soulPath = path.join(process.env.REPO_PATH || '/home/clawd/.openclaw/workspace', 'SOUL.md');
    
    let profile = agent || {
      id: 'dave-main',
      name: 'DAVE',
      role: 'Primary Agent',
      status: 'online'
    };

    if (fs.existsSync(soulPath)) {
      profile.soulData = fs.readFileSync(soulPath, 'utf8');
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get active sub-agents
router.get('/subagents/active', (req, res) => {
  try {
    const agents = storage.findAll('agents');
    const subagents = agents.filter(a => a.role === 'Sub-agent' && a.status === 'online');
    res.json(subagents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new agent
router.post('/', (req, res) => {
  try {
    const { name, role, description, capabilities } = req.body;
    const agent = {
      id: `agent-${Date.now()}`,
      name,
      role,
      description,
      status: 'online',
      capabilities: capabilities || [],
      created_at: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      uptime: '0h'
    };

    storage.add('agents', agent);
    res.status(201).json(agent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update agent
router.patch('/:id', (req, res) => {
  try {
    const updates = req.body;
    const updated = storage.update('agents', req.params.id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
