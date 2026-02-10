/**
 * Workshop API - Real Backend Integration (V4 FIXED)
 * Handles task management for DAVE's autonomous work system
 * 
 * Features:
 * - Connects to real backend (/api/workshop/*) - SAME DATA AS DASHBOARD
 * - Falls back to mock data if backend unavailable
 * - Manages local live feed events from real task activity logs
 * - Provides auto-pickup and simulation functions
 */

// Configuration
const API_BASE_URL = 'http://localhost:3001/api/workshop';
const USE_BACKEND = typeof fetch !== 'undefined'; // Will use backend if available
let backendDataCache = null;
let liveEventsCache = [];

// Mock task data store (fallback) - 17 tasks: 1 active, 2 completed, 14 queued
let mockTaskStore = {
  tasks: [
    // COMPLETED (2)
    {
      id: 'task-001-completed',
      title: 'Phase 1: Glassmorphism Framework',
      description: 'Design and implement the complete glassmorphism CSS framework with theme variables, glass effects, and component library.',
      tags: ['building', 'ui'],
      priority: 'critical',
      progress: 100,
      status: 'completed',
      created_at: '2026-02-08T18:00:00Z',
      started_at: '2026-02-08T18:00:00Z',
      completed_at: '2026-02-08T18:30:00Z',
      activity_log: [
        { timestamp: '18:00 EST', event: 'Task created by User' },
        { timestamp: '18:05 EST', event: 'Task started by DAVE' },
        { timestamp: '18:15 EST', event: 'Progress updated to 50%' },
        { timestamp: '18:30 EST', event: 'Task completed' }
      ]
    },
    {
      id: 'task-002-completed',
      title: 'Navigation Sidebar Design',
      description: 'Build frosted glass sidebar with navigation items, collapse/expand animations, and responsive behavior.',
      tags: ['building', 'ui'],
      priority: 'high',
      progress: 100,
      status: 'completed',
      created_at: '2026-02-07T14:00:00Z',
      started_at: '2026-02-07T14:15:00Z',
      completed_at: '2026-02-07T16:00:00Z',
      activity_log: [
        { timestamp: '14:00 EST', event: 'Task created by User' },
        { timestamp: '14:15 EST', event: 'Task started by DAVE' },
        { timestamp: '15:00 EST', event: 'Progress updated to 50%' },
        { timestamp: '16:00 EST', event: 'Task completed' }
      ]
    },

    // ACTIVE (1)
    {
      id: 'task-003-active',
      title: 'Dashboard Statistics Cards',
      description: 'Build dashboard with real-time stat cards showing system metrics, task counts, and performance indicators.',
      tags: ['building', 'ui'],
      priority: 'high',
      progress: 72,
      status: 'active',
      created_at: '2026-02-08T18:00:00Z',
      started_at: '2026-02-08T18:35:00Z',
      completed_at: null,
      activity_log: [
        { timestamp: '18:35 EST', event: 'Task started by DAVE' },
        { timestamp: '18:40 EST', event: 'Progress updated to 25%' },
        { timestamp: '18:45 EST', event: 'Progress updated to 50%' },
        { timestamp: '18:50 EST', event: 'Progress updated to 72%' }
      ]
    },

    // QUEUED (14)
    {
      id: 'task-004-queued',
      title: 'Workshop Page Layout',
      description: 'Create three-column task queue layout with drag-and-drop reordering and responsive design.',
      tags: ['building', 'deep work'],
      priority: 'critical',
      progress: 0,
      status: 'queued',
      created_at: '2026-02-08T19:00:00Z',
      started_at: null,
      completed_at: null,
      activity_log: [
        { timestamp: '19:00 EST', event: 'Task created by User' }
      ]
    },
    {
      id: 'task-005-queued',
      title: 'Task Auto-Pickup Logic',
      description: 'Implement auto-pickup mechanism: when Active column is empty and Queued has items, auto-move highest priority task.',
      tags: ['building', 'standard'],
      priority: 'critical',
      progress: 0,
      status: 'queued',
      created_at: '2026-02-08T19:05:00Z',
      started_at: null,
      completed_at: null,
      activity_log: [
        { timestamp: '19:05 EST', event: 'Task created by User' }
      ]
    },
    {
      id: 'task-006-queued',
      title: 'Task Detail Modal',
      description: 'Build modal dialog showing full task details including description, timeline, progress, and activity log.',
      tags: ['building', 'ui'],
      priority: 'high',
      progress: 0,
      status: 'queued',
      created_at: '2026-02-08T19:10:00Z',
      started_at: null,
      completed_at: null,
      activity_log: [
        { timestamp: '19:10 EST', event: 'Task created by User' }
      ]
    },
    {
      id: 'task-007-queued',
      title: 'Live Feed Stream Implementation',
      description: 'Wire live feed to show real-time task events: STARTED, progress updates, COMPLETED, and FAILED events.',
      tags: ['building', 'standard'],
      priority: 'high',
      progress: 0,
      status: 'queued',
      created_at: '2026-02-08T19:15:00Z',
      started_at: null,
      completed_at: null,
      activity_log: [
        { timestamp: '19:15 EST', event: 'Task created by User' }
      ]
    },
    {
      id: 'task-008-queued',
      title: 'API Integration for Workshop',
      description: 'Connect Workshop page to backend API endpoints for real-time task updates and mutations.',
      tags: ['building', 'standard'],
      priority: 'high',
      progress: 0,
      status: 'queued',
      created_at: '2026-02-08T19:20:00Z',
      started_at: null,
      completed_at: null,
      activity_log: [
        { timestamp: '19:20 EST', event: 'Task created by User' }
      ]
    },
    {
      id: 'task-009-queued',
      title: 'Research: iOS Design Patterns',
      description: 'Study latest iOS 17+ design patterns, glassmorphism trends, and SwiftUI animations for UI inspiration.',
      tags: ['research', 'standard'],
      priority: 'medium',
      progress: 0,
      status: 'queued',
      created_at: '2026-02-08T19:25:00Z',
      started_at: null,
      completed_at: null,
      activity_log: [
        { timestamp: '19:25 EST', event: 'Task created by User' }
      ]
    },
    {
      id: 'task-010-queued',
      title: 'Modal Focus Trap Implementation',
      description: 'Implement proper focus management for modal dialogs to ensure accessibility and keyboard navigation.',
      tags: ['blocker', 'building'],
      priority: 'critical',
      progress: 0,
      status: 'queued',
      created_at: '2026-02-08T19:30:00Z',
      started_at: null,
      completed_at: null,
      activity_log: [
        { timestamp: '19:30 EST', event: 'Task created by User' }
      ]
    },
    {
      id: 'task-011-queued',
      title: 'Search and Filter Tasks',
      description: 'Add search functionality to filter tasks by name, description, and tags. Include real-time filtering.',
      tags: ['building', 'ui'],
      priority: 'medium',
      progress: 0,
      status: 'queued',
      created_at: '2026-02-08T19:35:00Z',
      started_at: null,
      completed_at: null,
      activity_log: [
        { timestamp: '19:35 EST', event: 'Task created by User' }
      ]
    },
    {
      id: 'task-012-queued',
      title: 'Task Progress Animation',
      description: 'Add smooth progress bar animations and real-time progress updates with visual feedback.',
      tags: ['building', 'ui'],
      priority: 'medium',
      progress: 0,
      status: 'queued',
      created_at: '2026-02-08T19:40:00Z',
      started_at: null,
      completed_at: null,
      activity_log: [
        { timestamp: '19:40 EST', event: 'Task created by User' }
      ]
    },
    {
      id: 'task-013-queued',
      title: 'Performance Optimization',
      description: 'Optimize rendering, implement virtual scrolling for large task lists, and minimize re-renders.',
      tags: ['building', 'deep work'],
      priority: 'medium',
      progress: 0,
      status: 'queued',
      created_at: '2026-02-08T19:45:00Z',
      started_at: null,
      completed_at: null,
      activity_log: [
        { timestamp: '19:45 EST', event: 'Task created by User' }
      ]
    },
    {
      id: 'task-014-queued',
      title: 'Mobile Responsive Design',
      description: 'Ensure Workshop page works perfectly on mobile devices with touch-friendly controls and layout.',
      tags: ['building', 'ui'],
      priority: 'medium',
      progress: 0,
      status: 'queued',
      created_at: '2026-02-08T19:50:00Z',
      started_at: null,
      completed_at: null,
      activity_log: [
        { timestamp: '19:50 EST', event: 'Task created by User' }
      ]
    },
    {
      id: 'task-015-queued',
      title: 'Error Handling & Retry Logic',
      description: 'Implement comprehensive error handling, toast notifications, and automatic retry mechanisms.',
      tags: ['building', 'standard'],
      priority: 'medium',
      progress: 0,
      status: 'queued',
      created_at: '2026-02-08T19:55:00Z',
      started_at: null,
      completed_at: null,
      activity_log: [
        { timestamp: '19:55 EST', event: 'Task created by User' }
      ]
    },
    {
      id: 'task-016-queued',
      title: 'Unit Tests for Workshop',
      description: 'Write comprehensive unit tests for all Workshop components, API interactions, and state management.',
      tags: ['testing', 'standard'],
      priority: 'low',
      progress: 0,
      status: 'queued',
      created_at: '2026-02-08T20:00:00Z',
      started_at: null,
      completed_at: null,
      activity_log: [
        { timestamp: '20:00 EST', event: 'Task created by User' }
      ]
    },
    {
      id: 'task-017-queued',
      title: 'Documentation & Deployment',
      description: 'Write comprehensive documentation for Workshop API and deployment guide for production.',
      tags: ['documentation', 'standard'],
      priority: 'low',
      progress: 0,
      status: 'queued',
      created_at: '2026-02-08T20:05:00Z',
      started_at: null,
      completed_at: null,
      activity_log: [
        { timestamp: '20:05 EST', event: 'Task created by User' }
      ]
    }
  ],
  liveEvents: []
};

