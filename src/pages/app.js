/* ====================================================================
   APP.JS - Navigation & Dashboard Interactivity
   ==================================================================== */

// State Management
const appState = {
  currentPage: 'dashboard',
  sidebarOpen: window.innerWidth > 768,
  sidebarCollapsed: localStorage.getItem('sidebarCollapsed') === 'true',
  statusIndicator: 'idle',
  heartbeatCountdown: 12,
  currentTask: 'Dashboard V4 Development',
  isWorking: false,
  subAgentsRunning: false,
};

// Status Statuses for cycling
const statuses = ['online', 'idle', 'working'];
let statusIndex = 0;

// Mock activity data for the feed
const activityPool = [
  { action: 'Commit', description: 'feat(ui): Sidebar complete — DAVE', color: '#64D2FF' },
  { action: 'Task Updated', description: 'Dashboard implementation started — DAVE', color: '#FF9F0A' },
  { action: 'Sub-agent Created', description: 'Builder (phase-2-nav) — DAVE', color: '#BF5AF2' },
  { action: 'Status Updated', description: 'Working on dashboard layout — DAVE', color: '#007AFF' },
  { action: 'Deliverable Added', description: 'Navigation component completed — DAVE', color: '#30D158' },
  { action: 'Heartbeat', description: 'System online, services running — Gateway', color: 'rgba(255,255,255,0.3)' },
  { action: 'Commit', description: 'docs: Updated design system — DAVE', color: '#64D2FF' },
  { action: 'Task Updated', description: 'Responsive layout completed — DAVE', color: '#FF9F0A' },
];

let activityCounter = 0;

// ====================================================================
// Initialize App
// ====================================================================

function initApp() {
  loadNavigation();
  loadDashboard();
  setupEventListeners();
  startHeartbeat();
  setupStatusToggle();
  
  // Initialize status indicator to idle (yellow)
  setTimeout(() => {
    updateDaveStatus(false, false, 'Initializing...');
  }, 500);
  
  // Start real-time status polling (N3 FIX)
  setTimeout(() => {
    startStatusPolling();
  }, 1000);
  
  // Load dashboard logic (will handle real data fetching and initialization)
  setTimeout(() => {
    loadDashboardLogic();
  }, 800);
}

// ====================================================================
// Load Navigation Sidebar
// ====================================================================

function loadNavigation() {
  const navContainer = document.getElementById('navigationContainer');
  
  fetch('./Navigation.html')
    .then(response => response.text())
    .then(html => {
      navContainer.innerHTML = html;
      restoreSidebarState();
      setupSidebarToggle();
      setupMobileMenu();
      setupNavigation();
    })
    .catch(error => console.error('Error loading navigation:', error));
}

// ====================================================================
// Load Dashboard Content
// ====================================================================

function loadDashboard() {
  const dashContainer = document.getElementById('dashboardContainer');
  
  fetch('./Dashboard.html')
    .then(response => response.text())
    .then(html => {
      dashContainer.innerHTML = html;
      
      // Apply collapsed state styling if needed
      if (appState.sidebarCollapsed) {
        updateContainerWidths(true);
      }
      
      setupStatCardClickHandlers();
      setupQuickLinkHandlers();
      initializeActivityFeed();
    })
    .catch(error => console.error('Error loading dashboard:', error));
}

// ====================================================================
// Update DAVE Status Indicator (Green = Working, Yellow = Idle)
// N3 FIX: Dynamic status based on real activity
// ====================================================================

function updateDaveStatus(isWorking = false, subAgentsRunning = false, currentTask = null) {
  appState.isWorking = isWorking || subAgentsRunning;
  appState.subAgentsRunning = subAgentsRunning;
  
  if (currentTask) {
    appState.currentTask = currentTask;
  }
  
  const indicator = document.getElementById('statusIndicator');
  const label = document.getElementById('statusLabel');
  const activity = document.getElementById('statusActivity');
  
  if (!indicator || !label || !activity) return;
  
  if (isWorking || subAgentsRunning) {
    // Green dot = actively working OR sub-agents running
    appState.statusIndicator = 'working';
    indicator.setAttribute('data-status', 'working');
    label.textContent = subAgentsRunning ? 'Working' : 'Active';
    activity.textContent = appState.currentTask;
  } else {
    // Yellow dot = idle but online
    appState.statusIndicator = 'idle';
    indicator.setAttribute('data-status', 'idle');
    label.textContent = 'Online';
    activity.textContent = 'Waiting for tasks';
  }
}

// Poll for real-time status updates
function startStatusPolling() {
  // Check status every 5 seconds
  setInterval(async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        const isWorking = data.active_tasks > 0;
        const currentTask = data.current_task || 'No active tasks';
        updateDaveStatus(isWorking, false, currentTask);
      }
    } catch (error) {
      console.error('Error polling status:', error);
    }
  }, 5000);
}

