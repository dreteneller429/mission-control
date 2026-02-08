# Mission Control V4 - API Testing Guide

## Quick API Tests

### Health Check
```bash
curl http://localhost:3000/health
# Response: { "status": "ok", "timestamp": "..." }
```

### Workshop Tasks
```bash
# Get all tasks
curl http://localhost:3000/api/workshop/tasks | jq '.stats'

# Create task
curl -X POST http://localhost:3000/api/workshop/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Task","description":"Test","priority":"high","tags":["test"]}'

# Get single task
curl http://localhost:3000/api/workshop/tasks/task-phase1-ui

# Update task progress
curl -X PATCH http://localhost:3000/api/workshop/tasks/task-phase1-ui \
  -H "Content-Type: application/json" \
  -d '{"progress":75}'

# Start a task
curl -X POST http://localhost:3000/api/workshop/tasks/task-phase3-workshop/start

# Complete a task
curl -X POST http://localhost:3000/api/workshop/tasks/task-phase1-ui/complete
```

### Dashboard
```bash
# Get activity feed
curl http://localhost:3000/api/dashboard/activity | jq '.[] | {action, timestamp}'

# Get recent commits
curl http://localhost:3000/api/dashboard/commits | jq '.'

# Get stats
curl http://localhost:3000/api/dashboard/stats | jq '.'
```

### Clients
```bash
# Get all clients
curl http://localhost:3000/api/clients | jq '.[] | {name, type, status}'

# Get single client
curl http://localhost:3000/api/clients/client-8unit

# Create new client
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -d '{"name":"New Client","type":"Real Estate","manager":"John"}'
```

### Agents
```bash
# Get all agents
curl http://localhost:3000/api/agents | jq '.[] | {name, role, status}'

# Get DAVE profile
curl http://localhost:3000/api/agents/dave/profile | jq '.profile'

# Get active sub-agents
curl http://localhost:3000/api/agents/subagents/active | jq '.[] | {name, role}'
```

### Intelligence
```bash
# Get all reports
curl http://localhost:3000/api/intelligence | jq '.[] | {title, status, priority}'

# Deploy strategy
curl -X POST http://localhost:3000/api/intelligence/intel-1/deploy \
  -H "Content-Type: application/json" \
  -d '{"strategyId":"strat-1"}'
```

### Journal
```bash
# Get all entries
curl http://localhost:3000/api/journal | jq '.[] | {date, filename}'

# Get today's entry
curl http://localhost:3000/api/journal/today | jq '.date'
```

### Cron Jobs
```bash
# Get all jobs
curl http://localhost:3000/api/cron | jq '.[] | {name, schedule, status}'

# Create job
curl -X POST http://localhost:3000/api/cron \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Job","description":"Test","schedule":"0 9 * * *","schedule_readable":"9 AM daily"}'

# Disable job
curl -X POST http://localhost:3000/api/cron/cron-1/disable

# Enable job
curl -X POST http://localhost:3000/api/cron/cron-1/enable
```

### API Usage
```bash
# Get all usage
curl http://localhost:3000/api-usage | jq '.summary'

# Log usage
curl -X POST http://localhost:3000/api-usage/log \
  -H "Content-Type: application/json" \
  -d '{"provider":"OpenAI","model":"claude-3","tokens_used":5000,"cost":0.50}'
```

### Documents
```bash
# Get all documents
curl http://localhost:3000/api/documents | jq '.[] | {title, type, tags}'

# Create document
curl -X POST http://localhost:3000/api/documents \
  -H "Content-Type: application/json" \
  -d '{"title":"New Doc","type":"markdown","path":"/path/to/doc","tags":["new"]}'
```

### Communications
```bash
# Get all messages
curl http://localhost:3000/api/comms/messages | jq '.[] | {sender, recipient, timestamp}'

# Send message
curl -X POST http://localhost:3000/api/comms/messages \
  -H "Content-Type: application/json" \
  -d '{"sender":"User","recipient":"DAVE","message":"Hello","channel":"telegram"}'
```

### Weekly Recaps
```bash
# Get all recaps
curl http://localhost:3000/api/weekly-recaps | jq '.[] | {week, summary}'

# Get latest recap
curl http://localhost:3000/api/weekly-recaps/latest | jq '{week, summary, metrics}'
```

## Test Workflow

