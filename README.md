# Mission Control V4 - Backend REST API

Complete backend REST API for Mission Control V4. A comprehensive system for managing tasks, intelligence reports, cron jobs, API usage tracking, agents, communications, documents, journal entries, clients, and weekly recaps.

## Quick Start

### Installation
```bash
cd mission-control
npm install
```

### Running the Server
```bash
npm start
```

The API will be available at `http://localhost:3000`

### Testing All Endpoints
```bash
./test-api.sh
```

## API Architecture

### Technology Stack
- **Framework:** Express.js (Node.js)
- **Database:** JSON file-based storage (lightweight, no external dependencies)
- **Port:** 3000 (default)
- **Data Location:** `/server/db/data/`

### Directory Structure
```
mission-control/
├── server/
│   ├── app.js                 # Main Express application
│   ├── middleware/
│   │   ├── cors.js           # CORS configuration
│   │   └── logging.js        # Request/response logging
│   ├── routes/
│   │   ├── workshop.js       # Task management
│   │   ├── intelligence.js   # Intelligence reports
│   │   ├── cron.js          # Cron job scheduling
│   │   ├── api-usage.js     # API usage tracking
│   │   ├── agents.js        # Agent management
│   │   ├── comms.js         # Communications/messaging
│   │   ├── documents.js     # Document storage
│   │   ├── journal.js       # Journal entries
│   │   ├── clients.js       # Client management
│   │   ├── weekly-recaps.js # Weekly summaries
│   │   └── dashboard.js     # Dashboard stats & activity
│   └── db/
│       └── storage.js        # Storage abstraction layer
├── package.json
└── README.md
```

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Workshop Tasks
- `GET /api/workshop/tasks` - List all tasks
- `POST /api/workshop/tasks` - Create new task
- `GET /api/workshop/tasks/:id` - Get specific task
- `PUT /api/workshop/tasks/:id` - Update task
- `DELETE /api/workshop/tasks/:id` - Delete task
- `POST /api/workshop/tasks/:id/start` - Move task to Active
- `POST /api/workshop/tasks/:id/complete` - Mark task as Completed

### Intelligence Reports
- `GET /api/intelligence` - List all reports
- `POST /api/intelligence` - Create new report
- `GET /api/intelligence/:id` - Get specific report
- `PUT /api/intelligence/:id` - Update report
- `POST /api/intelligence/:id/deploy` - Deploy strategy (creates workshop task)

### Cron Jobs
- `GET /api/cron` - List all cron jobs
- `POST /api/cron` - Create new cron job
- `PUT /api/cron/:id` - Update cron job
- `DELETE /api/cron/:id` - Delete cron job
- `POST /api/cron/:id/run` - Trigger job immediately

### API Usage Tracking
- `GET /api-usage/today` - Today's spending
- `GET /api-usage/history` - Last 30 days history
- `GET /api-usage/breakdown` - Breakdown by model/service
- `GET /api-usage/metrics` - Comprehensive metrics
- `GET /api-usage/recent` - Recent API calls
- `POST /api-usage/log` - Log new API call

### Agents
- `GET /api/agents` - List all agents
- `GET /api/agents/:id` - Get agent details
- `PUT /api/agents/:id` - Update agent status/task

### Communications
- `GET /api/comms/messages` - Get message history
- `POST /api/comms/messages` - Send new message

### Documents
- `GET /api/documents` - List all documents
- `POST /api/documents` - Create new document
- `GET /api/documents/:id` - Get specific document
- `DELETE /api/documents/:id` - Delete document

### Journal
- `GET /api/journal/:date` - Get entries for specific date (YYYY-MM-DD)
- `POST /api/journal/:date` - Add entry to specific date

### Clients
- `GET /api/clients` - List all clients
- `POST /api/clients` - Create new client
- `GET /api/clients/:id` - Get client details
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Weekly Recaps
- `GET /api/weekly-recaps` - List all recaps
- `GET /api/weekly-recaps/:week` - Get specific week summary
- `POST /api/weekly-recaps` - Create new recap
- `PUT /api/weekly-recaps/:week` - Update recap

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/activity` - Activity feed
- `GET /api/dashboard/commits` - Git commits history

## Data Models

### Task
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "tags": ["string"],
  "priority": "high|medium|low",
  "progress": 0-100,
  "status": "pending|active|completed",
  "created_at": "ISO8601",
  "started_at": "ISO8601 or null",
  "completed_at": "ISO8601 or null",
  "activity_log": [
    {
      "timestamp": "ISO8601",
      "action": "string",
      "user": "string"
    }
  ]
}
```

### Intelligence Report
```json
{
  "id": "uuid",
  "title": "string",
  "category": "string",
  "content": "string",
  "impact_summary": "string",
  "strategy_summary": "string",
  "created_at": "ISO8601",
  "source": "string",
  "deployed": boolean
}
```

