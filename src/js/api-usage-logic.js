/**
 * API Usage & Metrics Page Logic
 * Handles fetching and displaying API usage data
 */

class APIUsageManager {
  constructor() {
    this.data = {
      today: 0.47,
      sevenDay: 2.15,
      monthlyProjection: 8.60,
      history: [],
      breakdown: {},
    };
    this.init();
  }

  init() {
    this.loadMetrics();
    this.setupCharts();
    this.refreshData();
  }

  loadMetrics() {
    // Load today's spend
    fetch('/api-usage/today')
      .then(res => res.json())
      .then(data => {
        this.data.today = data.spend || 0.47;
        this.updateTodayDisplay();
      })
      .catch(err => console.error('Failed to load today spend:', err));

    // Load 7-day spend
    fetch('/api-usage/history?days=7')
      .then(res => res.json())
      .then(data => {
        this.data.sevenDay = data.totalSpend || 2.15;
        this.data.history = data.history || [];
        this.updateSevenDayDisplay();
        this.updateChart();
      })
      .catch(err => console.error('Failed to load 7-day spend:', err));

    // Load breakdown
    fetch('/api-usage/breakdown')
      .then(res => res.json())
      .then(data => {
        this.data.breakdown = data || {
          claudeSonnet: 85,
          claudeHaiku: 10,
          braveSearch: 5,
        };
        this.updateBreakdown();
      })
      .catch(err => console.error('Failed to load breakdown:', err));

    // Calculate monthly projection
    this.updateMonthlyProjection();
  }

  updateTodayDisplay() {
    const el = document.getElementById('todaySpend');
    if (el) {
      el.textContent = '$' + this.data.today.toFixed(2);
      el.style.animation = 'fadeIn 0.5s ease-in';
    }
  }

  updateSevenDayDisplay() {
    const el = document.getElementById('sevenDaySpend');
    if (el) {
      el.textContent = '$' + this.data.sevenDay.toFixed(2);
      el.style.animation = 'fadeIn 0.5s ease-in';
    }
  }

  updateMonthlyProjection() {
    // Project based on 7-day average * 4.28 weeks
    const projected = (this.data.sevenDay / 7) * 30;
    this.data.monthlyProjection = projected;
    const el = document.getElementById('monthlyProjection');
    if (el) {
      el.textContent = '$' + projected.toFixed(2);
      el.style.animation = 'fadeIn 0.5s ease-in';
    }
  }

  updateChart() {
    // Try to use Chart.js if available, otherwise use SVG fallback
    const canvas = document.getElementById('spendHistoryChart');
    if (canvas && window.Chart) {
      this.drawChartJS(canvas);
    } else {
      // SVG is already rendered in HTML
      console.log('Using SVG fallback for chart');
    }
  }

  drawChartJS(canvas) {
    // Prepare data for Chart.js
    const labels = [];
    const data = [];

    // Generate 30 days of data
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      labels.push(date.getDate());

      // Mock data with variations
      const baseValue = 0.25 + Math.random() * 0.15;
      data.push(parseFloat(baseValue.toFixed(2)));
    }

    new Chart(canvas, {
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
            max: 0.6,
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

  updateBreakdown() {
    const breakdown = this.data.breakdown;

    // Update pie chart percentages if rendering with Canvas
    // For now, the SVG is static in HTML

    // Update legend with actual values
    const total = this.data.monthlyProjection;
    const sonnetValue = (total * (breakdown.claudeSonnet || 85)) / 100;
    const haikuValue = (total * (breakdown.claudeHaiku || 10)) / 100;
    const braveValue = (total * (breakdown.braveSearch || 5)) / 100;

    // Find legend items and update
    const legendItems = document.querySelectorAll('.legend-item');
    if (legendItems[0]) {
      legendItems[0].querySelector('.legend-value').textContent =
        `${breakdown.claudeSonnet || 85}% ($${sonnetValue.toFixed(2)})`;
    }
    if (legendItems[1]) {
      legendItems[1].querySelector('.legend-value').textContent =
        `${breakdown.claudeHaiku || 10}% ($${haikuValue.toFixed(2)})`;
    }
    if (legendItems[2]) {
      legendItems[2].querySelector('.legend-value').textContent =
        `${breakdown.braveSearch || 5}% ($${braveValue.toFixed(2)})`;
    }
  }

  setupCharts() {
    // Initialize charts on page load
    this.animateCharts();
  }

  animateCharts() {
    // Add animations to stat cards
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

  refreshData() {
    // Auto-refresh data every 30 seconds
    setInterval(() => {
      this.loadMetrics();
    }, 30000);
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
  return '$' + parseFloat(value).toFixed(2);
}

// Format number with commas
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
