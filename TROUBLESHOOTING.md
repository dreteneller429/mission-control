# Mission Control V4 - Troubleshooting Guide

**Version**: 1.0.0  
**Last Updated**: February 8, 2026

---

## 📋 Quick Troubleshooting Index

- [Server Issues](#server-issues)
- [Frontend Issues](#frontend-issues)
- [API Issues](#api-issues)
- [Database Issues](#database-issues)
- [Performance Issues](#performance-issues)
- [Deployment Issues](#deployment-issues)
- [Common Errors](#common-errors)

---

## 🖥️ Server Issues

### Backend Server Won't Start

**Error**: `Error: listen EADDRINUSE: address already in use :::3000`

**Cause**: Port 3000 is already in use

**Solutions**:
1. Kill the process using port 3000:
```bash
# macOS/Linux
lsof -i :3000 | awk 'NR!=1 {print $2}' | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

2. Use a different port:
```bash
PORT=3001 npm start
```

3. Check what's using the port:
```bash
lsof -i :3000
```

---

### Node Modules Not Found

**Error**: `Cannot find module 'express'`

**Cause**: Dependencies not installed

**Solution**:
```bash
npm install
```

---

### Out of Memory Error

**Error**: `JavaScript heap out of memory`

**Cause**: Too many requests or data in memory

**Solutions**:
1. Increase Node memory limit:
```bash
node --max-old-space-size=4096 server/app.js
```

2. Restart the server to clear memory
3. Optimize data loading (see [Performance Issues](#performance-issues))

---

### Server Crashes on Startup

**Error**: `SyntaxError: Unexpected token`

**Cause**: JSON file corruption or syntax error

**Solution**:
1. Check log output for file name
2. Validate JSON syntax in the mentioned file:
```bash
node -c server/db/data/tasks.json
```

3. Restore from backup if corrupted

---

## 🎨 Frontend Issues

### Pages Not Loading

**Symptom**: Blank page or 404 error

**Cause**: Frontend server not running

**Solutions**:
1. Verify frontend server is running:
```bash
curl http://localhost:8081/pages/Dashboard.html
```

2. Start frontend server:
```bash
node frontend-server.js
```

3. Check browser console for JavaScript errors (F12 → Console)

---

### Styles Not Applied

**Symptom**: Pages load but no styling

**Causes & Solutions**:
1. CSS files not found:
```bash
# Verify CSS files exist
ls -la src/styles/
```

2. Check CSS import paths in HTML files are correct

3. Clear browser cache:
   - Chrome: Ctrl+Shift+Delete or Cmd+Shift+Delete
   - Firefox: Ctrl+Shift+Delete or Cmd+Shift+Delete

4. Check for CORS issues in browser console

---

### API Calls Return 404

**Symptom**: `GET /api/... returned 404`

**Causes**:
1. Backend server not running
2. Wrong API endpoint path
3. Wrong base URL

**Solutions**:
1. Verify backend is running:
```bash
curl http://localhost:3000/health
```

2. Check endpoint path in code matches actual routes
3. Verify base URL in config matches server address
4. Check browser Network tab (F12 → Network) for actual request

---

### JavaScript Errors in Console

**Symptom**: Red errors in browser console (F12)

**Common Errors**:

**"Cannot read property 'innerHTML' of null"**
- Element doesn't exist in HTML
- Solution: Check element IDs match between HTML and JS

**"fetch is not defined"**
- Using outdated browser
- Solution: Use modern browser or add fetch polyfill

**"CORS error"**
- Backend doesn't allow requests from frontend origin
- Solution: Check CORS settings in `server/middleware/cors.js`

---

### Page Routing Issues

**Symptom**: Navigation doesn't work, stuck on one page

**Cause**: Page loader not working correctly

**Solution**:
1. Check app.js has `loadPage()` function
2. Verify page file names match route names
3. Check for JavaScript errors in console
4. Test direct URL: `http://localhost:8081/pages/Workshop.html`

---

## 🔌 API Issues

### API Returns 404

**Symptom**: `{"error":"Not found"}`

**Causes**:
1. Endpoint path is incorrect
2. API uses sub-paths that aren't documented

**Solutions**:
1. Verify path matches documentation in `API_DOCS.md`
2. Check API route implementations:
```bash
grep -r "router.get\|router.post" server/routes/
```

3. Test with curl:
```bash
curl http://localhost:3000/api/workshop/tasks
curl http://localhost:3000/api/intelligence
```

---

### API Returns Empty Array or Object

**Symptom**: API responds with `[]` or `{}`

**Cause**: No data loaded or seed data not initialized

**Solution**:
1. Seed the database:
```bash
npm run seed
```

2. Check seed script:
```bash
cat server/scripts/seed.js
```

3. Manually add test data:
```bash
curl -X POST http://localhost:3000/api/workshop/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Task","priority":"high"}'
```

---

### API Slow Response

**Symptom**: API takes > 1 second to respond

**Causes**:
1. Server under heavy load
2. Large dataset being processed
3. Inefficient queries

**Solutions**:
1. Check server CPU/memory:
```bash
top  # macOS/Linux
tasklist  # Windows
```

2. Restart server to clear memory
3. Check server logs for errors
4. Optimize data size (see [Performance Issues](#performance-issues))

---

### Authentication/CORS Errors

**Error**: `Access to XMLHttpRequest has been blocked by CORS policy`

**Cause**: Frontend and backend on different origins

**Solution** (Development):
Add CORS headers - already configured in `server/middleware/cors.js`

**Solution** (Production):
```javascript
// Update server/middleware/cors.js
const corsMiddleware = (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://76.13.119.105:8081');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
};
```

---

## 💾 Database Issues

### Data Not Persisting

**Symptom**: Data created in one session disappears on restart

**Cause**: File-based storage not persisting to disk properly

**Solution**:
1. Check database directory exists:
```bash
ls -la server/db/data/
```

2. Check file permissions:
```bash
chmod 755 server/db/data/
chmod 644 server/db/data/*.json
```

3. Verify storage implementation saves to disk

---

### Database Corruption

**Symptom**: JSON parse errors or unexpected data format

**Cause**: File corruption or incomplete write

**Solution**:
1. Check JSON validity:
```bash
npm install -g jsonlint
jsonlint server/db/data/tasks.json
```

2. Restore from backup:
```bash
cp server/db/data/tasks.json.backup server/db/data/tasks.json
```

3. Re-seed database:
```bash
rm server/db/data/*.json
npm run seed
```

---

### Multiple Instances Writing

**Symptom**: Data conflicts or duplicate entries

**Cause**: Multiple server instances writing to same files

**Solution**:
1. Ensure only one server instance is running:
```bash
ps aux | grep "node server"
```

2. Kill extra instances:
```bash
pkill -f "node server"
```

3. For production with multiple servers:
   - Migrate to database with locking (PostgreSQL)
   - Implement file locking mechanism
   - Use Redis for caching

---

## ⚡ Performance Issues

### Pages Load Slowly

**Symptom**: Page takes > 3 seconds to load and display

**Causes**:
1. Large data being fetched
2. Network latency
3. Inefficient JavaScript

**Solutions**:
1. Check Network tab in browser DevTools:
   - Look for slow requests
   - Check response sizes

2. Optimize data:
   - Load only needed data
   - Implement pagination
   - Use filtering

3. Profile JavaScript:
   - Use DevTools Performance tab
   - Look for long-running functions
   - Optimize DOM updates

---

### High CPU Usage

**Symptom**: Server CPU at 100%

**Causes**:
1. Inefficient loops
2. Too many simultaneous requests
3. Recursive function calls

**Solution**:
1. Enable logging to see slow requests:
```bash
DEBUG=* npm start
```

2. Check logs for slow endpoints
3. Optimize the identified endpoint
4. Implement rate limiting

---

### Memory Leak

**Symptom**: Memory usage keeps growing, server crashes

**Causes**:
1. Unclosed connections
2. Growing arrays without cleanup
3. Event listeners not removed

**Solution**:
1. Restart server periodically (cron job)
2. Monitor memory usage:
```bash
node --inspect server/app.js
# Open chrome://inspect
```

3. Look for growing data structures
4. Migrate to proper database (not file-based)

---

### Slow API Responses

**Symptom**: API endpoints take > 500ms

**Causes**:
1. Large data processing
2. Inefficient storage lookups
3. Network latency

**Solutions**:
1. Add timing logs:
```javascript
const start = Date.now();
// operation
console.log(`Operation took ${Date.now() - start}ms`);
```

2. Add caching:
```javascript
const cache = {};
function getCached(key, fetcher) {
  if (!cache[key]) cache[key] = fetcher();
  return cache[key];
}
```

3. Consider database indexing
4. Implement pagination

---

## 🚀 Deployment Issues

### Port Already in Use After Deployment

**Symptom**: Backend won't start on production server

**Solution**:
```bash
# Find what's using the port
sudo lsof -i :3000

# Kill the process
sudo kill -9 <PID>

# Restart the service
sudo systemctl restart mission-control
# or
npm start
```

---

### Frontend Not Accessible After Deployment

**Symptom**: `http://76.13.119.105:8081` returns 404

**Causes**:
1. Frontend server not running
2. Nginx misconfigured
3. Firewall blocking ports

**Solutions**:
1. Verify frontend server running:
```bash
ps aux | grep "http.server\|node frontend"
```

2. Check firewall:
```bash
sudo ufw status
sudo ufw allow 8081
```

3. Test locally:
```bash
curl http://localhost:8081
```

4. Check Nginx config:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

### CORS Issues in Production

**Symptom**: Frontend can't reach backend API

**Solution**:
Update CORS configuration for production domain:
```javascript
// server/middleware/cors.js
const corsMiddleware = (req, res, next) => {
  const allowed = [
    'http://76.13.119.105:8081',
    'http://76.13.119.105',
    'http://76.13.119.105:80'
  ];
  
  if (allowed.includes(req.headers.origin)) {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
};
```

---

### SSL Certificate Issues

**Symptom**: HTTPS doesn't work, certificate errors

**Solution**:
1. Obtain certificate (Let's Encrypt):
```bash
sudo apt-get install certbot
sudo certbot certonly --standalone -d 76.13.119.105
```

2. Configure in Nginx:
```nginx
server {
  listen 443 ssl http2;
  ssl_certificate /etc/letsencrypt/live/76.13.119.105/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/76.13.119.105/privkey.pem;
}
```

3. Redirect HTTP to HTTPS:
```nginx
server {
  listen 80;
  return 301 https://$host$request_uri;
}
```

---

## ⚠️ Common Errors

### "Cannot find module"
**Cause**: Package not installed  
**Fix**: `npm install`

---

### "Port 3000 in use"
**Cause**: Another app using port  
**Fix**: `lsof -i :3000 | kill` or use different port

---

### "ENOENT: no such file or directory"
**Cause**: File doesn't exist  
**Fix**: Check file path, create if needed

---

### "JSON.parse: unexpected character"
**Cause**: Invalid JSON in data file  
**Fix**: Validate JSON, re-seed database

---

### "fetch is not defined"
**Cause**: Old browser without Fetch API  
**Fix**: Use modern browser or add polyfill

---

### "Cannot read property of undefined"
**Cause**: Variable accessed before assignment  
**Fix**: Add null checks: `if (obj?.property)`

---

### "CORS error"
**Cause**: Wrong origin in request  
**Fix**: Check CORS middleware configuration

---

### "Request timeout"
**Cause**: Server not responding  
**Fix**: Restart server, check logs

---

### "Out of memory"
**Cause**: Too much data in RAM  
**Fix**: Restart server, optimize data

---

## 🔍 Debugging Tips

### Enable Debug Mode
```bash
DEBUG=* npm start
```

### Check Logs
```bash
# View Node logs
journalctl -u mission-control -f

# View application logs
tail -f app.log
```

### Browser DevTools
1. **Console** (F12): JavaScript errors
2. **Network** (F12): API requests/responses
3. **Elements** (F12): HTML/CSS inspection
4. **Application** (F12): Local storage, cookies
5. **Performance** (F12): Load time analysis

### Test API Endpoints
```bash
# Test all endpoints
curl http://localhost:3000/health
curl http://localhost:3000/api/workshop/tasks
curl http://localhost:3000/api/intelligence
curl http://localhost:3000/api/comms/messages
```

### Check System Resources
```bash
# CPU and memory usage
top

# Disk space
df -h

# Network connections
netstat -an | grep LISTEN
```

---

## 📞 Getting Help

If you can't find a solution:

1. **Check Documentation**:
   - API_DOCS.md - API reference
   - ARCHITECTURE.md - System design
   - README.md - Quick start

2. **Review Code**:
   - Check the source file mentioned in error
   - Look for comments explaining behavior
   - Read commit history for context

3. **Test Systematically**:
   - Isolate the problem
   - Test with minimal example
   - Compare with working example

4. **Common Fixes**:
   - Restart the server
   - Clear browser cache
   - Reinstall dependencies
   - Check file permissions

---

## ✅ Health Check

Regular health checks to prevent issues:

```bash
# Daily
- Check server is running: curl http://localhost:3000/health
- Check disk space: df -h
- Check backups exist

# Weekly
- Review logs for errors
- Check memory usage
- Test all API endpoints

# Monthly
- Performance optimization review
- Security audit
- Backup verification
```

---

**Troubleshooting Guide v1.0**  
**Last Updated**: February 8, 2026  
**Status**: Complete ✅

For additional support, refer to ARCHITECTURE.md, API_DOCS.md, or review code comments in the implementation files.
