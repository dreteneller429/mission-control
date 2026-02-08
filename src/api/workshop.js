/**
 * Workshop API - Real Backend + Mock Fallback
 * Handles task management for DAVE's autonomous work system
 * 
 * Features:
 * - Connects to real backend (/api/workshop/*)
 * - Falls back to mock data if backend unavailable
 * - Manages local live feed events
 * - Provides auto-pickup and simulation functions
 */

// Configuration
const API_BASE_URL = '/api/workshop';
const USE_BACKEND = typeof fetch !== 'undefined'; // Will use backend if available

// Mock task data store (fallback)
let mockTaskStore = {
  tasks: [
    {
      id: 'phase-1',
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
      id: 'phase-2',
      title: 'Phase 2: Navigation + Dashboard',
      description: 'Build frosted glass sidebar with DAVE status, main dashboard with stat cards, and responsive navigation.',
      tags: ['building', 'ui'],
      priority: 'high',
      progress: 65,
      status: 'active',
      created_at: '2026-02-08T18:00:00Z',
      started_at: '2026-02-08T18:35:00Z',
      completed_at: null,
      activity_log: [
        { timestamp: '18:35 EST', event: 'Task started by DAVE' },
        { timestamp: '18:40 EST', event: 'Progress updated to 25%' },
        { timestamp: '18:45 EST', event: 'Progress updated to 50%' },
        { timestamp: '18:50 EST', event: 'Progress updated to 65%' }
      ]
    },
    {
      id: 'phase-3',
      title: 'Phase 3: Workshop Page (Task Queue)',
      description: 'Create the Workshop page with three-column task queue layout, auto-pickup logic, task detail modal, and live feed view.',
      tags: ['building', 'deep work'],
      priority: 'high',
      progress: 30,
      status: 'queued',
      created_at: '2026-02-08T18:00:00Z',
      started_at: null,
      completed_at: null,
      activity_log: [
        { timestamp: '18:00 EST', event: 'Task created by User' }
      ]
    },
    {
      id: 'phase-4',
      title: 'Phase 4: API Integration',
      description: 'Implement real backend API endpoints for task management, socket connections for live updates, and heartbeat system.',
      tags: ['building', 'standard'],
      priority: 'high',
      progress: 0,
      status: 'queued',
      created_at: '2026-02-08T18:00:00Z',
      started_at: null,
      completed_at: null,
      activity_log: [
        { timestamp: '18:00 EST', event: 'Task created by User' }
      ]
    },
    {
      id: 'research-1',
      title: 'Research: iOS Design Patterns',
      description: 'Study latest iOS 17+ design patterns, glassmorphism trends, and SwiftUI animations for inspiration.',
      tags: ['research', 'standard'],
      priority: 'medium',
      progress: 0,
      status: 'queued',
      created_at: '2026-02-08T18:00:00Z',
      started_at: null,
      completed_at: null,
      activity_log: [
        { timestamp: '18:00 EST', event: 'Task created by User' }
      ]
    },
    {
      id: 'bug-fix-1',
      title: 'Fix: Modal Focus Trap',
      description: 'Implement proper focus management for modal dialogs to ensure accessibility and proper keyboard navigation.',
      tags: ['blocker', 'building'],
      priority: 'critical',
      progress: 0,
      status: 'queued',
      created_at: '2026-02-08T18:10:00Z',
      started_at: null,
      completed_at: null,
      activity_log: [
        { timestamp: '18:10 EST', event: 'Task created by User' }
      ]
    }
  ],
  liveEvents: []
};

// Current data store (points to backend or mock)
let taskStore = { ...mockTaskStore };
let backendAvailable = false;

/**
 * Get all tasks organized by status
 * @returns {Object} { queued, active, completed, stats }
 */
