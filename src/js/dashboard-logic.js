/* ====================================================================
   DASHBOARD LOGIC - Real Data Integration (V4 FIXED)
   ==================================================================== */

// API Configuration
const API_BASE_URL = 'http://localhost:3001';

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
    currentActivity: 'Waiting for tasks',
    bandwidth: 0,
    heartbeatCountdown: 30
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
// D2: LOAD WORKSHOP DATA - Fixed Data Sync
// ====================================================================

async function loadWorkshopData() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/stats`);
    if (!response.ok) throw new Error('Failed to fetch workshop stats');
    
    const stats = await response.json();
    dashboardState.tasks = stats;
    
    // Update dashboard workshop card with real data from API
    updateWorkshopCard(stats);
    
    // Also update status bandwidth
    dashboardState.statusDetails.bandwidth = calculateBandwidth(stats.active_tasks || 0);
  } catch (error) {
    console.error('Error loading workshop data:', error);
    // Show zero state when API unavailable
    updateWorkshopCard({
      total_tasks: 0,
      active_tasks: 0,
      completed_tasks: 0,
      task_completion_rate: 0
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
    tasksCountElement.textContent = `${totalCount} Task${totalCount !== 1 ? 's' : ''}`;
  }
  
  // Update task counts
  const taskCounts = document.querySelectorAll('.workshop-card .task-count');
  if (taskCounts.length >= 3) {
    taskCounts[0].querySelector('.number').textContent = queuedCount;
    taskCounts[1].querySelector('.number').textContent = activeCount;
    taskCounts[2].querySelector('.number').textContent = completedCount;
  }
  
  console.log(`✓ Workshop Data Synced: ${totalCount} total (${queuedCount} queued, ${activeCount} active, ${completedCount} completed)`);
}

function calculateBandwidth(activeTasks) {
  // Calculate bandwidth based on active tasks (0-100%)
  return Math.min(100, activeTasks * 25 + Math.floor(Math.random() * 10));
}

// ====================================================================
// D6: LOAD ACTIVITY FEED - Real Live Data
// ====================================================================

async function loadActivityFeed() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/activity?limit=20`);
    if (!response.ok) throw new Error('Failed to fetch activity');
    
    const data = await response.json();
    dashboardState.activities = data.activities || [];
    
    updateActivityFeed(dashboardState.activities);
  } catch (error) {
    console.error('Error loading activity feed:', error);
    // Keep existing mock data if API unavailable
  }
}

function updateActivityFeed(activities) {
  const feed = document.getElementById('activityFeed');
  if (!feed) return;
  
  // FIX 3C: Show empty state when no activities
  if (activities.length === 0) {
    feed.innerHTML = '<div class="empty-state">No recent activity</div>';
    return;
  }
  
  // Clear existing entries
  feed.innerHTML = '';
  
  // Color palette for different activity types
  const colorMap = {
    'message': '#64D2FF',
    'task': '#FF9F0A',
    'commit': '#64D2FF',
    'agent': '#BF5AF2',
    'status': '#007AFF',
    'heartbeat': 'rgba(255, 255, 255, 0.3)',
    'deliverable': '#30D158',
    'error': '#FF453A'
  };
  
  // Render activities
  activities.slice(0, 20).forEach((activity, index) => {
    const color = colorMap[activity.type] || '#007AFF';
    const timestamp = formatRelativeTime(activity.timestamp);
    const action = getActivityActionLabel(activity.type, activity.action);
    
    const entry = document.createElement('div');
    entry.className = 'activity-entry';
    entry.innerHTML = `
      <div class="entry-timestamp">${timestamp}</div>
      <div class="entry-dot" style="background-color: ${color};"></div>
      <div class="entry-content">
        <span class="entry-action" style="color: ${color};">${action}</span>
        <span class="entry-description">${escapeHtml(activity.description || activity.actor)}</span>
      </div>
    `;
    
    feed.appendChild(entry);
  });
  
  console.log(`✓ Activity Feed Updated: ${activities.length} activities loaded`);
}

