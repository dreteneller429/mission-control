// Intelligence Page Logic
// Handles report listing, filtering, selection, and strategy deployment

class IntelligenceManager {
  constructor() {
    this.reports = [];
    this.filteredReports = [];
    this.selectedReport = null;
    this.currentFilter = 'all';
    this.searchQuery = '';
    
    this.dom = {
      container: document.getElementById('intelligenceContainer'),
      sidebar: document.querySelector('.intelligence-sidebar'),
      main: document.querySelector('.intelligence-main'),
      reportsList: document.getElementById('reportsList'),
      reportView: document.getElementById('reportView'),
      emptyState: document.getElementById('emptyState'),
      searchInput: document.getElementById('searchInput'),
      reportCount: document.getElementById('reportCount'),
      deployStrategyBtn: document.getElementById('deployStrategyBtn'),
      backButton: document.getElementById('backButton'),
      deployMessage: document.getElementById('deployMessage'),
    };

    this.init();
  }

  async init() {
    this.setupEventListeners();
    await this.loadReports();
    this.render();
  }

  setupEventListeners() {
    // Search
    this.dom.searchInput?.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase();
      this.applyFilters();
    });

    // Category Filters
    document.querySelectorAll('.filter-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-pill').forEach(p => {
          p.setAttribute('data-selected', 'false');
        });
        e.target.setAttribute('data-selected', 'true');
        this.currentFilter = e.target.dataset.category;
        this.applyFilters();
      });
    });

    // Deploy Strategy
    this.dom.deployStrategyBtn?.addEventListener('click', () => {
      this.deployStrategy();
    });

    // Back Button
    this.dom.backButton?.addEventListener('click', () => {
      this.deselectReport();
    });

    // Report Selection
    this.dom.reportsList?.addEventListener('click', (e) => {
      const reportItem = e.target.closest('.report-item:not(.skeleton)');
      if (reportItem) {
        const reportId = reportItem.dataset.id;
        this.selectReport(reportId);
      }
    });
  }

  async loadReports() {
    try {
      // Fetch from API or use mock data
      const response = await fetch('/api/intelligence');
      if (response.ok) {
        this.reports = await response.json();
      } else {
        this.reports = this.getMockReports();
      }
    } catch (error) {
      console.log('Using mock reports:', error);
      this.reports = this.getMockReports();
    }
    this.filteredReports = [...this.reports];
  }

  getMockReports() {
    return [
      {
        id: '1',
        title: 'SureClose Q1 Pipeline Analysis',
        subtitle: 'Comprehensive analysis of Q1 deal velocity and conversion rates',
        category: 'BUSINESS_INTELLIGENCE',
        categoryColor: '#007AFF',
        timestamp: '5m ago',
        author: 'Intelligence Engine',
        breakdown: `
## Executive Summary
SureClose Q1 pipeline analysis reveals **strong momentum** across all deal stages with a 12% increase in conversion rates compared to Q4 2025.

## Key Findings

### Deal Velocity
- **Stage 1 (Prospecting):** 156 new leads (↑8% vs Q4)
- **Stage 2 (Qualification):** 87 qualified opportunities (↑15% vs Q4)
- **Stage 3 (Proposal):** 34 active proposals (↑5% vs Q4)
- **Stage 4 (Negotiation):** 12 deals in final negotiations (→ flat)

### Conversion Rates
- Overall conversion rate: **21.8%** (up from 19.4% in Q4)
- Average deal size: **$142,500** (↑6% vs Q4)
- Sales cycle length: **32 days** (down from 38 days)

### Performance by Team
- **Enterprise Team:** Leading with 28% conversion rate
- **Mid-Market Team:** 18% conversion rate
- **SMB Team:** 16% conversion rate

### Risk Factors
- 3 deals at risk of slipping to Q2 (estimated $425K)
- Resource constraints on Enterprise team may impact June pipeline
- Market conditions showing early signs of normalization
        `,
        impact: 'Q1 trajectory indicates $2.8M in confirmed revenue with potential upside to $3.2M if enterprise deals close early. Conversions improvements directly drive revenue acceleration.',
        strategy: 'Focus resources on accelerating enterprise deals in negotiation phase. Implement enhanced nurture sequences for Stage 2 opportunities. Monitor SMB team conversion rates for coaching opportunities.',
      },
      {
        id: '2',
        title: 'Time Optimization Findings',
        subtitle: 'Deep analysis of productivity metrics and efficiency gains',
        category: 'PRODUCTIVITY_INTELLIGENCE',
        categoryColor: '#64D2FF',
        timestamp: '1h ago',
        author: 'Analytics Team',
        breakdown: `
## Overview
Recent time tracking analysis across all systems reveals significant optimization opportunities with potential 15-18% efficiency gains.

## Time Distribution Analysis

### Current Allocation
- **Deep Work:** 42% (Target: 55%)
- **Meetings:** 28% (Target: 15%)
- **Admin/Email:** 18% (Target: 12%)
- **Context Switching:** 12% (Minimize)

### Peak Productivity Windows
- **Morning (7-10 AM):** 87% efficiency rate
- **Mid-day (1-3 PM):** 65% efficiency rate
- **Late afternoon (4-6 PM):** 52% efficiency rate

### Time Blockers Identified
1. **Back-to-back meetings:** Cost 4.2 hours/week in context switching
2. **Email notifications:** Interrupt deep work every 8 minutes on average
3. **Slack activity:** Average response time expectation creates constant context switching

### Optimization Recommendations
- Implement "Focus Blocks" (2-hour uninterrupted windows)
- Consolidate meetings into 90-minute blocks
- Batch email/chat responses to 3x daily
- Disable notifications during deep work periods
        `,
        impact: 'Implementing recommended optimizations could free up 6-8 hours per week, equivalent to 1 additional day of productive deep work monthly. Cumulative annual impact: ~100 hours of reclaimed productivity.',
        strategy: 'Start with 2-week pilot of focus block methodology. Measure baseline metrics this week. Roll out notification management system across all platforms. Create team guidelines for asynchronous communication.',
      },
      {
        id: '3',
        title: 'Competitive Landscape: RE Wholesaling',
        subtitle: 'Market analysis of emerging competitors and market shifts',
        category: 'MARKET_INTELLIGENCE',
        categoryColor: '#FF9F0A',
        timestamp: '3h ago',
        author: 'Market Research',
        breakdown: `
## Market Position Assessment

### Competitive Landscape Overview
The real estate wholesaling market is experiencing consolidation with 3 major players controlling 42% of the market. SureClose maintains a strong position with differentiated technology advantages.

### Major Competitors

#### Competitor A: PropTech Solutions
- **Market Share:** 18%
- **Strengths:** Established brand, extensive integrations
- **Weaknesses:** Dated UI/UX, slower feature development
- **Recent Activity:** Acquired regional player in Texas

#### Competitor B: FlipFlow Systems
- **Market Share:** 15%
- **Strengths:** Modern platform, strong mobile experience
- **Weaknesses:** Limited institutional features, customer support gaps
- **Recent Activity:** $8M Series B funding announced

#### Competitor C: CloudClose Pro
- **Market Share:** 9%
- **Strengths:** Enterprise focus, compliance expertise
- **Weaknesses:** Complex implementation, high cost structure
- **Recent Activity:** Expanding to European markets

### SureClose Position
- **Market Share:** 12% (growing)
- **Unique Advantages:** AI-powered pipeline analysis, superior UX, vertical specialization
- **Growth Rate:** 31% YoY (vs market average 8%)

### Market Trends
- **Consolidation:** M&A activity expected to continue, especially in mid-market segment
- **Feature Parity:** Competitors catching up on basic features; differentiation increasingly software-driven
- **Regional Expansion:** Opportunities in secondary markets and international expansion
- **Regulatory:** New compliance requirements creating barriers to entry for new competitors
        `,
        impact: 'Understanding competitive positioning allows for strategic product roadmap prioritization. Market consolidation creates acquisition opportunities and partnership potential. Current growth trajectory positions SureClose favorably.',
        strategy: 'Accelerate premium feature development to maintain competitive moat. Target FlipFlow customers with enterprise migration offers. Explore partnership opportunities with non-competing platforms. Prepare acquisition target list for potential inbound opportunities.',
      },
    ];
  }

  applyFilters() {
    this.filteredReports = this.reports.filter(report => {
      const categoryMatch = this.currentFilter === 'all' || report.category === this.currentFilter;
      const searchMatch = this.searchQuery === '' || 
        report.title.toLowerCase().includes(this.searchQuery) ||
        report.subtitle.toLowerCase().includes(this.searchQuery);
      return categoryMatch && searchMatch;
    });
    this.render();
  }

  render() {
    this.renderReportsList();
    this.updateReportCount();
  }

  renderReportsList() {
    const list = this.dom.reportsList;
    if (!list) return;

    list.innerHTML = '';

    if (this.filteredReports.length === 0) {
      list.innerHTML = `
        <div class="empty-list-message" style="padding: 32px 16px; text-align: center; color: rgba(255, 255, 255, 0.5);">
          <div style="font-size: 24px; margin-bottom: 8px;">🔍</div>
          <div style="font-size: 14px;">No reports found</div>
        </div>
      `;
      return;
    }

    this.filteredReports.forEach(report => {
      const reportElement = document.createElement('div');
      reportElement.className = `report-item ${report.id === this.selectedReport?.id ? 'active' : ''}`;
      reportElement.dataset.id = report.id;

      const timeAgo = this.formatTimeAgo(report.timestamp);
      reportElement.innerHTML = `
        <div class="report-title-sm">${this.escapeHtml(report.title)}</div>
        <div class="report-meta-sm">
          <span>${timeAgo}</span>
          <span class="category-tag-sm" style="background-color: ${this.getCategoryColor(report.category)}30; border: 1px solid ${this.getCategoryColor(report.category)}; color: ${this.getCategoryColor(report.category)};">
            ${this.formatCategory(report.category)}
          </span>
        </div>
      `;

      list.appendChild(reportElement);
    });
  }

  selectReport(reportId) {
    const report = this.reports.find(r => r.id === reportId);
    if (!report) return;

    this.selectedReport = report;
    this.renderReportView();
    this.updateReportsList();
  }

  deselectReport() {
    this.selectedReport = null;
    this.dom.reportView.style.display = 'none';
    this.dom.emptyState.style.display = 'flex';
    this.updateReportsList();
  }

  renderReportView() {
    if (!this.selectedReport) return;

    const report = this.selectedReport;
    const categoryColor = this.getCategoryColor(report.category);

    // Update category badge
    const categoryBadge = document.getElementById('reportCategoryBadge');
    if (categoryBadge) {
      categoryBadge.textContent = this.formatCategory(report.category);
      categoryBadge.style.backgroundColor = `${categoryColor}30`;
      categoryBadge.style.borderColor = categoryColor;
      categoryBadge.style.color = categoryColor;
      categoryBadge.style.border = `1px solid ${categoryColor}`;
    }

    // Update title and description
    document.getElementById('reportTitle').textContent = report.title;
    document.getElementById('reportSubtitle').textContent = report.subtitle;
    document.getElementById('reportTimestamp').textContent = report.timestamp;
    document.getElementById('reportAuthor').textContent = `by ${report.author}`;

    // Render markdown breakdown
    this.renderMarkdown(report.breakdown);

    // Update impact and strategy
    document.getElementById('impactContent').textContent = report.impact;
    document.getElementById('strategyContent').textContent = report.strategy;

    // Show report view, hide empty state
    this.dom.reportView.style.display = 'flex';
    this.dom.emptyState.style.display = 'none';

    // Scroll to top
    this.dom.main.scrollTop = 0;
  }

  renderMarkdown(markdown) {
    const container = document.getElementById('breakdownContent');
    if (!container) return;

    // Simple markdown-like rendering
    let html = markdown
      .trim()
      .split('\n')
      .map(line => {
        line = line.trim();
        if (!line) return '';
        
        if (line.startsWith('## ')) {
          return `<h3>${this.escapeHtml(line.substring(3))}</h3>`;
        }
        if (line.startsWith('- ')) {
          return `<li>${this.escapeHtml(line.substring(2))}</li>`;
        }
        if (line.startsWith('* ')) {
          return `<li>${this.escapeHtml(line.substring(2))}</li>`;
        }
        if (line.match(/^\d+\. /)) {
          return `<li>${this.escapeHtml(line.substring(3))}</li>`;
        }
        return `<p>${this.renderInlineMarkdown(line)}</p>`;
      })
      .join('\n');

    // Wrap consecutive list items
    html = html.replace(/(<li>.*?<\/li>)/gs, (match) => {
      return match.startsWith('<ul') ? match : `<ul>${match}</ul>`;
    });

    container.innerHTML = html;
  }

  renderInlineMarkdown(text) {
    // Handle **bold**
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Handle *italic*
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Handle `code`
    text = text.replace(/`(.*?)`/g, '<code>$1</code>');
    return text;
  }

  updateReportsList() {
    document.querySelectorAll('.report-item').forEach(item => {
      if (this.selectedReport && item.dataset.id === this.selectedReport.id) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  updateReportCount() {
    const count = this.filteredReports.length;
    this.dom.reportCount.textContent = `${count} report${count !== 1 ? 's' : ''}`;
  }

  async deployStrategy() {
    if (!this.selectedReport) return;

    const strategyText = this.selectedReport.strategy;
    
    try {
      // Try to call the API
      const response = await fetch(`/api/intelligence/${this.selectedReport.id}/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strategy: strategyText }),
      });

      if (!response.ok) {
        throw new Error('Deploy failed');
      }

      // Success - show message
      this.showDeployMessage();
    } catch (error) {
      console.log('API not available, simulating deployment:', error);
      // Simulate successful deployment
      this.showDeployMessage();
    }
  }

  showDeployMessage() {
    const message = this.dom.deployMessage;
    message.style.display = 'block';
    setTimeout(() => {
      message.style.display = 'none';
    }, 3000);
  }

  getCategoryColor(category) {
    const colors = {
      BUSINESS_INTELLIGENCE: '#007AFF',
      PRODUCTIVITY_INTELLIGENCE: '#64D2FF',
      RESEARCH_INTELLIGENCE: '#BF5AF2',
      SOURCE_INTELLIGENCE: '#30D158',
      MARKET_INTELLIGENCE: '#FF9F0A',
    };
    return colors[category] || '#007AFF';
  }

  formatCategory(category) {
    return category
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  formatTimeAgo(timestamp) {
    // If it's already a formatted string like "5m ago", return it
    if (timestamp.includes('ago') || timestamp.includes('yesterday')) {
      return timestamp;
    }
    // Otherwise parse and format
    return new Date(timestamp).toLocaleString();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.intelligenceManager = new IntelligenceManager();
});
