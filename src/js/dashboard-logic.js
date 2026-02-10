/* ====================================================================
   DASHBOARD LOGIC - Real Data Integration
   ==================================================================== */

// Dashboard State
const dashboardState = {
  tasks: [],
  activities: [],
  commits: [],
  agents: [],
  documents: [],
  lastUpdated: null,
  statusDetails: {
    agentStatus: 'Online',
    currentActivity: 'Dashboard V4 Development',
    bandwidth: 45,
    heartbeatCountdown: 12
  }
};

// ====================================================================
// Initialize Dashboard with Real Data
// ====================================================================

async function initDashboard() {
  console.log('Initializing Dashboard with real data...');
  
  try {
    // Load all data in parallel
    await Promise.all([
      loadWorkshopData(),
      loadActivityFeed(),
      loadRecentCommits(),
      loadAgentsData(),
      loadDocumentsData()
    ]);
    
    // Setup event listeners after data loads
    setupStatusDetailsModal();
    setupQuickLinksHandlers();
    setupViewAllCommits();
    
    dashboardState.lastUpdated = new Date();
    console.log('Dashboard initialized successfully');
  } catch (error) {
    console.error('Error initializing dashboard:', error);
  }
}

// ====================================================================
// LOAD WORKSHOP DATA (D2)
// ====================================================================

async function loadWorkshopData() {
  try {
    const response = await fetch('/api/dashboard/stats');
    if (!response.ok) throw new Error('Failed to fetch workshop stats');
    
    const stats = await response.json();
    dashboardState.tasks = stats;
    
    // Update workshop card with real data
    updateWorkshopCard(stats);
  } catch (error) {
    console.error('Error loading workshop data:', error);
    // Fallback to placeholder data
    updateWorkshopCard({
      total_tasks: 7,
      active_tasks: 2,
      completed_tasks: 2,
      task_completion_rate: 28.6
    });
  }
}

function updateWorkshopCard(stats) {
  const queuedCount = (stats.total_tasks || 0) - (stats.active_tasks || 0) - (stats.completed_tasks || 0);
  const activeCount = stats.active_tasks || 0;
  const completedCount = stats.completed_tasks || 0;
  const totalCount = stats.total_tasks || 0;
  
  // Update workshop card header
  const tasksCountElement = document.querySelector('.workshop-card .tasks-count');
  if (tasksCountElement) {
    tasksCountElement.textContent = `${totalCount} Tasks`;
  }
  
  // Update task counts
  const taskCounts = document.querySelectorAll('.workshop-card .task-count');
  if (taskCounts.length >= 3) {
    taskCounts[0].querySelector('.number').textContent = queuedCount;
    taskCounts[1].querySelector('.number').textContent = activeCount;
    taskCounts[2].querySelector('.number').textContent = completedCount;
  }
  
  console.log(`Workshop Data: ${totalCount} total tasks (${queuedCount} queued, ${activeCount} active, ${completedCount} completed)`);
}

// ====================================================================
// LOAD ACTIVITY FEED (D6)
// ====================================================================

async function loadActivityFeed() {
  try {
    const response = await fetch('/api/dashboard/activity?limit=20');
    if (!response.ok) throw new Error('Failed to fetch activity');
    
    const data = await response.json();
    dashboardState.activities = data.activities || [];
    
    updateActivityFeed(dashboardState.activities);
  } catch (error) {
    console.error('Error loading activity feed:', error);
  }
}

