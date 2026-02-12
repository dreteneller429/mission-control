# Mission Control V4 - Data Storage Architecture

## Overview
Mission Control uses **JSON file-based persistent storage** located at `/server/db/data/*.json`.

## Architecture

### Storage Layer
- **Location:** `/server/db/storage.js`
- **Data Directory:** `/server/db/data/`  (gitignored)
- **Format:** JSON files (one per collection)
- **Operations:** CRUD (Create, Read, Update, Delete)

### Collections

| Collection | File | Description |
|------------|------|-------------|
| `agents` | `agents.json` | DAVE and sub-agents |
| `clients` | `clients.json` | Client records (name, company, MRR, status) |
| `comms_messages` | `comms_messages.json` | Messages between DAVE and sub-agents |
| `cron` | `cron.json` | Scheduled cron jobs |
| `documents` | `documents.json` | Generated reports and documents |
| `intelligence` | `intelligence.json` | Intelligence reports |
| `journal` | `journal.json` | Journal entries |
| `messages` | `messages.json` | Activity log messages |
| `tasks` | `tasks.json` | Workshop tasks (queued, active, completed) |
| `weekly-recaps` | `weekly-recaps.json` | Weekly summary data |

### API Methods

```javascript
const storage = require('./db/storage');

// Initialize with default data
storage.initCollection('collection_name', [defaultData]);

// Read
const item = storage.findById('collection_name', 'item-id');
const allItems = storage.findAll('collection_name');
const allItems = storage.getAll('collection_name'); // Alias

// Create
storage.add('collection_name', newItem);

// Update
storage.update('collection_name', 'item-id', updates);

// Delete
storage.remove('collection_name', 'item-id');
```

## Persistence Guarantee

✅ **All data persists across server restarts**  
✅ **Files written to disk on every change**  
✅ **Atomic write operations (fs.writeFileSync)**  
✅ **Auto-creates collections on first access**

## Testing Persistence

1. Add a journal entry via UI
2. Restart backend server: `pm2 restart mission-control-backend` or `cd server && npm start`
3. Refresh browser and navigate to Journal page
4. Entry should still be visible ✓

## Backup & Recovery

Data files are in `/server/db/data/*.json`.

To backup:
```bash
tar -czf mission-control-data-$(date +%Y%m%d).tar.gz server/db/data/
```

To restore:
```bash
tar -xzf mission-control-data-YYYYMMDD.tar.gz
```

## Migration Path

If growth requires more robust storage:

1. **SQLite** - Use `better-sqlite3` npm package
2. **PostgreSQL** - For multi-user or high-concurrency
3. **MongoDB** - For document-heavy workloads

Current JSON implementation is production-ready for single-user, moderate data volumes (<10k records per collection).

---

**Architecture Status:** ✅ Complete  
**Last Verified:** 2026-02-12  
**Implemented By:** DAVE (Second Sprint, Section 13)
