# Mission Control V4 - Complete API Documentation

**Version**: 1.0.0  
**Base URL**: `http://localhost:3000` (development) | `http://76.13.119.105:3000` (production)  
**Content-Type**: `application/json`  

---

## 📚 API Overview

Mission Control V4 provides a comprehensive REST API with 30+ endpoints across 11 different resource modules. All endpoints return JSON responses and follow RESTful conventions.

### Available Modules
- Workshop (Task Management)
- Intelligence (Reports & Strategies)
- Communications (Messages)
- Documents
- Agents (Team Members)
- Cron Jobs
- Clients
- Journal
- Weekly Recaps
- API Usage
- Dashboard

---

## 🧰 Workshop API

Manage tasks, projects, and workflow items.

### Get All Tasks
```
GET /api/workshop/tasks
```

**Description**: Retrieve all workshop tasks grouped by status

**Response**:
```json
{
  "queued": [
    {
      "id": "task-123",
      "title": "Phase 1: UI Design",
      "description": "Design the UI framework",
      "status": "queued",
      "priority": "high",
      "progress": 0,
      "tags": ["building", "ui"],
      "created_at": "2026-02-08T18:00:00Z",
      "started_at": null,
      "completed_at": null
    }
  ],
  "in_progress": [
    {
      "id": "task-456",
      "title": "Phase 2: Navigation",
      "status": "active",
      "progress": 65,
      "started_at": "2026-02-08T18:30:00Z"
    }
  ],
  "completed": [
    {
      "id": "task-789",
      "title": "Setup Project",
      "status": "completed",
      "progress": 100,
      "completed_at": "2026-02-08T19:00:00Z"
    }
  ]
}
```

**Status Code**: `200 OK`

---

### Create Task
```
POST /api/workshop/tasks
```

**Description**: Create a new task in the workshop queue

**Request Body**:
```json
{
  "title": "New Task Title",
  "description": "Task description",
  "priority": "high",
  "tags": ["feature", "urgent"],
  "status": "queued"
}
```

**Response**:
```json
{
  "id": "uuid-generated",
  "title": "New Task Title",
  "description": "Task description",
  "priority": "high",
  "progress": 0,
  "status": "queued",
  "created_at": "2026-02-08T18:30:00Z",
  "activity_log": [
    {
      "timestamp": "6:30 PM EST",
      "event": "Task created"
    }
  ]
}
```

**Status Code**: `201 Created`

---

### Get Single Task
```
GET /api/workshop/tasks/:id
```

**Description**: Get detailed information about a specific task

**Parameters**:
- `id` (string, required) - Task UUID

**Response**:
```json
{
  "id": "task-123",
  "title": "Phase 1: UI Design",
  "description": "Complete description",
  "priority": "high",
  "progress": 50,
  "status": "active",
  "tags": ["building", "ui"],
  "created_at": "2026-02-08T18:00:00Z",
  "started_at": "2026-02-08T18:15:00Z",
  "completed_at": null,
  "activity_log": [
    {
      "timestamp": "6:00 PM EST",
      "event": "Task created"
    },
    {
      "timestamp": "6:15 PM EST",
      "event": "Task started"
    }
  ]
}
```

**Status Code**: `200 OK`

**Error Response** (404):
```json
{
  "error": "Task not found"
}
```

---

### Update Task
```
PUT /api/workshop/tasks/:id
```

**Description**: Update task properties (status, progress, description, etc.)

**Request Body**:
```json
{
  "status": "active",
  "progress": 75,
  "description": "Updated description"
}
```

**Response**:
```json
{
  "id": "task-123",
  "title": "Phase 1: UI Design",
  "status": "active",
  "progress": 75,
  "updated_at": "2026-02-08T18:45:00Z"
}
```

**Status Code**: `200 OK`

---

### Delete Task
```
DELETE /api/workshop/tasks/:id
```

**Description**: Remove a task from the workshop

**Response**:
```json
{
  "success": true,
  "message": "Task deleted"
}
```

**Status Code**: `200 OK`

---

## 🧠 Intelligence API

Manage intelligence reports and strategic information.

### Get All Reports
```
GET /api/intelligence
```

**Description**: Retrieve all intelligence reports

**Response**:
```json
[
  {
    "id": "intel-1",
    "title": "Market Expansion Strategy Q1 2026",
    "description": "Comprehensive market analysis",
    "category": "BUSINESS",
    "priority": "high",
    "status": "active",
    "created_at": "2026-02-01T10:00:00Z",
    "strategies": [
      {
        "id": "strat-1",
        "name": "Digital Marketing Push",
        "description": "Increase digital presence",
        "effort": "high"
      }
    ]
  }
]
```