// Backend availability flag
let backendAvailable = false;

/**
 * Get all tasks organized by status - USES REAL API (same as Dashboard)
 * @returns {Promise<Object>} { queued, active, completed, stats }
 */
export async function getTasks() {
  try {
    // Fetch from real backend API
    const response = await fetch(`${API_BASE_URL}/tasks`);
    
    if (!response.ok) {
      throw new Error('API unavailable, using cache');
    }
    
    const data = await response.json();
    
    // Cache the data for offline use
    backendDataCache = data;
    
    // Update live events from task activity logs
    updateLiveEventsFromTasks([...data.queued, ...data.active, ...data.completed]);
    
    return data;
  } catch (error) {
    console.warn('Workshop API: Using cached data or mock fallback', error.message);
    
    // Use cached data if available
    if (backendDataCache) {
      return backendDataCache;
    }
    
    // Fallback to mock data
    const queued = mockTaskStore.tasks.filter(t => t.status === 'queued').sort(sortByPriority);
    const active = mockTaskStore.tasks.filter(t => t.status === 'active').sort(sortByPriority);
    const completed = mockTaskStore.tasks.filter(t => t.status === 'completed').sort((a, b) => 
      new Date(b.completed_at) - new Date(a.completed_at)
    );

    return {
      queued,
      active,
      completed,
      stats: {
        total: mockTaskStore.tasks.length,
        queued: queued.length,
        active: active.length,
        completed: completed.length,
        bandwidth: calculateBandwidth()
      }
    };
  }
}

