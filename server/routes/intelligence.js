const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const storage = require('../db/storage');

// Initialize intelligence collection
storage.initCollection('intelligence', [
  {
    id: 'intel-1',
    title: 'SureClose Q1 Pipeline Analysis',
    description: 'Comprehensive analysis of Q1 deal velocity and conversion rates',
    category: 'BUSINESS_INTELLIGENCE',
    content: 'SureClose Q1 pipeline analysis reveals strong momentum across all deal stages with a 12% increase in conversion rates compared to Q4 2025.',
    status: 'active',
    priority: 'high',
    created_at: '2026-02-10T12:00:00Z',
    timestamp: '5m ago',
    author: 'Intelligence Engine',
    subtitle: 'Comprehensive analysis of Q1 deal velocity and conversion rates',
    breakdown: '## Executive Summary\nSureClose Q1 pipeline analysis reveals strong momentum across all deal stages with a 12% increase in conversion rates.\n\n## Key Findings\n- Stage 1 Prospecting: 156 new leads (↑8% vs Q4)\n- Stage 2 Qualification: 87 qualified opportunities (↑15% vs Q4)\n- Stage 3 Proposal: 34 active proposals (↑5% vs Q4)\n- Overall conversion rate: 21.8% (up from 19.4% in Q4)',
    impact: 'Q1 trajectory indicates $2.8M in confirmed revenue with potential upside to $3.2M if enterprise deals close early.',
    strategy: 'Focus resources on accelerating enterprise deals. Implement enhanced nurture sequences. Monitor SMB team conversion rates for coaching opportunities.',
    strategies: []
  },
  {
    id: 'intel-2',
    title: 'Time Optimization Findings',
    description: 'Deep analysis of productivity metrics and efficiency gains',
    category: 'PRODUCTIVITY_INTELLIGENCE',
    content: 'Recent time tracking analysis reveals significant optimization opportunities with potential 15-18% efficiency gains.',
    status: 'active',
    priority: 'high',
    created_at: '2026-02-10T11:00:00Z',
    timestamp: '1h ago',
    author: 'Analytics Team',
    subtitle: 'Deep analysis of productivity metrics and efficiency gains',
    breakdown: '## Overview\nCurrent allocation shows Deep Work at 42% (Target: 55%), Meetings at 28% (Target: 15%), Admin/Email at 18% (Target: 12%), Context Switching at 12%.\n\n## Peak Productivity Windows\n- Morning (7-10 AM): 87% efficiency\n- Mid-day (1-3 PM): 65% efficiency\n- Late afternoon (4-6 PM): 52% efficiency',
    impact: 'Implementing recommended optimizations could free up 6-8 hours per week, equivalent to 100 hours of reclaimed productivity annually.',
    strategy: 'Start with 2-week pilot of focus block methodology. Measure baseline metrics. Roll out notification management system. Create team guidelines for asynchronous communication.',
    strategies: []
  },
  {
    id: 'intel-3',
    title: 'Competitive Landscape: RE Wholesaling',
    description: 'Market analysis of emerging competitors and market shifts',
    category: 'MARKET_INTELLIGENCE',
    content: 'The real estate wholesaling market is experiencing consolidation with 3 major players controlling 42% of the market.',
    status: 'active',
    priority: 'high',
    created_at: '2026-02-10T09:30:00Z',
    timestamp: '3h ago',
    author: 'Market Research',
    subtitle: 'Market analysis of emerging competitors and market shifts',
    breakdown: '## Competitive Landscape\n- Competitor A (PropTech Solutions): 18% market share\n- Competitor B (FlipFlow Systems): 15% market share\n- Competitor C (CloudClose Pro): 9% market share\n- SureClose Position: 12% market share (growing 31% YoY)',
    impact: 'Understanding competitive positioning allows for strategic product roadmap prioritization. Market consolidation creates acquisition opportunities.',
    strategy: 'Accelerate premium feature development. Target FlipFlow customers with enterprise migration offers. Explore partnership opportunities.',
    strategies: []
  },
  {
    id: 'intel-4',
    title: 'Technology Stack Modernization',
    description: 'Evaluation of current tech infrastructure and modernization roadmap',
    category: 'RESEARCH_INTELLIGENCE',
    content: 'Assessment of technology infrastructure with recommendations for modernization to improve scalability and maintainability.',
    status: 'draft',
    priority: 'medium',
    created_at: '2026-02-09T14:30:00Z',
    timestamp: '1d ago',
    author: 'Technology Team',
    subtitle: 'Evaluation of current tech infrastructure and modernization roadmap',
    breakdown: '## Current Stack Assessment\n- Frontend: React 18 (Good)\n- Backend: Node.js Express (Good)\n- Database: PostgreSQL (Good)\n- Infrastructure: Cloud-based (AWS)\n\n## Modernization Priorities\n1. Implement microservices architecture\n2. Add API rate limiting\n3. Enhance monitoring and logging',
    impact: 'Modernization could reduce deployment time by 40% and improve system reliability to 99.9% uptime.',
    strategy: 'Phase 1: Assessment and planning (2 weeks). Phase 2: Infrastructure setup (4 weeks). Phase 3: Migration (8 weeks).',
    strategies: []
  },
  {
    id: 'intel-5',
    title: 'Customer Retention Strategy Review',
    description: 'Analysis of churn factors and retention improvement opportunities',
    category: 'SOURCE_INTELLIGENCE',
    content: 'Comprehensive review of customer retention metrics and identification of churn prevention strategies.',
    status: 'active',
    priority: 'high',
    created_at: '2026-02-09T10:00:00Z',
    timestamp: '2d ago',
    author: 'Customer Success',
    subtitle: 'Analysis of churn factors and retention improvement opportunities',
    breakdown: '## Retention Metrics\n- Overall retention rate: 94% (Target: 96%)\n- Enterprise retention: 98%\n- SMB retention: 89%\n- Churn causes: Product features (35%), Pricing (25%), Support quality (20%), Competition (20%)',
    impact: 'Improving retention by 2% could generate $1.2M in additional ARR. Customer lifetime value would increase by 15%.',
    strategy: 'Launch premium support tier for enterprise. Create product feature roadmap based on feedback. Implement usage-based pricing tier for SMBs. Establish customer advisory board.',
    strategies: []
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
