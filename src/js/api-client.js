/**
 * Mission Control V4 - Centralized API Client
 * All HTTP requests to backend API
 */

import CONFIG from '../config.js';

/**
 * Base fetch function with error handling
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${CONFIG.apiBaseUrl}${endpoint}`;
  const requestConfig = {
    ...CONFIG.requestOptions,
    ...options
  };

  try {
    if (CONFIG.debug) {
      console.log(`[API] ${options.method || 'GET'} ${endpoint}`);
    }

    const response = await fetch(url, requestConfig);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error(`[API Error] ${endpoint}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Workshop API
 */
export const workshopAPI = {
  // Get all tasks organized by status
  getTasks: () => apiRequest(CONFIG.endpoints.workshipTasks),

  // Get single task
  getTask: (id) => apiRequest(CONFIG.endpoints.workshopTask(id)),

  // Create new task
  createTask: (taskData) =>
    apiRequest(CONFIG.endpoints.workshipTasks, {
      method: 'POST',
      body: JSON.stringify(taskData)
    }),

  // Update task
  updateTask: (id, updates) =>
    apiRequest(CONFIG.endpoints.workshopTask(id), {
      method: 'PATCH',
      body: JSON.stringify(updates)
    }),

  // Start task
  startTask: (id) =>
    apiRequest(`${CONFIG.endpoints.workshopTask(id)}/start`, {
      method: 'POST'
    }),

  // Complete task
  completeTask: (id) =>
    apiRequest(`${CONFIG.endpoints.workshopTask(id)}/complete`, {
      method: 'POST'
    }),

  // Delete task
  deleteTask: (id) =>
    apiRequest(CONFIG.endpoints.workshopTask(id), {
      method: 'DELETE'
    }),

  // Search tasks
  searchTasks: (query) =>
    apiRequest(`${CONFIG.endpoints.workshopSearch}?q=${encodeURIComponent(query)}`)
};

/**
 * Dashboard API
 */
export const dashboardAPI = {
  // Get activity feed
  getActivity: () => apiRequest(CONFIG.endpoints.dashboardActivity),

  // Get recent commits
  getCommits: () => apiRequest(CONFIG.endpoints.dashboardCommits),

  // Get dashboard stats
  getStats: () => apiRequest(CONFIG.endpoints.dashboardStats)
};

/**
 * Intelligence API
 */
export const intelligenceAPI = {
  // Get all reports
  getReports: () => apiRequest(CONFIG.endpoints.intelligence),

  // Get single report
  getReport: (id) => apiRequest(CONFIG.endpoints.intelligenceReport(id)),

  // Create report
  createReport: (reportData) =>
    apiRequest(CONFIG.endpoints.intelligence, {
      method: 'POST',
      body: JSON.stringify(reportData)
    }),

  // Update report
  updateReport: (id, updates) =>
    apiRequest(CONFIG.endpoints.intelligenceReport(id), {
      method: 'PATCH',
      body: JSON.stringify(updates)
    }),

  // Deploy strategy
  deployStrategy: (id, strategyId) =>
    apiRequest(CONFIG.endpoints.intelligenceDeploy(id), {
      method: 'POST',
      body: JSON.stringify({ strategyId })
    }),

  // Delete report
  deleteReport: (id) =>
    apiRequest(CONFIG.endpoints.intelligenceReport(id), {
      method: 'DELETE'
    })
};

/**
 * Agents API
 */
export const agentsAPI = {
  // Get all agents
  getAgents: () => apiRequest(CONFIG.endpoints.agents),

  // Get single agent
  getAgent: (id) => apiRequest(CONFIG.endpoints.agent(id)),

  // Get DAVE profile
  getDAVEProfile: () => apiRequest(CONFIG.endpoints.agentProfile),

  // Get active sub-agents
  getActiveSubagents: () => apiRequest(CONFIG.endpoints.agentsActive),

  // Create agent
  createAgent: (agentData) =>
    apiRequest(CONFIG.endpoints.agents, {
      method: 'POST',
      body: JSON.stringify(agentData)
    }),

  // Update agent
  updateAgent: (id, updates) =>
    apiRequest(CONFIG.endpoints.agent(id), {
      method: 'PATCH',
      body: JSON.stringify(updates)
    })
};

/**
 * Clients API
 */
export const clientsAPI = {
  // Get all clients
  getClients: () => apiRequest(CONFIG.endpoints.clients),

  // Get single client
  getClient: (id) => apiRequest(CONFIG.endpoints.client(id)),

  // Create client
  createClient: (clientData) =>
    apiRequest(CONFIG.endpoints.clients, {
      method: 'POST',
      body: JSON.stringify(clientData)
    }),

  // Update client
  updateClient: (id, updates) =>
    apiRequest(CONFIG.endpoints.client(id), {
      method: 'PATCH',
      body: JSON.stringify(updates)
    }),

  // Delete client
  deleteClient: (id) =>
    apiRequest(CONFIG.endpoints.client(id), {
      method: 'DELETE'
    })
};

