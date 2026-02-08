const express = require('express');
const { v4: uuidv4 } = require('uuid');
const storage = require('../db/storage');

const router = express.Router();

// Initialize collection
storage.initCollection('cron_jobs', []);

// GET /api/cron - List jobs
router.get('/', (req, res) => {
  try {
    const jobs = storage.findAll('cron_jobs');
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching cron jobs:', error);
    res.status(500).json({ error: 'Failed to fetch cron jobs' });
  }
});

// POST /api/cron - Create job
router.post('/', (req, res) => {
  try {
    const { name, description, schedule } = req.body;

    if (!name || !schedule) {
      return res.status(400).json({ error: 'Name and schedule are required' });
    }

    const job = {
      id: uuidv4(),
      name,
      description: description || '',
      schedule,
      next_run: calculateNextRun(schedule),
      last_run: null,
      status: 'active'
    };

    const saved = storage.add('cron_jobs', job);
    res.status(201).json(saved);
  } catch (error) {
    console.error('Error creating cron job:', error);
    res.status(500).json({ error: 'Failed to create cron job' });
  }
});

// PUT /api/cron/:id - Update job
router.put('/:id', (req, res) => {
  try {
    const { name, description, schedule, status } = req.body;

    const job = storage.findById('cron_jobs', req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Cron job not found' });
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (schedule !== undefined) {
      updates.schedule = schedule;
      updates.next_run = calculateNextRun(schedule);
    }
    if (status !== undefined) updates.status = status;

    const updated = storage.update('cron_jobs', req.params.id, updates);
    res.json(updated);
  } catch (error) {
    console.error('Error updating cron job:', error);
    res.status(500).json({ error: 'Failed to update cron job' });
  }
});

// DELETE /api/cron/:id - Delete job
router.delete('/:id', (req, res) => {
  try {
    const job = storage.findById('cron_jobs', req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Cron job not found' });
    }

    const deleted = storage.remove('cron_jobs', req.params.id);
    res.json({ message: 'Cron job deleted', job: deleted });
  } catch (error) {
    console.error('Error deleting cron job:', error);
    res.status(500).json({ error: 'Failed to delete cron job' });
  }
});

// POST /api/cron/:id/run - Trigger immediately
router.post('/:id/run', (req, res) => {
  try {
    const job = storage.findById('cron_jobs', req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Cron job not found' });
    }

    // Simulate running the job
    const updated = storage.update('cron_jobs', req.params.id, {
      last_run: new Date().toISOString(),
      next_run: calculateNextRun(job.schedule)
    });

    res.json({
      message: 'Cron job triggered',
      job: updated,
      execution_time: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error running cron job:', error);
    res.status(500).json({ error: 'Failed to run cron job' });
  }
});

// Helper function to calculate next run time
function calculateNextRun(schedule) {
  // Simple calculation - add 24 hours for daily, adjust as needed
  const now = new Date();
  const nextRun = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  return nextRun.toISOString();
}

module.exports = router;