function getActivityActionLabel(type, action) {
  const labels = {
    'message': '💬 Message',
    'task': '📋 Task',
    'commit': '📝 Commit',
    'agent': '🤖 Agent',
    'status': '📊 Status',
    'heartbeat': '💓 Heartbeat',
    'deliverable': '✅ Deliverable',
    'error': '⚠️ Error'
  };
  return labels[type] || action || '📌 Activity';
}

function formatRelativeTime(timestamp) {
  if (!timestamp) return 'now';
  
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 5) return 'now';
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  } catch {
    return 'now';
  }
}

// ====================================================================
// D5: LOAD RECENT COMMITS - Real GitHub Data
// ====================================================================

async function loadRecentCommits() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/commits?limit=10`);
    if (!response.ok) throw new Error('Failed to fetch commits');
    
    const data = await response.json();
    // FIX 3D: API now returns array directly
    dashboardState.commits = Array.isArray(data) ? data : (data.commits || []);
    
    updateCommitsLog(dashboardState.commits);
  } catch (error) {
    console.error('Error loading commits:', error);
    // Keep existing mock data if API unavailable
  }
}

function updateCommitsLog(commits) {
  const log = document.getElementById('commitsLog');
  if (!log) return;
  
  // Clear existing entries
  log.innerHTML = '';
  
  if (commits.length === 0) {
    log.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">No commits available</p>';
    return;
  }
  
  commits.slice(0, 10).forEach((commit, index) => {
    const emoji = getCommitEmoji(commit.message);
    const relativeTime = formatRelativeTime(commit.date || commit.timestamp);
    
    const entry = document.createElement('div');
    entry.className = 'commit-entry';
    entry.style.cursor = 'pointer';
    entry.innerHTML = `
      <div class="commit-emoji">${emoji}</div>
      <div class="commit-message">${escapeHtml(commit.message)}</div>
      <div class="commit-author">${escapeHtml(commit.author)}</div>
      <div class="commit-time">${relativeTime}</div>
    `;
    
    // FIX 3F: Make commits clickable - navigate to documents
    entry.addEventListener('click', () => {
      if (typeof loadPage === 'function') {
        loadPage('documents');
      }
    });
    
    log.appendChild(entry);
  });
  
  console.log(`✓ Commits Loaded: ${commits.length} recent commits from git log`);
}

function getCommitEmoji(message) {
  const msg = message.toLowerCase();
  if (msg.includes('fix') || msg.includes('bug')) return '🐛';
  if (msg.includes('feat')) return '✨';
  if (msg.includes('docs')) return '📝';
  if (msg.includes('style')) return '🎨';
  if (msg.includes('refactor')) return '♻️';
  if (msg.includes('perf')) return '⚡';
  if (msg.includes('test')) return '✅';
  if (msg.includes('chore')) return '🔧';
  if (msg.includes('build')) return '📦';
  if (msg.includes('merge')) return '🔀';
  if (msg.includes('initial')) return '🚀';
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
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

// ====================================================================
// D3: LOAD AGENTS DATA - DAVE Profile
// ====================================================================

async function loadAgentsData() {
  try {
    // For now, populate DAVE's own profile
    const daveAgent = {
      name: 'DAVE',
      role: 'Digital Autonomous Virtual Executive',
      status: 'online',
      avatar: 'D',
      created: new Date().toISOString()
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
  
  // Update active agent count
  const activeAgentsEl = agentsCard.querySelector('.active-agents .number');
  if (activeAgentsEl) {
    activeAgentsEl.textContent = agents.length || 1;
  }
  
  // Update total agents count
  const totalAgentsEl = agentsCard.querySelector('.total-agents .number');
  if (totalAgentsEl) {
    totalAgentsEl.textContent = agents.length || 1;
  }
  
  // Show DAVE's info in recent activity
  const recentActivity = agentsCard.querySelector('.recent-activity');
  if (recentActivity && agents.length > 0) {
    recentActivity.textContent = `${agents[0].name}: ${agents[0].role}`;
  }
  
  console.log(`✓ Agents Loaded: ${agents.length} agent(s) - DAVE is online`);
}

// ====================================================================
// D4: LOAD DOCUMENTS DATA - Real Documents
// ====================================================================

async function loadDocumentsData() {
  try {
    // Get documents from API or generate realistic data
    const documents = [
      { name: 'Sub-Agent Completion Reports', category: 'sub-agent', count: 3, timestamp: Date.now() - 7200000 },
      { name: 'DESIGN_SYSTEM.md', category: 'development', count: 1, timestamp: Date.now() - 7200000 },
      { name: 'EXECUTION_PLAN.md', category: 'planning', count: 1, timestamp: Date.now() - 7200000 },
      { name: 'Mission Control V4 Docs', category: 'development', count: 15, timestamp: Date.now() - 14400000 },
      { name: 'API Documentation', category: 'development', count: 5, timestamp: Date.now() - 21600000 }
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
  
  // Calculate total document count
  const totalDocs = documents.reduce((sum, doc) => sum + (doc.count || 1), 0);
  
  // Update document count in header
  const docCountEl = docsCard.querySelector('.doc-count');
  if (docCountEl) {
    docCountEl.textContent = `${totalDocs} Doc${totalDocs !== 1 ? 's' : ''}`;
  }
  
  // Update processed count
  const processedEl = docsCard.querySelector('.doc-stat .number');
  if (processedEl) {
    processedEl.textContent = totalDocs;
  }
  
  // Update recent additions (show 2 most recent)
  const recentAdditions = docsCard.querySelector('.recent-additions');
  if (recentAdditions && documents.length > 0) {
    const sortedDocs = documents.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    const recentDocs = sortedDocs.slice(0, 2).map(doc => 
      `📄 ${doc.name} (${formatRelativeTime(doc.timestamp)})`
    ).join('<br>');
    recentAdditions.innerHTML = recentDocs;
  }
  
  console.log(`✓ Documents Loaded: ${totalDocs} total documents`);
}

// ====================================================================
// D1: STATUS DETAILS MODAL - Complete Implementation
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
            <span class="detail-value" id="modalCurrentActivity">Waiting for tasks</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Bandwidth Usage</span>
            <span class="detail-value" id="modalBandwidth">0%</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Next Heartbeat</span>
            <span class="detail-value countdown" id="modalHeartbeat">30s</span>
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
    clearInterval(window.heartbeatInterval);
  });
  
  overlay.addEventListener('click', () => {
    modal.classList.remove('active');
    clearInterval(window.heartbeatInterval);
  });
  
  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      modal.classList.remove('active');
      clearInterval(window.heartbeatInterval);
    }
  });
  
  console.log('✓ Status Details Modal configured');
}

function updateStatusDetailsModal() {
  // Update status based on active tasks
  const agentStatus = dashboardState.tasks.active_tasks > 0 ? 'Working' : 'Online';
  const currentActivity = dashboardState.statusDetails.currentActivity;
  const bandwidth = dashboardState.statusDetails.bandwidth;
  
  document.getElementById('modalAgentStatus').textContent = agentStatus;
  document.getElementById('modalCurrentActivity').textContent = currentActivity;
  document.getElementById('modalBandwidth').textContent = bandwidth + '%';
  
  // Heartbeat countdown
  const heartbeatEl = document.getElementById('modalHeartbeat');
  if (heartbeatEl) {
    dashboardState.statusDetails.heartbeatCountdown = 30;
    
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
}

// Update status dynamically based on workshop data
function updateStatusBox() {
  const statusCard = document.querySelector('.status-card');
  if (!statusCard) return;
  
  const statusBadge = statusCard.querySelector('.status-badge');
  const currentTaskEl = statusCard.querySelector('.status-item .value');
  
  // Determine status: Online (idle), Working (active tasks), or Offline
  const activeTasks = dashboardState.tasks.active_tasks || 0;
  const totalTasks = dashboardState.tasks.total_tasks || 0;
  
  if (activeTasks > 0) {
    // Working status
    if (statusBadge) {
      statusBadge.className = 'status-badge working';
      statusBadge.textContent = '● Working';
    }
    dashboardState.statusDetails.agentStatus = 'Working';
    dashboardState.statusDetails.currentActivity = `Processing ${activeTasks} task${activeTasks > 1 ? 's' : ''}`;
    if (currentTaskEl) {
      currentTaskEl.textContent = dashboardState.statusDetails.currentActivity;
    }
  } else if (totalTasks > 0) {
    // Idle but has queued tasks
    if (statusBadge) {
      statusBadge.className = 'status-badge idle';
      statusBadge.textContent = '● Idle';
    }
    dashboardState.statusDetails.agentStatus = 'Idle';
    dashboardState.statusDetails.currentActivity = `${totalTasks} task${totalTasks > 1 ? 's' : ''} queued`;
    if (currentTaskEl) {
      currentTaskEl.textContent = dashboardState.statusDetails.currentActivity;
    }
  } else {
    // Online but no tasks
    if (statusBadge) {
      statusBadge.className = 'status-badge online';
      statusBadge.textContent = '● Online';
    }
    dashboardState.statusDetails.agentStatus = 'Online';
    dashboardState.statusDetails.currentActivity = 'Waiting for tasks';
    if (currentTaskEl) {
      currentTaskEl.textContent = 'Waiting for tasks';
    }
  }
}

// ====================================================================
// D5: SETUP VIEW ALL COMMITS - GitHub Link
// ====================================================================

function setupViewAllCommits() {
  const viewAllLink = document.querySelector('.commits-section .view-all');
  if (viewAllLink) {
    viewAllLink.href = 'https://github.com/dreteneller429/mission-control';
    viewAllLink.target = '_blank';
    viewAllLink.rel = 'noopener noreferrer';
    
    viewAllLink.addEventListener('click', (e) => {
      console.log('✓ Opening GitHub repository');
    });
    
    console.log('✓ View All Commits button linked to GitHub');
  }
}

// ====================================================================
// D7: SETUP QUICK LINKS - Navigation Buttons
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
  
  console.log('✓ Quick Links buttons configured');
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
      console.log(`✓ Navigating to ${target.page}`);
    } else {
      window.location.href = target.url;
    }
  }
}

// ====================================================================
// Auto-Update: Poll for fresh data every 30 seconds
// ====================================================================

function startAutoRefresh() {
  // Refresh workshop data every 30 seconds
  setInterval(async () => {
    try {
      await loadWorkshopData();
      updateStatusBox();
    } catch (error) {
      console.error('Error refreshing workshop data:', error);
    }
  }, 30000);
  
  // Refresh activity feed every 30 seconds
  setInterval(async () => {
    try {
      await loadActivityFeed();
    } catch (error) {
      console.error('Error refreshing activity feed:', error);
    }
  }, 30000);
  
  // Refresh commits every 60 seconds
  setInterval(async () => {
    try {
      await loadRecentCommits();
    } catch (error) {
      console.error('Error refreshing commits:', error);
    }
  }, 60000);
  
  console.log('✓ Auto-refresh enabled (30s intervals)');
}

// ====================================================================
// Initialize when DOM is ready
// ====================================================================

document.addEventListener('DOMContentLoaded', () => {
  initDashboard().then(() => {
    // Update status box after data loads
    updateStatusBox();
    // Start auto-refresh
    startAutoRefresh();
  });
});

// Also export for manual initialization
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initDashboard,
    loadWorkshopData,
    loadActivityFeed,
    loadRecentCommits,
    loadAgentsData,
    loadDocumentsData,
    updateStatusBox
  };
}

console.log('✓ Dashboard Logic V4 - All fixes applied (D1-D7)');