// ====================================================================
// Set Current Task (Updates status activity text)
// ====================================================================

function setCurrentTask(taskName) {
  appState.currentTask = taskName;
  
  const activity = document.getElementById('statusActivity');
  if (activity) {
    activity.textContent = taskName;
  }
}

// ====================================================================
// Setup Event Listeners
// ====================================================================

function setupEventListeners() {
  // Window resize to update sidebar state
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      const sidebar = document.getElementById('sidebar');
      if (sidebar) {
        sidebar.classList.remove('open');
        // Restore collapsed state on desktop
        if (appState.sidebarCollapsed) {
          sidebar.classList.add('collapsed');
        } else {
          sidebar.classList.remove('collapsed');
        }
      }
      appState.sidebarOpen = false;
    } else {
      // On mobile, remove collapsed class
      const sidebar = document.getElementById('sidebar');
      if (sidebar) {
        sidebar.classList.remove('collapsed');
      }
    }
  });
}

// ====================================================================
// Restore Sidebar State from localStorage
// ====================================================================

function restoreSidebarState() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  if (appState.sidebarCollapsed) {
    sidebar.classList.add('collapsed');
    updateContainerWidths(true);
  }
}

// ====================================================================
// Sidebar Toggle (Collapse/Expand & Mobile Menu)
// ====================================================================

function setupSidebarToggle() {
  const toggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');

  if (toggle && sidebar) {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      
      // On mobile (width <= 768px): toggle menu open/close
      if (window.innerWidth <= 768) {
        sidebar.classList.toggle('open');
        appState.sidebarOpen = sidebar.classList.contains('open');
      } else {
        // On desktop (width > 768px): toggle collapse/expand
        sidebar.classList.toggle('collapsed');
        appState.sidebarCollapsed = sidebar.classList.contains('collapsed');
        
        // Update arrow direction (FIX 2C)
        const arrow = toggle.querySelector('.toggle-arrow');
        if (arrow) {
          if (sidebar.classList.contains('collapsed')) {
            arrow.innerHTML = '›'; // Right arrow when collapsed
          } else {
            arrow.innerHTML = '‹'; // Left arrow when expanded
          }
        }
        
        // Save state to localStorage
        localStorage.setItem('sidebarCollapsed', appState.sidebarCollapsed);
        
        // Update container widths
        updateContainerWidths(appState.sidebarCollapsed);
      }
    });

    // Close sidebar when clicking outside (mobile only)
    document.addEventListener('click', (e) => {
      if (appState.sidebarOpen && 
          !sidebar.contains(e.target) && 
          !toggle.contains(e.target) &&
          window.innerWidth <= 768) {
        sidebar.classList.remove('open');
        appState.sidebarOpen = false;
      }
    });
  }
}

// ====================================================================
// Update Container Widths Based on Sidebar State
// ====================================================================

function updateContainerWidths(isCollapsed) {
  const containers = document.querySelectorAll(
    '.dashboard-container, .documents-container, .journal-container, ' +
    '.intelligence-container, .agents-container, .clients-container, ' +
    '.cron-jobs-container, .api-usage-container, .docudigest-container, ' +
    '.weekly-recaps-container, .workshop-page'
  );

  containers.forEach(container => {
    if (isCollapsed) {
      container.classList.add('sidebar-collapsed');
    } else {
      container.classList.remove('sidebar-collapsed');
    }
  });
}

// ====================================================================
// Mobile Menu Close on Nav Click
// ====================================================================

function setupMobileMenu() {
  const navLinks = document.querySelectorAll('.nav-link');
  const sidebar = document.getElementById('sidebar');

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768 && sidebar) {
        sidebar.classList.remove('open');
        appState.sidebarOpen = false;
      }
    });
  });
}

// ====================================================================
// Navigation Setup
// ====================================================================

function setupNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Remove active class from all links
      navLinks.forEach(l => l.classList.remove('active'));
      
      // Add active class to clicked link
      link.classList.add('active');
      
      const page = link.getAttribute('data-page');
      appState.currentPage = page;
      
      // Load the selected page
      loadPage(page);
    });
  });
}

// ====================================================================
// Update Active Navigation Link
// ====================================================================

function updateActiveNavLink(page) {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('data-page') === page) {
      link.classList.add('active');
    }
  });
}

// ====================================================================
// Load Page Dynamically
// ====================================================================

