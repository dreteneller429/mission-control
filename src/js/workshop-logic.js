/**
 * Workshop Logic - Frontend State Management
 * Handles task rendering, modal interactions, auto-pickup, and live updates
 */

import WorkshopAPI from '../api/workshop.js';

class WorkshopManager {
  constructor() {
    this.currentView = 'queued'; // 'queued' or 'live-feed'
    this.selectedTask = null;
    this.refreshInterval = null;
    this.simulationInterval = null;
    this.autoPickupInterval = null;
    this.searchQuery = '';
    this.init();
  }

  /**
   * Initialize the workshop page
   */
  init() {
    this.cacheElements();
    this.attachEventListeners();
    this.render();
    this.startAutoRefresh();
    this.startSimulation();
  }

  /**
   * Cache DOM elements
   */
  cacheElements() {
    // Containers
    this.queuedContainer = document.getElementById('queuedTasksContainer');
    this.activeContainer = document.getElementById('activeTasksContainer');
    this.completedContainer = document.getElementById('completedTasksContainer');
    this.liveFeedList = document.getElementById('liveFeedList');

    // Stats
    this.queuedCount = document.getElementById('queuedCount');
    this.activeCount = document.getElementById('activeCount');
    this.completedCount = document.getElementById('completedCount');
    this.bandwidthStat = document.getElementById('bandwidthStat');
    this.queuedBadge = document.getElementById('queuedBadge');
    this.activeBadge = document.getElementById('activeBadge');
    this.completedBadge = document.getElementById('completedBadge');

    // View controls
    this.searchInput = document.getElementById('searchTasks');
    this.queuedViewBtn = document.getElementById('queuedViewBtn');
    this.liveFeedViewBtn = document.getElementById('liveFeedViewBtn');
    this.queuedView = document.getElementById('queuedView');
    this.liveFeedView = document.getElementById('liveFeedView');

    // Modal
    this.modal = document.getElementById('taskDetailModal');
    this.modalOverlay = document.getElementById('modalOverlay');
    this.modalCloseBtn = document.getElementById('modalCloseBtn');
    this.modalCloseActionBtn = document.getElementById('modalCloseActionBtn');
    this.modalActionBtn = document.getElementById('modalActionBtn');

    // Modal content
    this.modalTitle = document.getElementById('modalTaskTitle');
    this.modalStatusBadge = document.getElementById('modalStatusBadge');
    this.modalDescription = document.getElementById('modalDescription');
    this.modalTags = document.getElementById('modalTags');
    this.modalPriority = document.getElementById('modalPriority');
    this.modalCreatedAt = document.getElementById('modalCreatedAt');
    this.modalStartedAt = document.getElementById('modalStartedAt');
    this.modalCompletedAt = document.getElementById('modalCompletedAt');
    this.modalProgressBar = document.getElementById('modalProgressBar');
    this.modalProgressFill = document.getElementById('modalProgressFill');
    this.modalProgressText = document.getElementById('modalProgressText');
    this.modalActivityLog = document.getElementById('modalActivityLog');
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // View toggle
    this.queuedViewBtn.addEventListener('click', () => this.switchView('queued'));
    this.liveFeedViewBtn.addEventListener('click', () => this.switchView('live-feed'));

    // Search
    this.searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      this.render();
    });

    // Modal
    this.modalCloseBtn.addEventListener('click', () => this.closeModal());
    this.modalCloseActionBtn.addEventListener('click', () => this.closeModal());
    this.modalOverlay.addEventListener('click', () => this.closeModal());
    this.modalActionBtn.addEventListener('click', () => this.handleModalAction());

    // Prevent modal close when clicking on content
    this.modal.querySelector('.modal-content').addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  /**
   * Switch between views
   */
  switchView(view) {
    this.currentView = view;

    // Update button states
    this.queuedViewBtn.classList.toggle('active', view === 'queued');
    this.liveFeedViewBtn.classList.toggle('active', view === 'live-feed');

    // Show/hide views
    this.queuedView.classList.toggle('active', view === 'queued');
    this.liveFeedView.classList.toggle('active', view === 'live-feed');

    if (view === 'live-feed') {
      this.renderLiveFeed();
      // Auto-scroll to bottom
      setTimeout(() => {
        this.liveFeedList.scrollTop = this.liveFeedList.scrollHeight;
      }, 100);
    }
  }

  /**
   * Main render function
   */
  render() {
    const data = WorkshopAPI.getTasks();

    // Filter by search query
    let queued = data.queued;
    let active = data.active;
    let completed = data.completed;

    if (this.searchQuery) {
      const filtered = WorkshopAPI.searchTasks(this.searchQuery);
      queued = queued.filter(t => filtered.find(f => f.id === t.id));
      active = active.filter(t => filtered.find(f => f.id === t.id));
      completed = completed.filter(t => filtered.find(f => f.id === t.id));
    }

    // Render tasks
    this.renderColumn(this.queuedContainer, queued, 'queued');
    this.renderColumn(this.activeContainer, active, 'active');
    this.renderColumn(this.completedContainer, completed, 'completed');

    // Update stats
    this.updateStats(data.stats);
  }

  /**
   * Render a column of tasks
   */
  renderColumn(container, tasks, status) {
    container.innerHTML = '';

    if (tasks.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.className = 'empty-state';

      if (status === 'queued') {
        emptyState.innerHTML = `
          <div class="empty-icon">📭</div>
          <p>No queued tasks</p>
          <p class="empty-hint">Create a new task to get started</p>
        `;
      } else if (status === 'active') {
        emptyState.innerHTML = `
          <div class="empty-icon">🤖</div>
          <p>No active tasks</p>
          <p class="empty-hint">I will auto-pickup from queue</p>
        `;
      } else {
        emptyState.innerHTML = `
          <div class="empty-icon">🎉</div>
          <p>No completed tasks yet</p>
          <p class="empty-hint">Tasks will appear here when done</p>
        `;
      }

      container.appendChild(emptyState);
      return;
    }

    tasks.forEach(task => {
      const card = this.createTaskCard(task, status);
      container.appendChild(card);
    });
  }

  /**
   * Create a task card element
   */
  createTaskCard(task, status) {
    const card = document.createElement('div');
    card.className = `task-card ${status === 'active' ? 'active' : ''}`;
    card.dataset.taskId = task.id;

    // Header with title and actions
    const header = document.createElement('div');
    header.className = 'task-card-header';

    const title = document.createElement('h3');
    title.className = 'task-title';
    title.textContent = task.title;

    const actions = document.createElement('div');
    actions.className = 'task-card-actions';

    // Start button (only for queued)
    if (status === 'queued') {
      const startBtn = document.createElement('button');
      startBtn.className = 'task-btn-start';
      startBtn.textContent = 'Start →';
      startBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.startTask(task.id);
      });
      actions.appendChild(startBtn);
    }

    // Remove button
    const removeBtn = document.createElement('button');
    removeBtn.className = 'task-btn-remove';
    removeBtn.textContent = '✕';
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm(`Delete task: ${task.title}?`)) {
        this.deleteTask(task.id);
      }
    });
    actions.appendChild(removeBtn);

    header.appendChild(title);
    header.appendChild(actions);

    // Description
    const desc = document.createElement('p');
    desc.className = 'task-description';
    desc.textContent = task.description;

    // Tags
    const tagsDiv = document.createElement('div');
    tagsDiv.className = 'task-tags';
    task.tags.forEach(tag => {
      const tagEl = document.createElement('span');
      tagEl.className = `tag tag-${tag.replace(' ', '-')}`;
      tagEl.textContent = tag;
      tagsDiv.appendChild(tagEl);
    });

    // Progress bar
    const progressDiv = document.createElement('div');
    progressDiv.className = 'task-progress';

    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';

    const progressFill = document.createElement('div');
    progressFill.className = 'progress-fill';
    progressFill.style.width = task.progress + '%';

    progressBar.appendChild(progressFill);

    const progressText = document.createElement('span');
    progressText.className = 'progress-text';
    progressText.textContent = task.progress + '%';

    progressDiv.appendChild(progressBar);
    progressDiv.appendChild(progressText);

    // Assemble card
    card.appendChild(header);
    card.appendChild(desc);
    card.appendChild(tagsDiv);
    card.appendChild(progressDiv);

    // Click to open modal
    card.addEventListener('click', () => {
      this.openModal(task);
    });

    return card;
  }

  /**
   * Open task detail modal
   */
  openModal(task) {
    this.selectedTask = task;

    // Set title and status
    this.modalTitle.textContent = task.title;
    this.modalStatusBadge.textContent = task.status.charAt(0).toUpperCase() + task.status.slice(1);
    this.modalStatusBadge.className = `status-badge ${task.status}`;

    // Description
    this.modalDescription.textContent = task.description;

    // Tags
    this.modalTags.innerHTML = '';
    task.tags.forEach(tag => {
      const tagEl = document.createElement('span');
      tagEl.className = `tag tag-${tag.replace(' ', '-')}`;
      tagEl.textContent = tag;
      this.modalTags.appendChild(tagEl);
    });

    // Priority
    this.modalPriority.textContent = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
    this.modalPriority.className = `priority-badge priority-${task.priority}`;

    // Dates
    this.modalCreatedAt.textContent = this.formatDate(task.created_at);
    this.modalStartedAt.textContent = task.started_at ? this.formatDate(task.started_at) : '-';
    this.modalCompletedAt.textContent = task.completed_at ? this.formatDate(task.completed_at) : '-';

    // Progress
    this.modalProgressFill.style.width = task.progress + '%';
    this.modalProgressText.textContent = task.progress + '%';

    // Activity log
    this.modalActivityLog.innerHTML = '';
    task.activity_log.forEach(log => {
      const item = document.createElement('div');
      item.className = 'activity-item';
      item.innerHTML = `
        <span class="activity-timestamp">${log.timestamp}</span>
        <span class="activity-event">${log.event}</span>
      `;
      this.modalActivityLog.appendChild(item);
    });

    // Set action button
    if (task.status === 'queued') {
      this.modalActionBtn.textContent = 'Start Task';
      this.modalActionBtn.style.display = 'block';
    } else if (task.status === 'active') {
      this.modalActionBtn.textContent = 'Complete Task';
      this.modalActionBtn.style.display = 'block';
    } else {
      this.modalActionBtn.style.display = 'none';
    }

    // Show modal
    this.modal.classList.add('active');
  }

  /**
   * Close modal
   */
  closeModal() {
    this.modal.classList.remove('active');
    this.selectedTask = null;
  }

  /**
   * Handle modal action button click
   */
  handleModalAction() {
    if (!this.selectedTask) return;

    if (this.selectedTask.status === 'queued') {
      this.startTask(this.selectedTask.id);
    } else if (this.selectedTask.status === 'active') {
      this.completeTask(this.selectedTask.id);
    }

    this.closeModal();
  }

  /**
   * Start a task
   */
  startTask(taskId) {
    try {
      WorkshopAPI.startTask(taskId);
      this.render();
    } catch (error) {
      console.error('Error starting task:', error);
    }
  }

  /**
   * Complete a task
   */
  completeTask(taskId) {
    try {
      WorkshopAPI.completeTask(taskId);
      this.render();
    } catch (error) {
      console.error('Error completing task:', error);
    }
  }

  /**
   * Delete a task
   */
  deleteTask(taskId) {
    try {
      WorkshopAPI.deleteTask(taskId);
      this.render();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }

  /**
   * Update stats
   */
  updateStats(stats) {
    this.queuedCount.textContent = stats.queued;
    this.activeCount.textContent = stats.active;
    this.completedCount.textContent = stats.completed;
    this.bandwidthStat.textContent = stats.bandwidth + '%';

    this.queuedBadge.textContent = stats.queued;
    this.activeBadge.textContent = stats.active;
    this.completedBadge.textContent = stats.completed;
  }

  /**
   * Render live feed with real task events
   */
  renderLiveFeed() {
    const events = WorkshopAPI.getLiveEvents(50);

    // Show placeholder if no events yet
    if (events.length === 0) {
      this.liveFeedList.innerHTML = `
        <div class="feed-item feed-placeholder">
          <span class="feed-time">--:-- EST</span>
          <span class="feed-task">Waiting for activity...</span>
          <span class="feed-event">Monitoring for task events</span>
        </div>
      `;
      return;
    }

    // Only re-render if new events added to avoid flickering
    const existingCount = this.liveFeedList.children.length;
    if (existingCount === events.length && existingCount > 0 && this.liveFeedList.children[0].className.includes('feed-placeholder')) {
      // First time rendering, clear placeholder
      this.liveFeedList.innerHTML = '';
    } else if (existingCount === events.length && existingCount > 0) {
      // No new events, don't re-render
      return;
    } else if (existingCount > 0 && !this.liveFeedList.children[0].className.includes('feed-placeholder')) {
      // Append new events only
      const startIndex = existingCount;
      for (let i = startIndex; i < events.length; i++) {
        const event = events[i];
        const item = this.createFeedItem(event);
        this.liveFeedList.appendChild(item);
      }
      // Auto-scroll to bottom
      this.liveFeedList.scrollTop = this.liveFeedList.scrollHeight;
      return;
    }

    // Full render on first load
    this.liveFeedList.innerHTML = '';
    events.forEach(event => {
      const item = this.createFeedItem(event);
      this.liveFeedList.appendChild(item);
    });

    // Auto-scroll to bottom
    this.liveFeedList.scrollTop = this.liveFeedList.scrollHeight;
  }

  /**
   * Create a feed item element
   */
  createFeedItem(event) {
    const item = document.createElement('div');
    item.className = `feed-item feed-${event.eventType}`;

    const timeEl = document.createElement('span');
    timeEl.className = 'feed-time';
    timeEl.textContent = event.timestamp;

    const taskEl = document.createElement('span');
    taskEl.className = 'feed-task';
    taskEl.textContent = event.taskName;

    const eventEl = document.createElement('span');
    eventEl.className = 'feed-event';
    eventEl.textContent = event.eventLabel;

    item.appendChild(timeEl);
    item.appendChild(taskEl);
    item.appendChild(eventEl);

    return item;
  }

  /**
   * Start auto-refresh (every 2 seconds for responsive updates)
   */
  startAutoRefresh() {
    this.refreshInterval = setInterval(() => {
      this.render();

      // Update live feed if visible (faster refresh for real-time feel)
      if (this.currentView === 'live-feed') {
        this.renderLiveFeed();
        // Auto-scroll to bottom for new events
        setTimeout(() => {
          if (this.liveFeedList) {
            this.liveFeedList.scrollTop = this.liveFeedList.scrollHeight;
          }
        }, 100);
      }
    }, 2000);
  }

  /**
   * Start simulation of progress updates and live feed events
   */
  startSimulation() {
    this.simulationInterval = setInterval(() => {
      // Simulate progress on active tasks
      WorkshopAPI.simulateProgress();

      // Auto-pickup if needed (move next task to active)
      const pickedUp = WorkshopAPI.autoPickupTask();

      // Update UI
      this.render();

      // Always update live feed if in that view (for real-time feel)
      if (this.currentView === 'live-feed') {
        this.renderLiveFeed();
        setTimeout(() => {
          if (this.liveFeedList) {
            this.liveFeedList.scrollTop = this.liveFeedList.scrollHeight;
          }
        }, 100);
      }

      // Update modal if open
      if (this.selectedTask && this.modal.classList.contains('active')) {
        const updatedTask = WorkshopAPI.getTask(this.selectedTask.id);
        if (updatedTask) {
          this.selectedTask = updatedTask;
          this.openModal(updatedTask); // Re-render modal
        }
      }
    }, 2000); // Simulate every 2 seconds for responsive feel
  }

  /**
   * Format date for display
   */
  formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
    if (this.simulationInterval) clearInterval(this.simulationInterval);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.workshopManager = new WorkshopManager();
  });
} else {
  window.workshopManager = new WorkshopManager();
}

export default WorkshopManager;
