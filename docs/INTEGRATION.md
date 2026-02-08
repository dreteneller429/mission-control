# Mission Control V4 - Frontend-Backend Integration Guide

## Overview

This document describes how the Mission Control V4 frontend integrates with the backend API and how to run the complete application.

## Architecture

### Backend
- **Framework:** Express.js
- **Database:** File-based JSON storage (local development)
- **Port:** 3000
- **API Routes:** RESTful endpoints under `/api/*`

### Frontend
- **Framework:** Vanilla JavaScript (no build step required)
- **API Client:** Centralized `/src/js/api-client.js`
- **Configuration:** `/src/config.js`
- **Pages:** Modular HTML pages loaded dynamically

## Backend Setup

### Installation

```bash
cd /home/clawd/.openclaw/workspace/mission-control
npm install
npm run seed
```

### Running the Backend

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

The API will be available at `http://localhost:3000`

### API Endpoints

All endpoints return JSON responses.

#### Workshop (Task Management)
- `GET /api/workshop/tasks` - Get all tasks organized by status
- `GET /api/workshop/tasks/:id` - Get single task
- `POST /api/workshop/tasks` - Create new task
- `PATCH /api/workshop/tasks/:id` - Update task
- `POST /api/workshop/tasks/:id/start` - Start a task
- `POST /api/workshop/tasks/:id/complete` - Complete a task
- `DELETE /api/workshop/tasks/:id` - Delete task
- `GET /api/workshop/tasks/search?q=query` - Search tasks

#### Dashboard
- `GET /api/dashboard/activity` - Get activity feed
- `GET /api/dashboard/commits` - Get recent git commits
- `GET /api/dashboard/stats` - Get dashboard statistics

#### Intelligence
- `GET /api/intelligence` - Get all intelligence reports
- `GET /api/intelligence/:id` - Get single report
- `POST /api/intelligence` - Create report
- `PATCH /api/intelligence/:id` - Update report
- `POST /api/intelligence/:id/deploy` - Deploy strategy (creates Workshop task)
- `DELETE /api/intelligence/:id` - Delete report

#### Agents
- `GET /api/agents` - Get all agents
- `GET /api/agents/:id` - Get single agent
- `GET /api/agents/dave/profile` - Get DAVE profile (from SOUL.md)
- `GET /api/agents/subagents/active` - Get active sub-agents
- `POST /api/agents` - Create new agent
- `PATCH /api/agents/:id` - Update agent

#### Clients
- `GET /api/clients` - Get all clients
- `GET /api/clients/:id` - Get single client
- `POST /api/clients` - Create client
- `PATCH /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

#### Journal
- `GET /api/journal` - Get all journal entries
- `GET /api/journal/:date` - Get entry for specific date (format: YYYY-MM-DD)
- `GET /api/journal/today` - Get today's journal entry

#### Cron Jobs
- `GET /api/cron` - Get all cron jobs
- `GET /api/cron/:id` - Get single job
- `POST /api/cron` - Create job
- `PATCH /api/cron/:id` - Update job
- `POST /api/cron/:id/enable` - Enable job
- `POST /api/cron/:id/disable` - Disable job
- `DELETE /api/cron/:id` - Delete job

#### API Usage
- `GET /api-usage` - Get all API usage stats
- `GET /api-usage/date/:date` - Get usage for specific date
- `POST /api-usage/log` - Log API usage

#### Documents
- `GET /api/documents` - Get all documents
- `GET /api/documents/:id` - Get single document
- `POST /api/documents` - Create document
- `PATCH /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document

#### Communications
- `GET /api/comms/messages` - Get all messages
- `GET /api/comms/messages/:recipient` - Get conversation
- `POST /api/comms/messages` - Send message
- `PATCH /api/comms/messages/:id/read` - Mark as read

#### Weekly Recaps
- `GET /api/weekly-recaps` - Get all recaps
- `GET /api/weekly-recaps/:id` - Get single recap
- `GET /api/weekly-recaps/latest` - Get most recent recap
- `POST /api/weekly-recaps` - Create recap
- `PATCH /api/weekly-recaps/:id` - Update recap

#### Health
- `GET /health` - Health check endpoint

