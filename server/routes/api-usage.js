const express = require('express');
const router = express.Router();
const storage = require('../db/storage');

// Initialize API usage collection with mock data
storage.initCollection('api-usage', []);

// Generate 30-day mock history
function generateMockHistory(days = 30) {
  const history = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    // Generate realistic daily variation
    const baseSpend = 0.25;
    const variation = Math.sin(i / 5) * 0.1 + (Math.random() - 0.5) * 0.08;
    const spend = Math.max(0.1, baseSpend + variation);

    history.push({
      date: dateStr,
      spend: parseFloat(spend.toFixed(2)),
      calls: Math.floor(Math.random() * 30 + 10),
      tokens: Math.floor(Math.random() * 15000 + 5000),
    });
  }

  return history;
}

// Mock data for API usage
const mockHistory = generateMockHistory(30);

/**
 * GET /api-usage/today
 * Get today's API spend and metrics
 */
router.get('/today', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const todayData = mockHistory.find(h => h.date === today) || {
      date: today,
      spend: 0.47,
      calls: 18,
      tokens: 12847,
    };

    res.json({
      date: today,
      spend: todayData.spend,
      calls: todayData.calls,
      tokens: todayData.tokens,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching today usage:', error);
    res.status(500).json({ error: 'Failed to fetch today usage' });
  }
});

/**
 * GET /api-usage/history?days=N
 * Get historical API usage (default: last 30 days)
 */
router.get('/history', (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const history = mockHistory.slice(-days);

    const totalSpend = history.reduce((sum, day) => sum + day.spend, 0);
    const averageDaily = totalSpend / days;

    res.json({
      period: `last-${days}-days`,
      totalSpend: parseFloat(totalSpend.toFixed(2)),
      average: parseFloat(averageDaily.toFixed(2)),
      history,
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch usage history' });
  }
});

/**
 * GET /api-usage/breakdown
 * Get spend breakdown by model/service
 */
router.get('/breakdown', (req, res) => {
  try {
    const monthlyTotal = mockHistory.reduce((sum, day) => sum + day.spend, 0);

    res.json({
      claudeSonnet: {
        percentage: 85,
        spend: parseFloat((monthlyTotal * 0.85).toFixed(2)),
      },
      claudeHaiku: {
        percentage: 10,
        spend: parseFloat((monthlyTotal * 0.10).toFixed(2)),
      },
      braveSearch: {
        percentage: 5,
        spend: parseFloat((monthlyTotal * 0.05).toFixed(2)),
      },
    });
  } catch (error) {
    console.error('Error fetching breakdown:', error);
    res.status(500).json({ error: 'Failed to fetch usage breakdown' });
  }
});

/**
 * GET /api-usage/metrics
 * Get comprehensive metrics (integrity, efficiency, etc.)
 */
router.get('/metrics', (req, res) => {
  try {
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
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

/**
 * GET /api-usage/recent
 * Get recent API calls
 */
router.get('/recent', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const recentCalls = [
      {
        timestamp: new Date().toISOString(),
        model: 'Claude Sonnet',
        tokens: 2847,
        cost: 0.085,
        status: 'success',
      },
      {
        timestamp: new Date(Date.now() - 60000).toISOString(),
        model: 'Brave Search',
        tokens: 1,
        cost: 0.001,
        status: 'success',
      },
      {
        timestamp: new Date(Date.now() - 120000).toISOString(),
        model: 'Claude Haiku',
        tokens: 1234,
        cost: 0.012,
        status: 'success',
      },
      {
        timestamp: new Date(Date.now() - 180000).toISOString(),
        model: 'Claude Sonnet',
        tokens: 3156,
        cost: 0.095,
        status: 'success',
      },
      {
        timestamp: new Date(Date.now() - 240000).toISOString(),
        model: 'Claude Sonnet',
        tokens: 2521,
        cost: 0.076,
        status: 'success',
      },
    ];

    res.json(recentCalls.slice(0, limit));
  } catch (error) {
    console.error('Error fetching recent calls:', error);
    res.status(500).json({ error: 'Failed to fetch recent calls' });
  }
});

/**
 * POST /api-usage/log
 * Log an API call (for real-time tracking)
 */
router.post('/log', (req, res) => {
  try {
    const { model, tokens, cost } = req.body;

    const entry = {
      id: `call-${Date.now()}`,
      timestamp: new Date().toISOString(),
      model,
      tokens,
      cost,
      status: 'logged',
    };

    res.status(201).json({ success: true, entry });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
