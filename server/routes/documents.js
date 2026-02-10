const express = require('express');
const router = express.Router();
const storage = require('../db/storage');

// Initialize documents collection
storage.initCollection('documents', [
  {
    id: 'doc-1',
    title: 'CHECKPOINT_6_COMPLETION.md',
    category: 'sub-agent-reports',
    type: 'markdown',
    path: '/home/clawd/.openclaw/workspace/CHECKPOINT_6_COMPLETION.md',
    date: '2026-02-10T13:42:00Z',
    created_at: '2026-02-10T13:42:00Z',
    updated_at: '2026-02-10T13:42:00Z',
    size: 12917,
    tags: ['checkpoint', 'api', 'usage', 'report'],
    content: '# Checkpoint 6: API Usage Page Wiring - Complete'
  },
  {
    id: 'doc-2',
    title: 'MISSION_CONTROL_FIXES.md',
    category: 'sub-agent-reports',
    type: 'markdown',
    path: '/home/clawd/.openclaw/workspace/MISSION_CONTROL_FIXES.md',
    date: '2026-02-10T02:42:00Z',
    created_at: '2026-02-10T02:42:00Z',
    updated_at: '2026-02-10T02:42:00Z',
    size: 11260,
    tags: ['mission-control', 'fixes', 'v4'],
    content: '# Mission Control Fixes - Dashboard Updates'
  },
  {
    id: 'doc-3',
    title: 'Fort_Valley_159_Unit_Buyer_Acquisition_Plan.md',
    category: 'sureclose',
    type: 'markdown',
    path: '/home/clawd/.openclaw/workspace/Fort_Valley_159_Unit_Buyer_Acquisition_Plan.md',
    date: '2026-02-06T02:35:00Z',
    created_at: '2026-02-06T02:35:00Z',
    updated_at: '2026-02-06T02:35:00Z',
    size: 74662,
    tags: ['real-estate', 'sureclose', 'acquisition', 'fort-valley'],
    content: '# Fort Valley 159 Unit Buyer Acquisition Plan'
  },
  {
    id: 'doc-4',
    title: '159-Unit-Fort-Valley-Research.md',
    category: 'sureclose',
    type: 'markdown',
    path: '/home/clawd/.openclaw/workspace/159-unit-fort-valley-research.md',
    date: '2026-02-03T01:00:00Z',
    created_at: '2026-02-03T01:00:00Z',
    updated_at: '2026-02-03T01:00:00Z',
    size: 7790,
    tags: ['research', 'fort-valley', 'market'],
    content: '# Fort Valley Unit Research'
  },
  {
    id: 'doc-5',
    title: 'MISSION_CONTROL_V4.md',
    category: 'personal',
    type: 'markdown',
    path: '/home/clawd/.openclaw/workspace/MISSION_CONTROL_V4.md',
    date: '2026-02-08T17:52:00Z',
    created_at: '2026-02-08T17:52:00Z',
    updated_at: '2026-02-08T17:52:00Z',
    size: 15855,
    tags: ['mission-control', 'documentation', 'v4'],
    content: '# Mission Control V4 Documentation'
  },
  {
    id: 'doc-6',
    title: 'DESIGN_SYSTEM.md',
    category: 'training',
    type: 'markdown',
    path: '/home/clawd/.openclaw/workspace/mission-control/DESIGN_SYSTEM.md',
    date: '2026-02-08T18:09:00Z',
    created_at: '2026-02-08T18:09:00Z',
    updated_at: '2026-02-08T18:09:00Z',
    size: 13660,
    tags: ['design', 'system', 'ui', 'training'],
    content: '# Design System Documentation'
  },
  {
    id: 'doc-7',
    title: 'QUICK_START.md',
    category: 'training',
    type: 'markdown',
    path: '/home/clawd/.openclaw/workspace/mission-control/QUICK_START.md',
    date: '2026-02-08T18:09:00Z',
    created_at: '2026-02-08T18:09:00Z',
    updated_at: '2026-02-08T18:09:00Z',
    size: 8085,
    tags: ['quickstart', 'getting-started', 'training'],
    content: '# Quick Start Guide'
  },
  {
    id: 'doc-8',
    title: 'README.md',
    category: 'misc',
    type: 'markdown',
    path: '/home/clawd/.openclaw/workspace/mission-control/README.md',
    date: '2026-02-08T18:08:00Z',
    created_at: '2026-02-08T18:08:00Z',
    updated_at: '2026-02-08T18:08:00Z',
    size: 9364,
    tags: ['documentation', 'reference'],
    content: '# Mission Control Dashboard'
  },
  {
    id: 'doc-9',
    title: 'API_DOCS.md',
    category: 'peachstone',
    type: 'markdown',
    path: '/home/clawd/.openclaw/workspace/mission-control/API_DOCS.md',
    date: '2026-02-08T18:24:00Z',
    created_at: '2026-02-08T18:24:00Z',
    updated_at: '2026-02-08T18:24:00Z',
    size: 20610,
    tags: ['api', 'documentation', 'peachstone'],
    content: '# API Documentation'
  },
  {
    id: 'doc-10',
    title: 'ARCHITECTURE.md',
    category: 'sub-agent-reports',
    type: 'markdown',
    path: '/home/clawd/.openclaw/workspace/mission-control/ARCHITECTURE.md',
    date: '2026-02-08T18:28:00Z',
    created_at: '2026-02-08T18:28:00Z',
    updated_at: '2026-02-08T18:28:00Z',
    size: 19218,
    tags: ['architecture', 'system', 'design'],
    content: '# System Architecture'
  }
]);

// Get all documents
router.get('/', (req, res) => {
  try {
    const documents = storage.findAll('documents');
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single document
router.get('/:id', (req, res) => {
  try {
    const doc = storage.findById('documents', req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json(doc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new document
router.post('/', (req, res) => {
  try {
    const { title, type, path, tags } = req.body;
    const doc = {
      id: `doc-${Date.now()}`,
      title,
      type,
      path,
      tags: tags || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      size: 0
    };

    storage.add('documents', doc);
    res.status(201).json(doc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update document
router.patch('/:id', (req, res) => {
  try {
    const updates = { ...req.body, updated_at: new Date().toISOString() };
    const updated = storage.update('documents', req.params.id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete document
router.delete('/:id', (req, res) => {
  try {
    const doc = storage.remove('documents', req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json({ success: true, deleted: doc });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
