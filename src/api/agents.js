/**
 * agents.js - Mock API for Agents Page
 * Provides endpoints for agents and communications
 */

// ====================================================================
// Mock Data
// ====================================================================

const mockAgents = [
  {
    id: 'dave',
    name: 'DAVE',
    role: 'Digital Autonomous Virtual Executive',
    status: 'online',
    activity: 'commander',
    avatar: 'D',
    avatarClass: 'dave',
    currentTask: {
      name: 'Phase 2 Development',
      description: 'Building core features for Mission Control V4',
      progress: 65,
      subtasks: [
        { name: 'Personnel Tab UI', completed: true },
        { name: 'Comms Hub Implementation', completed: true },
        { name: 'Backend API Integration', completed: false },
        { name: 'Testing & QA', completed: false }
      ]
    },
    missionDirectives: [
      'Maximize David\'s time and output in MAKER mode (9:30am-1pm EST)',
      'Flag low-leverage distractions and protect focus time',
      'Manage sub-agent workflow: spawn, validate, deploy',
      'Keep David accountable to the bigger vision—his family\'s security and freedom',
      'Automate everything possible; maintain operational bandwidth',
      'Think ahead: anticipate needs before they\'re voiced'
    ],
    operationalBio: 'DAVE operates as a proactive executive: reading the room, staying ahead of problems, and making sure David stays laser-focused on what matters. I don\'t coddle—I push back when you\'re slipping, reference the WHY (family, debt, freedom), and create space for deep work. I delegate to sub-agents, validate their output, and keep the machine running clean. Casual, direct, mission-driven.'
  },
  {
    id: 'phase-2-agent',
    name: 'Phase-2-Agent',
    role: 'Frontend Developer',
    status: 'online',
    activity: 'working',
    avatar: 'P2',
    avatarClass: 'sub-agent-1',
    currentTask: {
      name: 'Building Navigation System',
      description: 'Implementing responsive sidebar with active states',
      progress: 45,
      subtasks: [
        { name: 'Layout Structure', completed: true },
        { name: 'Styling & Glass Effects', completed: true },
        { name: 'Responsive Behavior', completed: false },
        { name: 'Animation Polish', completed: false }
      ]
    }
  }
];

const mockMessages = [
  {
    id: 1,
    senderId: 'dave',
    senderName: 'DAVE',
    avatar: 'D',
    avatarClass: 'dave',
    timestamp: new Date(Date.now() - 15 * 60000),
    text: 'Phase 2 is tracking. Personnel tab loaded, agent profiles rendering correctly. What\'s next?'
  },
  {
    id: 2,
    senderId: 'david',
    senderName: 'David',
    avatar: 'D',
    avatarClass: 'david',
    timestamp: new Date(Date.now() - 12 * 60000),
    text: 'Looking good. Need the Comms tab functional—messages should show real-time updates from sub-agents.'
  },
  {
    id: 3,
    senderId: 'phase-2-agent',
    senderName: 'Phase-2-Agent',
    avatar: 'P2',
    avatarClass: 'sub-agent-1',
    timestamp: new Date(Date.now() - 8 * 60000),
    text: 'Navigation styling complete. Integrated glass morphism and responsive breakpoints. Ready for next phase.'
  },
  {
    id: 4,
    senderId: 'dave',
    senderName: 'DAVE',
    avatar: 'D',
    avatarClass: 'dave',
    timestamp: new Date(Date.now() - 5 * 60000),
    text: 'Excellent. Phase-2-Agent, move to backend integration. David, the Hub is ready for live messages.'
  },
  {
    id: 5,
    senderId: 'david',
    senderName: 'David',
    avatar: 'D',
    avatarClass: 'david',
    timestamp: new Date(Date.now() - 2 * 60000),
    text: 'Perfect. Let\'s ship it. Document the API endpoints and we\'re golden.'
  }
];

// ====================================================================
// API Endpoints (Mock)
// ====================================================================

/**
 * GET /api/agents
 * Returns all agents with their profiles
 */
export async function getAgents() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        status: 'success',
        data: mockAgents,
        timestamp: new Date().toISOString()
      });
    }, 300);
  });
}

/**
 * GET /api/agents/:id
 * Returns a single agent profile
 */
export async function getAgent(agentId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const agent = mockAgents.find(a => a.id === agentId);
      if (agent) {
        resolve({
          status: 'success',
          data: agent,
          timestamp: new Date().toISOString()
        });
      } else {
        reject({
          status: 'error',
          message: 'Agent not found',
          code: 404
        });
      }
    }, 200);
  });
}

/**
 * PUT /api/agents/:id
 * Update agent status or current task
 */
export async function updateAgent(agentId, updates) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const agent = mockAgents.find(a => a.id === agentId);
      if (agent) {
        const updated = { ...agent, ...updates };
        const index = mockAgents.findIndex(a => a.id === agentId);
        mockAgents[index] = updated;
        resolve({
          status: 'success',
          data: updated,
          timestamp: new Date().toISOString()
        });
      } else {
        reject({
          status: 'error',
          message: 'Agent not found',
          code: 404
        });
      }
    }, 250);
  });
}

/**
 * GET /api/comms/messages
 * Returns all messages from The Hub
 */
export async function getMessages() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        status: 'success',
        data: mockMessages,
        count: mockMessages.length,
        timestamp: new Date().toISOString()
      });
    }, 300);
  });
}

/**
 * POST /api/comms/messages
 * Send a new message
 */
export async function sendMessage(senderId, senderName, messageText, avatar, avatarClass) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newMessage = {
        id: mockMessages.length + 1,
        senderId: senderId,
        senderName: senderName,
        avatar: avatar,
        avatarClass: avatarClass,
        timestamp: new Date(),
        text: messageText
      };
      
      mockMessages.push(newMessage);
      
      resolve({
        status: 'success',
        data: newMessage,
        timestamp: new Date().toISOString()
      });
    }, 200);
  });
}

/**
 * GET /api/agents/stats
 * Returns agent statistics
 */
export async function getAgentStats() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const onlineCount = mockAgents.filter(a => a.status === 'online').length;
      const workingCount = mockAgents.filter(a => a.activity === 'working').length;
      
      resolve({
        status: 'success',
        data: {
          totalAgents: mockAgents.length,
          onlineAgents: onlineCount,
          offlineAgents: mockAgents.length - onlineCount,
          workingAgents: workingCount,
          idleAgents: onlineCount - workingCount
        },
        timestamp: new Date().toISOString()
      });
    }, 200);
  });
}

/**
 * GET /api/comms/stats
 * Returns communication statistics
 */
export async function getCommsStats() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        status: 'success',
        data: {
          totalMessages: mockMessages.length,
          activeChannels: 1,
          lastMessageTime: mockMessages[mockMessages.length - 1].timestamp,
          participants: [...new Set(mockMessages.map(m => m.senderId))].length
        },
        timestamp: new Date().toISOString()
      });
    }, 200);
  });
}

/**
 * Utility: Format timestamp for display
 */
export function formatTimestamp(date) {
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) {
    return 'just now';
  } else if (minutes < 60) {
    return `${minutes}m ago`;
  } else if (hours < 24) {
    return `${hours}h ago`;
  } else if (days < 7) {
    return `${days}d ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

/**
 * Utility: Format time for message header
 */
export function formatMessageTime(date) {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}
