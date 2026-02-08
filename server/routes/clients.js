const express = require('express');
const router = express.Router();
const storage = require('../db/storage');

// Initialize clients collection
storage.initCollection('clients', [
  {
    id: 'client-8unit',
    name: '8-Unit Portfolio',
    type: 'Real Estate',
    status: 'active',
    deals: 8,
    value: '$2.4M',
    roi: '12.5%',
    manager: 'Team A',
    created_at: '2025-06-15T10:00:00Z'
  },
  {
    id: 'client-7unit',
    name: '7-Unit Portfolio',
    type: 'Real Estate',
    status: 'active',
    deals: 7,
    value: '$1.8M',
    roi: '11.2%',
    manager: 'Team B',
    created_at: '2025-07-20T10:00:00Z'
  },
  {
    id: 'client-159unit',
    name: '159-Unit Development',
    type: 'Real Estate',
    status: 'planning',
    deals: 159,
    value: '$45.8M',
    roi: '15.3%',
    manager: 'Executive Team',
    created_at: '2025-09-01T10:00:00Z'
  },
  {
    id: 'client-mario',
    name: 'Mario Properties',
    type: 'Real Estate',
    status: 'active',
    deals: 12,
    value: '$3.2M',
    roi: '10.8%',
    manager: 'Mario',
    created_at: '2025-08-10T10:00:00Z'
  },
  {
    id: 'client-home-warranty',
    name: 'Home Warranty Program',
    type: 'Service',
    status: 'active',
    deals: 450,
    value: '$1.2M',
    roi: '18.5%',
    manager: 'Operations',
    created_at: '2025-10-05T10:00:00Z'
  },
  {
    id: 'client-tanner',
    name: 'Tanner Ventures',
    type: 'Partnership',
    status: 'active',
    deals: 8,
    value: '$2.0M',
    roi: '9.5%',
    manager: 'Tanner',
    created_at: '2025-11-12T10:00:00Z'
  }
]);

// Get all clients
router.get('/', (req, res) => {
  try {
    const clients = storage.findAll('clients');
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single client
router.get('/:id', (req, res) => {
  try {
    const client = storage.findById('clients', req.params.id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new client
router.post('/', (req, res) => {
  try {
    const { name, type, manager } = req.body;
    const client = {
      id: `client-${Date.now()}`,
      name,
      type,
      status: 'active',
      manager,
      deals: 0,
      value: '$0',
      roi: '0%',
      created_at: new Date().toISOString()
    };

    storage.add('clients', client);
    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update client
router.patch('/:id', (req, res) => {
  try {
    const updates = req.body;
    const updated = storage.update('clients', req.params.id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete client
router.delete('/:id', (req, res) => {
  try {
    const client = storage.remove('clients', req.params.id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json({ success: true, deleted: client });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
