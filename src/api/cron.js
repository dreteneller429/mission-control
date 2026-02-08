/**
 * Cron Jobs API Routes
 * Handles CRUD operations for scheduled tasks
 */

const express = require('express');
const router = express.Router();

// In-memory storage (replace with database in production)
let cronJobs = [
  {
    id: 'morning-briefing',
    name: 'Morning Briefing',
    description: 'Scan AI news, RE market updates, SureClose pipeline',
    schedule: '0 7 * * *',
    active: true,
    lastRun: new Date('2026-02-08T07:15:00Z'),
    nextRun: new Date('2026-02-09T07:00:00Z'),
  },
  {
    id: 'task-summary',
    name: 'Task Summary',
    description: 'Pull tasks, organize by urgency, send morning digest',
    schedule: '0 8 * * *',
    active: true,
    lastRun: new Date('2026-02-08T08:02:00Z'),
    nextRun: new Date('2026-02-09T08:00:00Z'),
  },
  {
    id: 'email-check',
    name: 'Email Check',
    description: 'Monitor david@sureclose.ai for new emails',
    schedule: '*/10 * * * *',
    active: true,
    lastRun: new Date(Date.now() - 9 * 60000),
    nextRun: new Date(Date.now() + 60000),
  },
  {
    id: 'dashboard-notes',
    name: 'Dashboard Notes Check',
    description: 'Check if David left notes, process them',
    schedule: '*/5 * * * *',
    active: true,
    lastRun: new Date(Date.now() - 4 * 60000),
    nextRun: new Date(Date.now() + 60000),
  },
  {
    id: 'weekly-swot',
    name: 'Weekly SWOT',
    description: 'Competitor research, opportunity identification',
    schedule: '0 9 * * 1',
    active: true,
    lastRun: new Date('2026-02-01T09:05:00Z'),
    nextRun: new Date('2026-02-15T09:00:00Z'),
  },
  {
    id: 'security-audit',
    name: 'Weekly Security Audit',
    description: 'Port scan, failed logins, permissions check',
    schedule: '0 14 * * 1',
    active: true,
    lastRun: new Date('2026-02-01T14:10:00Z'),
    nextRun: new Date('2026-02-15T14:00:00Z'),
  },
];

/**
 * GET /api/cron
 * List all cron jobs
 */
router.get('/', (req, res) => {
  res.json(cronJobs);
});

/**
 * GET /api/cron/:id
 * Get a specific cron job
 */
router.get('/:id', (req, res) => {
  const job = cronJobs.find(j => j.id === req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  res.json(job);
});

/**
 * POST /api/cron
 * Create a new cron job
 */
router.post('/', (req, res) => {
  const { name, description, schedule, active } = req.body;

  if (!name || !description || !schedule) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Validate cron notation (basic validation)
  if (!isValidCron(schedule)) {
    return res.status(400).json({ error: 'Invalid cron notation' });
  }

  const newJob = {
    id: generateId(),
    name,
    description,
    schedule,
    active: active !== false,
    lastRun: null,
    nextRun: calculateNextRun(schedule),
  };

  cronJobs.push(newJob);

  res.status(201).json({
    success: true,
    job: newJob,
  });
});

/**
 * PUT /api/cron/:id
 * Update a cron job
 */
router.put('/:id', (req, res) => {
  const job = cronJobs.find(j => j.id === req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  const { name, description, schedule, active } = req.body;

  if (name) job.name = name;
  if (description) job.description = description;
  if (schedule) {
    if (!isValidCron(schedule)) {
      return res.status(400).json({ error: 'Invalid cron notation' });
    }
    job.schedule = schedule;
    job.nextRun = calculateNextRun(schedule);
  }
  if (typeof active === 'boolean') job.active = active;

  res.json({
    success: true,
    job,
  });
});

/**
 * DELETE /api/cron/:id
 * Delete a cron job
 */
router.delete('/:id', (req, res) => {
  const index = cronJobs.findIndex(j => j.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Job not found' });
  }

  cronJobs.splice(index, 1);

  res.json({
    success: true,
    message: 'Job deleted',
  });
});

// Helper functions

function generateId() {
  return 'job-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

function isValidCron(cronString) {
  // Basic cron validation (checks for 5 fields)
  const parts = cronString.trim().split(/\s+/);
  return parts.length === 5;
}

function calculateNextRun(cronString) {
  // Simplified next run calculation
  // In production, use a library like cron-parser
  const now = new Date();

  // Parse cron string (basic parsing)
  const [minute, hour, dayOfMonth, month, dayOfWeek] = cronString.split(/\s+/);

  // Return approximate next run (simplified)
  // For now, just add time based on pattern
  if (minute === '*' && hour === '*') {
    // Every minute - next run in 1 minute
    return new Date(now.getTime() + 60000);
  } else if (minute.startsWith('*/')) {
    // Every N minutes
    const interval = parseInt(minute.substring(2));
    return new Date(now.getTime() + interval * 60000);
  } else {
    // Specific time - add 1 day
    return new Date(now.getTime() + 86400000);
  }
}

module.exports = router;
