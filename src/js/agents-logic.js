/**
 * agents-logic.js - Client-side logic for Agents Page
 * Handles tab switching, agent selection, messaging, and UI state
 */

import {
  getAgents,
  getAgent,
  getMessages,
  sendMessage,
  formatTimestamp,
  formatMessageTime,
  getAgentStats,
  getCommsStats
} from '../api/agents.js';

// ====================================================================
// State Management
// ====================================================================

const state = {
  currentTab: 'personnel',
  selectedAgentId: 'dave',
  agents: [],
  messages: [],
  isLoading: false,
  currentUser: {
    id: 'david',
    name: 'David',
    avatar: 'D',
    avatarClass: 'david'
  }
};

// ====================================================================
// DOM References
// ====================================================================

const refs = {
  container: document.getElementById('agentsContainer'),
  tabs: {
    personnel: document.getElementById('personnelTab'),
    comms: document.getElementById('commsTab'),
    buttons: document.querySelectorAll('.tab-button')
  },
  personnel: {
    agentList: document.getElementById('agentList'),
    agentProfile: document.getElementById('agentProfile')
  },
  comms: {
    feed: document.getElementById('commsFeed'),
    input: document.getElementById('commsInput'),
    form: document.getElementById('commsInputForm'),
    charCount: document.getElementById('charCount'),
    messageCount: document.getElementById('messageCount'),
    activeAgentsCount: document.getElementById('activeAgentsCount')
  }
};

// ====================================================================
// Initialization
// ====================================================================

export async function initAgentsPage() {
  console.log('🚀 Initializing Agents Page...');
  
  try {
    // Load data
    await loadAgents();
    await loadMessages();
    
    // Setup event listeners
    setupTabListeners();
    setupAgentListeners();
    setupCommsListeners();
    
    // Render initial state
    renderAgentList();
    renderAgentProfile(state.selectedAgentId);
    renderMessagesFeed();
    updateStats();
    
    console.log('✅ Agents Page initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Agents Page:', error);
  }
}

// ====================================================================
// Data Loading
// ====================================================================

async function loadAgents() {
  try {
    state.isLoading = true;
    const response = await getAgents();
    state.agents = response.data;
    console.log(`📊 Loaded ${state.agents.length} agents`);
  } catch (error) {
    console.error('Failed to load agents:', error);
    state.agents = [];
  } finally {
    state.isLoading = false;
  }
}

async function loadMessages() {
  try {
    const response = await getMessages();
    state.messages = response.data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    console.log(`💬 Loaded ${state.messages.length} messages`);
  } catch (error) {
    console.error('Failed to load messages:', error);
    state.messages = [];
  }
}

// ====================================================================
// Tab Management
// ====================================================================

function setupTabListeners() {
  refs.tabs.buttons.forEach(button => {
    button.addEventListener('click', (e) => {
      const tabName = button.getAttribute('data-tab');
      switchTab(tabName);
    });
  });
}

function switchTab(tabName) {
  // Update state
  state.currentTab = tabName;
  
  // Update active button
  refs.tabs.buttons.forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
  });
  
  // Update visible panels
  Object.values(refs.tabs).forEach(tab => {
    if (tab instanceof Element) return; // Skip buttons
  });
  
  refs.tabs.personnel.classList.toggle('active', tabName === 'personnel');
  refs.tabs.comms.classList.toggle('active', tabName === 'comms');
  
  // Auto-scroll to bottom on comms tab
  if (tabName === 'comms') {
    setTimeout(() => scrollMessagesBottom(), 100);
  }
  
  console.log(`📑 Switched to ${tabName} tab`);
}

// ====================================================================
// Personnel Tab: Agent List
// ====================================================================

function setupAgentListeners() {
  // Event delegation on agent list
  refs.personnel.agentList.addEventListener('click', (e) => {
    const agentItem = e.target.closest('.agent-item');
    if (agentItem) {
      const agentId = agentItem.getAttribute('data-agent-id');
      selectAgent(agentId);
    }
  });
}

function renderAgentList() {
  refs.personnel.agentList.innerHTML = '';
  
  state.agents.forEach(agent => {
    const isSelected = agent.id === state.selectedAgentId;
    const agentEl = createAgentListItem(agent, isSelected);
    refs.personnel.agentList.appendChild(agentEl);
  });
}

