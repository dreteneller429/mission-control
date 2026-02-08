// Journal Page Logic
class JournalManager {
  constructor() {
    this.currentDate = new Date();
    this.entryCache = {};
    this.markdownToHTML = this.initMarkdownParser();
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.updateDisplay();
    this.loadStats();
  }

  setupEventListeners() {
    const prevBtn = document.getElementById('prevDayBtn');
    const nextBtn = document.getElementById('nextDayBtn');
    const datePicker = document.getElementById('journalDatePicker');
    const dateDisplay = document.getElementById('dateDisplay');

    prevBtn?.addEventListener('click', () => this.previousDay());
    nextBtn?.addEventListener('click', () => this.nextDay());
    dateDisplay?.addEventListener('click', () => datePicker?.click());
    datePicker?.addEventListener('change', (e) => {
      if (e.target.value) {
        this.currentDate = new Date(e.target.value);
        this.updateDisplay();
      }
    });
  }

  previousDay() {
    this.currentDate.setDate(this.currentDate.getDate() - 1);
    this.updateDisplay();
  }

  nextDay() {
    this.currentDate.setDate(this.currentDate.getDate() + 1);
    this.updateDisplay();
  }

  formatDateForDisplay(date) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (this.isSameDay(date, today)) {
      return 'Today';
    } else if (this.isSameDay(date, yesterday)) {
      return 'Yesterday';
    } else if (this.isSameDay(date, tomorrow)) {
      return 'Tomorrow';
    }

    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

  formatDateForFilename(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  isSameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }

  async updateDisplay() {
    const dateDisplay = document.getElementById('dateDisplay');
    const datePicker = document.getElementById('journalDatePicker');
    const dateStr = this.formatDateForFilename(this.currentDate);

    // Update date picker
    if (datePicker) {
      datePicker.value = dateStr;
    }

    // Update display
    if (dateDisplay) {
      dateDisplay.textContent = this.formatDateForDisplay(this.currentDate);
    }

    // Load and display entry
    await this.loadEntry(dateStr);
  }

  async loadEntry(dateStr) {
    const container = document.getElementById('journalEntryContainer');
    if (!container) return;

    container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading entry...</p></div>';

    try {
      const response = await fetch(`/api/journal/${dateStr}`);
      
      if (response.ok) {
        const data = await response.json();
        const html = this.markdownToHTML(data.content);
        container.innerHTML = html;
        container.classList.remove('empty');
      } else if (response.status === 404) {
        container.innerHTML = '<div class="empty"><div class="empty-icon">📝</div><p>No entry for this date</p><p style="font-size: 0.9rem; color: var(--text-tertiary);">Start writing to create an entry</p></div>';
        container.classList.add('empty');
      } else {
        throw new Error('Failed to load entry');
      }
    } catch (error) {
      console.error('Error loading entry:', error);
      container.innerHTML = '<div class="empty"><div class="empty-icon">⚠️</div><p>Unable to load entry</p></div>';
      container.classList.add('empty');
    }
  }

  initMarkdownParser() {
    return (markdown) => {
      if (!markdown) return '<p>No content</p>';

      let html = markdown
        // Headers
        .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
        .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
        .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
        // Bold
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/__(.+?)__/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/_(.+?)_/g, '<em>$1</em>')
        // Inline code
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        // Line breaks
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');

      // Code blocks
      html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
        return `<pre><code class="language-${lang || 'plain'}">${this.escapeHtml(code.trim())}</code></pre>`;
      });

      // Blockquotes
      html = html.replace(/^&gt; (.*?)$/gm, '<blockquote>$1</blockquote>');

      // Lists
      html = html.replace(/^\* (.*?)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/s, (match) => `<ul>${match}</ul>`)
        .replace(/^\d+\. (.*?)$/gm, '<li>$1</li>');

      // Wrap content in paragraph tags if not already wrapped
      if (!html.startsWith('<')) {
        html = '<p>' + html + '</p>';
      }

      return `<div>${html}</div>`;
    };
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  async loadStats() {
    try {
      const response = await fetch('/api/journal/stats');
      if (response.ok) {
        const stats = await response.json();
        document.getElementById('entriesThisWeek').textContent = stats.entriesThisWeek || 0;
        document.getElementById('entriesThisMonth').textContent = stats.entriesThisMonth || 0;
        document.getElementById('totalEntries').textContent = stats.totalEntries || 0;
        document.getElementById('longestStreak').textContent = `${stats.longestStreak || 0} days`;
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }
}

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.journalManager = new JournalManager();
  });
} else {
  window.journalManager = new JournalManager();
}
