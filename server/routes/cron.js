const express = require('express');
const router = express.Router();
const storage = require('../db/storage');
const cronScheduler = require('../services/cron-scheduler');

// Initialize cron jobs collection with default jobs
// Specs: Morning Briefing (7:00am), Task Summary (12:00pm), Email Check (every hour),
// Dashboard Notes Check (6:00pm), Weekly SWOT (Sunday 6pm), Security Audit (Monday 12am)
storage.initCollection('cron', [
  {
    id: 'morning-briefing',
    name: 'Morning Briefing',
    description: 'Scan AI news, RE market updates, SureClose pipeline',
    schedule: '0 7 * * *',
    schedule_readable: 'Every day at 7:00 AM EST',
    status: 'active',
    last_run: '2026-02-10T07:15:00Z',
    next_run: '2026-02-11T07:00:00Z',
    last_result: 'success',
    created_at: '2026-01-15T10:00:00Z'
  },
  {
    id: 'task-summary',
    name: 'Task Summary',
    description: 'Pull tasks, organize by urgency, send daily summary',
    schedule: '0 12 * * *',
    schedule_readable: 'Every day at 12:00 PM EST',
    status: 'active',
    last_run: '2026-02-10T12:02:00Z',
    next_run: '2026-02-11T12:00:00Z',
    last_result: 'success',
    created_at: '2026-01-20T10:00:00Z'
  },
  {
    id: 'email-check',
    name: 'Email Check',
    description: 'Monitor david@sureclose.ai for new emails',
    schedule: '0 * * * *',
    schedule_readable: 'Every hour',
    status: 'active',
    last_run: '2026-02-10T13:00:00Z',
    next_run: '2026-02-10T14:00:00Z',
    last_result: 'success',
    created_at: '2026-01-10T10:00:00Z'
  },
  {
    id: 'dashboard-notes',
    name: 'Dashboard Notes Check',
    description: 'Check if David left notes, process them',
    schedule: '0 18 * * *',
    schedule_readable: 'Every day at 6:00 PM EST',
    status: 'active',
    last_run: '2026-02-10T18:00:00Z',
    next_run: '2026-02-11T18:00:00Z',
    last_result: 'success',
    created_at: '2026-01-25T10:00:00Z'
  },
  {
    id: 'weekly-swot',
    name: 'Weekly SWOT',
    description: 'Competitor research, opportunity identification',
    schedule: '0 18 * * 0',
    schedule_readable: 'Every Sunday at 6:00 PM EST',
    status: 'active',
    last_run: '2026-02-09T18:05:00Z',
    next_run: '2026-02-16T18:00:00Z',
    last_result: 'success',
    created_at: '2026-01-15T10:00:00Z'
  },
  {
    id: 'security-audit',
    name: 'Security Audit',
    description: 'Port scan, failed logins, permissions check',
    schedule: '0 0 * * 1',
    schedule_readable: 'Every Monday at 12:00 AM EST',
    status: 'active',
    last_run: '2026-02-10T00:10:00Z',
    next_run: '2026-02-17T00:00:00Z',
    last_result: 'success',
    created_at: '2026-01-20T10:00:00Z'
  }
]);

// Get all cron jobs
router.get('/', (req, res) => {
  try {
    const jobs = storage.findAll('cron');
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single cron job
router.get('/:id', (req, res) => {
  try {
    const job = storage.findById('cron', req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Cron job not found' });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new cron job
router.post('/', (req, res) => {
  try {
    const { name, description, schedule } = req.body;
    
    if (!name || !description || !schedule) {
      return res.status(400).json({ error: 'Missing required fields: name, description, schedule' });
    }
    
    // Validate cron expression
    const cron = require('node-cron');
    if (!cron.validate(schedule)) {
      return res.status(400).json({ error: 'Invalid cron expression' });
    }
    
    // Calculate accurate next run time
    const nextRun = cronScheduler.calculateNextRun(schedule);
    
    const job = {
      id: `cron-${Date.now()}`,
      name,
      description,
      schedule,
      schedule_readable: cronScheduler.getScheduleDescription(schedule),
      status: 'active',
      last_run: null,
      next_run: nextRun,
      last_result: null,
      created_at: new Date().toISOString()
    };

    storage.add('cron', job);
    
    // Schedule the job immediately
    cronScheduler.scheduleJob(job);
    
    res.status(201).json({
      success: true,
      job,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update cron job
router.patch('/:id', (req, res) => {
  try {
    const updates = req.body;
    
    // If schedule is being updated, validate and recalculate next run
    if (updates.schedule) {
      const cron = require('node-cron');
      if (!cron.validate(updates.schedule)) {
        return res.status(400).json({ error: 'Invalid cron expression' });
      }
      updates.next_run = cronScheduler.calculateNextRun(updates.schedule);
      updates.schedule_readable = cronScheduler.getScheduleDescription(updates.schedule);
    }
    
    const updated = storage.update('cron', req.params.id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Cron job not found' });
    }
    
    // Reschedule the job
    cronScheduler.scheduleJob(updated);
    
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update cron job (PUT - for status toggle and other updates)
router.put('/:id', (req, res) => {
  try {
    const { active } = req.body;
    const updates = {};
    
    if (typeof active === 'boolean') {
      updates.status = active ? 'active' : 'disabled';
    }
    
    // Merge other updates
    Object.assign(updates, req.body);
    
    const updated = storage.update('cron', req.params.id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Cron job not found' });
    }
    
    // Reschedule or unschedule based on status
    if (updated.status === 'active') {
      cronScheduler.scheduleJob(updated);
    } else {
      cronScheduler.unscheduleJob(updated.id);
    }
    
    res.json({
      success: true,
      job: updated,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Disable cron job
router.post('/:id/disable', (req, res) => {
  try {
    const updated = storage.update('cron', req.params.id, { status: 'disabled' });
    if (!updated) {
      return res.status(404).json({ error: 'Cron job not found' });
    }
    
    // Unschedule the job
    cronScheduler.unscheduleJob(req.params.id);
    
    res.json({ success: true, job: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Enable cron job
router.post('/:id/enable', (req, res) => {
  try {
    const updated = storage.update('cron', req.params.id, { status: 'active' });
    if (!updated) {
      return res.status(404).json({ error: 'Cron job not found' });
    }
    
    // Schedule the job
    cronScheduler.scheduleJob(updated);
    
    res.json({ success: true, job: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete cron job
router.delete('/:id', (req, res) => {
  try {
    const job = storage.remove('cron', req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Cron job not found' });
    }
    
    // Unschedule the job
    cronScheduler.unscheduleJob(req.params.id);
    
    res.json({ 
      success: true,
      message: 'Cron job deleted successfully',
      deleted: job 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get scheduler status (for debugging)
router.get('/scheduler/status', (req, res) => {
  try {
    const status = cronScheduler.getStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
