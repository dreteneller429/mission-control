/**
 * Cron Scheduler Service
 * Actually executes and manages scheduled cron jobs
 */

const cron = require('node-cron');
const { CronExpressionParser } = require('cron-parser');
const storage = require('../db/storage');

class CronScheduler {
  constructor() {
    this.scheduledJobs = new Map();
    this.running = false;
  }

  /**
   * Start the cron scheduler
   */
  start() {
    if (this.running) {
      console.log('⚠️  Cron scheduler already running');
      return;
    }

    console.log('🕐 Starting cron scheduler...');
    this.running = true;

    // Load and schedule all active jobs
    this.loadAndScheduleJobs();

    // Check for new/updated jobs every minute
    this.checkInterval = setInterval(() => {
      this.loadAndScheduleJobs();
    }, 60000);

    console.log('✅ Cron scheduler started');
  }

  /**
   * Stop the cron scheduler
   */
  stop() {
    if (!this.running) return;

    console.log('🛑 Stopping cron scheduler...');
    
    // Clear all scheduled jobs
    for (const [jobId, scheduledTask] of this.scheduledJobs) {
      scheduledTask.stop();
    }
    this.scheduledJobs.clear();

    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.running = false;
    console.log('✅ Cron scheduler stopped');
  }

  /**
   * Load jobs from storage and schedule them
   */
  loadAndScheduleJobs() {
    try {
      const jobs = storage.findAll('cron');
      
      // Schedule each active job
      jobs.forEach(job => {
        if (job.status === 'active') {
          this.scheduleJob(job);
        } else {
          // Unschedule disabled jobs
          this.unscheduleJob(job.id);
        }
      });

      // Remove scheduled jobs that no longer exist
      const jobIds = new Set(jobs.map(j => j.id));
      for (const scheduledId of this.scheduledJobs.keys()) {
        if (!jobIds.has(scheduledId)) {
          this.unscheduleJob(scheduledId);
        }
      }
    } catch (error) {
      console.error('❌ Error loading cron jobs:', error);
    }
  }

  /**
   * Schedule a single job
   */
  scheduleJob(job) {
    // If already scheduled, check if schedule changed
    if (this.scheduledJobs.has(job.id)) {
      const existing = this.scheduledJobs.get(job.id);
      // If schedule hasn't changed, no need to reschedule
      if (existing.cronExpression === job.schedule) {
        return;
      }
      // Schedule changed, unschedule and reschedule
      this.unscheduleJob(job.id);
    }

    // Validate cron expression
    if (!cron.validate(job.schedule)) {
      console.error(`❌ Invalid cron expression for job ${job.id}: ${job.schedule}`);
      return;
    }

    try {
      // Calculate next run time
      const nextRun = this.calculateNextRun(job.schedule);
      
      // Update next_run in storage
      storage.update('cron', job.id, {
        next_run: nextRun
      });

      // Schedule the job
      const task = cron.schedule(job.schedule, () => {
        this.executeJob(job);
      }, {
        timezone: 'America/New_York' // EST
      });

      // Store the task
      this.scheduledJobs.set(job.id, {
        task,
        cronExpression: job.schedule,
        nextRun
      });

      console.log(`✅ Scheduled job: ${job.name} (${job.schedule})`);
    } catch (error) {
      console.error(`❌ Error scheduling job ${job.id}:`, error);
    }
  }

  /**
   * Unschedule a job
   */
  unscheduleJob(jobId) {
    if (!this.scheduledJobs.has(jobId)) return;

    const scheduled = this.scheduledJobs.get(jobId);
    scheduled.task.stop();
    this.scheduledJobs.delete(jobId);
    console.log(`🛑 Unscheduled job: ${jobId}`);
  }

  /**
   * Execute a cron job
   */
  async executeJob(job) {
    console.log(`⚡ Executing job: ${job.name}`);
    const startTime = Date.now();
    
    try {
      // Update last_run timestamp
      const now = new Date().toISOString();
      const nextRun = this.calculateNextRun(job.schedule);
      
      storage.update('cron', job.id, {
        last_run: now,
        next_run: nextRun,
        last_result: 'running'
      });

      // Execute the actual job logic
      await this.runJobLogic(job);

      // Mark as success
      const duration = Date.now() - startTime;
      storage.update('cron', job.id, {
        last_result: 'success',
        last_duration: duration
      });

      console.log(`✅ Job completed: ${job.name} (${duration}ms)`);
    } catch (error) {
      console.error(`❌ Job failed: ${job.name}`, error);
      storage.update('cron', job.id, {
        last_result: 'error',
        last_error: error.message
      });
    }
  }

  /**
   * Run the actual job logic (placeholder)
   * In production, this would trigger specific actions based on job type
   */
  async runJobLogic(job) {
    // Simulate job execution
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`   → Running: ${job.description}`);
        resolve();
      }, 100);
    });

    // TODO: Implement actual job logic based on job.id or job.type
    // Examples:
    // - morning-briefing: Scan news, market updates
    // - email-check: Check inbox
    // - task-summary: Generate task report
    // - dashboard-notes: Process dashboard notes
    // - etc.
  }

  /**
   * Calculate next run time for a cron expression
   */
  calculateNextRun(cronExpression) {
    try {
      const interval = CronExpressionParser.parse(cronExpression, {
        currentDate: new Date(),
        tz: 'America/New_York'
      });
      return interval.next().toISOString();
    } catch (error) {
      console.error('Error calculating next run:', error);
      // Fallback: 1 hour from now
      return new Date(Date.now() + 3600000).toISOString();
    }
  }

  /**
   * Get human-readable description of cron schedule
   */
  getScheduleDescription(cronExpression) {
    const parts = cronExpression.trim().split(/\s+/);
    if (parts.length !== 5) {
      return cronExpression;
    }

    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

    // Every N minutes
    if (minute.startsWith('*/')) {
      const interval = minute.substring(2);
      return `Every ${interval} minutes`;
    }

    // Hourly
    if (minute === '0' && hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
      return 'Every hour';
    }

    // Daily at specific time
    if (dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
      const hrs = parseInt(hour);
      const mins = parseInt(minute);
      return `Every day at ${this.formatTime(hrs, mins)}`;
    }

    // Weekly on specific day
    if (dayOfMonth === '*' && month === '*' && dayOfWeek !== '*') {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = days[parseInt(dayOfWeek)] || 'Unknown';
      const hrs = parseInt(hour);
      const mins = parseInt(minute);
      return `Every ${dayName} at ${this.formatTime(hrs, mins)}`;
    }

    return cronExpression;
  }

  /**
   * Format time in 12-hour format
   */
  formatTime(hour, minute = 0) {
    const meridiem = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    const displayMinute = minute.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${meridiem} EST`;
  }

  /**
   * Get status of scheduler
   */
  getStatus() {
    return {
      running: this.running,
      activeJobs: this.scheduledJobs.size,
      jobs: Array.from(this.scheduledJobs.entries()).map(([id, data]) => ({
        id,
        nextRun: data.nextRun,
        schedule: data.cronExpression
      }))
    };
  }
}

// Create singleton instance
const scheduler = new CronScheduler();

module.exports = scheduler;