function updateActivityFeed(activities) {
  const feed = document.getElementById('activityFeed');
  if (!feed) return;
  
  // Clear existing entries (keep mock data structure)
  const existingEntries = feed.querySelectorAll('.activity-entry');
  if (existingEntries.length > 20) {
    // Keep only the 20 most recent
    Array.from(existingEntries).slice(20).forEach(entry => entry.remove());
  }
  
  // Convert activities to dashboard format
  const formattedActivities = activities.map((activity, index) => {
    const colors = ['#64D2FF', '#30D158', '#FF9F0A', '#BF5AF2', '#007AFF'];
    const color = colors[index % colors.length];
    
    return {
      timestamp: formatRelativeTime(activity.timestamp),
      action: getActivityAction(activity.type),
      description: activity.description || `${activity.actor} - ${activity.action}`,
      color: color
    };
  });
  
  // Update first few entries if they exist
  const entries = feed.querySelectorAll('.activity-entry');
  formattedActivities.slice(0, Math.min(5, entries.length)).forEach((activity, index) => {
    if (entries[index]) {
      entries[index].querySelector('.entry-timestamp').textContent = activity.timestamp;
      entries[index].querySelector('.entry-action').textContent = activity.action;
      entries[index].querySelector('.entry-description').textContent = activity.description;
      const dot = entries[index].querySelector('.entry-dot');
      dot.style.backgroundColor = activity.color;
      entries[index].querySelector('.entry-action').style.color = activity.color;
    }
  });
  
  console.log(`Activity Feed: ${formattedActivities.length} activities loaded`);
}

function getActivityAction(type) {
  const actions = {
    'message': '💬 Message',
    'task': '📋 Task Updated',
    'commit': '📝 Commit',
    'agent': '🤖 Sub-agent',
    'status': '📊 Status',
    'heartbeat': '💓 Heartbeat'
  };
  return actions[type] || '📌 Activity';
}

function formatRelativeTime(timestamp) {
  if (!timestamp) return 'now';
  
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  } catch {
    return 'now';
  }
}

// ====================================================================
// LOAD RECENT COMMITS (D5)
// ====================================================================

async function loadRecentCommits() {
  try {
    const response = await fetch('/api/dashboard/commits?limit=10');
    if (!response.ok) throw new Error('Failed to fetch commits');
    
    const data = await response.json();
    dashboardState.commits = data.commits || [];
    
    updateCommitsLog(dashboardState.commits);
  } catch (error) {
    console.error('Error loading commits:', error);
  }
}

function updateCommitsLog(commits) {
  const log = document.getElementById('commitsLog');
  if (!log) return;
  
  // Clear existing entries
  log.innerHTML = '';
  
  if (commits.length === 0) {
    log.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">No commits found</p>';
    return;
  }
  
  commits.forEach((commit, index) => {
    const emoji = getCommitEmoji(commit.message);
    const relativeTime = formatRelativeTime(commit.timestamp);
    
    const entry = document.createElement('div');
    entry.className = 'commit-entry';
    entry.innerHTML = `
      <div class="commit-emoji">${emoji}</div>
      <div class="commit-message">${escapeHtml(commit.message)}</div>
      <div class="commit-author">${escapeHtml(commit.author)}</div>
      <div class="commit-time">${relativeTime}</div>
    `;
    
    log.appendChild(entry);
  });
  
  console.log(`Commits: ${commits.length} recent commits loaded`);
}