/**
 * Create a new task (uses REAL API)
 * @param {Object} taskData - { title, description, tags, priority, progress }
 * @returns {Promise<Object>} Created task
 */
export async function createTask(taskData) {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });
    
    if (!response.ok) throw new Error('Failed to create task');
    
    const task = await response.json();
    return task;
  } catch (error) {
    console.error('Error creating task:', error);
    
    // Fallback to mock
    const task = {
      id: generateId(),
      title: taskData.title,
      description: taskData.description,
      tags: taskData.tags || [],
      priority: taskData.priority || 'medium',
      progress: taskData.progress || 0,
      status: 'queued',
      created_at: new Date().toISOString(),
      started_at: null,
      completed_at: null,
      activity_log: [
        { timestamp: formatTime(new Date()), event: 'Task created by User' }
      ]
    };

    mockTaskStore.tasks.push(task);
    return task;
  }
}

/**
 * Update a task (uses REAL API)
 * @param {string} taskId - Task ID
 * @param {Object} updates - { progress, status, ... }
 * @returns {Promise<Object>} Updated task
 */
export async function updateTask(taskId, updates) {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) throw new Error('Failed to update task');
    
    const task = await response.json();
    return task;
  } catch (error) {
    console.error('Error updating task:', error);
    
    // Fallback to mock
    const task = mockTaskStore.tasks.find(t => t.id === taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);

    if (updates.progress !== undefined) {
      task.progress = Math.min(100, Math.max(0, updates.progress));
      task.activity_log.push({
        timestamp: formatTime(new Date()),
        event: `Progress updated to ${task.progress}%`
      });
    }

    if (updates.status !== undefined) {
      task.status = updates.status;
      if (updates.status === 'active' && !task.started_at) {
        task.started_at = new Date().toISOString();
        task.activity_log.push({
          timestamp: formatTime(new Date()),
          event: 'Task started by DAVE'
        });
      }
      if (updates.status === 'completed' && !task.completed_at) {
        task.completed_at = new Date().toISOString();
        task.activity_log.push({
          timestamp: formatTime(new Date()),
          event: 'Task completed'
        });
      }
    }

    if (updates.activity_log) {
      task.activity_log.push(updates.activity_log);
    }

    return task;
  }
}