### Cron Job
```json
{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "schedule": "cron expression",
  "next_run": "ISO8601",
  "last_run": "ISO8601 or null",
  "status": "active|inactive"
}
```

### Agent
```json
{
  "id": "uuid",
  "name": "string",
  "role": "string",
  "status": "active|inactive",
  "current_task": "string",
  "avatar": "emoji"
}
```

### Message
```json
{
  "id": "uuid",
  "timestamp": "ISO8601",
  "sender_id": "string",
  "sender_name": "string",
  "message_text": "string",
  "avatar": "emoji"
}
```

### Document
```json
{
  "id": "uuid",
  "title": "string",
  "date": "ISO8601",
  "category": "string",
  "content": "string"
}
```

### Client
```json
{
  "id": "uuid",
  "name": "string",
  "company": "string",
  "status": "active|inactive",
  "mrr": number,
  "last_activity": "ISO8601",
  "next_action": "string"
}
```

### Weekly Recap
```json
{
  "id": "uuid",
  "week": "YYYY-Www",
  "start_date": "ISO8601",
  "end_date": "ISO8601",
  "summary": "string",
  "metrics": {
    "tasks_completed": number,
    "tasks_created": number,
    "focus_time_hours": number,
    "intelligence_deployed": number
  }
}
```

## CORS Configuration

The API allows requests from:
- `http://localhost:8081` (Frontend development)
- `http://localhost:3000` (Local testing)
- `http://127.0.0.1:*` (Local loopback)
- `http://76.13.119.105:8080` (Production)

## Error Handling

All errors follow this format:
```json
{
  "error": "Error message description"
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

## Logging

All requests and responses are logged with:
- Timestamp
- HTTP Method
- Request Path
- Response Status Code
- Response Time (milliseconds)

Logs appear in console output and can be piped to files:
```bash
npm start > api.log 2>&1
```

## Storage

Data is persisted in JSON files located at:
```
server/db/data/
├── tasks.json
├── intelligence.json
├── cron_jobs.json
├── api_usage.json
├── agents.json
├── messages.json
├── documents.json
├── journal.json
├── clients.json
├── weekly_recaps.json
└── ...
```

All data is automatically formatted with proper JSON indentation for readability.

## Example Usage

### Create a Task
```bash
curl -X POST http://localhost:3000/api/workshop/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Build API",
    "description": "Complete REST API",
    "tags": ["api", "backend"],
    "priority": "high"
  }'
```

### Get All Tasks
```bash
curl http://localhost:3000/api/workshop/tasks
```

### Create Intelligence Report
```bash
curl -X POST http://localhost:3000/api/intelligence \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Q1 Strategy",
    "category": "strategic",
    "content": "Analysis of Q1 opportunities",
    "impact_summary": "40% efficiency gain",
    "strategy_summary": "Implement automation"
  }'
```

### Send Message
```bash
curl -X POST http://localhost:3000/api/comms/messages \
  -H "Content-Type: application/json" \
  -d '{
    "sender_id": "agent-1",
    "sender_name": "Agent Smith",
    "message_text": "Task completed",
    "avatar": "🤖"
  }'
```

### Get Dashboard Stats
```bash
curl http://localhost:3000/api/dashboard/stats
```

## Features

✅ **Complete CRUD Operations** - Create, Read, Update, Delete for all resources
✅ **Task Management** - Full lifecycle management with status tracking
✅ **Intelligence Reports** - Strategic planning with deployment capability
✅ **Cron Job Scheduling** - Schedule and manage automated jobs
✅ **API Usage Tracking** - Monitor spend by model and service
✅ **Agent Management** - Track active agents and their tasks
✅ **Communications** - Message history and broadcasting
✅ **Document Storage** - Organize documents by category
✅ **Journal Entries** - Daily notes with tags
✅ **Client Management** - CRM functionality
✅ **Weekly Recaps** - Summarize progress and metrics
✅ **Dashboard** - Stats, activity feed, and git integration
✅ **Error Handling** - Comprehensive error responses
✅ **Request Logging** - All requests logged with metadata
✅ **CORS Enabled** - Pre-configured for frontend integration

## Performance

- **Fast:** JSON file-based storage with in-memory operations
- **Scalable:** Efficient storage layer abstraction
- **Lightweight:** No database server required
- **Portable:** Self-contained, runs anywhere Node.js is available

## Development

### Add a New Endpoint

1. Create route file in `/server/routes/`
2. Export Express router
3. Import and register in `app.js`
4. Test with curl or API client

### Example Route
```javascript
const express = require('express');
const router = express.Router();
const storage = require('../db/storage');

storage.initCollection('items', []);

router.get('/', (req, res) => {
  try {
    const items = storage.findAll('items');
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

module.exports = router;
```

## License

ISC

## Support

For issues or questions, check the logs or verify JSON file integrity in `/server/db/data/`.