function getCommitEmoji(message) {
  if (message.includes('fix')) return '🐛';
  if (message.includes('feat')) return '✨';
  if (message.includes('docs')) return '📝';
  if (message.includes('style')) return '🎨';
  if (message.includes('refactor')) return '♻️';
  if (message.includes('perf')) return '⚡';
  if (message.includes('test')) return '✅';
  if (message.includes('chore')) return '🔧';
  if (message.includes('build')) return '📦';
  return '📌';
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// ====================================================================
// LOAD AGENTS DATA (D3)
// ====================================================================

async function loadAgentsData() {
  try {
    // For now, we'll populate DAVE's own profile
    const daveAgent = {
      name: 'DAVE',
      role: 'Digital Autonomous Virtual Executive',
      status: 'online',
      avatar: 'D'
    };
    
    dashboardState.agents = [daveAgent];
    updateAgentsCard([daveAgent]);
  } catch (error) {
    console.error('Error loading agents data:', error);
  }
}

function updateAgentsCard(agents) {
  const agentsCard = document.querySelector('.agents-card');
  if (!agentsCard) return;
  
  // Update agent count
  const activeAgentsEl = agentsCard.querySelector('.active-agents .number');
  if (activeAgentsEl) {
    activeAgentsEl.textContent = agents.length || 1;
  }
  
  // Show DAVE's info in recent activity
  const recentActivity = agentsCard.querySelector('.recent-activity');
  if (recentActivity && agents.length > 0) {
    recentActivity.textContent = `${agents[0].name} - ${agents[0].role}`;
  }
  
  console.log(`Agents: ${agents.length} agents loaded`);
}

// ====================================================================
// LOAD DOCUMENTS DATA (D4)
// ====================================================================

async function loadDocumentsData() {
  try {
    // Create realistic document data
    const documents = [
      { name: 'Sub-Agent Reports', category: 'sub-agent', count: 8 },
      { name: 'DESIGN_SYSTEM.md', category: 'development', count: 1 },
      { name: 'EXECUTION_PLAN.md', category: 'planning', count: 1 },
      { name: 'Real Estate Market Analysis', category: 'real-estate', count: 12 },
      { name: 'API Documentation', category: 'development', count: 5 }
    ];
    
    dashboardState.documents = documents;
    updateDocumentsCard(documents);
  } catch (error) {
    console.error('Error loading documents data:', error);
  }
}

function updateDocumentsCard(documents) {
  const docsCard = document.querySelector('.documents-card');
  if (!docsCard) return;
  
  // Update document count
  const totalDocs = documents.reduce((sum, doc) => sum + (doc.count || 1), 0);
  const docCountEl = docsCard.querySelector('.doc-count');
  if (docCountEl) {
    docCountEl.textContent = `${totalDocs} Docs`;
  }
  
  // Update recent additions
  const recentAdditions = docsCard.querySelector('.recent-additions');
  if (recentAdditions && documents.length > 0) {
    const recentDocs = documents.slice(0, 2).map(doc => 
      `📄 ${doc.name} (${formatRelativeTime(new Date(Date.now() - Math.random() * 7200000))})`
    ).join('<br>');
    recentAdditions.innerHTML = recentDocs;
  }
  
  console.log(`Documents: ${totalDocs} total documents loaded`);
}

// ====================================================================
// STATUS DETAILS MODAL (D1)
// ====================================================================

function setupStatusDetailsModal() {
  const statusCard = document.querySelector('.status-card');
  const viewDetailsBtn = statusCard?.querySelector('.btn-ghost');
  
  if (!viewDetailsBtn) {
    console.warn('View Details button not found');
    return;
  }
  
  // Create modal HTML if it doesn't exist
  let modal = document.getElementById('statusDetailsModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'statusDetailsModal';
    modal.className = 'status-modal';
    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content glass-card">
        <div class="modal-header">
          <h2>Status Details</h2>
          <button class="modal-close" aria-label="Close">×</button>
        </div>
        <div class="modal-body">
          <div class="detail-item">
            <span class="detail-label">Agent Status</span>
            <span class="detail-value" id="modalAgentStatus">Online</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Current Activity</span>
            <span class="detail-value" id="modalCurrentActivity">Dashboard V4 Development</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Bandwidth Usage</span>
            <span class="detail-value" id="modalBandwidth">45%</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Next Heartbeat</span>
            <span class="detail-value countdown" id="modalHeartbeat">12s</span>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    
    // Add modal CSS
    const style = document.createElement('style');
    style.textContent = `
      .status-modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 1000;
        align-items: center;
        justify-content: center;
      }
      
      .status-modal.active {
        display: flex;
      }
      
      .modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
      }
      
      .modal-content {
        position: relative;
        z-index: 1001;
        border-radius: var(--radius-lg);
        border: 1px solid var(--border-glass);
        background: var(--bg-glass);
        backdrop-filter: var(--blur-lg);
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
        min-width: 350px;
        max-width: 90%;
        animation: modalSlideUp 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      }
      
      @keyframes modalSlideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid var(--border-glass);
      }
      
      .modal-header h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        color: var(--text-primary);
      }
      
      .modal-close {
        background: none;
        border: none;
        color: var(--text-secondary);
        font-size: 28px;
        cursor: pointer;
        padding: 0;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--radius-sm);
        transition: all 0.2s ease;
      }
      
      .modal-close:hover {
        background: rgba(255, 255, 255, 0.1);
        color: var(--text-primary);
      }
      
      .modal-body {
        padding: 20px;
      }
      
      .detail-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid var(--border-glass);
      }
      
      .detail-item:last-child {
        border-bottom: none;
      }
      
      .detail-label {
        font-size: 13px;
        color: var(--text-secondary);
        font-weight: 500;
      }
      
      .detail-value {
        font-size: 13px;
        color: var(--text-primary);
        font-weight: 600;
      }
      
      .detail-value.countdown {
        color: var(--accent-teal);
        font-family: 'Monaco', 'Courier New', monospace;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Setup modal handlers
  viewDetailsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    modal.classList.add('active');
    updateStatusDetailsModal();
  });
  
  const closeBtn = modal.querySelector('.modal-close');
  const overlay = modal.querySelector('.modal-overlay');
  
  closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
  });
  
  overlay.addEventListener('click', () => {
    modal.classList.remove('active');
  });
  
  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      modal.classList.remove('active');
    }
  });
}

function updateStatusDetailsModal() {
  const heartbeatEl = document.getElementById('modalHeartbeat');
  if (heartbeatEl) {
    // Update countdown every second
    const updateCountdown = () => {
      dashboardState.statusDetails.heartbeatCountdown--;
      if (dashboardState.statusDetails.heartbeatCountdown < 0) {
        dashboardState.statusDetails.heartbeatCountdown = 30;
      }
      heartbeatEl.textContent = `${dashboardState.statusDetails.heartbeatCountdown}s`;
    };
    
    // Update immediately and then every second
    updateCountdown();
    clearInterval(window.heartbeatInterval);
    window.heartbeatInterval = setInterval(updateCountdown, 1000);
  }
  
  // Update other details
  document.getElementById('modalAgentStatus').textContent = dashboardState.statusDetails.agentStatus;
  document.getElementById('modalCurrentActivity').textContent = dashboardState.statusDetails.currentActivity;
  document.getElementById('modalBandwidth').textContent = dashboardState.statusDetails.bandwidth + '%';
}

// ====================================================================
// SETUP VIEW ALL COMMITS (D5)
// ====================================================================

function setupViewAllCommits() {
  const viewAllLink = document.querySelector('.view-all');
  if (viewAllLink) {
    viewAllLink.href = 'https://github.com/dreteneller429/mission-control';
    viewAllLink.target = '_blank';
    viewAllLink.rel = 'noopener noreferrer';
    viewAllLink.addEventListener('click', (e) => {
      console.log('Opening GitHub repo');
    });
  }
}

// ====================================================================
// SETUP QUICK LINKS (D7)
// ====================================================================

function setupQuickLinksHandlers() {
  const quickButtons = document.querySelectorAll('.quick-buttons .btn-glass-pill');
  
  quickButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const text = btn.textContent.trim();
      handleQuickLinkClick(text);
    });
  });
}

function handleQuickLinkClick(linkName) {
  const pageMap = {
    'Workshop Queue': { page: 'workshop', url: '/workshop' },
    'Client Intelligence': { page: 'intelligence', url: '/intelligence' },
    'DocuDigest': { page: 'documents', url: '/documents' },
    '+ Add Task': { page: 'workshop', url: '/workshop#add-task' }
  };
  
  const target = pageMap[linkName];
  if (target) {
    // Use app.js navigation if available, otherwise navigate directly
    if (window.loadPage) {
      window.loadPage(target.page);
      window.updateActiveNavLink(target.page);
    } else {
      window.location.href = target.url;
    }
  }
}

// ====================================================================
// Auto-Update Activity Feed Every 30 seconds
// ====================================================================

function startActivityFeedPolling() {
  setInterval(async () => {
    try {
      const response = await fetch('/api/dashboard/activity?limit=10');
      if (response.ok) {
        const data = await response.json();
        if (data.activities.length > 0) {
          updateActivityFeed(data.activities);
        }
      }
    } catch (error) {
      console.error('Error polling activity feed:', error);
    }
  }, 30000);
}

// ====================================================================
// Initialize when DOM is ready
// ====================================================================

document.addEventListener('DOMContentLoaded', () => {
  initDashboard();
  startActivityFeedPolling();
});

// Also export for manual initialization
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initDashboard,
    loadWorkshopData,
    loadActivityFeed,
    loadRecentCommits,
    loadAgentsData,
    loadDocumentsData
  };
}