/**
 * Start a task (move from Queued to Active) - uses REAL API
 * @param {string} taskId - Task ID
 * @returns {Promise<Object>} Updated task
 */
export async function startTask(taskId) {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) throw new Error('Failed to start task');
    
    const task = await response.json();
    return task;
  } catch (error) {
    console.error('Error starting task:', error);
    return updateTask(taskId, { status: 'active' });
  }
}

/**
 * Complete a task (move from Active to Completed) - uses REAL API
 * @param {string} taskId - Task ID
 * @returns {Promise<Object>} Updated task
 */
export async function completeTask(taskId) {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) throw new Error('Failed to complete task');
    
    const task = await response.json();
    return task;
  } catch (error) {
    console.error('Error completing task:', error);
    return updateTask(taskId, { status: 'completed', progress: 100 });
  }
}

/**
 * Delete a task - uses REAL API
 * @param {string} taskId - Task ID
 * @returns {Promise<Object>} { success: true }
 */
export async function deleteTask(taskId) {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) throw new Error('Failed to delete task');
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error deleting task:', error);
    
    // Fallback to mock
    const index = mockTaskStore.tasks.findIndex(t => t.id === taskId);
    if (index === -1) throw new Error(`Task ${taskId} not found`);

    mockTaskStore.tasks.splice(index, 1);
    return { success: true };
  }
}

/**
 * Get a single task by ID - uses REAL API
 * @param {string} taskId - Task ID
 * @returns {Promise<Object>} Task
 */
