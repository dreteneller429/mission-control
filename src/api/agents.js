/**
 * agents.js - API for Agents Page
 * Provides endpoints for agents and communications
 */

const API_BASE = 'http://localhost:3000';

// ====================================================================
// API Endpoints
// ====================================================================

/**
 * GET /api/agents
 * Returns all agents with their profiles
 */
export async function getAgents() {
  try {
    const response = await fetch(`${API_BASE}/api/agents`);
    if (!response.ok) throw new Error('Failed to fetch agents');
    const data = await response.json();
    return {
      status: 'success',
      data: data,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('getAgents error:', error);
    return {
      status: 'success',
      data: [],
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * GET /api/agents/:id
 * Returns a single agent profile
 */
export async function getAgent(agentId) {
  try {
    const response = await fetch(`${API_BASE}/api/agents/${agentId}`);
    if (!response.ok) throw new Error('Agent not found');
    const data = await response.json();
    return {
      status: 'success',
      data: data,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    throw {
      status: 'error',
      message: 'Agent not found',
      code: 404
    };
  }
}

/**
 * PUT /api/agents/:id
 * Update agent status or current task
 */
export async function updateAgent(agentId, updates) {
  try {
    const response = await fetch(`${API_BASE}/api/agents/${agentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Failed to update agent');
    const data = await response.json();
    return {
      status: 'success',
      data: data,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    throw {
      status: 'error',
      message: 'Failed to update agent',
      code: 500
    };
  }
}

/**
 * GET /api/comms/messages
 * Returns all messages from The Hub
 */
export async function getMessages() {
  try {
    const response = await fetch(`${API_BASE}/api/comms/messages`);
    if (!response.ok) throw new Error('Failed to fetch messages');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('getMessages error:', error);
    return {
      status: 'success',
      data: [],
      count: 0,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * POST /api/comms/messages
 * Send a new message
 */
export async function sendMessage(senderId, senderName, messageText, avatar, avatarClass) {
  try {
    const response = await fetch(`${API_BASE}/api/comms/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderId,
        senderName,
        text: messageText,
        avatar,
        avatarClass
      })
    });
    if (!response.ok) throw new Error('Failed to send message');
    const data = await response.json();
    return data;
  } catch (error) {
    throw {
      status: 'error',
      message: 'Failed to send message',
      code: 500
    };
  }
}

/**
 * GET /api/agents/stats (derived from agents list)
 * Returns agent statistics
 */
export async function getAgentStats() {
  try {
    const agentsResp = await getAgents();
    const agents = agentsResp.data;
    const onlineCount = agents.filter(a => a.status === 'online').length;
    const workingCount = agents.filter(a => a.activity === 'working').length;
    
    return {
      status: 'success',
      data: {
        totalAgents: agents.length,
        onlineAgents: onlineCount,
        offlineAgents: agents.length - onlineCount,
        workingAgents: workingCount,
        idleAgents: onlineCount - workingCount
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'success',
      data: {
        totalAgents: 0,
        onlineAgents: 0,
        offlineAgents: 0,
        workingAgents: 0,
        idleAgents: 0
      },
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * GET /api/comms/stats
 * Returns communication statistics
 */
export async function getCommsStats() {
  try {
    const response = await fetch(`${API_BASE}/api/comms/stats`);
    if (!response.ok) throw new Error('Failed to fetch comms stats');
    const data = await response.json();
    return data;
  } catch (error) {
    return {
      status: 'success',
      data: {
        totalMessages: 0,
        activeChannels: 1,
        lastMessageTime: null,
        participants: 0
      },
      timestamp: new Date().toISOString()
    };
  }
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
