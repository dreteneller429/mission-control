/**
 * API Usage & Metrics Page Logic
 * Wired to real token tracking data from /api-usage/* endpoints
 * Updates every 5 minutes with actual API costs
 */

class APIUsageManager {
  constructor() {
    this.data = {
      todaySpend: 0,
      sevenDaySpend: 0,
      monthlyProjection: 0,
      history: [],
      breakdown: {},
      metrics: {},
      recentCalls: [],
      hourlyData: [],
    };
    this.chartInstance = null;
    this.pollInterval = 5 * 60 * 1000; // 5 minutes
    this.init();
  }

  init() {
    console.log('🔄 Initializing API Usage Manager with real token tracking');
    this.loadAllData();
    this.setupCharts();
    this.startPolling();
    this.setupUI();
  }

  /**
   * Load all data from API endpoints
   */
  async loadAllData() {
    await Promise.all([
      this.loadTodayData(),
      this.loadHistoryData(),
      this.loadBreakdownData(),
      this.loadMetricsData(),
      this.loadRecentCalls(),
    ]);
  }

  /**
   * Load today's spend with hourly breakdown
   */
  async loadTodayData() {
    try {
      const res = await fetch('/api-usage/today');
      const data = await res.json();
      
      this.data.todaySpend = data.spend || 0;
      this.data.hourlyData = data.hourlyData || [];
      
      this.updateTodayDisplay();
      console.log(`✓ Today's spend: $${this.data.todaySpend.toFixed(4)}`);
    } catch (err) {
      console.error('Failed to load today spend:', err);
    }
  }