function createAgentListItem(agent, isSelected) {
  const item = document.createElement('button');
  item.className = `agent-item ${isSelected ? 'active' : ''}`;
  item.setAttribute('data-agent-id', agent.id);
  item.setAttribute('type', 'button');
  
  const statusDot = agent.status === 'online' ? 'online' : 'offline';
  
  item.innerHTML = `
    <div class="agent-item-avatar ${agent.avatarClass}">
      ${agent.avatar}
      <div class="agent-status-dot ${statusDot}"></div>
    </div>
    <div class="agent-item-info">
      <div class="agent-item-name">${agent.name}</div>
      <div class="agent-item-role">${agent.role}</div>
    </div>
  `;
  
  return item;
}

function selectAgent(agentId) {
  state.selectedAgentId = agentId;
  
  // Update active state in list
  refs.personnel.agentList.querySelectorAll('.agent-item').forEach(item => {
    item.classList.toggle('active', item.getAttribute('data-agent-id') === agentId);
  });
  
  // Render profile
  renderAgentProfile(agentId);
  
  console.log(`👤 Selected agent: ${agentId}`);
}

// ====================================================================
// Personnel Tab: Agent Profile
// ====================================================================

function renderAgentProfile(agentId) {
  const agent = state.agents.find(a => a.id === agentId);
  if (!agent) return;
  
  const profileHTML = createAgentProfileHTML(agent);
  refs.personnel.agentProfile.innerHTML = profileHTML;
}

function createAgentProfileHTML(agent) {
  const statusDot = agent.status === 'online' ? 'online' : 'offline';
  const activityBadge = agent.activity || 'idle';
  
  let profileHTML = `
    <div class="profile-header">
      <div class="profile-avatar-large ${agent.avatarClass}">
        ${agent.avatar}
      </div>
      <div class="profile-header-info">
        <h1 class="profile-name">${agent.name}</h1>
        <p class="profile-role">${agent.role}</p>
        <div class="profile-status-group">
          <span class="status-badge ${statusDot}">
            <span class="status-dot ${statusDot}"></span>
            ${statusDot === 'online' ? 'Online' : 'Offline'}
          </span>
          <span class="status-badge ${activityBadge}">
            ${formatActivityBadge(activityBadge)}
          </span>
        </div>
      </div>
    </div>
  `;
  
  // DAVE-specific sections
  if (agent.id === 'dave') {
    profileHTML += createDAVEProfile(agent);
  } else {
    profileHTML += createSubAgentProfile(agent);
  }
  
  // Current task
  if (agent.currentTask) {
    profileHTML += createTaskCard(agent.currentTask);
  }
  
  return profileHTML;
}

function createDAVEProfile(agent) {
  let html = `
    <!-- Mission Directives -->
    <section class="profile-section">
      <h3 class="section-title">Mission Directives</h3>
      <div class="section-content">
        <ul style="margin: 0; padding-left: 20px;">
  `;
  
  agent.missionDirectives.forEach(directive => {
    html += `<li style="margin-bottom: 8px; color: var(--text-secondary); font-size: 14px; line-height: var(--line-height-relaxed);">${directive}</li>`;
  });
  
  html += `
        </ul>
      </div>
    </section>

    <!-- Operational Bio -->
    <section class="profile-section">
      <h3 class="section-title">Operational Bio</h3>
      <div class="section-content">
        <p class="info-text">${agent.operationalBio}</p>
      </div>
    </section>
  `;
  
  return html;
}

function createSubAgentProfile(agent) {
  let html = `
    <!-- Current Activity -->
    <section class="profile-section">
      <h3 class="section-title">Status</h3>
      <div class="section-content">
  `;
  
  if (agent.currentTask) {
    html += `
      <div class="info-item">
        <span class="info-label">Current Task:</span>
        <span class="info-value">${agent.currentTask.name}</span>
      </div>
    `;
  }
  
  html += `
      </div>
    </section>
  `;
  
  return html;
}

function formatActivityBadge(activity) {
  const badges = {
    'commander': '👑 Commander',
    'working': '⚙️ Working',
    'idle': '😴 Idle'
  };
  return badges[activity] || activity;
}

