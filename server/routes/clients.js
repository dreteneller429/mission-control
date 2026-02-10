const express = require('express');
const router = express.Router();
const storage = require('../db/storage');

// Initialize clients collection
storage.initCollection('clients', [
  {
    id: 'client-8unit',
    name: 'Fort Valley 8-Unit',
    company: 'Valley Properties LLC',
    email: 'contact@valleyprops.com',
    status: 'active',
    mrr: 24000,
    lastActivity: '2026-02-08T14:30:00Z',
    nextAction: 'Q1 portfolio review',
    description: 'Multi-unit residential property portfolio in Fort Valley region',
    interactions: [
      { date: '2026-02-08T14:30:00Z', type: 'Email' },
      { date: '2026-02-05T10:15:00Z', type: 'Phone Call' }
    ],
    documents: ['Portfolio Analysis', 'Investment Summary'],
    created_at: '2025-06-15T10:00:00Z'
  },
  {
    id: 'client-7unit',
    name: 'Metro 7-Unit Complex',
    company: 'Metro Residential Partners',
    email: 'info@metroresidential.com',
    status: 'active',
    mrr: 18000,
    lastActivity: '2026-02-07T09:45:00Z',
    nextAction: 'Refinancing proposal',
    description: 'Seven-unit apartment complex in metropolitan area',
    interactions: [
      { date: '2026-02-07T09:45:00Z', type: 'Meeting' },
      { date: '2026-02-01T16:20:00Z', type: 'Email' }
    ],
    documents: ['Property Specs', 'Financial Statements'],
    created_at: '2025-07-20T10:00:00Z'
  },
  {
    id: 'client-159unit',
    name: '159-Unit Peachstone Dev',
    company: 'Peachstone Development',
    email: 'deals@peachstone.com',
    status: 'prospect',
    mrr: 125000,
    lastActivity: '2026-02-06T13:00:00Z',
    nextAction: 'Contract negotiation',
    description: 'Large-scale residential development project with 159 units',
    interactions: [
      { date: '2026-02-06T13:00:00Z', type: 'Meeting' }
    ],
    documents: ['Development Plan', 'Market Analysis', 'Financial Model'],
    created_at: '2025-09-01T10:00:00Z'
  },
  {
    id: 'client-mario',
    name: 'Mario Properties Holdings',
    company: 'Mario Properties',
    email: 'mario@marioprops.com',
    status: 'active',
    mrr: 32000,
    lastActivity: '2026-02-04T11:20:00Z',
    nextAction: 'Monthly performance review',
    description: 'Multi-property real estate holdings and management',
    interactions: [
      { date: '2026-02-04T11:20:00Z', type: 'Email' },
      { date: '2026-01-28T15:45:00Z', type: 'Meeting' }
    ],
    documents: ['Portfolio Overview', 'Annual Report'],
    created_at: '2025-08-10T10:00:00Z'
  },
  {
    id: 'client-home-warranty',
    name: 'Home Warranty Group',
    company: 'National Home Warranty',
    email: 'partnerships@homew.com',
    status: 'active',
    mrr: 12000,
    lastActivity: '2026-02-03T08:30:00Z',
    nextAction: 'Renewal negotiation',
    description: 'Home warranty and protection program provider',
    interactions: [
      { date: '2026-02-03T08:30:00Z', type: 'Email' },
      { date: '2026-01-25T14:00:00Z', type: 'Phone Call' }
    ],
    documents: ['Partnership Agreement', 'Performance Metrics'],
    created_at: '2025-10-05T10:00:00Z'
  },
  {
    id: 'client-sureclose',
    name: 'SureClose Platform',
    company: 'SureClose Tech Inc',
    email: 'enterprise@sureclose.com',
    status: 'active',
    mrr: 45000,
    lastActivity: '2026-02-09T16:15:00Z',
    nextAction: 'Feature roadmap planning',
    description: 'Real estate closing and transaction management platform',
    interactions: [
      { date: '2026-02-09T16:15:00Z', type: 'Video Call' },
      { date: '2026-02-02T10:00:00Z', type: 'Meeting' }
    ],
    documents: ['Contract', 'Service Level Agreement', 'Integration Specs'],
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
