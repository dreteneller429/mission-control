const express = require('express');
const router = express.Router();
const storage = require('../db/storage');

// Initialize messages collection
storage.initCollection('messages', [
  {
    id: 'msg-1',
    sender: 'User',
    recipient: 'DAVE',
    message: 'Start Phase 2 development',
    timestamp: '2026-02-08T18:00:00Z',
    channel: 'telegram',
    read: true
  },
  {
    id: 'msg-2',
    sender: 'DAVE',
    recipient: 'User',
    message: 'Phase 2 (Navigation + Dashboard) started. Spawning sub-agent.',
    timestamp: '2026-02-08T18:01:00Z',
    channel: 'telegram',
    read: true
  },
  {
    id: 'msg-3',
    sender: 'User',
    recipient: 'DAVE',
    message: 'Good. Update me when phase 1 is done.',
    timestamp: '2026-02-08T18:05:00Z',
    channel: 'telegram',
    read: true
  }
]);

// Get all messages
router.get('/messages', (req, res) => {
  try {
    const messages = storage.findAll('messages');
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get messages for conversation
router.get('/messages/:recipient', (req, res) => {
  try {
    const messages = storage.findAll('messages');
    const conversation = messages.filter(m =>
      (m.sender === req.params.recipient || m.recipient === req.params.recipient)
    );
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send message
router.post('/messages', (req, res) => {
  try {
    const { sender, recipient, message, channel } = req.body;
    const msg = {
      id: `msg-${Date.now()}`,
      sender,
      recipient,
      message,
      timestamp: new Date().toISOString(),
      channel: channel || 'telegram',
      read: false
    };

    storage.add('messages', msg);
    res.status(201).json(msg);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark message as read
router.patch('/messages/:id/read', (req, res) => {
  try {
    const updated = storage.update('messages', req.params.id, { read: true });
    if (!updated) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