export function getTasks() {
  // Currently uses mock data (can be extended to fetch from backend)
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

/**
 * Create a new task (uses mock data - backend integration ready)
 * @param {Object} taskData - { title, description, tags, priority, progress }
 * @returns {Object} Created task
 */
export function createTask(taskData) {
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
  addLiveEvent('created', task.title, 'CREATED');
  return task;
}

/**
 * Update a task (uses mock data - backend integration ready)
 * @param {string} taskId - Task ID
 * @param {Object} updates - { progress, status, ... }
 * @returns {Object} Updated task
 */
export function updateTask(taskId, updates) {
  const task = mockTaskStore.tasks.find(t => t.id === taskId);
  if (!task) throw new Error(`Task ${taskId} not found`);

  // Update progress
  if (updates.progress !== undefined && updates.progress !== task.progress) {
    task.progress = Math.min(100, Math.max(0, updates.progress));
    task.activity_log.push({
      timestamp: formatTime(new Date()),
      event: `Progress updated to ${task.progress}%`
    });
    addLiveEvent('progress', task.title, `Progress ${task.progress}%`);
  }

  // Update status
  if (updates.status !== undefined && updates.status !== task.status) {
    task.status = updates.status;
    if (updates.status === 'active' && !task.started_at) {
      task.started_at = new Date().toISOString();
      task.activity_log.push({
        timestamp: formatTime(new Date()),
        event: 'Task started by DAVE'
      });
      addLiveEvent('started', task.title, 'STARTED');
    }
    if (updates.status === 'completed' && !task.completed_at) {
      task.completed_at = new Date().toISOString();
      task.activity_log.push({
        timestamp: formatTime(new Date()),
        event: 'Task completed'
      });
      addLiveEvent('completed', task.title, 'COMPLETED');
    }
  }

  // Add custom activity log entry
  if (updates.activity_log) {
    task.activity_log.push(updates.activity_log);
  }

  return task;
}

/**
 * Start a task (move from Queued to Active)
 * @param {string} taskId - Task ID
 * @returns {Object} Updated task
 */
export function startTask(taskId) {
  return updateTask(taskId, { status: 'active' });
}

/**
 * Complete a task (move from Active to Completed)
 * @param {string} taskId - Task ID
 * @returns {Object} Updated task
 */
export function completeTask(taskId) {
  const task = taskStore.tasks.find(t => t.id === taskId);
  if (!task) throw new Error(`Task ${taskId} not found`);
  
  task.progress = 100;
  return updateTask(taskId, { status: 'completed', progress: 100 });
}

/**
 * Delete a task
 * @param {string} taskId - Task ID
 * @returns {Object} { success: true }
 */
export function deleteTask(taskId) {
  const index = mockTaskStore.tasks.findIndex(t => t.id === taskId);
  if (index === -1) throw new Error(`Task ${taskId} not found`);

  const task = mockTaskStore.tasks[index];
  mockTaskStore.tasks.splice(index, 1);
  addLiveEvent('deleted', task.title, 'DELETED');

  return { success: true };
}

/**
 * Get a single task by ID
 * @param {string} taskId - Task ID
 * @returns {Object} Task
 */
export function getTask(taskId) {
  const task = mockTaskStore.tasks.find(t => t.id === taskId);
  if (!task) throw new Error(`Task ${taskId} not found`);
  return task;
}

/**
 * Search tasks
 * @param {string} query - Search query
 * @returns {Array} Matching tasks
 */
export function searchTasks(query) {
  if (!query || query.trim() === '') return mockTaskStore.tasks;

  const q = query.toLowerCase();
  return mockTaskStore.tasks.filter(task =>
    task.title.toLowerCase().includes(q) ||
    task.description.toLowerCase().includes(q) ||
    task.tags.some(tag => tag.toLowerCase().includes(q))
  );
}

/**
 * Get live feed events
 * @param {number} limit - Max entries to return
 * @returns {Array} Live feed events
 */
export function getLiveEvents(limit = 50) {
  return mockTaskStore.liveEvents.slice(-limit).reverse();
}

/**
 * Simulate auto-pickup: if active is empty and queued has items, move highest priority to active
 * @returns {Object|null} Task that was auto-picked or null
 */
export function autoPickupTask() {
  const active = mockTaskStore.tasks.filter(t => t.status === 'active');
  const queued = mockTaskStore.tasks.filter(t => t.status === 'queued');

  // Only auto-pickup if no active tasks and queue has items
  if (active.length === 0 && queued.length > 0) {
    // Sort by priority and pick the first
    queued.sort(sortByPriority);
    const nextTask = queued[0];
    return startTask(nextTask.id);
  }

  return null;
}

/**
 * Simulate progress updates for active tasks (for live feed demo)
 */
export function simulateProgress() {
  const active = mockTaskStore.tasks.filter(t => t.status === 'active');

  active.forEach(task => {
    if (task.progress < 100) {
      const increment = Math.floor(Math.random() * 15) + 5; // 5-20%
      const newProgress = Math.min(100, task.progress + increment);
      updateTask(task.id, { progress: newProgress });

      // Auto-complete if at 100%
      if (newProgress === 100) {
        completeTask(task.id);
      }
    }
  });
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
 * Add event to live feed
 */
function addLiveEvent(eventType, taskName, eventLabel) {
  const event = {
    timestamp: formatTime(new Date()),
    taskName,
    eventType,
    eventLabel
  };

  mockTaskStore.liveEvents.push(event);

  // Keep only last 50 events
  if (mockTaskStore.liveEvents.length > 50) {
    mockTaskStore.liveEvents.shift();
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
