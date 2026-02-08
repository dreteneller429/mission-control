# Mission Control V4 API - Quick Reference

## Start the API
```bash
npm start
```
Server runs on `http://localhost:3000`

## Test All Endpoints
```bash
./test-api.sh
```
Expected: 32/32 tests passing ✅

## Core Endpoints Quick Reference

### Tasks
```bash
# Create
curl -X POST http://localhost:3000/api/workshop/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Task title","priority":"high"}'

# List
curl http://localhost:3000/api/workshop/tasks

# Get one
curl http://localhost:3000/api/workshop/tasks/:id

# Update
curl -X PUT http://localhost:3000/api/workshop/tasks/:id \
  -H "Content-Type: application/json" \
  -d '{"status":"active"}'

# Start
curl -X POST http://localhost:3000/api/workshop/tasks/:id/start

# Complete
curl -X POST http://localhost:3000/api/workshop/tasks/:id/complete

# Delete
curl -X DELETE http://localhost:3000/api/workshop/tasks/:id
```

### Intelligence
```bash
# Create
curl -X POST http://localhost:3000/api/intelligence \
  -H "Content-Type: application/json" \
  -d '{"title":"Report","category":"strategic","content":"...","impact_summary":"...","strategy_summary":"..."}'

# List
curl http://localhost:3000/api/intelligence

# Deploy (creates task)
curl -X POST http://localhost:3000/api/intelligence/:id/deploy
```

### Messages
```bash
# Send
curl -X POST http://localhost:3000/api/comms/messages \
  -H "Content-Type: application/json" \
  -d '{"sender_id":"agent","sender_name":"Agent","message_text":"Hello"}'

# Get history
curl http://localhost:3000/api/comms/messages
```

### Dashboard
```bash
# Stats
curl http://localhost:3000/api/dashboard/stats

# Activity
curl http://localhost:3000/api/dashboard/activity

# Recent commits
curl http://localhost:3000/api/dashboard/commits
```

### API Usage
```bash
# Today
curl http://localhost:3000/api-usage/today

# History
curl http://localhost:3000/api-usage/history

# Breakdown
curl http://localhost:3000/api-usage/breakdown
```

## Response Format

Success (200/201):
```json
{
  "id": "uuid",
  "title": "...",
  ...
}
```

Error (400/404/500):
```json
{
  "error": "Error message"
}
```

## Data Storage
All data in: `server/db/data/`
- tasks.json
- intelligence.json
- cron_jobs.json
- api_usage.json
- agents.json
- messages.json
- documents.json
- journal.json
- clients.json
- weekly_recaps.json

## Project Structure
```
server/
├── app.js              # Main app
├── middleware/
│   ├── cors.js
│   └── logging.js
├── routes/             # All endpoints
└── db/
    ├── storage.js      # Data layer
    └── data/           # JSON files
```

## Common Tasks

### Clear all data
```bash
rm server/db/data/*.json
npm start  # Recreates with defaults
```

### View logs
```bash
# In background
tail -f /tmp/server.log

# Direct console
npm start
```

### Add new endpoint
1. Create `server/routes/name.js`
2. Import in `server/app.js`
3. Register: `app.use('/api/name', nameRoutes)`
4. Test with curl

### Enable debug logging
```bash
# Add to request handler
console.log('Debug:', req.body);
```

## Status Codes
- 200 - OK
- 201 - Created
- 400 - Bad Request (missing fields)
- 404 - Not Found (wrong ID)
- 500 - Server Error (check console)

## File Locations

Key Files:
- `package.json` - Dependencies
- `README.md` - Full documentation
- `IMPLEMENTATION_SUMMARY.md` - What was built
- `test-api.sh` - Test suite

Code:
- `server/app.js` - Express setup
- `server/routes/*.js` - API endpoints
- `server/db/storage.js` - Data persistence

## Environment

- **Node:** v22.22.0
- **Port:** 3000 (default)
- **Database:** JSON files
- **CORS:** localhost:8081, 76.13.119.105:8080

## Support

- Check logs for errors: `console.error()`
- Verify JSON in `/server/db/data/`
- Run tests: `./test-api.sh`
- Read full docs: `README.md`

---

**49 Endpoints | 100% Complete | All Tests Passing ✅**
