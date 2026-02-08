// Intelligence API
// Handles mock data and API endpoints for intelligence reports

// Mock Database
const intelligenceDatabase = {
  reports: [
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
  ],
};

/**
 * GET /api/intelligence
 * Returns list of all intelligence reports
 */
async function getIntelligenceList(req, res) {
  try {
    res.json(intelligenceDatabase.reports);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
}

/**
 * GET /api/intelligence/:id
 * Returns a single intelligence report with full details
 */
async function getIntelligenceReport(req, res) {
  try {
    const { id } = req.params;
    const report = intelligenceDatabase.reports.find(r => r.id === id);

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch report' });
  }
}

/**
 * POST /api/intelligence
 * Creates a new intelligence report
 */
async function createIntelligenceReport(req, res) {
  try {
    const { title, subtitle, category, breakdown, impact, strategy, author } = req.body;

    if (!title || !category) {
      return res.status(400).json({ error: 'Title and category are required' });
    }

    const newReport = {
      id: String(intelligenceDatabase.reports.length + 1),
      title,
      subtitle: subtitle || '',
      category,
      categoryColor: getCategoryColor(category),
      timestamp: 'now',
      author: author || 'System',
      breakdown: breakdown || '',
      impact: impact || '',
      strategy: strategy || '',
    };

    intelligenceDatabase.reports.unshift(newReport);
    res.status(201).json(newReport);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create report' });
  }
}

/**
 * POST /api/intelligence/:id/deploy
 * Deploys a strategy to the Workshop queue (creates a task)
 */
async function deployStrategy(req, res) {
  try {
    const { id } = req.params;
    const { strategy } = req.body;

    const report = intelligenceDatabase.reports.find(r => r.id === id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Create a task in Workshop queue
    const workshopTask = {
      id: `task-${Date.now()}`,
      title: `Deploy Strategy: ${report.title}`,
      description: strategy || report.strategy,
      source: `Intelligence Report #${id}`,
      priority: 'medium',
      status: 'queued',
      createdAt: new Date().toISOString(),
    };

    // In a real implementation, this would add to Workshop queue
    console.log('Strategy deployed to Workshop:', workshopTask);

    res.json({
      success: true,
      message: 'Strategy deployed to Workshop',
      taskId: workshopTask.id,
      report: report.title,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to deploy strategy' });
  }
}

/**
 * Helper function to get category color
 */
function getCategoryColor(category) {
  const colors = {
    BUSINESS_INTELLIGENCE: '#007AFF',
    PRODUCTIVITY_INTELLIGENCE: '#64D2FF',
    RESEARCH_INTELLIGENCE: '#BF5AF2',
    SOURCE_INTELLIGENCE: '#30D158',
    MARKET_INTELLIGENCE: '#FF9F0A',
  };
  return colors[category] || '#007AFF';
}

// Export for use in Express app or testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getIntelligenceList,
    getIntelligenceReport,
    createIntelligenceReport,
    deployStrategy,
    intelligenceDatabase,
  };
}

// Example Express integration:
// app.get('/api/intelligence', getIntelligenceList);
// app.get('/api/intelligence/:id', getIntelligenceReport);
// app.post('/api/intelligence', createIntelligenceReport);
// app.post('/api/intelligence/:id/deploy', deployStrategy);
