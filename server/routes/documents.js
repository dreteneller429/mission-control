const express = require('express');
const router = express.Router();
const storage = require('../db/storage');

// Initialize documents collection
storage.initCollection('documents', [
  {
    id: 'doc-1',
    title: 'DESIGN_SYSTEM.md',
    type: 'markdown',
    path: '/home/clawd/.openclaw/workspace/mission-control/DESIGN_SYSTEM.md',
    created_at: '2026-02-08T18:09:00Z',
    updated_at: '2026-02-08T18:09:00Z',
    size: 13660,
    tags: ['design', 'system', 'ui']
  },
  {
    id: 'doc-2',
    title: 'EXECUTION_PLAN.md',
    type: 'markdown',
    path: '/home/clawd/.openclaw/workspace/mission-control/EXECUTION_PLAN.md',
    created_at: '2026-02-08T18:10:00Z',
    updated_at: '2026-02-08T18:10:00Z',
    size: 7589,
    tags: ['planning', 'execution', 'roadmap']
  },
  {
    id: 'doc-3',
    title: 'README.md',
    type: 'markdown',
    path: '/home/clawd/.openclaw/workspace/mission-control/README.md',
    created_at: '2026-02-08T18:08:00Z',
    updated_at: '2026-02-08T18:08:00Z',
    size: 9364,
    tags: ['documentation', 'reference']
  },
  {
    id: 'doc-4',
    title: 'QUICK_START.md',
    type: 'markdown',
    path: '/home/clawd/.openclaw/workspace/mission-control/QUICK_START.md',
    created_at: '2026-02-08T18:09:00Z',
    updated_at: '2026-02-08T18:09:00Z',
    size: 8085,
    tags: ['quickstart', 'getting-started']
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