**Status Code**: `200 OK`

---

### Get Single Report
```
GET /api/intelligence/:id
```

**Description**: Get full details of an intelligence report

**Parameters**:
- `id` (string, required) - Report UUID

**Response**:
```json
{
  "id": "intel-1",
  "title": "Market Expansion Strategy Q1 2026",
  "description": "Comprehensive market analysis and expansion plan",
  "content": "Detailed breakdown with findings...",
  "category": "BUSINESS",
  "priority": "high",
  "status": "active",
  "created_at": "2026-02-01T10:00:00Z",
  "impact": {
    "revenue": "$2.8M potential",
    "timeline": "Q1 2026"
  },
  "strategies": [
    {
      "id": "strat-1",
      "name": "Digital Marketing Push",
      "description": "Increase digital presence across platforms",
      "tasks": 3,
      "effort": "high"
    }
  ]
}
```

**Status Code**: `200 OK`

---

### Create Report
```
POST /api/intelligence
```

**Description**: Create a new intelligence report

**Request Body**:
```json
{
  "title": "New Intelligence Report",
  "description": "Short description",
  "content": "Detailed content here",
  "priority": "high",
  "strategies": [
    {
      "name": "Strategy 1",
      "description": "Description",
      "effort": "high"
    }
  ]
}
```

**Response**:
```json
{
  "id": "intel-new",
  "title": "New Intelligence Report",
  "priority": "high",
  "status": "active",
  "created_at": "2026-02-08T18:30:00Z"
}
```

**Status Code**: `201 Created`

---

### Deploy Strategy to Workshop
```
POST /api/intelligence/:id/deploy
```

**Description**: Deploy a strategy from the report to Workshop as a task

**Parameters**:
- `id` (string, required) - Report ID

**Request Body**:
```json
{
  "strategyId": "strat-1"
}
```

**Response**:
```json
{
  "success": true,
  "task": {
    "id": "task-new",
    "title": "Deploy: Digital Marketing Push",
    "description": "Increase digital presence",
    "priority": "high",
    "status": "queued",
    "tags": ["strategy", "deployment"]
  },
  "message": "Strategy deployed to Workshop"
}
```

**Status Code**: `200 OK`

**Error Response** (404):
```json
{
  "error": "Report not found"
}
```

---

## 💬 Communications API

Manage messages and activity feed.

### Get All Messages
```
GET /api/comms/messages
```

**Description**: Retrieve all messages from the communications feed

**Response**:
```json
[
  {
    "id": "msg-1",
    "text": "Task completed successfully",
    "author": "DAVE",
    "channel": "general",
    "timestamp": "2026-02-08T18:30:00Z",
    "reactions": ["👍"],
    "replies": 2
  },
  {
    "id": "msg-2",
    "text": "New strategy deployed",
    "author": "System",
    "channel": "alerts"
  }
]
```

**Status Code**: `200 OK`

---

### Send Message
```
POST /api/comms/messages
```

**Description**: Post a new message to the communications feed

**Request Body**:
```json
{
  "text": "Message content here",
  "author": "Your Name",
  "channel": "general"
}
```

**Response**:
```json
{
  "id": "msg-new",
  "text": "Message content here",
  "author": "Your Name",
  "channel": "general",
  "timestamp": "2026-02-08T18:35:00Z"
}
```

**Status Code**: `201 Created`

---

### Get Channels
```
GET /api/comms/channels
```

**Description**: Get available communication channels

**Response**:
```json
[
  {
    "id": "general",
    "name": "General",
    "messageCount": 45
  },
  {
    "id": "alerts",
    "name": "Alerts",
    "messageCount": 12
  }
]
```

**Status Code**: `200 OK`

---

### Update Message
```
PUT /api/comms/messages/:id
```

**Description**: Edit an existing message

**Request Body**:
```json
{
  "text": "Updated message text"
}
```

**Response**:
```json
{
  "id": "msg-1",
  "text": "Updated message text",
  "edited_at": "2026-02-08T18:40:00Z"
}
```

**Status Code**: `200 OK`

---

### Delete Message
```
DELETE /api/comms/messages/:id
```

**Description**: Remove a message from the feed

**Response**:
```json
{
  "success": true
}
```

**Status Code**: `200 OK`