function loadPage(page) {
  const dashContainer = document.getElementById('dashboardContainer');
  if (!dashContainer) return;

  // Map page names to their filenames
  const pageMap = {
    dashboard: 'Dashboard.html',
    intelligence: 'Intelligence.html',
    journal: 'Journal.html',
    documents: 'Documents.html',
    agents: 'Agents.html',
    recaps: 'WeeklyRecaps.html',
    clients: 'Clients.html',
    cron: 'CronJobs.html',
    api: 'APIUsage.html',
    workshop: 'Workshop.html',
  };

  const filename = pageMap[page] || 'Dashboard.html';

  fetch(`./${filename}`)
    .then(response => response.text())
    .then(html => {
      dashContainer.innerHTML = html;
      
      // Apply collapsed state styling if needed
      if (appState.sidebarCollapsed) {
        updateContainerWidths(true);
      }
      
      // Initialize page-specific logic based on page name
      switch(page) {
        case 'intelligence':
          // Load Intelligence-specific JavaScript
          const script = document.createElement('script');
          script.src = '../js/intelligence-logic.js';
          document.body.appendChild(script);
          break;
        case 'agents':
          // Load Agents-specific JavaScript
          import('../js/agents-logic.js').then(module => {
            if (module.initAgentsPage) {
              module.initAgentsPage();
            }
          }).catch(error => console.error('Error initializing agents page:', error));
          break;
        case 'journal':
          // Load Journal-specific JavaScript
          const journalScript = document.createElement('script');
          journalScript.src = '../js/journal-logic.js';
          document.body.appendChild(journalScript);
          break;
        case 'documents':
          // Load Documents-specific JavaScript
          const docsScript = document.createElement('script');
          docsScript.src = '../js/documents-logic.js';
          document.body.appendChild(docsScript);
          break;
        case 'cron':
          // Load Cron Jobs-specific JavaScript
          const cronScript = document.createElement('script');
          cronScript.src = '../js/cron-logic.js';
          document.body.appendChild(cronScript);
          break;
        case 'clients':
          // Load Clients-specific JavaScript
          const clientsScript = document.createElement('script');
          clientsScript.src = '../js/clients-logic.js';
          document.body.appendChild(clientsScript);
          break;
        case 'recaps':
          // Load Weekly Recaps-specific JavaScript
          const recapsScript = document.createElement('script');
          recapsScript.src = '../js/recaps-logic.js';
          document.body.appendChild(recapsScript);
          break;
        case 'api':
          // Load API Usage-specific JavaScript
          const apiScript = document.createElement('script');
          apiScript.src = '../js/api-usage-logic.js';
          document.body.appendChild(apiScript);
          break;
        case 'workshop':
          // Load Workshop-specific JavaScript
          const workshopScript = document.createElement('script');
          workshopScript.src = '../js/workshop-logic.js';
          document.body.appendChild(workshopScript);
          break;
        case 'dashboard':
          setupStatCardClickHandlers();
          setupQuickLinkHandlers();
          initializeActivityFeed();
          break;
      }
    })
    .catch(error => console.error(`Error loading page ${filename}:`, error));
}

// ====================================================================
// Status Toggle & Expand
// ====================================================================

function setupStatusToggle() {
  setTimeout(() => {
    const statusToggle = document.getElementById('statusToggle');
    const statusDetails = document.getElementById('statusDetails');

    if (statusToggle && statusDetails) {
      statusToggle.addEventListener('click', () => {
        statusDetails.classList.toggle('expanded');
      });
    }
  }, 500);
}

// ====================================================================
// Heartbeat Counter
// ====================================================================

function startHeartbeat() {
  setInterval(() => {
    appState.heartbeatCountdown--;
    
    if (appState.heartbeatCountdown <= 0) {
      appState.heartbeatCountdown = 30;
    }

    const countdownEl = document.getElementById('heartbeatCountdown');
    if (countdownEl) {
      countdownEl.textContent = appState.heartbeatCountdown + 's';
    }
  }, 1000);
}

// ====================================================================
// Load Dashboard Logic (Real Data Integration)
// ====================================================================

function loadDashboardLogic() {
  const script = document.createElement('script');
  script.src = './dashboard-logic.js';
  script.async = true;
  script.onload = () => {
    console.log('Dashboard logic loaded successfully');
    // Make functions available globally
    window.dashboardState = dashboardState || {};
  };
  script.onerror = () => {
    console.error('Failed to load dashboard logic');
  };
  document.body.appendChild(script);
}

// ====================================================================
// Activity Feed Auto-Update (Deprecated - Using dashboard-logic)
// ====================================================================

function startActivityFeed() {
  // This function is now handled by dashboard-logic.js
  // The dashboard-logic will handle real data fetching and polling
  console.log('Activity feed will be managed by dashboard-logic.js');
}

// ====================================================================
// Update Activity Feed Timestamps
// ====================================================================

