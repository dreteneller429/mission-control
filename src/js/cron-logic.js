/**
 * Cron Jobs Page Logic - Backend Integration
 * Handles job management, CRUD operations, real-time countdown timers, and API integration
 */

class CronJobsManager {
  constructor() {
    this.jobs = [];
    this.editingJobId = null;
    this.countdownInterval = null;
    this.refreshInterval = null;
    this.init();
  }

  init() {
    this.attachEventListeners();
    this.loadJobsFromAPI();
    this.startCountdownUpdates();
    this.startPeriodicRefresh();
  }

  attachEventListeners() {
    // Create job button
    const createJobBtn = document.getElementById('createJobBtn');
    if (createJobBtn) {
      createJobBtn.addEventListener('click', () => this.openCreateJobModal());
    }

    // Modal controls
    const closeBtn = document.getElementById('closeJobModalBtn');
    const cancelBtn = document.getElementById('cancelJobBtn');
    const jobForm = document.getElementById('jobForm');
    const modalOverlay = document.getElementById('jobModalOverlay');

    if (closeBtn) closeBtn.addEventListener('click', () => this.closeJobModal());
    if (cancelBtn) cancelBtn.addEventListener('click', () => this.closeJobModal());
    if (jobForm) jobForm.addEventListener('submit', (e) => this.handleJobSubmit(e));
    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) this.closeJobModal();
      });
    }

    // Cron presets
    document.querySelectorAll('.preset').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const cronValue = btn.dataset.cron;
        const cronInput = document.getElementById('jobCron');
        if (cronInput) cronInput.value = cronValue;
      });
    });

    // Delegated event listeners for job cards
    document.addEventListener('change', (e) => {
      if (e.target.classList.contains('job-toggle')) {
        const card = e.target.closest('.cron-job-card');
        if (card) {
          const jobId = card.dataset.jobId;
          const isActive = e.target.checked;
          this.toggleJobStatus(jobId, isActive);
        }
      }
    });

    document.addEventListener('click', (e) => {
      // Edit button handler
      if (e.target.classList.contains('edit-job-btn')) {
        const card = e.target.closest('.cron-job-card');
        if (card) {
          const jobId = card.dataset.jobId;
          this.openEditJobModal(jobId);
        }
      }

      // Delete button handler
      if (e.target.classList.contains('delete-job-btn')) {
        const card = e.target.closest('.cron-job-card');
        if (card) {
          const jobId = card.dataset.jobId;
          const jobName = card.querySelector('.job-name')?.textContent || 'this job';
          if (confirm(`Are you sure you want to delete "${jobName}"? This cannot be undone.`)) {
            this.deleteJobFromAPI(jobId);
          }
        }
      }
    });
  }

  /**
   * Load all cron jobs from backend API
   */
  loadJobsFromAPI() {
    fetch('http://localhost:3000/api/cron')
      .then(res => {
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
      })
      .then(data => {
        this.jobs = Array.isArray(data) ? data : [];
        this.renderJobsList();
        console.log('✅ Loaded', this.jobs.length, 'cron jobs from API');
      })
      .catch(err => {
        console.error('❌ Failed to load cron jobs:', err);
        this.jobs = [];
        this.renderJobsList();
        this.showErrorNotification('Failed to load cron jobs - ' + err.message);
      });
  }

  /**
   * Render the jobs list in the DOM
   */
  renderJobsList() {
    const container = document.getElementById('cronJobsList');
    if (!container) return;

    // Clear container
    container.innerHTML = '';

    if (this.jobs.length === 0) {
      container.innerHTML = `
        <div class="glass-card" style="padding: 40px; text-align: center;">
          <p style="color: var(--text-secondary); font-size: 16px;">No cron jobs configured yet.</p>
          <button class="btn btn-primary" id="createJobBtnEmpty" style="margin-top: 16px;">+ Create First Job</button>
        </div>
      `;
      
      const createBtn = container.querySelector('#createJobBtnEmpty');
      if (createBtn) {
        createBtn.addEventListener('click', () => this.openCreateJobModal());
      }
      return;
    }

    // Render each job card
    this.jobs.forEach(job => {
      const card = this.createJobCard(job);
      container.appendChild(card);
    });
  }

  /**
   * Create a job card element
   */
  createJobCard(job) {
    const card = document.createElement('div');
    card.className = 'glass-card cron-job-card';
    card.setAttribute('data-job-id', job.id);

    const isActive = job.status === 'active';
    const lastRunText = this.formatLastRun(job.last_run);
    const nextRunTime = this.parseDate(job.next_run);

    card.innerHTML = `
      <div class="job-header">
        <div class="job-title-section">
          <h3 class="job-name">${this.escapeHtml(job.name)}</h3>
          <p class="job-description">${this.escapeHtml(job.description)}</p>
        </div>
        <div class="job-status-toggle">
          <label class="toggle-switch">
            <input type="checkbox" class="job-toggle" ${isActive ? 'checked' : ''}>
            <span class="toggle-slider"></span>
          </label>
          <span class="status-label ${isActive ? 'active' : 'disabled'}">${isActive ? 'Active' : 'Disabled'}</span>
        </div>
      </div>

      <div class="job-details">
        <div class="detail-item">
          <span class="detail-label">Schedule</span>
          <div class="detail-value">
            <span class="human-readable">${this.escapeHtml(job.schedule_readable)}</span>
            <code class="cron-notation">${this.escapeHtml(job.schedule)}</code>
          </div>
        </div>

        <div class="detail-item">
          <span class="detail-label">Next Run</span>
          <div class="detail-value">
            <span class="next-run" data-time="${nextRunTime.getTime()}">${this.formatCountdown(nextRunTime)}</span>
          </div>
        </div>

        <div class="detail-item">
          <span class="detail-label">Last Run</span>
          <div class="detail-value">
            <span class="last-run">${lastRunText}</span>
            ${job.last_result ? `<span style="font-size: 12px; color: ${job.last_result === 'success' ? '#30D158' : '#FF3B30'};">${this.escapeHtml(job.last_result)}</span>` : ''}
          </div>
        </div>
      </div>

      <div class="job-actions">
        <button class="btn btn-secondary sm edit-job-btn">✎ Edit</button>
        <button class="btn btn-danger sm delete-job-btn">🗑 Delete</button>
      </div>
    `;

    return card;
  }

  /**
   * Format last run time
   */
  formatLastRun(lastRunIso) {
    if (!lastRunIso) return 'Never';
    const date = this.parseDate(lastRunIso);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }

  /**
   * Format countdown to next run
   */
  formatCountdown(nextRunDate) {
    const now = new Date();
    const diff = nextRunDate - now;

    if (diff <= 0) return 'Running now...';

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `in ${days}d ${hours % 24}h ${minutes % 60}m`;
    } else if (hours > 0) {
      return `in ${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `in ${minutes}m ${seconds % 60}s`;
    } else {
      return `in ${seconds}s`;
    }
  }

  /**
   * Format next run time (human readable)
   */
  formatNextRunTime(nextRunIso) {
    const date = this.parseDate(nextRunIso);
    return date.toLocaleString();
  }

  /**
   * Parse ISO date string to Date object
   */
  parseDate(isoString) {
    if (!isoString) return new Date();
    return new Date(isoString);
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Open create job modal
   */
  openCreateJobModal() {
    this.editingJobId = null;
    const modal = document.getElementById('jobModalOverlay');
    const form = document.getElementById('jobForm');
    const modalHeader = document.querySelector('.modal-header h2');

    if (modal && form && modalHeader) {
      modalHeader.textContent = 'Create New Job';
      form.reset();
      form.setAttribute('data-mode', 'create');
      modal.style.display = 'flex';
      setTimeout(() => {
        document.getElementById('jobName')?.focus();
      }, 100);
    }
  }

  /**
   * Open edit job modal
   */
  openEditJobModal(jobId) {
    const job = this.jobs.find(j => j.id === jobId);
    if (!job) {
      this.showErrorNotification('Job not found');
      return;
    }

    this.editingJobId = jobId;
    const modal = document.getElementById('jobModalOverlay');
    const form = document.getElementById('jobForm');
    const modalHeader = document.querySelector('.modal-header h2');

    if (modal && form && modalHeader) {
      modalHeader.textContent = `Edit Job: ${job.name}`;
      
      document.getElementById('jobName').value = job.name;
      document.getElementById('jobDesc').value = job.description;
      document.getElementById('jobCron').value = job.schedule;
      
      form.setAttribute('data-mode', 'edit');
      modal.style.display = 'flex';
      setTimeout(() => {
        document.getElementById('jobName')?.focus();
      }, 100);
    }
  }

  /**
   * Close job modal
   */
  closeJobModal() {
    const modal = document.getElementById('jobModalOverlay');
    if (modal) {
      modal.style.display = 'none';
      this.editingJobId = null;
    }
  }

  /**
   * Handle job form submission (create or edit)
   */
  handleJobSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('jobName').value.trim();
    const desc = document.getElementById('jobDesc').value.trim();
    const cron = document.getElementById('jobCron').value.trim();

    if (!name || !desc || !cron) {
      alert('Please fill in all required fields');
      return;
    }

    const form = document.getElementById('jobForm');
    const mode = form.getAttribute('data-mode') || 'create';

    if (mode === 'edit' && this.editingJobId) {
      this.updateJobViaAPI(this.editingJobId, { name, description: desc, schedule: cron });
    } else {
      this.createJobViaAPI({ name, description: desc, schedule: cron });
    }
  }

  /**
   * Create a new cron job via API
   */
  createJobViaAPI(jobData) {
    fetch('http://localhost:3000/api/cron', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobData),
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => {
            throw new Error(data.error || `API error: ${res.status}`);
          });
        }
        return res.json();
      })
      .then(data => {
        if (data.success && data.job) {
          this.jobs.push(data.job);
          this.closeJobModal();
          this.renderJobsList();
          this.showSuccessNotification(`Job "${jobData.name}" created successfully!`);
          console.log('✅ Job created:', data.job.id);
        } else {
          throw new Error('Unexpected API response');
        }
      })
      .catch(err => {
        console.error('❌ Error creating job:', err);
        this.showErrorNotification(`Failed to create job: ${err.message}`);
      });
  }

  /**
   * Update an existing cron job via API
   */
  updateJobViaAPI(jobId, updates) {
    fetch(`http://localhost:3000/api/cron/${jobId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => {
            throw new Error(data.error || `API error: ${res.status}`);
          });
        }
        return res.json();
      })
      .then(updatedJob => {
        const index = this.jobs.findIndex(j => j.id === jobId);
        if (index !== -1) {
          this.jobs[index] = updatedJob;
        }
        this.closeJobModal();
        this.renderJobsList();
        this.showSuccessNotification(`Job "${updates.name}" updated successfully!`);
        console.log('✅ Job updated:', jobId);
      })
      .catch(err => {
        console.error('❌ Error updating job:', err);
        this.showErrorNotification(`Failed to update job: ${err.message}`);
      });
  }

  /**
   * Toggle job status (active/disabled)
   */
  toggleJobStatus(jobId, isActive) {
    fetch(`http://localhost:3000/api/cron/${jobId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        active: isActive,
        status: isActive ? 'active' : 'disabled'
      }),
    })
      .then(res => {
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
      })
      .then(data => {
        const index = this.jobs.findIndex(j => j.id === jobId);
        if (index !== -1) {
          this.jobs[index] = data.job;
          this.renderJobsList();
          const status = isActive ? 'enabled' : 'disabled';
          this.showSuccessNotification(`Job ${status}`);
          console.log(`✅ Job ${status}:`, jobId);
        }
      })
      .catch(err => {
        console.error('❌ Error toggling job:', err);
        this.loadJobsFromAPI(); // Reload to restore UI state
        this.showErrorNotification('Failed to update job status');
      });
  }

  /**
   * Delete a cron job via API
   */
  deleteJobFromAPI(jobId) {
    const job = this.jobs.find(j => j.id === jobId);
    const jobName = job?.name || 'Job';

    fetch(`http://localhost:3000/api/cron/${jobId}`, {
      method: 'DELETE',
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => {
            throw new Error(data.error || `API error: ${res.status}`);
          });
        }
        return res.json();
      })
      .then(data => {
        this.jobs = this.jobs.filter(j => j.id !== jobId);
        this.renderJobsList();
        this.showSuccessNotification(`"${jobName}" deleted successfully`);
        console.log('✅ Job deleted:', jobId);
      })
      .catch(err => {
        console.error('❌ Error deleting job:', err);
        this.showErrorNotification(`Failed to delete job: ${err.message}`);
      });
  }

  /**
   * Start countdown timer updates (every second)
   */
  startCountdownUpdates() {
    this.countdownInterval = setInterval(() => {
      document.querySelectorAll('.next-run').forEach(el => {
        const timeMs = parseInt(el.dataset.time);
        const nextRunDate = new Date(timeMs);
        el.textContent = this.formatCountdown(nextRunDate);
      });
    }, 1000);
  }

  /**
   * Periodically refresh job data from API (every 30 seconds)
   */
  startPeriodicRefresh() {
    this.refreshInterval = setInterval(() => {
      this.loadJobsFromAPI();
    }, 30000);
  }

  /**
   * Show success notification
   */
  showSuccessNotification(message) {
    this.showNotification(message, 'success');
  }

  /**
   * Show error notification
   */
  showErrorNotification(message) {
    this.showNotification(message, 'error');
  }

  /**
   * Show notification
   */
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: ${type === 'success' ? 'rgba(48, 209, 88, 0.9)' : type === 'error' ? 'rgba(255, 59, 48, 0.9)' : 'rgba(0, 122, 255, 0.9)'};
      color: white;
      padding: 14px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      z-index: 1000;
      animation: slideInUp 0.3s ease;
      backdrop-filter: blur(20px);
      max-width: 400px;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOutDown 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  /**
   * Cleanup on destroy
   */
  destroy() {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    if (this.refreshInterval) clearInterval(this.refreshInterval);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.cronJobsManager = new CronJobsManager();
  });
} else {
  window.cronJobsManager = new CronJobsManager();
}