/**
 * Journal API
 */
export const journalAPI = {
  // Get all entries
  getEntries: () => apiRequest(CONFIG.endpoints.journal),

  // Get single entry
  getEntry: (date) => apiRequest(CONFIG.endpoints.journalEntry(date)),

  // Get today's entry
  getToday: () => apiRequest(CONFIG.endpoints.journalToday)
};

/**
 * Cron Jobs API
 */
export const cronAPI = {
  // Get all jobs
  getJobs: () => apiRequest(CONFIG.endpoints.cron),

  // Get single job
  getJob: (id) => apiRequest(CONFIG.endpoints.cronJob(id)),

  // Create job
  createJob: (jobData) =>
    apiRequest(CONFIG.endpoints.cron, {
      method: 'POST',
      body: JSON.stringify(jobData)
    }),

  // Update job
  updateJob: (id, updates) =>
    apiRequest(CONFIG.endpoints.cronJob(id), {
      method: 'PATCH',
      body: JSON.stringify(updates)
    }),

  // Disable job
  disableJob: (id) =>
    apiRequest(`${CONFIG.endpoints.cronJob(id)}/disable`, {
      method: 'POST'
    }),

  // Enable job
  enableJob: (id) =>
    apiRequest(`${CONFIG.endpoints.cronJob(id)}/enable`, {
      method: 'POST'
    }),

  // Delete job
  deleteJob: (id) =>
    apiRequest(CONFIG.endpoints.cronJob(id), {
      method: 'DELETE'
    })
};

/**
 * API Usage API
 */
export const apiUsageAPI = {
  // Get all usage stats
  getUsage: () => apiRequest(CONFIG.endpoints.apiUsage),

  // Get usage by date
  getUsageByDate: (date) => apiRequest(CONFIG.endpoints.apiUsageDate(date)),

  // Log usage
  logUsage: (usageData) =>
    apiRequest(`${CONFIG.endpoints.apiUsage}/log`, {
      method: 'POST',
      body: JSON.stringify(usageData)
    })
};

/**
 * Documents API
 */
export const documentsAPI = {
  // Get all documents
  getDocuments: () => apiRequest(CONFIG.endpoints.documents),

  // Get single document
  getDocument: (id) => apiRequest(CONFIG.endpoints.document(id)),

  // Create document
  createDocument: (docData) =>
    apiRequest(CONFIG.endpoints.documents, {
      method: 'POST',
      body: JSON.stringify(docData)
    }),

  // Update document
  updateDocument: (id, updates) =>
    apiRequest(CONFIG.endpoints.document(id), {
      method: 'PATCH',
      body: JSON.stringify(updates)
    }),

  // Delete document
  deleteDocument: (id) =>
    apiRequest(CONFIG.endpoints.document(id), {
      method: 'DELETE'
    })
};

/**
 * Communications API
 */
export const commsAPI = {
  // Get all messages
  getMessages: () => apiRequest(CONFIG.endpoints.comms),

  // Get conversation with recipient
  getConversation: (recipient) => apiRequest(CONFIG.endpoints.commsConversation(recipient)),

  // Send message
  sendMessage: (messageData) =>
    apiRequest(CONFIG.endpoints.comms, {
      method: 'POST',
      body: JSON.stringify(messageData)
    }),

  // Mark message as read
  markAsRead: (id) =>
    apiRequest(`${CONFIG.endpoints.comms}/${id}/read`, {
      method: 'PATCH'
    })
};

/**
 * Weekly Recaps API
 */
export const weeklyRecapsAPI = {
  // Get all recaps
  getRecaps: () => apiRequest(CONFIG.endpoints.weeklyRecaps),

  // Get single recap
  getRecap: (id) => apiRequest(CONFIG.endpoints.weeklyRecap(id)),

  // Get latest recap
  getLatest: () => apiRequest(CONFIG.endpoints.weeklyRecapLatest),

  // Create recap
  createRecap: (recapData) =>
    apiRequest(CONFIG.endpoints.weeklyRecaps, {
      method: 'POST',
      body: JSON.stringify(recapData)
    }),

  // Update recap
  updateRecap: (id, updates) =>
    apiRequest(CONFIG.endpoints.weeklyRecap(id), {
      method: 'PATCH',
      body: JSON.stringify(updates)
    })
};

/**
 * Health Check API
 */
export const healthAPI = {
  // Check API health
  checkHealth: () => apiRequest(CONFIG.endpoints.health)
};

/**
 * Export all APIs
 */
export default {
  workshopAPI,
  dashboardAPI,
  intelligenceAPI,
  agentsAPI,
  clientsAPI,
  journalAPI,
  cronAPI,
  apiUsageAPI,
  documentsAPI,
  commsAPI,
  weeklyRecapsAPI,
  healthAPI,
  apiRequest
};