---

## 📄 Documents API

Manage documents and knowledge base.

### Get All Documents
```
GET /api/documents
```

**Description**: Retrieve all documents

**Response**:
```json
[
  {
    "id": "doc-1",
    "title": "Project Charter",
    "type": "pdf",
    "size": "2.5 MB",
    "created_at": "2026-02-01T10:00:00Z",
    "author": "John Doe"
  }
]
```

**Status Code**: `200 OK`

---

### Create Document
```
POST /api/documents
```

**Description**: Upload or create a new document

**Request Body** (multipart/form-data):
```
file: [binary data]
title: "Document Title"
type: "pdf"
```

**Response**:
```json
{
  "id": "doc-new",
  "title": "Document Title",
  "type": "pdf",
  "url": "/documents/doc-new",
  "created_at": "2026-02-08T18:30:00Z"
}
```

**Status Code**: `201 Created`

---

### Get Document Details
```
GET /api/documents/:id
```

**Description**: Get information about a specific document

**Response**:
```json
{
  "id": "doc-1",
  "title": "Project Charter",
  "type": "pdf",
  "size": "2.5 MB",
  "created_at": "2026-02-01T10:00:00Z",
  "author": "John Doe",
  "tags": ["project", "planning"],
  "url": "/documents/doc-1"
}
```

**Status Code**: `200 OK`

---

### Update Document
```
PUT /api/documents/:id
```

**Description**: Update document metadata

**Request Body**:
```json
{
  "title": "Updated Title",
  "tags": ["project", "updated"]
}
```

**Response**:
```json
{
  "id": "doc-1",
  "title": "Updated Title",
  "updated_at": "2026-02-08T18:40:00Z"
}
```

**Status Code**: `200 OK`

---

### Delete Document
```
DELETE /api/documents/:id
```

**Description**: Remove a document

**Response**:
```json
{
  "success": true
}
```

**Status Code**: `200 OK`

---

## 👥 Agents API

Manage team members and agents.

### Get All Agents
```
GET /api/agents
```

**Description**: Retrieve all team members

**Response**:
```json
[
  {
    "id": "agent-1",
    "name": "DAVE",
    "role": "AI Assistant",
    "status": "active",
    "avatar": "🤖",
    "tasks_completed": 156,
    "last_activity": "2026-02-08T18:30:00Z"
  }
]
```

**Status Code**: `200 OK`

---

### Create Agent
```
POST /api/agents
```

**Description**: Add a new team member

**Request Body**:
```json
{
  "name": "Agent Name",
  "role": "Engineer",
  "email": "agent@example.com"
}
```

**Response**:
```json
{
  "id": "agent-new",
  "name": "Agent Name",
  "role": "Engineer",
  "status": "active"
}
```

**Status Code**: `201 Created`

---

### Get Agent Details
```
GET /api/agents/:id
```

**Description**: Get detailed information about an agent

**Response**:
```json
{
  "id": "agent-1",
  "name": "DAVE",
  "role": "AI Assistant",
  "status": "active",
  "email": "dave@mission-control.dev",
  "tasks_completed": 156,
  "tasks_in_progress": 3,
  "last_activity": "2026-02-08T18:30:00Z"
}
```

**Status Code**: `200 OK`

---

### Update Agent
```
PUT /api/agents/:id
```

**Description**: Update agent information

**Request Body**:
```json
{
  "status": "away",
  "role": "Senior Engineer"
}
```

**Response**:
```json
{
  "id": "agent-1",
  "status": "away",
  "role": "Senior Engineer"
}
```

**Status Code**: `200 OK`

---

### Delete Agent
```
DELETE /api/agents/:id
```

**Description**: Remove an agent

**Response**:
```json
{
  "success": true
}
```

**Status Code**: `200 OK`

---

## ⏰ Cron Jobs API

Manage scheduled jobs and automations.

### Get All Jobs
```
GET /api/cron
```

**Description**: Retrieve all scheduled cron jobs

**Response**:
```json
[
  {
    "id": "cron-1",
    "name": "Daily Backup",
    "schedule": "0 2 * * *",
    "status": "active",
    "last_run": "2026-02-08T02:00:00Z",
    "next_run": "2026-02-09T02:00:00Z"
  }
]
```

**Status Code**: `200 OK`

---

### Create Job
```
POST /api/cron
```

**Description**: Create a new cron job

**Request Body**:
```json
{
  "name": "Weekly Report",
  "schedule": "0 9 * * 1",
  "action": "generate_report"
}
```

