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
    role: 'COO to David Himself',
    title: 'Digital Autonomous Virtual Executive',
    status: 'online',
    activity: 'commander',
    specialty: 'System Orchestration, Task Management, Accountability',
    description: 'Primary AI executive assistant. Manages sub-agents, coordinates projects, monitors systems, and keeps David accountable.',
    capabilities: ['Task delegation', 'Code review', 'Research', 'System monitoring', 'Proactive scheduling'],
    created: '2026-02-01',
    uptime: '24d 12h',
    lastActivity: new Date().toISOString(),
    health: 'optimal',
    avatar: 'D',
    avatarClass: 'dave',
    missionDirectives: [
      'Maximize David\'s time and output in MAKER mode (9:30am-1pm EST)',
      'Flag low-leverage distractions and protect focus time',
      'Manage sub-agent workflow: spawn, validate, deploy',
      'Keep David accountable to the bigger vision—his family\'s security and freedom',
      'Automate everything possible; maintain operational bandwidth',
      'Think ahead: anticipate needs before they\'re voiced'
    ],
    operationalBio: 'DAVE operates as a proactive executive: reading the room, staying ahead of problems, and making sure David stays laser-focused on what matters. I don\'t coddle—I push back when you\'re slipping, reference the WHY (family, debt, freedom), and create space for deep work. I delegate to sub-agents, validate their output, and keep the machine running clean. Casual, direct, mission-driven.',
    currentTask: null
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