export async function getTask(taskId) {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`);
    
    if (!response.ok) throw new Error('Failed to fetch task');
    
    const task = await response.json();
    return task;
  } catch (error) {
    console.error('Error fetching task:', error);
    
    // Fallback to cache or mock
    if (backendDataCache) {
      const allTasks = [...backendDataCache.queued, ...backendDataCache.active, ...backendDataCache.completed];
      const task = allTasks.find(t => t.id === taskId);
      if (task) return task;
    }
    
    const task = mockTaskStore.tasks.find(t => t.id === taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);
    return task;
  }
}

/**
 * Search tasks - uses cached data from getTasks()
 * @param {string} query - Search query
 * @returns {Array} Matching tasks
 */
export function searchTasks(query) {
  // Use cached backend data if available
  let allTasks = mockTaskStore.tasks;
  
  if (backendDataCache) {
    allTasks = [...backendDataCache.queued, ...backendDataCache.active, ...backendDataCache.completed];
  }
  
  if (!query || query.trim() === '') return allTasks;

  const q = query.toLowerCase();
  return allTasks.filter(task =>
    task.title.toLowerCase().includes(q) ||
    task.description.toLowerCase().includes(q) ||
    task.tags.some(tag => tag.toLowerCase().includes(q))
  );
}

/**
 * Get live feed events from real task activity logs (WK2 FIX)
 * @param {number} limit - Max entries to return
 * @returns {Array} Live feed events in format: { timestamp, taskName, eventType, eventLabel }
 */
export function getLiveEvents(limit = 50) {
  // Return cached live events (built from real task activity logs)
  return liveEventsCache.slice(-limit).reverse();
}

/**
 * Build live feed events from task activity logs (WK2 FIX)
 * This converts task activity logs into live feed format
 */
function updateLiveEventsFromTasks(tasks) {
  const events = [];
  
  // Extract all activity log entries from all tasks
  tasks.forEach(task => {
    if (task.activity_log && Array.isArray(task.activity_log)) {
      task.activity_log.forEach(log => {
        // Determine event type from log event text
        let eventType = 'progress';
        let eventLabel = log.event;
        
        if (log.event.includes('created')) {
          eventType = 'created';
          eventLabel = 'CREATED';
        } else if (log.event.includes('started')) {
          eventType = 'started';
          eventLabel = 'STARTED';
        } else if (log.event.includes('Progress')) {
          eventType = 'progress';
          // Extract percentage from "Progress updated to 72%"
          const match = log.event.match(/(\d+)%/);
          eventLabel = match ? `Progress ${match[1]}%` : 'Progress update';
        } else if (log.event.includes('completed')) {
          eventType = 'completed';
          eventLabel = 'COMPLETED';
        } else if (log.event.includes('failed') || log.event.includes('error')) {
          eventType = 'error';
          eventLabel = 'FAILED';
        } else if (log.event.includes('deleted')) {
          eventType = 'deleted';
          eventLabel = 'DELETED';
        }
        
        events.push({
          timestamp: log.timestamp,
          taskName: task.title,
          eventType: eventType,
          eventLabel: eventLabel,
          task_id: task.id
        });
      });
    }
  });
  
  // Sort by timestamp (most recent first) and update cache
  liveEventsCache = events.sort((a, b) => {
    // Try to parse timestamps if possible, otherwise use string comparison
    const timeA = parseEventTime(a.timestamp);
    const timeB = parseEventTime(b.timestamp);
    return timeB - timeA;
  });
  
  // Keep only last 100 events
  if (liveEventsCache.length > 100) {
    liveEventsCache = liveEventsCache.slice(0, 100);
  }
}

/**
 * Parse event timestamp (handles "HH:MM EST" format)
 */
function parseEventTime(timestamp) {
  try {
    // Handle "HH:MM EST" format by using today's date
    if (timestamp && timestamp.includes('EST')) {
      const today = new Date();
      const [time, period] = timestamp.split(' ');
      const [hours, minutes] = time.split(':').map(Number);
      today.setHours(hours, minutes, 0, 0);
      return today.getTime();
    }
    return new Date(timestamp).getTime();
  } catch {
    return 0;
  }
}

/**
 * Simulate auto-pickup: if active is empty and queued has items, move highest priority to active
 * @returns {Promise<Object|null>} Task that was auto-picked or null
 */
export async function autoPickupTask() {
  // Use cached backend data if available
  let active = [];
  let queued = [];
  
  if (backendDataCache) {
    active = backendDataCache.active || [];
    queued = backendDataCache.queued || [];
  } else {
    active = mockTaskStore.tasks.filter(t => t.status === 'active');
    queued = mockTaskStore.tasks.filter(t => t.status === 'queued');
  }

  // Only auto-pickup if no active tasks and queue has items
  if (active.length === 0 && queued.length > 0) {
    // Sort by priority and pick the first
    queued.sort(sortByPriority);
    const nextTask = queued[0];
    return await startTask(nextTask.id);
  }

  return null;
}

/**
 * Simulate progress updates for active tasks (for live feed demo)
 */
export async function simulateProgress() {
  // Use cached backend data if available
  let active = [];
  
  if (backendDataCache) {
    active = backendDataCache.active || [];
  } else {
    active = mockTaskStore.tasks.filter(t => t.status === 'active');
  }

  for (const task of active) {
    if (task.progress < 100) {
      const increment = Math.floor(Math.random() * 15) + 5; // 5-20%
      const newProgress = Math.min(100, task.progress + increment);
      await updateTask(task.id, { progress: newProgress });

      // Auto-complete if at 100%
      if (newProgress === 100) {
        await completeTask(task.id);
      }
    }
  }
}

/**
 * Clear all mock data
 */
export function resetData() {
  mockTaskStore = {
    tasks: mockTaskStore.tasks.slice(0, 2), // Keep first 2 for demo
    liveEvents: []
  };
}

// ============ Helper Functions ============

/**
 * Check if backend API is available
 */
async function checkBackendAvailability() {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'GET',
      signal: AbortSignal.timeout(2000) // 2 second timeout
    });
    backendAvailable = response.ok;
    return backendAvailable;
  } catch (error) {
    backendAvailable = false;
    return false;
  }
}

/**
 * Format time as HH:MM EST
 */
function formatTime(date) {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC'
  }).replace('AM', '').replace('PM', '').trim() + ' EST';
}

/**
 * Sort tasks by priority
 */
function sortByPriority(a, b) {
  const priorityMap = { critical: 0, high: 1, medium: 2, low: 3 };
  return priorityMap[a.priority] - priorityMap[b.priority];
}

/**
 * Generate unique ID
 */
function generateId() {
  return 'task-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

/**
 * Calculate simulated bandwidth percentage
 */
function calculateBandwidth() {
  const active = taskStore.tasks.filter(t => t.status === 'active');
  return Math.min(100, active.length * 25 + Math.floor(Math.random() * 20));
}

// ============ Export All ============
export const WorkshopAPI = {
  getTasks,
  createTask,
  updateTask,
  startTask,
  completeTask,
  deleteTask,
  getTask,
  searchTasks,
  getLiveEvents,
  autoPickupTask,
  simulateProgress,
  resetData
};

export default WorkshopAPI;
