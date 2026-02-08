const express = require('express');
const { v4: uuidv4 } = require('uuid');
const storage = require('../db/storage');

const router = express.Router();

// Initialize collection
storage.initCollection('documents', []);

// GET /api/documents - List documents
router.get('/', (req, res) => {
  try {
    const documents = storage.findAll('documents');
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// POST /api/documents - Create document
router.post('/', (req, res) => {
  try {
    const { title, category = 'general', content } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const document = {
      id: uuidv4(),
      title,
      date: new Date().toISOString(),
      category,
      content: content || ''
    };

    const saved = storage.add('documents', document);
    res.status(201).json(saved);
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ error: 'Failed to create document' });
  }
});

// GET /api/documents/:id - Get document
router.get('/:id', (req, res) => {
  try {
    const document = storage.findById('documents', req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// DELETE /api/documents/:id - Delete document
router.delete('/:id', (req, res) => {
  try {
    const document = storage.findById('documents', req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const deleted = storage.remove('documents', req.params.id);
    res.json({ message: 'Document deleted', document: deleted });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

module.exports = router;