## Frontend Integration

### Configuration

The frontend configuration is in `/src/config.js`. Key settings:

```javascript
// Environment detection (automatic)
isDevelopment = window.location.hostname === 'localhost'
isProduction = !isDevelopment

// API Base URL (configured automatically)
apiBaseUrl = isDevelopment ? 'http://localhost:3000' : 'http://76.13.119.105:3000'
```

### API Client Usage

The centralized API client in `/src/js/api-client.js` provides all methods:

```javascript
import { workshopAPI, dashboardAPI } from '../js/api-client.js';

// Get all tasks
const response = await workshopAPI.getTasks();
if (response.success) {
  console.log(response.data);
} else {
  console.error(response.error);
}

// Create a task
const task = await workshopAPI.createTask({
  title: 'New Task',
  description: 'Task description',
  priority: 'high',
  tags: ['tag1', 'tag2']
});

// Update task progress
await workshopAPI.updateTask('task-id', { progress: 50 });

// Start task
await workshopAPI.startTask('task-id');

// Complete task
await workshopAPI.completeTask('task-id');
```

### Page Integration

Each HTML page should:

1. **Import the API client**
   ```javascript
   import { workshopAPI, dashboardAPI } from '../js/api-client.js';
   ```

2. **Load data on page initialization**
   ```javascript
   async function loadPageData() {
     const response = await workshopAPI.getTasks();
     if (response.success) {
       renderTasks(response.data);
     } else {
       showErrorMessage(response.error);
     }
   }
   ```

3. **Handle loading states**
   ```javascript
   function showLoadingSpinner() {
     const spinner = document.getElementById('loadingSpinner');
     if (spinner) spinner.style.display = 'block';
   }

   function hideLoadingSpinner() {
     const spinner = document.getElementById('loadingSpinner');
     if (spinner) spinner.style.display = 'none';
   }
   ```

4. **Handle errors gracefully**
   ```javascript
   function showErrorMessage(message) {
     const errorEl = document.getElementById('errorMessage');
     if (errorEl) {
       errorEl.textContent = message;
       errorEl.style.display = 'block';
       setTimeout(() => {
         errorEl.style.display = 'none';
       }, 5000);
     }
   }
   ```

## Data Flow Examples

### Workshop Task Creation Flow

1. **User clicks "Create Task" button**
2. **Form collects task data**
3. **JavaScript calls API:**
   ```javascript
   const task = await workshopAPI.createTask(formData);
   ```
4. **API creates task and returns it**
5. **Frontend adds task to appropriate column**
6. **UI updates to show new task**

### Task Status Transition

1. **User clicks "Start" on queued task**
2. **JavaScript calls API:**
   ```javascript
   await workshopAPI.startTask(taskId);
   ```
3. **Backend updates task status to "active"**
4. **Frontend receives updated task**
5. **Task moves from Queued to Active column**

### Intelligence Strategy Deployment

1. **User views Intelligence report**
2. **User clicks "Deploy Strategy"**
3. **JavaScript calls API:**
   ```javascript
   const result = await intelligenceAPI.deployStrategy(reportId, strategyId);
   ```
4. **Backend creates new task in Workshop**
5. **Frontend navigates to Workshop page**
6. **New task visible in Queued column**

## Database Storage

### Data Structure

All data is stored as JSON files in `/server/db/data/`:

```
server/db/data/
├── tasks.json              # Workshop tasks
├── intelligence.json       # Intelligence reports
├── clients.json           # Client records
├── agents.json            # Agent definitions
├── cron.json              # Scheduled jobs
├── documents.json         # Document references
├── activity.json          # Activity feed
├── weekly-recaps.json     # Weekly summaries
├── messages.json          # Chat messages
└── api-usage.json         # Token usage tracking
```

### Adding New Collections

To add a new data collection:

1. **Initialize in route:**
   ```javascript
   storage.initCollection('newcollection', [
     { id: 1, data: 'example' }
   ]);
   ```

2. **Use storage methods:**
   ```javascript
   storage.add('newcollection', item);
   storage.findAll('newcollection');
   storage.findById('newcollection', id);
   storage.update('newcollection', id, updates);
   storage.remove('newcollection', id);
   ```

