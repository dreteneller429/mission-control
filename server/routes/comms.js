const express = require('express');
const router = express.Router();
const storage = require('../db/storage');

// Initialize comms messages collection
storage.initCollection('comms_messages', []);

// Get all messages
router.get('/messages', (req, res) => {
  try {
    const messages = storage.findAll('comms_messages');
    res.json({
      status: 'success',
      data: messages,
      count: messages.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send a new message
router.post('/messages', (req, res) => {
  try {
    const { senderId, senderName, avatar, avatarClass, text } = req.body;
    
    const message = {
      id: Date.now().toString(),
      senderId,
      senderName,
      avatar,
      avatarClass,
      text,
      timestamp: new Date().toISOString()
    };

    storage.add('comms_messages', message);
    
    res.status(201).json({
      status: 'success',
      data: message,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get comms stats
router.get('/stats', (req, res) => {
  try {
    const messages = storage.findAll('comms_messages');
    const participants = [...new Set(messages.map(m => m.senderId))];
    
    res.json({
      status: 'success',
      data: {
        totalMessages: messages.length,
        activeChannels: 1,
        lastMessageTime: messages.length > 0 ? messages[messages.length - 1].timestamp : null,
        participants: participants.length
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
