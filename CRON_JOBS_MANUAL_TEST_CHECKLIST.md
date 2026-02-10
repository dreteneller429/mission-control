# Cron Jobs Page - Manual Testing Checklist

## Quick Start
1. Start backend: `node server/app.js`
2. Start frontend: `node frontend-server.js`
3. Open: http://localhost:8081/pages/CronJobs.html

---

## Test Checklist

### Initial Page Load
- [ ] Page loads without errors
- [ ] Loading spinner appears briefly
- [ ] 6 default jobs display:
  - [ ] Morning Briefing (7:00 AM daily)
  - [ ] Task Summary (12:00 PM daily)
  - [ ] Email Check (hourly)
  - [ ] Dashboard Notes Check (6:00 PM daily)
  - [ ] Weekly SWOT (Sunday 6:00 PM)
  - [ ] Security Audit (Monday 12:00 AM)

### Job Card Display
Each job card should show:
- [ ] Job name (bold, prominent)
- [ ] Job description
- [ ] Schedule (human-readable + cron expression)
- [ ] Next run countdown (updates every second)
- [ ] Last run timestamp (relative time like "2h ago")
- [ ] Status toggle switch (ON/OFF)
- [ ] Status label (Active=green, Disabled=orange)
- [ ] Edit button
- [ ] Delete button

### Real-Time Countdown
- [ ] Wait 5 seconds and verify countdown decreases
- [ ] Countdown format shows: "in Xd Xh Xm" or "in Xh Xm" or "in Xm Xs"
- [ ] All active jobs show future countdown times

### Create New Job
1. [ ] Click "+ New Job" button
2. [ ] Modal opens with "Create New Job" title
3. [ ] Form contains:
   - [ ] Job Name field (required)
   - [ ] Description textarea (required)
   - [ ] Cron expression field (required)
   - [ ] 8 preset buttons (5min, 10min, hourly, etc.)
4. [ ] Click a preset button → cron field populates
5. [ ] Fill in form with valid data:
   - Name: "Test Job"
   - Description: "This is a test"
   - Schedule: "*/5 * * * *" (every 5 minutes)
6. [ ] Click "Save Job"
7. [ ] Modal closes
8. [ ] New job appears in list immediately
9. [ ] New job shows countdown timer
10. [ ] Success notification appears (green toast)

### Create Job - Validation
1. [ ] Click "+ New Job"
2. [ ] Enter invalid cron: "invalid"
3. [ ] Click "Save Job"
4. [ ] Error message appears
5. [ ] Modal stays open

### Edit Existing Job
1. [ ] Click "Edit" button on any job
2. [ ] Modal opens with "Edit Job: [name]" title
3. [ ] Form is pre-filled with job data
4. [ ] Change name to "Updated Name"
5. [ ] Change schedule to different value
6. [ ] Click "Save Job"
7. [ ] Modal closes
8. [ ] Job card updates with new data immediately
9. [ ] Next run time recalculated
10. [ ] Success notification appears

### Toggle Job Status
1. [ ] Find an active job (toggle switch ON, green label)
2. [ ] Click toggle switch to OFF
3. [ ] Status label changes to "DISABLED" (orange)
4. [ ] Success notification: "Job disabled"
5. [ ] Click toggle switch to ON
6. [ ] Status label changes to "ACTIVE" (green)
7. [ ] Success notification: "Job enabled"

### Delete Job
1. [ ] Click "Delete" button on test job
2. [ ] Confirmation dialog appears: "Are you sure you want to delete [name]?"
3. [ ] Click "Cancel" → nothing happens
4. [ ] Click "Delete" again
5. [ ] Click "OK" → job removed from list
6. [ ] Success notification: "[name] deleted successfully"

### Persistence Test
1. [ ] Create a new job: "Persistence Test"
2. [ ] Edit an existing job
3. [ ] Disable a job
4. [ ] Reload the page (F5 or Ctrl+R)
5. [ ] Verify all changes persisted:
   - [ ] "Persistence Test" job still exists
   - [ ] Edited job shows updated data
   - [ ] Disabled job is still disabled

### Backend Integration Verification

**Check Scheduler Status:**
```bash
curl http://localhost:3000/api/cron/scheduler/status | jq
```
Expected:
- [ ] "running": true
- [ ] "activeJobs": 6 (or more if you created jobs)
- [ ] Each active job listed with next run time

**Check Backend Logs:**
```bash
tail -f backend-server.log
```
Expected to see:
- [ ] "✅ Scheduled job: [Job Name]" for each active job
- [ ] "✅ Cron scheduler started"
- [ ] When you create a job: "✅ Scheduled job: [New Job Name]"
- [ ] When you toggle off: "🛑 Unscheduled job: [Job ID]"

### Edge Cases
- [ ] Try creating job with name only (no description) → should fail
- [ ] Try creating job with invalid cron "abcd" → should fail
- [ ] Create job with "0 0 * * *" (midnight) → should show correct countdown
- [ ] Edit job schedule to "*/1 * * * *" (every minute) → next run ~1min away
- [ ] Create multiple jobs quickly → all should appear
- [ ] Disable all jobs → countdown should stop for disabled jobs

### Performance
- [ ] Page loads within 2 seconds
- [ ] Creating job takes < 500ms
- [ ] Updating job takes < 500ms
- [ ] Deleting job takes < 500ms
- [ ] Countdown updates are smooth (no lag)

---

## Quick Test (5 Minutes)

Minimal test to verify everything works:

1. ✅ Load page → 6 jobs display
2. ✅ Watch countdown timer decrease for 5 seconds
3. ✅ Click "+ New Job" → modal opens
4. ✅ Use "Every 5 min" preset
5. ✅ Fill name: "Quick Test", desc: "Testing"
6. ✅ Submit → job appears
7. ✅ Click "Edit" on new job → form pre-fills
8. ✅ Change name to "Quick Test Updated"
9. ✅ Submit → name updates
10. ✅ Toggle OFF → status changes to disabled
11. ✅ Toggle ON → status changes to active
12. ✅ Click "Delete" → confirm → job removed
13. ✅ Reload page → changes persist

**If all 13 steps pass → System is working correctly!**

---

## Troubleshooting

### Issue: Jobs not loading
**Check:**
```bash
curl http://localhost:3000/api/cron
```
If empty array `[]` → backend not initialized properly

**Fix:**
```bash
# Restart backend
pkill -f "node.*server/app.js"
node server/app.js
```

### Issue: Countdown not updating
**Check:** Browser console (F12) for JavaScript errors

**Fix:** Hard refresh (Ctrl+Shift+R)

### Issue: "Job not scheduled" in backend
**Check:**
```bash
curl http://localhost:3000/api/cron/scheduler/status
```
Should show all active jobs

**Fix:** Restart backend server

### Issue: Invalid cron expression not rejected
**Check:** Backend logs for validation errors

**Expected:** Should return 400 error with message "Invalid cron expression"

---

## Success Criteria

✅ **All tests pass if:**
1. All 6 default jobs load and display
2. Countdown timers update every second
3. Can create new jobs
4. Can edit existing jobs
5. Can delete jobs
6. Can toggle job status
7. All changes persist after reload
8. Backend scheduler shows all active jobs
9. Invalid cron expressions are rejected

---

## Automated Test

Run full test suite:
```bash
cd /home/clawd/.openclaw/workspace/mission-control
./test-cron-jobs-complete.sh
```

Expected: **32/32 tests pass**
