/**
 * API Usage & Metrics API Routes
 * Handles API cost tracking and usage statistics
 */

const express = require('express');
const router = express.Router();

// Mock API usage data
const mockData = {
  today: {
    spend: 0.47,
    calls: 18,
    tokens: 12847,
    lastUpdated: new Date(),
  },
  history: generateMockHistory(30),
  breakdown: {
    claudeSonnet: 85,
    claudeHaiku: 10,
    braveSearch: 5,
  },
  recentCalls: [
    {
      timestamp: '2026-02-08 18:15:32',
      model: 'Claude Sonnet',
      tokens: 2847,
      cost: 0.085,
      status: 'success',
    },
    {
      timestamp: '2026-02-08 18:14:05',
      model: 'Brave Search',
      tokens: 1,
      cost: 0.001,
      status: 'success',
    },
    {
      timestamp: '2026-02-08 18:12:48',
      model: 'Claude Haiku',
      tokens: 1234,
      cost: 0.012,
      status: 'success',
    },
    {
      timestamp: '2026-02-08 18:11:22',
      model: 'Claude Sonnet',
      tokens: 3156,
      cost: 0.095,
      status: 'success',
    },
    {
      timestamp: '2026-02-08 18:10:01',
      model: 'Claude Sonnet',
      tokens: 2521,
      cost: 0.076,
      status: 'success',
    },
  ],
};

/**
 * GET /api-usage/today
 * Get today's API usage and spend
 */
router.get('/today', (req, res) => {
  res.json({
    spend: mockData.today.spend,
    calls: mockData.today.calls,
    tokens: mockData.today.tokens,
    lastUpdated: mockData.today.lastUpdated,
  });
});

/**
 * GET /api-usage/history?days=N
 * Get historical API usage data
 */
router.get('/history', (req, res) => {
  const days = parseInt(req.query.days) || 30;
  const history = mockData.history.slice(-days);

  const totalSpend = history.reduce((sum, day) => sum + day.spend, 0);

  res.json({
    period: `${days} days`,
    totalSpend,
    average: totalSpend / days,
    history,
  });
});

/**
 * GET /api-usage/breakdown
 * Get API usage breakdown by model/service
 */
router.get('/breakdown', (req, res) => {
  const total = mockData.today.spend * 30; // Monthly projection

  res.json({
    claudeSonnet: {
      percentage: mockData.breakdown.claudeSonnet,
      spend: (total * mockData.breakdown.claudeSonnet) / 100,
    },
    claudeHaiku: {
      percentage: mockData.breakdown.claudeHaiku,
      spend: (total * mockData.breakdown.claudeHaiku) / 100,
    },
    braveSearch: {
      percentage: mockData.breakdown.braveSearch,
      spend: (total * mockData.breakdown.braveSearch) / 100,
    },
  });
});

/**
 * GET /api-usage/metrics
 * Get comprehensive metrics (integrity, efficiency, etc.)
 */
router.get('/metrics', (req, res) => {
  res.json({
    dataIntegrity: {
      percentage: 98,
      status: 'healthy',
      details: [
        'Real-time sync active',
        'No data loss detected',
        'API responses valid',
      ],
    },
    efficiency: {
      percentage: 87,
      status: 'excellent',
      cacheHitRate: 87,
      averageResponseTime: 245,
      improvement: 13,
      details: [
        'Avg response time: 245ms',
        '13% improvement from last week',
        'Low latency maintained',
      ],
    },
  });
});

/**
 * GET /api-usage/recent
 * Get recent API calls
 */
router.get('/recent', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  res.json(mockData.recentCalls.slice(0, limit));
});

// Helper function to generate mock historical data
function generateMockHistory(days) {
  const history = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Generate realistic variation in daily spend
    const baseSpend = 0.25;
    const variation = Math.sin(i / 5) * 0.1 + (Math.random() - 0.5) * 0.08;
    const spend = Math.max(0.1, baseSpend + variation);

    history.push({
      date: date.toISOString().split('T')[0],
      spend: parseFloat(spend.toFixed(2)),
      calls: Math.floor(Math.random() * 30 + 10),
      tokens: Math.floor(Math.random() * 15000 + 5000),
    });
  }

  return history;
}

module.exports = router;
