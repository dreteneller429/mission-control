const express = require('express');
const { v4: uuidv4 } = require('uuid');
const storage = require('../db/storage');

const router = express.Router();

// Initialize collection
storage.initCollection('clients', []);

// GET /api/clients - List clients
router.get('/', (req, res) => {
  try {
    const clients = storage.findAll('clients');
    res.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

// POST /api/clients - Create client
router.post('/', (req, res) => {
  try {
    const { name, company, status = 'active', mrr = 0, next_action = '' } = req.body;

    if (!name || !company) {
      return res.status(400).json({ error: 'Name and company are required' });
    }

    const client = {
      id: uuidv4(),
      name,
      company,
      status,
      mrr,
      last_activity: new Date().toISOString(),
      next_action
    };

    const saved = storage.add('clients', client);
    res.status(201).json(saved);
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ error: 'Failed to create client' });
  }
});

// GET /api/clients/:id - Get client details
router.get('/:id', (req, res) => {
  try {
    const client = storage.findById('clients', req.params.id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({ error: 'Failed to fetch client' });
  }
});

// PUT /api/clients/:id - Update client
router.put('/:id', (req, res) => {
  try {
    const { name, company, status, mrr, next_action } = req.body;

    const client = storage.findById('clients', req.params.id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (company !== undefined) updates.company = company;
    if (status !== undefined) updates.status = status;
    if (mrr !== undefined) updates.mrr = mrr;
    if (next_action !== undefined) updates.next_action = next_action;
    updates.last_activity = new Date().toISOString();

    const updated = storage.update('clients', req.params.id, updates);
    res.json(updated);
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ error: 'Failed to update client' });
  }
});

// DELETE /api/clients/:id - Delete client
router.delete('/:id', (req, res) => {
  try {
    const client = storage.findById('clients', req.params.id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const deleted = storage.remove('clients', req.params.id);
    res.json({ message: 'Client deleted', client: deleted });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ error: 'Failed to delete client' });
  }
});

module.exports = router;