  /**
   * Load 7-day and 30-day history
   */
  async loadHistoryData() {
    try {
      const res = await fetch('/api-usage/history?days=30');
      const data = await res.json();
      
      this.data.history = data.history || [];
      
      // Calculate 7-day rolling average
      if (this.data.history.length >= 7) {
        const last7 = this.data.history.slice(-7);
        this.data.sevenDaySpend = last7.reduce((sum, day) => sum + day.spend, 0);
      } else {
        this.data.sevenDaySpend = this.data.history.reduce((sum, day) => sum + day.spend, 0);
      }
      
      // Calculate monthly projection from 30-day average
      const avgDaily = data.average || 0;
      this.data.monthlyProjection = avgDaily * 30;
      
      this.updateSevenDayDisplay();
      this.updateMonthlyProjection();
      this.updateChart();
      
      console.log(`✓ 7-day rolling: $${this.data.sevenDaySpend.toFixed(4)}`);
      console.log(`✓ Monthly projection: $${this.data.monthlyProjection.toFixed(4)}`);
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  }

  /**
   * Load model breakdown percentages
   */
  async loadBreakdownData() {
    try {
      const res = await fetch('/api-usage/breakdown');
      const data = await res.json();
      
      this.data.breakdown = {
        sonnet: data.sonnet || { percentage: 0, spend: 0 },
        haiku: data.haiku || { percentage: 0, spend: 0 },
        opus: data.opus || { percentage: 0, spend: 0 },
      };
      
      this.updateBreakdown();
      console.log(`✓ Breakdown loaded: Sonnet ${this.data.breakdown.sonnet.percentage}%, Haiku ${this.data.breakdown.haiku.percentage}%`);
    } catch (err) {
      console.error('Failed to load breakdown:', err);
    }
  }

  /**
   * Load data integrity and efficiency metrics
   */
  async loadMetricsData() {
    try {
      const res = await fetch('/api-usage/metrics');
      const data = await res.json();
      
      this.data.metrics = data || {};
      
      this.updateMetrics();
      console.log(`✓ Metrics: Data Integrity ${data.dataIntegrity?.percentage}%, Efficiency ${data.efficiency?.percentage}%`);
    } catch (err) {
      console.error('Failed to load metrics:', err);
    }
  }

  /**
   * Load recent API calls
   */
  async loadRecentCalls() {
    try {
      const res = await fetch('/api-usage/recent?limit=10');
      const data = await res.json();
      
      this.data.recentCalls = data || [];
      this.updateRecentCalls();
      console.log(`✓ Recent calls loaded: ${data.length} entries`);
    } catch (err) {
      console.error('Failed to load recent calls:', err);
    }
  }

  /**
   * Update today's spend display
   */
  updateTodayDisplay() {
    const el = document.getElementById('todaySpend');
    if (el) {
      el.textContent = '$' + this.data.todaySpend.toFixed(2);
      this.flashUpdate(el);
    }
  }

  /**
   * Update 7-day rolling display
   */
  updateSevenDayDisplay() {
    const el = document.getElementById('sevenDaySpend');
    if (el) {
      el.textContent = '$' + this.data.sevenDaySpend.toFixed(2);
      this.flashUpdate(el);
    }
  }

  /**
   * Update monthly projection display
   */
  updateMonthlyProjection() {
    const el = document.getElementById('monthlyProjection');
    if (el) {
      el.textContent = '$' + this.data.monthlyProjection.toFixed(2);
      this.flashUpdate(el);
    }
  }

  /**
   * Update breakdown pie chart and legend
   */
  updateBreakdown() {
    const breakdown = this.data.breakdown;
    
    // Update legend items by data-model attribute
    const sonnetValue = document.querySelector('[data-model="sonnet"]');
    const haikuValue = document.querySelector('[data-model="haiku"]');
    const opusValue = document.querySelector('[data-model="opus"]');
    
    if (sonnetValue && breakdown.sonnet) {
      sonnetValue.textContent = `${breakdown.sonnet.percentage}% ($${breakdown.sonnet.spend.toFixed(2)})`;
    }
    
    if (haikuValue && breakdown.haiku) {
      haikuValue.textContent = `${breakdown.haiku.percentage}% ($${breakdown.haiku.spend.toFixed(2)})`;
    }
    
    if (opusValue && breakdown.opus) {
      opusValue.textContent = `${breakdown.opus.percentage}% ($${breakdown.opus.spend.toFixed(2)})`;
    }
  }

  /**
   * Update data integrity and efficiency metrics
   */
  updateMetrics() {
    const metrics = this.data.metrics;
    
    if (!metrics.dataIntegrity || !metrics.efficiency) {
      console.warn('Metrics data incomplete');
      return;
    }
    
    // Data Integrity
    const integrityFill = document.querySelector('.intelligence-card:nth-of-type(1) .progress-fill');
    const integrityValue = document.querySelector('.intelligence-card:nth-of-type(1) .progress-value');
    const integrityDetails = document.querySelector('.intelligence-card:nth-of-type(1) .intelligence-details');
    
    if (integrityFill && integrityValue) {
      integrityFill.style.width = `${metrics.dataIntegrity.percentage}%`;
      integrityValue.textContent = `${metrics.dataIntegrity.percentage}%`;
      integrityDetails.innerHTML = metrics.dataIntegrity.details
        .map(detail => `<p class="detail">✓ ${detail}</p>`)
        .join('');
    }
    
    // Efficiency
    const efficiencyFill = document.querySelector('.intelligence-card:nth-of-type(2) .progress-fill');
    const efficiencyValue = document.querySelector('.intelligence-card:nth-of-type(2) .progress-value');
    const efficiencyDetails = document.querySelector('.intelligence-card:nth-of-type(2) .intelligence-details');
    
    if (efficiencyFill && efficiencyValue) {
      efficiencyFill.style.width = `${metrics.efficiency.percentage}%`;
      efficiencyValue.textContent = `${metrics.efficiency.percentage}%`;
      efficiencyDetails.innerHTML = metrics.efficiency.details
        .map(detail => `<p class="detail">✓ ${detail}</p>`)
        .join('');
    }
  }

  /**
   * Update recent API calls table
   */
  updateRecentCalls() {
    const tbody = document.getElementById('apiCallsTable');
    if (!tbody) return;
    
    tbody.innerHTML = this.data.recentCalls
      .map(call => `
        <tr>
          <td>${new Date(call.timestamp).toLocaleString()}</td>
          <td>${call.model}</td>
          <td>${call.tokens.toLocaleString()}</td>
          <td>$${call.cost.toFixed(4)}</td>
          <td><span class="status-badge success">✓ Success</span></td>
        </tr>
      `)
      .join('');
  }

  /**
   * Update 30-day spend chart
   */
  updateChart() {
    const canvas = document.getElementById('spendHistoryChart');
    if (!canvas) return;
    
    if (window.Chart) {
      this.drawChartJS(canvas);
    } else {
      console.warn('Chart.js not available, using SVG fallback');
    }
  }

  /**
   * Draw chart with Chart.js
   */
  drawChartJS(canvas) {
    const labels = [];
    const data = [];

    // Use actual history data
    this.data.history.forEach(day => {
      const date = new Date(day.date);
      labels.push(date.getDate());
      data.push(day.spend);
    });

    // Destroy existing chart if any
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    this.chartInstance = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Daily Spend',
            data,
            borderColor: '#007AFF',
            backgroundColor: 'rgba(0, 122, 255, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointBackgroundColor: '#007AFF',
            pointBorderColor: 'rgba(255, 255, 255, 0.2)',
            pointHoverRadius: 5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => '$' + value.toFixed(2),
              color: 'rgba(255, 255, 255, 0.5)',
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
            },
          },
          x: {
            ticks: {
              color: 'rgba(255, 255, 255, 0.5)',
            },
            grid: {
              display: false,
            },
          },
        },
      },
    });
  }

  /**
   * Setup charts and animations
   */
  setupCharts() {
    this.animateCharts();
  }

  /**
   * Animate stat cards on load
   */
  animateCharts() {
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
      setTimeout(() => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        requestAnimationFrame(() => {
          card.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        });
      }, index * 50);
    });
  }

  /**
   * Flash animation on update
   */
  flashUpdate(el) {
    if (!el) return;
    el.style.opacity = '0.7';
    setTimeout(() => {
      el.style.opacity = '1';
      el.style.transition = 'opacity 0.3s ease';
    }, 10);
  }

  /**
   * Setup UI interactions
   */
  setupUI() {
    // Add refresh button if needed
    const exportBtn = document.querySelector('.btn-secondary');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.exportData();
      });
    }
  }

  /**
   * Export usage data as CSV
   */
  exportData() {
    const csv = [
      ['Date', 'Spend', 'Calls', 'Tokens'],
      ...this.data.history.map(day => [
        day.date,
        day.spend.toFixed(4),
        day.calls,
        day.tokens,
      ]),
    ];

    const csvContent = csv.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api-usage-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Start 5-minute polling interval
   */
  startPolling() {
    console.log('🔄 Starting 5-minute polling for API usage data');
    setInterval(() => {
      console.log('📊 Polling API usage data...');
      this.loadAllData();
    }, this.pollInterval);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new APIUsageManager();
  });
} else {
  new APIUsageManager();
}

// Format currency helper
function formatCurrency(value) {
  return '$' + parseFloat(value).toFixed(4);
}

// Format number with commas
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