function createTaskCard(task) {
  const subtasksHTML = task.subtasks && task.subtasks.length > 0 ? `
    <div class="task-subtasks">
      <div class="subtask-list">
        ${task.subtasks.map(st => `
          <div class="subtask-item">
            <div class="subtask-checkbox ${st.completed ? 'completed' : ''}">
              ${st.completed ? '✓' : ''}
            </div>
            <span>${st.name}</span>
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';
  
  return `
    <section class="profile-section">
      <h3 class="section-title">Active Task</h3>
      <div class="task-card">
        <div class="task-name">${task.name}</div>
        <div class="task-description">${task.description}</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${task.progress}%"></div>
        </div>
        <div class="progress-label">
          <span>Progress</span>
          <span>${task.progress}%</span>
        </div>
        ${subtasksHTML}
      </div>
    </section>
  `;
}

// ====================================================================
// Comms Tab: Messages
// ====================================================================

function setupCommsListeners() {
  // Form submission
  refs.comms.form.addEventListener('submit', handleMessageSubmit);
  
  // Input character count
  refs.comms.input.addEventListener('input', updateCharCount);
  refs.comms.input.addEventListener('keydown', handleInputKeydown);
}

function updateCharCount() {
  const count = refs.comms.input.value.length;
  refs.comms.charCount.textContent = `${count}/1000`;
}

function handleInputKeydown(e) {
  // Allow Shift+Enter for new lines
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleMessageSubmit(e);
  }
}

async function handleMessageSubmit(e) {
  e.preventDefault();
  
  const message = refs.comms.input.value.trim();
  if (!message) return;
  
  try {
    // Show optimistic update
    refs.comms.input.value = '';
    updateCharCount();
    
    // Send message
    const response = await sendMessage(
      state.currentUser.id,
      state.currentUser.name,
      message,
      state.currentUser.avatar,
      state.currentUser.avatarClass
    );
    
    // Update state and re-render
    state.messages.push(response.data);
    renderMessagesFeed();
    scrollMessagesBottom();
    
    console.log('💬 Message sent');
  } catch (error) {
    console.error('Failed to send message:', error);
    refs.comms.input.value = message; // Restore on error
    alert('Failed to send message. Please try again.');
  }
}

function renderMessagesFeed() {
  if (state.messages.length === 0) {
    refs.comms.feed.innerHTML = `
      <div class="feed-empty-state">
        <div class="feed-empty-icon">💬</div>
        <div class="feed-empty-text">No messages yet. Start the conversation!</div>
      </div>
    `;
    return;
  }
  
  refs.comms.feed.innerHTML = '';
  
  state.messages.forEach(msg => {
    const msgEl = createMessageBubble(msg);
    refs.comms.feed.appendChild(msgEl);
  });
  
  // Update message count
  refs.comms.messageCount.textContent = state.messages.length;
}

function createMessageBubble(msg) {
  const wrapper = document.createElement('div');
  const sender = msg.senderId;
  wrapper.className = `message-bubble from-${sender}`;
  
  const timeStr = formatMessageTime(new Date(msg.timestamp));
  const timestampRelative = formatTimestamp(new Date(msg.timestamp));
  
  wrapper.innerHTML = `
    <div class="message-avatar ${msg.avatarClass}">
      ${msg.avatar}
    </div>
    <div class="message-content">
      <div class="message-header">
        <span class="message-sender ${sender}">${msg.senderName}</span>
        <span class="message-timestamp" title="${timeStr}">${timestampRelative}</span>
      </div>
      <div class="message-text">${escapeHTML(msg.text)}</div>
    </div>
  `;
  
  return wrapper;
}

function escapeHTML(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function scrollMessagesBottom() {
  refs.comms.feed.scrollTop = refs.comms.feed.scrollHeight;
}

// ====================================================================
// Stats & Updates
// ====================================================================

async function updateStats() {
  try {
    const agentStats = await getAgentStats();
    const commsStats = await getCommsStats();
    
    refs.comms.activeAgentsCount.textContent = agentStats.data.onlineAgents;
    refs.comms.messageCount.textContent = commsStats.data.totalMessages;
    
    console.log('📈 Stats updated');
  } catch (error) {
    console.error('Failed to update stats:', error);
  }
}

// ====================================================================
// Export & Auto-init
// ====================================================================

// Auto-initialize on DOMContentLoaded if in a browser
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAgentsPage);
  } else {
    initAgentsPage();
  }
}

export { initAgentsPage, switchTab, selectAgent };
