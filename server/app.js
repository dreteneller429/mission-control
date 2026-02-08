const express = require('express');
const cors = require('cors');
const path = require('path');

// Import middleware
const { loggingMiddleware } = require('./middleware/logging');
const { corsMiddleware } = require('./middleware/cors');

// Import routes
const workshopRoutes = require('./routes/workshop');
const intelligenceRoutes = require('./routes/intelligence');
const cronRoutes = require('./routes/cron');
const apiUsageRoutes = require('./routes/api-usage');
const agentsRoutes = require('./routes/agents');
const commsRoutes = require('./routes/comms');
const documentsRoutes = require('./routes/documents');
const journalRoutes = require('./routes/journal');
const clientsRoutes = require('./routes/clients');
const weeklyRecapsRoutes = require('./routes/weekly-recaps');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(loggingMiddleware);
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/workshop', workshopRoutes);
app.use('/api/intelligence', intelligenceRoutes);
app.use('/api/cron', cronRoutes);
app.use('/api-usage', apiUsageRoutes);
app.use('/api/agents', agentsRoutes);
app.use('/api/comms', commsRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/weekly-recaps', weeklyRecapsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Mission Control V4 API running on http://localhost:${PORT}`);
  console.log(`📊 Available endpoints:`);
  console.log(`   - /api/workshop/tasks`);
  console.log(`   - /api/intelligence`);
  console.log(`   - /api/cron`);
  console.log(`   - /api-usage`);
  console.log(`   - /api/agents`);
  console.log(`   - /api/comms/messages`);
  console.log(`   - /api/documents`);
  console.log(`   - /api/journal`);
  console.log(`   - /api/clients`);
  console.log(`   - /api/weekly-recaps`);
  console.log(`   - /api/dashboard`);
  console.log(`   - /health`);
});

module.exports = app;
