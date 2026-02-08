const express = require('express');
const storage = require('../db/storage');

const router = express.Router();

// Initialize collection
storage.initCollection('api_usage', []);

// GET /api-usage/today - Today's spend
router.get('/today', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const allUsage = storage.findAll('api_usage');
    const todayUsage = allUsage.filter(item => item.date === today);
    
    const totalCost = todayUsage.reduce((sum, item) => sum + item.cost, 0);
    const totalRequests = todayUsage.reduce((sum, item) => sum + item.requests, 0);

    res.json({
      date: today,
      total_cost: totalCost.toFixed(2),
      total_requests: totalRequests,
      breakdown: todayUsage
    });
  } catch (error) {
    console.error('Error fetching today usage:', error);
    res.status(500).json({ error: 'Failed to fetch today usage' });
  }
});

// GET /api-usage/history - Last 30 days
router.get('/history', (req, res) => {
  try {
    const allUsage = storage.findAll('api_usage');
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const history = allUsage.filter(item => new Date(item.date) >= thirtyDaysAgo);
    
    // Group by date
    const grouped = {};
    history.forEach(item => {
      if (!grouped[item.date]) {
        grouped[item.date] = { cost: 0, requests: 0, services: [] };
      }
      grouped[item.date].cost += item.cost;
      grouped[item.date].requests += item.requests;
      grouped[item.date].services.push({
        service: item.service,
        model: item.model,
        cost: item.cost,
        requests: item.requests
      });
    });

    res.json({
      period: 'last-30-days',
      daily_breakdown: grouped,
      total_cost: Object.values(grouped).reduce((sum, day) => sum + day.cost, 0).toFixed(2),
      total_requests: Object.values(grouped).reduce((sum, day) => sum + day.requests, 0)
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch usage history' });
  }
});

// GET /api-usage/breakdown - By model/service
router.get('/breakdown', (req, res) => {
  try {
    const allUsage = storage.findAll('api_usage');
    
    const breakdown = {};
    allUsage.forEach(item => {
      const key = `${item.service}/${item.model}`;
      if (!breakdown[key]) {
        breakdown[key] = {
          service: item.service,
          model: item.model,
          total_cost: 0,
          total_requests: 0,
          usage_count: 0
        };
      }
      breakdown[key].total_cost += item.cost;
      breakdown[key].total_requests += item.requests;
      breakdown[key].usage_count += 1;
    });

    const sortedBreakdown = Object.values(breakdown).sort((a, b) => b.total_cost - a.total_cost);

    res.json({
      breakdown: sortedBreakdown,
      total_cost: sortedBreakdown.reduce((sum, item) => sum + item.total_cost, 0).toFixed(2),
      total_requests: sortedBreakdown.reduce((sum, item) => sum + item.total_requests, 0)
    });
  } catch (error) {
    console.error('Error fetching breakdown:', error);
    res.status(500).json({ error: 'Failed to fetch usage breakdown' });
  }
});

module.exports = router;