**Response**:
```json
{
  "id": "cron-new",
  "name": "Weekly Report",
  "schedule": "0 9 * * 1",
  "status": "active"
}
```

**Status Code**: `201 Created`

---

## 📞 Clients API

Manage client relationships.

### Get All Clients
```
GET /api/clients
```

**Description**: Retrieve all clients

**Response**:
```json
[
  {
    "id": "client-1",
    "name": "Acme Corp",
    "status": "active",
    "contact_person": "John Smith",
    "email": "contact@acmecorp.com",
    "phone": "+1-555-0123",
    "created_at": "2026-01-01T00:00:00Z"
  }
]
```

**Status Code**: `200 OK`

---

### Create Client
```
POST /api/clients
```

**Description**: Add a new client

**Request Body**:
```json
{
  "name": "New Client Inc",
  "contact_person": "Jane Doe",
  "email": "jane@newclient.com",
  "phone": "+1-555-0456"
}
```

**Response**:
```json
{
  "id": "client-new",
  "name": "New Client Inc",
  "status": "active",
  "created_at": "2026-02-08T18:30:00Z"
}
```

**Status Code**: `201 Created`

---

## 📓 Journal API

Manage journal entries and notes.

### Get All Entries
```
GET /api/journal
```

**Description**: Retrieve all journal entries

**Response**:
```json
[
  {
    "id": "journal-1",
    "title": "Day 1: Project Kickoff",
    "content": "Started the Mission Control project...",
    "date": "2026-02-01",
    "tags": ["project", "kickoff"]
  }
]
```

**Status Code**: `200 OK`

---

### Create Entry
```
POST /api/journal
```

**Description**: Write a new journal entry

**Request Body**:
```json
{
  "title": "Daily Standup",
  "content": "Completed tasks...",
  "date": "2026-02-08",
  "tags": ["daily", "standup"]
}
```

**Response**:
```json
{
  "id": "journal-new",
  "title": "Daily Standup",
  "date": "2026-02-08",
  "created_at": "2026-02-08T18:30:00Z"
}
```

**Status Code**: `201 Created`

---

## 📊 Weekly Recaps API

Manage weekly summary reports.

### Get All Recaps
```
GET /api/weekly-recaps
```

**Description**: Retrieve all weekly recap reports

**Response**:
```json
[
  {
    "id": "recap-1",
    "week": "2026-W06",
    "title": "Week 6 Summary",
    "tasks_completed": 12,
    "achievements": "Delivered UI framework",
    "blockers": "None",
    "created_at": "2026-02-08T18:00:00Z"
  }
]
```

**Status Code**: `200 OK`

---

### Create Recap
```
POST /api/weekly-recaps
```

**Description**: Generate a new weekly recap

**Request Body**:
```json
{
  "week": "2026-W07",
  "title": "Week 7 Summary",
  "tasks_completed": 15,
  "achievements": "Feature development complete",
  "blockers": "Waiting on customer feedback"
}
```

**Response**:
```json
{
  "id": "recap-new",
  "week": "2026-W07",
  "created_at": "2026-02-08T18:30:00Z"
}
```

**Status Code**: `201 Created`

---

## 📈 API Usage API

Track API consumption and costs.

### Get Today's Usage
```
GET /api-usage/today
```

**Description**: Get API usage statistics for today

**Response**:
```json
{
  "date": "2026-02-08",
  "spend": 0.28,
  "calls": 10,
  "tokens": 6716,
  "lastUpdated": "2026-02-08T18:26:03.398Z"
}
```

**Status Code**: `200 OK`

---

### Get Usage History
```
GET /api-usage/history
```

**Description**: Get 30-day usage history

**Response**:
```json
[
  {
    "date": "2026-02-08",
    "spend": 0.28,
    "calls": 10,
    "tokens": 6716
  },
  {
    "date": "2026-02-07",
    "spend": 0.32,
    "calls": 12,
    "tokens": 7200
  }
]
```

**Status Code**: `200 OK`

---

### Get Usage Breakdown
```
GET /api-usage/breakdown
```

**Description**: Get usage breakdown by endpoint

**Response**:
```json
{
  "endpoints": {
    "/api/workshop": { "calls": 150, "spend": 0.15 },
    "/api/intelligence": { "calls": 80, "spend": 0.08 },
    "/api/comms": { "calls": 45, "spend": 0.05 }
  },
  "total_spend": 0.28
}
```

