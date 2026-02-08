const express = require('express');
const router = express.Router();
const storage = require('../db/storage');

// Initialize cron jobs collection with default jobs
storage.initCollection('cron', [
  {
    id: 'morning-briefing',
    name: 'Morning Briefing',
    description: 'Scan AI news, RE market updates, SureClose pipeline',
    schedule: '0 7 * * *',
    schedule_readable: 'Every day at 7:00 AM EST',
    status: 'active',
    last_run: '2026-02-08T07:15:00Z',
    next_run: '2026-02-09T07:00:00Z',
    last_result: 'success',
    created_at: '2026-01-15T10:00:00Z'
  },
  {
    id: 'task-summary',
    name: 'Task Summary',
    description: 'Pull tasks, organize by urgency, send morning digest',
    schedule: '0 8 * * *',
    schedule_readable: 'Every day at 8:00 AM EST',
    status: 'active',
    last_run: '2026-02-08T08:02:00Z',
    next_run: '2026-02-09T08:00:00Z',
    last_result: 'success',
    created_at: '2026-01-20T10:00:00Z'
  },
  {
    id: 'email-check',
    name: 'Email Check',
    description: 'Monitor david@sureclose.ai for new emails',
    schedule: '*/10 * * * *',
    schedule_readable: 'Every 10 minutes',
    status: 'active',
    last_run: '2026-02-08T18:10:00Z',
    next_run: '2026-02-08T18:20:00Z',
    last_result: 'success',
    created_at: '2026-01-10T10:00:00Z'
  },
  {
    id: 'dashboard-notes',
    name: 'Dashboard Notes Check',
    description: 'Check if David left notes, process them',
    schedule: '*/5 * * * *',
    schedule_readable: 'Every 5 minutes',
    status: 'active',
    last_run: '2026-02-08T18:15:00Z',
    next_run: '2026-02-08T18:20:00Z',
    last_result: 'success',
    created_at: '2026-01-25T10:00:00Z'
  },
  {
    id: 'weekly-swot',
    name: 'Weekly SWOT',
    description: 'Competitor research, opportunity identification',
    schedule: '0 9 * * 1',
    schedule_readable: 'Every Monday at 9:00 AM EST',
    status: 'active',
    last_run: '2026-02-01T09:05:00Z',
    next_run: '2026-02-15T09:00:00Z',
    last_result: 'success',
    created_at: '2026-01-15T10:00:00Z'
  },
  {
    id: 'security-audit',
    name: 'Weekly Security Audit',
    description: 'Port scan, failed logins, permissions check',
    schedule: '0 14 * * 1',
    schedule_readable: 'Every Monday at 2:00 PM EST',
    status: 'active',
    last_run: '2026-02-01T14:10:00Z',
    next_run: '2026-02-15T14:00:00Z',
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
    
    const job = {
      id: `cron-${Date.now()}`,
      name,
      description,
      schedule,
      schedule_readable: generateReadableSchedule(schedule),
      status: 'active',
      last_run: null,
      next_run: new Date(Date.now() + 3600000).toISOString(), // Next hour
      last_result: 'pending',
      created_at: new Date().toISOString()
    };

    storage.add('cron', job);
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
    const updated = storage.update('cron', req.params.id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Cron job not found' });
    }
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
    res.json({ 
      success: true,
      message: 'Cron job deleted successfully',
      deleted: job 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to generate readable cron schedules
function generateReadableSchedule(cronString) {
  const parts = cronString.trim().split(/\s+/);
  if (parts.length !== 5) {
    return cronString; // Return original if not valid
  }

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  if (minute === '*/5' && hour === '*') {
    return 'Every 5 minutes';
  } else if (minute === '*/10' && hour === '*') {
    return 'Every 10 minutes';
  } else if (minute === '*/30' && hour === '*') {
    return 'Every 30 minutes';
  } else if (minute === '0' && dayOfMonth === '*' && month === '*') {
    const hrs = parseInt(hour);
    return `Every day at ${formatHour(hrs)}`;
  } else if (minute === '0' && dayOfWeek === '1') {
    const hrs = parseInt(hour);
    return `Every Monday at ${formatHour(hrs)}`;
  } else if (minute === '0' && dayOfWeek === '0') {
    const hrs = parseInt(hour);
    return `Every Sunday at ${formatHour(hrs)}`;
  }

  return cronString;
}

function formatHour(hour) {
  const meridiem = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:00 ${meridiem} EST`;
}

module.exports = router;
