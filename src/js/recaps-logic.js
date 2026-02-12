// Weekly Recaps Page Logic
class WeeklyRecapsManager {
  constructor() {
    this.currentWeekStart = this.getWeekStart(new Date());
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.updateDisplay();
  }

  setupEventListeners() {
    document.getElementById('prevWeekBtn')?.addEventListener('click', () => this.previousWeek());
    document.getElementById('nextWeekBtn')?.addEventListener('click', () => this.nextWeek());
    
    // Set button states after initial display
    setTimeout(() => this.updateButtonStates(), 100);
  }

  updateButtonStates() {
    const nextBtn = document.getElementById('nextWeekBtn');
    if (nextBtn) {
      const thisWeekStart = this.getWeekStart(new Date());
      
      // Disable next button if we're at the current week
      if (this.currentWeekStart.getTime() >= thisWeekStart.getTime()) {
        nextBtn.classList.add('disabled');
        nextBtn.style.opacity = '0.3';
        nextBtn.style.pointerEvents = 'none';
        nextBtn.disabled = true;
      } else {
        nextBtn.classList.remove('disabled');
        nextBtn.style.opacity = '1';
        nextBtn.style.pointerEvents = 'auto';
        nextBtn.disabled = false;
      }
    }
  }

  getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  previousWeek() {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() - 7);
    this.updateDisplay();
    this.updateButtonStates();
  }

  nextWeek() {
    const thisWeekStart = this.getWeekStart(new Date());
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() + 7);
    
    // Can't go past current week
    if (this.currentWeekStart.getTime() > thisWeekStart.getTime()) {
      this.currentWeekStart = thisWeekStart;
      this.updateDisplay();
      this.updateButtonStates();
      return;
    }
    
    this.updateDisplay();
    this.updateButtonStates();
  }

  formatWeekDisplay(date) {
    const options = { month: 'short', day: 'numeric' };
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 6);

    return `Week of ${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
  }

  async updateDisplay() {
    const weekDisplay = document.getElementById('weekDisplay');
    if (weekDisplay) {
      weekDisplay.textContent = this.formatWeekDisplay(this.currentWeekStart);
    }

    await this.loadRecap();
  }

  async loadRecap() {
    const container = document.getElementById('recapContent');
    if (!container) return;

    try {
      const weekStr = this.formatDateForApi(this.currentWeekStart);
      const response = await fetch(`/api/weekly-recaps/${weekStr}`);

      if (response.ok) {
        const data = await response.json();
        container.innerHTML = this.buildRecapHTML(data);
      } else {
        container.innerHTML = this.buildEmptyState();
      }
    } catch (error) {
      console.error('Error loading recap:', error);
      container.innerHTML = this.buildEmptyState();
    }
  }

  formatDateForApi(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  buildRecapHTML(data) {
    const {
      tasksCompleted = [],
      tasksCompletedCount = 0,
      intelligenceReports = 0,
      decisions = [],
      cronJobsExecuted = 0,
      issues = [],
      recommendations = []
    } = data;

    return `
      <div class="recap-grid">
        <!-- Tasks Card -->
        <div class="recap-card">
          <h3 class="recap-card-title">
            <span class="recap-card-icon">✓</span>
            Tasks Completed
          </h3>
          <div class="recap-metric">
            <span class="metric-value">${tasksCompletedCount}</span>
            <span class="metric-label">completed this week</span>
          </div>
          ${tasksCompleted.length > 0 ? `
            <ul class="recap-list">
              ${tasksCompleted.slice(0, 5).map(task => `
                <li class="recap-list-item">${this.escapeHtml(task)}</li>
              `).join('')}
              ${tasksCompleted.length > 5 ? `<li class="recap-list-item">+ ${tasksCompleted.length - 5} more</li>` : ''}
            </ul>
          ` : ''}
        </div>

        <!-- Intelligence Reports Card -->
        <div class="recap-card">
          <h3 class="recap-card-title">
            <span class="recap-card-icon">🧠</span>
            Intelligence Reports
          </h3>
          <div class="recap-metric">
            <span class="metric-value">${intelligenceReports}</span>
            <span class="metric-label">generated</span>
          </div>
          <p style="color: var(--text-secondary); margin: 0; font-size: 0.9rem;">
            Intelligence gathering and analysis completed
          </p>
        </div>

        <!-- Key Decisions Card -->
        <div class="recap-card">
          <h3 class="recap-card-title">
            <span class="recap-card-icon">🎯</span>
            Key Decisions
          </h3>
          ${decisions.length > 0 ? `
            <ul class="recap-list">
              ${decisions.slice(0, 4).map(decision => `
                <li class="recap-list-item">${this.escapeHtml(decision)}</li>
              `).join('')}
            </ul>
          ` : '<p style="color: var(--text-secondary);">No major decisions recorded</p>'}
        </div>

        <!-- Cron Jobs Card -->
        <div class="recap-card">
          <h3 class="recap-card-title">
            <span class="recap-card-icon">⏰</span>
            Cron Jobs Executed
          </h3>
          <div class="recap-metric">
            <span class="metric-value">${cronJobsExecuted}</span>
            <span class="metric-label">executions</span>
          </div>
          <p style="color: var(--text-secondary); margin: 0; font-size: 0.9rem;">
            Automated tasks completed successfully
          </p>
        </div>
      </div>

      ${issues.length > 0 ? `
        <div class="recap-card recap-issues">
          <h3 class="recap-card-title">
            <span class="recap-card-icon">⚠️</span>
            Issues Encountered
          </h3>
          <ul class="recap-list">
            ${issues.map(issue => `
              <li class="recap-list-item">${this.escapeHtml(issue)}</li>
            `).join('')}
          </ul>
        </div>
      ` : ''}

      ${recommendations.length > 0 ? `
        <div class="recap-card recap-recommendations">
          <h3 class="recap-card-title">
            <span class="recap-card-icon">→</span>
            Recommendations for Next Week
          </h3>
          <ul class="recap-list">
            ${recommendations.map(rec => `
              <li class="recap-list-item">${this.escapeHtml(rec)}</li>
            `).join('')}
          </ul>
        </div>
      ` : ''}
    `;
  }

  buildEmptyState(message = 'No recap data available for this week') {
    return `
      <div class="empty-state">
        <div class="empty-icon">📅</div>
        <p>${message}</p>
      </div>
    `;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.weeklyrRecapsManager = new WeeklyRecapsManager();
  });
} else {
  window.weeklyrRecapsManager = new WeeklyRecapsManager();
}
