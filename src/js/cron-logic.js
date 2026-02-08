/**
 * Cron Jobs Page Logic
 * Handles job management, toggling, editing, and API integration
 */

class CronJobsManager {
  constructor() {
    this.jobs = [];
    this.init();
  }

  init() {
    this.attachEventListeners();
    this.loadJobs();
    this.startCountdownUpdates();
  }

  attachEventListeners() {
    // Create job button
    const createJobBtn = document.getElementById('createJobBtn');
    if (createJobBtn) {
      createJobBtn.addEventListener('click', () => this.openJobModal());
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

    // Job card listeners (delegated)
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
      if (e.target.classList.contains('edit-job-btn')) {
        const card = e.target.closest('.cron-job-card');
        if (card) {
          const jobId = card.dataset.jobId;
          this.editJob(jobId);
        }
      }

      if (e.target.classList.contains('delete-job-btn')) {
        const card = e.target.closest('.cron-job-card');
        if (card) {
          const jobId = card.dataset.jobId;
          if (confirm('Are you sure you want to delete this job?')) {
            this.deleteJob(jobId);
          }
        }
      }
    });
  }

  loadJobs() {
    // Fetch from API
    fetch('/api/cron')
      .then(res => res.json())
      .then(data => {
        this.jobs = data;
      })
      .catch(err => {
        console.error('Failed to load cron jobs:', err);
        // Jobs are already in DOM from server render
      });
  }

  openJobModal() {
    const modal = document.getElementById('jobModalOverlay');
    const form = document.getElementById('jobForm');
    if (modal && form) {
      modal.style.display = 'flex';
      form.reset();
      document.getElementById('jobName').focus();
    }
  }

  closeJobModal() {
    const modal = document.getElementById('jobModalOverlay');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  handleJobSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('jobName').value;
    const desc = document.getElementById('jobDesc').value;
    const cron = document.getElementById('jobCron').value;

    if (!name || !desc || !cron) {
      alert('Please fill in all fields');
      return;
    }

    const job = {
      name,
      description: desc,
      schedule: cron,
      active: true,
    };

    fetch('/api/cron', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(job),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          this.closeJobModal();
          this.loadJobs();
          this.refreshJobsList();
          alert('Job created successfully!');
        } else {
          alert('Failed to create job: ' + (data.error || 'Unknown error'));
        }
      })
      .catch(err => {
        console.error('Error creating job:', err);
        alert('Error creating job');
      });
  }

  toggleJobStatus(jobId, isActive) {
    fetch(`/api/cron/${jobId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: isActive }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Update UI
          const card = document.querySelector(`[data-job-id="${jobId}"]`);
          if (card) {
            const statusLabel = card.querySelector('.status-label');
            if (statusLabel) {
              statusLabel.textContent = isActive ? 'Active' : 'Paused';
              statusLabel.classList.toggle('active', isActive);
              statusLabel.classList.toggle('paused', !isActive);
            }
          }
        }
      })
      .catch(err => console.error('Error updating job status:', err));
  }

  editJob(jobId) {
    // In a real app, populate the form with existing job data
    const card = document.querySelector(`[data-job-id="${jobId}"]`);
    if (card) {
      const name = card.querySelector('.job-name').textContent;
      const desc = card.querySelector('.job-description').textContent;
      const cronCode = card.querySelector('.cron-notation').textContent;

      document.getElementById('jobName').value = name;
      document.getElementById('jobDesc').value = desc;
      document.getElementById('jobCron').value = cronCode;

      // Update modal title and form submit
      const modalHeader = document.querySelector('.modal-header h2');
      if (modalHeader) modalHeader.textContent = 'Edit Job';

      this.openJobModal();
      this.currentEditId = jobId;
    }
  }

  deleteJob(jobId) {
    fetch(`/api/cron/${jobId}`, {
      method: 'DELETE',
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const card = document.querySelector(`[data-job-id="${jobId}"]`);
          if (card) {
            card.style.opacity = '0';
            card.style.transform = 'translateY(-10px)';
            setTimeout(() => card.remove(), 300);
          }
          alert('Job deleted successfully');
        }
      })
      .catch(err => {
        console.error('Error deleting job:', err);
        alert('Error deleting job');
      });
  }

  startCountdownUpdates() {
    // Update countdowns every second
    setInterval(() => {
      document.querySelectorAll('.next-run').forEach(el => {
        const time = parseInt(el.dataset.time);
        const now = Date.now();
        const diff = time - now;

        if (diff > 0) {
          el.textContent = this.formatCountdown(diff);
        } else {
          el.textContent = 'Running now...';
        }
      });
    }, 1000);
  }

  formatCountdown(ms) {
    const seconds = Math.floor(ms / 1000);
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

  refreshJobsList() {
    // Reload page or fetch new jobs
    location.reload();
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new CronJobsManager();
  });
} else {
  new CronJobsManager();
}