**Status Code**: `200 OK`

---

## 📊 Dashboard API

Get dashboard metrics and summaries.

### Get Dashboard Stats
```
GET /api/dashboard/stats
```

**Description**: Get key dashboard metrics

**Response**:
```json
{
  "total_tasks": 45,
  "tasks_completed": 18,
  "tasks_in_progress": 12,
  "tasks_queued": 15,
  "completion_rate": 40,
  "team_size": 8,
  "active_agents": 6
}
```

**Status Code**: `200 OK`

---

### Get Activity Feed
```
GET /api/dashboard/activity
```

**Description**: Get recent activity for the dashboard

**Response**:
```json
[
  {
    "timestamp": "2026-02-08T18:30:00Z",
    "event": "Task completed",
    "title": "Phase 1: UI Design",
    "user": "DAVE"
  },
  {
    "timestamp": "2026-02-08T18:25:00Z",
    "event": "Message posted",
    "text": "Strategy deployed",
    "user": "System"
  }
]
```

**Status Code**: `200 OK`

---

### Get Git Commits
```
GET /api/dashboard/commits
```

**Description**: Get recent git commit history

**Response**:
```json
[
  {
    "hash": "abc123",
    "message": "Phase 1: Complete UI framework",
    "author": "Developer",
    "date": "2026-02-08T15:00:00Z"
  }
]
```

**Status Code**: `200 OK`

---

## 🏥 Health Check

### Health Status
```
GET /health
```

**Description**: Check API server health

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2026-02-08T18:30:00Z"
}
```

**Status Code**: `200 OK`

---

## 🔑 Authentication

Currently, the API does not require authentication. This is suitable for internal/trusted environments.

**⚠️ For Production**: Add JWT or OAuth2 authentication.

---

## ⚠️ Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid request parameters",
  "details": "Missing required field: title"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found",
  "id": "invalid-id"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "Unexpected error occurred"
}
```

---

## 📋 Rate Limiting

Currently: **No rate limiting**

**⚠️ Recommendation**: Implement rate limiting (1000 requests/hour per IP)

```javascript
// Example with express-rate-limit
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000
});
app.use('/api/', limiter);
```

---

## 🔒 CORS Configuration

**Current CORS Settings**:
- Allowed Origins: All (*)
- Allowed Methods: GET, POST, PUT, DELETE, OPTIONS
- Allowed Headers: Content-Type

**⚠️ For Production**: Restrict to specific domains

```javascript
const cors = require('cors');
app.use(cors({
  origin: 'http://76.13.119.105:8081',
  credentials: true
}));
```

---

## 🧪 Example Requests

### Using cURL

```bash
# Get all tasks
curl http://localhost:3000/api/workshop/tasks

# Create a task
curl -X POST http://localhost:3000/api/workshop/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"New Task","priority":"high"}'

# Get specific task
curl http://localhost:3000/api/workshop/tasks/task-123

# Update task
curl -X PUT http://localhost:3000/api/workshop/tasks/task-123 \
  -H "Content-Type: application/json" \
  -d '{"status":"completed","progress":100}'

# Delete task
curl -X DELETE http://localhost:3000/api/workshop/tasks/task-123
```

### Using JavaScript (Fetch API)

```javascript
// Get all tasks
const response = await fetch('http://localhost:3000/api/workshop/tasks');
const tasks = await response.json();

// Create task
const newTask = await fetch('http://localhost:3000/api/workshop/tasks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    title: 'New Task', 
    priority: 'high' 
  })
});
const createdTask = await newTask.json();

// Update task
const updated = await fetch('http://localhost:3000/api/workshop/tasks/task-123', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ status: 'completed' })
});

// Delete task
await fetch('http://localhost:3000/api/workshop/tasks/task-123', {
  method: 'DELETE'
});
```

---

## 📝 API Versioning

**Current Version**: 1.0.0

Future versions will be available at `/api/v2/`, `/api/v3/`, etc.

---

## 🔄 Pagination

Currently: No pagination (returns all results)

**Recommended for v2**:
```
GET /api/workshop/tasks?page=1&limit=20
```

---

## 📚 Further Resources

- **ARCHITECTURE.md** - System design and patterns
- **COMPLETION_REPORT.md** - Testing results and deployment
- **TROUBLESHOOTING.md** - Common issues and solutions
- **README.md** - Quick start guide

---

**API Version**: 1.0.0  
**Last Updated**: February 8, 2026  
**Status**: Production Ready ✅