function updateActivityTimestamps() {
  const entries = document.querySelectorAll('.activity-entry');
  
  entries.forEach((entry, index) => {
    const timestamp = entry.querySelector('.entry-timestamp');
    if (index === 0) {
      timestamp.textContent = 'now';
    } else if (index === 1) {
      timestamp.textContent = '1m ago';
    } else if (index < 5) {
      timestamp.textContent = (index) + 'm ago';
    } else {
      timestamp.textContent = Math.floor(index / 5 * 10) + 'm ago';
    }
  });
}

// ====================================================================
// Initialize Activity Feed (On Load)
// ====================================================================

function initializeActivityFeed() {
  const feed = document.getElementById('activityFeed');
  if (feed) {
    updateActivityTimestamps();
  }
}

// ====================================================================
// Stat Card Click Handlers
// ====================================================================

function setupStatCardClickHandlers() {
  const statCards = document.querySelectorAll('.stat-card');

  statCards.forEach(card => {
    const cardType = card.getAttribute('data-card');
    
    // For status card, setup View Details button
    if (cardType === 'status') {
      const viewDetailsBtn = card.querySelector('.btn-ghost');
      if (viewDetailsBtn) {
        viewDetailsBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          // The dashboard-logic will handle opening the modal
          console.log('View Details button clicked - modal will open via dashboard-logic');
        });
      }
    } else {
      // For other cards, navigate to their pages
      card.addEventListener('click', () => {
        handleStatCardClick(cardType);
      });
    }
  });
}

function handleStatCardClick(cardType) {
  switch(cardType) {
    case 'workshop':
      loadPage('workshop');
      updateActiveNavLink('workshop');
      break;
    case 'agents':
      loadPage('agents');
      updateActiveNavLink('agents');
      break;
    case 'documents':
      loadPage('documents');
      updateActiveNavLink('documents');
      break;
    case 'status':
      // Status card - modal is handled by dashboard-logic
      console.log('Status card clicked - view details');
      break;
    default:
      console.log('Card clicked:', cardType);
  }
}

// ====================================================================
// Quick Links Click Handlers (Will be overridden by dashboard-logic)
// ====================================================================

function setupQuickLinkHandlers() {
  // This will be set up by dashboard-logic.js for real data handling
  // But we'll keep this as a fallback
  setTimeout(() => {
    const quickButtons = document.querySelectorAll('.quick-buttons .btn-glass-pill');

    quickButtons.forEach(btn => {
      if (!btn.hasListener) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const text = btn.textContent.trim();
          handleQuickLinkClick(text);
        });
        btn.hasListener = true;
      }
    });
  }, 100);
}

function handleQuickLinkClick(linkName) {
  // Map button text to page names
  const pageMap = {
    'Workshop Queue': 'workshop',
    'Client Intelligence': 'intelligence',
    'DocuDigest': 'documents',
    '+ Add Task': 'workshop',
  };

  const page = pageMap[linkName] || 'dashboard';
  loadPage(page);
  updateActiveNavLink(page);
  showNotification(`Opening: ${linkName}`);
}

// ====================================================================
// Simple Notification (Visual Feedback)
// ====================================================================

function showNotification(message) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: rgba(0, 122, 255, 0.9);
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 14px;
    z-index: 1000;
    animation: slideInUp 0.3s ease;
    backdrop-filter: blur(20px);
  `;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOutDown 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 2500);
}

// ====================================================================
// Status Indicator Mock Cycling (For Demo)
// ====================================================================

function setupStatusCycling() {
  // Uncomment to enable automatic status cycling
  /*
  setInterval(() => {
    statusIndex = (statusIndex + 1) % statuses.length;
    const newStatus = statuses[statusIndex];
    
    const indicator = document.getElementById('statusIndicator');
    const label = document.getElementById('statusLabel');
    
    if (indicator && label) {
      indicator.setAttribute('data-status', newStatus);
      label.textContent = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
      
      // Update other status fields
      const activity = document.getElementById('statusActivity');
      if (activity) {
        const activities = ['Building Dashboard', 'Waiting for input', 'Processing data'];
        activity.textContent = activities[statusIndex];
      }
    }
  }, 10000);
  */
}

// ====================================================================
// Initialize on DOM Ready
// ====================================================================

document.addEventListener('DOMContentLoaded', initApp);

// ====================================================================
// CSS Animation Helpers (for notification)
// ====================================================================

const style = document.createElement('style');
style.textContent = `
  @keyframes slideInUp {
    from {
      transform: translateY(100px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slideOutDown {
    from {
      transform: translateY(0);
      opacity: 1;
    }
    to {
      transform: translateY(100px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

console.log('Mission Control V4 - Dashboard Initialized');

// Expose key functions to global window object for dashboard-logic
window.loadPage = loadPage;
window.updateActiveNavLink = updateActiveNavLink;
window.handleQuickLinkClick = handleQuickLinkClick;
window.showNotification = showNotification;

// Initialize the app when the DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
