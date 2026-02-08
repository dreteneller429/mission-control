/**
 * Mission Control V4 - Configuration
 * Environment-specific settings and API endpoints
 */

// Detect environment
const isDevelopment = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';
const isProduction = !isDevelopment;

// API Configuration
export const CONFIG = {
  // Environment
  isDevelopment,
  isProduction,
  environment: isDevelopment ? 'development' : 'production',

  // API Base URL
  apiBaseUrl: isDevelopment 
    ? 'http://localhost:3000'
    : 'http://76.13.119.105:3000',

  // API Endpoints
  endpoints: {
    // Workshop
    workshop: '/api/workshop',
    workshipTasks: '/api/workshop/tasks',
    workshopTask: (id) => `/api/workshop/tasks/${id}`,
    workshopSearch: '/api/workshop/tasks/search',

    // Dashboard
    dashboard: '/api/dashboard',
    dashboardActivity: '/api/dashboard/activity',
    dashboardCommits: '/api/dashboard/commits',
    dashboardStats: '/api/dashboard/stats',

    // Intelligence
    intelligence: '/api/intelligence',
    intelligenceReport: (id) => `/api/intelligence/${id}`,
    intelligenceDeploy: (id) => `/api/intelligence/${id}/deploy`,

    // Agents
    agents: '/api/agents',
    agent: (id) => `/api/agents/${id}`,
    agentProfile: '/api/agents/dave/profile',
    agentsActive: '/api/agents/subagents/active',

    // Clients
    clients: '/api/clients',
    client: (id) => `/api/clients/${id}`,

    // Journal
    journal: '/api/journal',
    journalEntry: (date) => `/api/journal/${date}`,
    journalToday: '/api/journal/today',

    // Cron Jobs
    cron: '/api/cron',
    cronJob: (id) => `/api/cron/${id}`,

    // API Usage
    apiUsage: '/api-usage',
    apiUsageDate: (date) => `/api-usage/date/${date}`,

    // Documents
    documents: '/api/documents',
    document: (id) => `/api/documents/${id}`,

    // Communications
    comms: '/api/comms/messages',
    commsConversation: (recipient) => `/api/comms/messages/${recipient}`,

    // Weekly Recaps
    weeklyRecaps: '/api/weekly-recaps',
    weeklyRecap: (id) => `/api/weekly-recaps/${id}`,
    weeklyRecapLatest: '/api/weekly-recaps/latest',

    // Health
    health: '/health'
  },

  // Request options
  requestOptions: {
    headers: {
      'Content-Type': 'application/json'
    },
    timeout: 10000 // 10 second timeout
  },

  // Features
  features: {
    realTimeUpdates: true,
    autoRefresh: true,
    errorNotifications: true,
    successNotifications: true
  },

  // Refresh intervals (ms)
  refreshIntervals: {
    dashboard: 30000, // 30 seconds
    workshop: 15000,  // 15 seconds
    activity: 30000,  // 30 seconds
    commits: 300000   // 5 minutes
  },

  // Debug mode
  debug: isDevelopment
};

export default CONFIG;
