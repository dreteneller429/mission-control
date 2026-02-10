/**
 * Frontend Server for Mission Control V4
 * Serves static files and provides frontend routing
 */

const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.FRONTEND_PORT || 8081;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from src directory (disable directory listing)
app.use(express.static(path.join(__dirname, 'src'), { index: false }));

// Serve pages directory
app.use('/pages', express.static(path.join(__dirname, 'src/pages')));
app.use('/styles', express.static(path.join(__dirname, 'src/styles')));
app.use('/js', express.static(path.join(__dirname, 'src/js')));

// Main app route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/pages/index.html'));
});

// Fallback to index.html for SPA routing
app.get('/*', (req, res) => {
  // Check if it's a static file request
  if (req.path.match(/\.(js|css|html|json|png|jpg|gif|svg|ico|woff2?)$/)) {
    res.status(404).send('Not found');
  } else {
    // SPA fallback
    res.sendFile(path.join(__dirname, 'src/pages/index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`🎨 Mission Control V4 Frontend running on http://localhost:${PORT}`);
  console.log(`📄 Available pages:`);
  console.log(`   - Dashboard: http://localhost:${PORT}/pages/Dashboard.html`);
  console.log(`   - Workshop: http://localhost:${PORT}/pages/Workshop.html`);
  console.log(`   - Intelligence: http://localhost:${PORT}/pages/Intelligence.html`);
  console.log(`   - Agents: http://localhost:${PORT}/pages/Agents.html`);
  console.log(`   - Clients: http://localhost:${PORT}/pages/Clients.html`);
  console.log(`   - CronJobs: http://localhost:${PORT}/pages/CronJobs.html`);
  console.log(`   - DocuDigest: http://localhost:${PORT}/pages/DocuDigest.html`);
  console.log(`   - Documents: http://localhost:${PORT}/pages/Documents.html`);
  console.log(`   - Journal: http://localhost:${PORT}/pages/Journal.html`);
  console.log(`   - WeeklyRecaps: http://localhost:${PORT}/pages/WeeklyRecaps.html`);
  console.log(`   - APIUsage: http://localhost:${PORT}/pages/APIUsage.html`);
});