## Testing Checklist

### Backend Verification
- [ ] Server starts without errors
- [ ] All endpoints respond to requests
- [ ] Database seeding completes successfully
- [ ] Git log is readable for commits
- [ ] Memory files are accessible for journal

### Frontend Verification
- [ ] Pages load without console errors
- [ ] API client initializes correctly
- [ ] Network requests show in browser DevTools
- [ ] Responses are parsed as JSON

### Feature Testing

#### Workshop Page
- [ ] Load all tasks (queued, active, completed)
- [ ] Create new task
- [ ] Start a queued task (moves to active)
- [ ] Update progress manually
- [ ] Complete an active task (moves to completed)
- [ ] Delete a task
- [ ] Search for tasks
- [ ] Task detail modal opens and closes

#### Dashboard Page
- [ ] Activity feed loads
- [ ] Recent commits display
- [ ] Stats cards show current data
- [ ] Links to other pages work

#### Intelligence Page
- [ ] Load intelligence reports
- [ ] Deploy strategy creates task in Workshop
- [ ] Task appears in Workshop queued column

#### Agents Page
- [ ] Display all agents
- [ ] Show DAVE profile from SOUL.md
- [ ] List active sub-agents
- [ ] Display capabilities and status

#### Clients Page
- [ ] Show all clients
- [ ] Display client details
- [ ] Filter by status
- [ ] Create new client

#### Journal Page
- [ ] Load memory files
- [ ] Display today's entry
- [ ] Show historical entries

#### Cron Jobs Page
- [ ] List all scheduled jobs
- [ ] Show schedule (cron format and readable)
- [ ] Enable/disable jobs
- [ ] View last run and next run

#### API Usage Page
- [ ] Show token usage by provider
- [ ] Display costs
- [ ] Show usage percentages

## Troubleshooting

### Backend Won't Start
```bash
# Check Node.js version
node --version  # Should be v14+

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check port 3000
lsof -i :3000  # Kill process if needed
```

### API Endpoints Not Responding
```bash
# Check server is running
curl http://localhost:3000/health

# Check logs
tail -f /tmp/mission-control-server.log
```

### Database Issues
```bash
# Reseed database
npm run seed

# Check data files
ls -la server/db/data/
```

### Frontend Not Connecting
1. **Check Config:** Verify `/src/config.js` has correct API URL
2. **Check CORS:** Verify backend CORS middleware is enabled
3. **Check Network:** Open browser DevTools → Network tab, check API requests

## Performance Optimization

### Refresh Intervals (Configurable in `/src/config.js`)
```javascript
refreshIntervals: {
  dashboard: 30000,  // 30 seconds
  workshop: 15000,   // 15 seconds
  activity: 30000,   // 30 seconds
  commits: 300000    // 5 minutes
}
```

### Caching Strategy
- Store API responses in local variables
- Use timestamp to invalidate cache
- Only refresh when needed

### Loading States
- Show spinner while fetching
- Disable controls during requests
- Display loading percentage for large operations

## Next Steps

1. **Connect all pages to real APIs**
2. **Add WebSocket for real-time updates**
3. **Implement error recovery and retries**
4. **Add loading animations**
5. **Implement data caching**
6. **Add offline support**
7. **Performance monitoring**
8. **Analytics tracking**

## API Client Methods Reference

See `/src/js/api-client.js` for all available methods organized by feature:

- `workshopAPI.*` - Task management
- `dashboardAPI.*` - Dashboard data
- `intelligenceAPI.*` - Intelligence reports
- `agentsAPI.*` - Agent management
- `clientsAPI.*` - Client management
- `journalAPI.*` - Journal entries
- `cronAPI.*` - Scheduled jobs
- `apiUsageAPI.*` - Token tracking
- `documentsAPI.*` - Document management
- `commsAPI.*` - Communication
- `weeklyRecapsAPI.*` - Weekly summaries
- `healthAPI.*` - Health checks

## Questions & Support

For issues or questions:
1. Check the troubleshooting section
2. Review API endpoint documentation
3. Check browser console for errors
4. Check server logs
5. Ensure backend is running and seeded
