const express = require('express');
const { v4: uuidv4 } = require('uuid');
const storage = require('../db/storage');

const router = express.Router();

// Initialize collection
storage.initCollection('messages', []);

// GET /api/comms/messages - Get message history
router.get('/messages', (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 100;
    const messages = storage.findAll('messages');
    
    // Sort by timestamp descending and apply limit
    const sorted = messages
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);

    res.json({
      count: sorted.length,
      messages: sorted
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// POST /api/comms/messages - Send message
router.post('/messages', (req, res) => {
  try {
    const { sender_id, sender_name, message_text, avatar = '💬' } = req.body;

    if (!sender_id || !sender_name || !message_text) {
      return res.status(400).json({ 
        error: 'sender_id, sender_name, and message_text are required' 
      });
    }

    const message = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      sender_id,
      sender_name,
      message_text,
      avatar
    };

    const saved = storage.add('messages', message);
    res.status(201).json(saved);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

module.exports = router;