### Complete Workshop Flow
```bash
# 1. Get current tasks
curl http://localhost:3000/api/workshop/tasks | jq '.stats'

# 2. Create a new task
NEW_TASK=$(curl -s -X POST http://localhost:3000/api/workshop/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Integration Test","description":"Test task","priority":"medium","tags":["test"]}')

TASK_ID=$(echo $NEW_TASK | jq -r '.id')
echo "Created task: $TASK_ID"

# 3. Start the task
curl -X POST http://localhost:3000/api/workshop/tasks/$TASK_ID/start | jq '.status'

# 4. Update progress
curl -X PATCH http://localhost:3000/api/workshop/tasks/$TASK_ID \
  -H "Content-Type: application/json" \
  -d '{"progress":50}' | jq '.progress'

# 5. Complete the task
curl -X POST http://localhost:3000/api/workshop/tasks/$TASK_ID/complete | jq '.status'

# 6. Verify it's in completed section
curl http://localhost:3000/api/workshop/tasks | jq '.completed[] | select(.id==env.TASK_ID)'
```

### Intelligence Deploy Flow
```bash
# 1. Get intelligence reports
curl http://localhost:3000/api/intelligence | jq '.[] | {id, title, strategies}'

# 2. Deploy strategy (creates task in workshop)
DEPLOY=$(curl -s -X POST http://localhost:3000/api/intelligence/intel-1/deploy \
  -H "Content-Type: application/json" \
  -d '{"strategyId":"strat-1"}')

echo $DEPLOY | jq '{success, message}'

# 3. Verify task created in workshop
curl http://localhost:3000/api/workshop/tasks | jq '.queued[] | select(.title | contains("Deploy"))'
```

## Response Examples

### Task Response
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Integration Test",
  "description": "Test task",
  "tags": ["test"],
  "priority": "medium",
  "progress": 0,
  "status": "queued",
  "created_at": "2026-02-08T18:30:00Z",
  "started_at": null,
  "completed_at": null,
  "activity_log": [
    {
      "timestamp": "18:30 EST",
      "event": "Task created by User"
    }
  ]
}
```

### Client Response
```json
{
  "id": "client-8unit",
  "name": "8-Unit Portfolio",
  "type": "Real Estate",
  "status": "active",
  "deals": 8,
  "value": "$2.4M",
  "roi": "12.5%",
  "manager": "Team A",
  "created_at": "2025-06-15T10:00:00Z"
}
```

### Agent Response
```json
{
  "id": "dave-main",
  "name": "DAVE",
  "role": "Primary Agent",
  "status": "online",
  "description": "Main autonomous agent",
  "uptime": "24d 12h",
  "lastActivity": "2026-02-08T18:10:30Z",
  "capabilities": ["planning", "execution", "analysis"],
  "health": "optimal"
}
```

## Common Issues & Solutions

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 npm start
```

### CORS Errors
- Ensure backend is serving with CORS headers enabled
- Check `/src/config.js` for correct API URL
- Verify frontend is on same origin or CORS is configured

### Database Not Found
```bash
# Reseed database
npm run seed

# Check data directory exists
ls -la server/db/data/
```

### No Response from API
```bash
# Check server is running
curl http://localhost:3000/health

# Check logs
tail -f /tmp/mission-control-server.log

# Restart server
npm start
```

## Performance Testing

### Load Test with ab (Apache Bench)
```bash
# Make 100 requests with 10 concurrent
ab -n 100 -c 10 http://localhost:3000/api/workshop/tasks

# Expected: <100ms response time
```

### Monitor Server Performance
```bash
# Watch server memory and CPU
watch -n 1 'ps aux | grep node'

# or with top
top -p $(pgrep -f "node server/app.js")
```

## Automated Testing Script

See `scripts/test-api.sh` for automated API testing.

## Frontend Integration Testing

### Browser Console Tests
```javascript
// Import API client
import * as API from './src/js/api-client.js';

// Test workshop API
API.workshopAPI.getTasks().then(res => {
  console.log('Workshop Tasks:', res.data);
});

// Test dashboard API
API.dashboardAPI.getActivity().then(res => {
  console.log('Activity Feed:', res.data);
});

// Test create task
API.workshopAPI.createTask({
  title: 'Browser Test',
  description: 'Created from browser console',
  priority: 'low'
}).then(res => {
  console.log('Created:', res.data);
});
```

## Debugging Tips

### Enable Debug Logging
In `/src/config.js`:
```javascript
debug: true  // Shows all API requests in console
```

### Check Network Requests
1. Open DevTools (F12)
2. Go to Network tab
3. Make API request
4. Click on request to see:
   - Request URL
   - Headers
   - Response body
   - Response time

### Check Server Logs
```bash
# Real-time logs
npm run dev

# or read log file
tail -f /tmp/mission-control-server.log
```

## Success Criteria

- ✅ Server starts without errors
- ✅ All endpoints respond to GET/POST/PATCH/DELETE
- ✅ Database operations work (create, read, update, delete)
- ✅ Git log is readable
- ✅ Memory files are accessible
- ✅ CORS is properly configured
- ✅ Error responses are properly formatted
- ✅ All timestamps are ISO 8601
- ✅ IDs are properly generated and returned
- ✅ Frontend can fetch and display data
