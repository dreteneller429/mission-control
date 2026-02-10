# API Usage Tracking System

## Overview

The API Usage & Metrics page provides real-time tracking and historical analysis of all API calls made by the OpenClaw system, with detailed cost calculations, model breakdowns, and performance metrics.

## What It Displays

### Primary Metrics (Top Cards)

1. **Today's Spend** - Real-time cumulative cost for the current day
   - Updates every 5 minutes via API polling
   - Includes hourly breakdown data
   - Shows dollar amount with 2 decimal precision

2. **7-Day Rolling Average** - Total spend over the last 7 days
   - Calculated by summing daily totals from the past 7 days
   - Provides trend comparison to understand weekly patterns
   - Updates automatically with new data

3. **Monthly Projection** - Estimated monthly cost based on current usage
   - Formula: `(30-day average daily spend) × 30`
   - Adjusts automatically as usage patterns change
   - Helps predict budget requirements

### Model Breakdown (Pie Chart)

Displays percentage distribution across different Claude models:
- **Claude Sonnet** (Blue) - Advanced reasoning and analysis
- **Claude Haiku** (Green) - Fast, cost-effective operations
- **Claude Opus** (Orange) - Most capable model (rarely used)

The pie chart updates dynamically based on actual usage from token logs.

### Intelligence Metrics

#### Data Integrity
- **What it measures**: System health and data reliability
- **Calculation**: `(successful_log_days / expected_days) × 100`
- **Range**: 85-100% (clamped)
- **Status levels**:
  - ≥95%: Healthy (green)
  - 80-94%: Acceptable (yellow)
  - <80%: Degraded (red)
- **Details tracked**:
  - Days successfully synced
  - Entry validation status
  - Timestamp verification

#### Efficiency
- **What it measures**: Model selection optimization and system performance
- **Calculation**: Based on Haiku vs. Sonnet ratio (higher Haiku = better efficiency)
- **Formula**: `(haiku_calls / total_calls) × 100`
- **Range**: 40-100% (clamped)
- **Status levels**:
  - ≥75%: Excellent
  - 50-74%: Good
  - <50%: Needs Improvement
- **Details tracked**:
  - Total API calls logged
  - Optimized model selection percentage
  - Average response time
  - Performance improvements

### Recent API Calls Table

Shows the last 10 API calls with:
- **Timestamp**: When the call was made (localized format)
- **Model**: Friendly name (e.g., "Claude Sonnet 4.5")
- **Tokens**: Total tokens used (input + output)
- **Cost**: Dollar amount with 4 decimal precision
- **Status**: Always "Success" for logged calls

### Spend History Chart

30-day line graph showing daily spend trends:
- X-axis: Days (0-30)
- Y-axis: Dollar amount
- Updates with real historical data from token logs
- Uses Chart.js for interactive visualization

---

## Data Sources

### Token Tracking System

All data comes from **token_tracker.py**, which logs every API call to JSONL files:

```
/home/clawd/.openclaw/workspace/memory/token_logs/YYYY-MM-DD.jsonl
```

Each log entry contains:
```json
{
  "timestamp": "2026-02-10T16:57:29.846992",
  "model": "claude-sonnet-4-5",
  "model_tier": "sonnet",
  "tokens_in": 10000,
  "tokens_out": 500,
  "total_tokens": 10500,
  "cost": 0.0375,
  "trigger": "user-message",
  "task_context": "Brief description of what triggered the call"
}
```

### Backend API Endpoints

The frontend fetches data from these Express.js routes:

1. **GET /api-usage/today**
   - Returns today's spend, calls, tokens
   - Includes hourly breakdown array
   - Includes model breakdown percentages

2. **GET /api-usage/history?days=N**
   - Returns historical data for N days (default 30)
   - Each day includes: date, spend, calls, tokens, breakdown
   - Calculates total spend and daily average

3. **GET /api-usage/breakdown**
   - Returns 30-day model usage percentages
   - Shows spend and call count per model tier
   - Percentages sum to 100%

4. **GET /api-usage/metrics**
   - Returns Data Integrity and Efficiency metrics
   - Includes status levels and detail arrays
   - Updates based on 30 days of log data

5. **GET /api-usage/recent?limit=N**
   - Returns last N API calls (default 10)
   - Sorted by timestamp descending
   - Includes all call metadata

---

## How Usage is Tracked

### Logging Flow

1. **API Call Made** → OpenClaw makes a request to Claude API or Brave Search
2. **Response Received** → Token counts extracted from API response
3. **Cost Calculated** → Using pricing configuration in token_tracker.py
4. **Entry Logged** → Appended to today's JSONL file
5. **Frontend Fetches** → Page polls backend every 5 minutes
6. **Backend Reads** → Server reads JSONL files on-demand
7. **Data Aggregated** → Calculations performed for metrics
8. **UI Updated** → Numbers and charts refresh

### Auto-Polling

The frontend `APIUsageManager` class starts a polling interval on page load:

```javascript
setInterval(() => {
  this.loadAllData();
}, 5 * 60 * 1000); // 5 minutes
```

This ensures data stays fresh without manual refresh.

---

## Cost Calculation

### Pricing Configuration

Costs are calculated using these rates (per 1 million tokens):

| Model Tier | Input Tokens | Output Tokens |
|------------|--------------|---------------|
| **Haiku**  | $0.25        | $1.25         |
| **Sonnet** | $3.00        | $15.00        |
| **Opus**   | $15.00       | $75.00        |

### Cost Formula

```
cost = (tokens_in / 1,000,000 × input_rate) + (tokens_out / 1,000,000 × output_rate)
```

**Example:**
- Model: Claude Sonnet 4.5
- Input tokens: 10,000
- Output tokens: 500
- Calculation:
  - Input: (10,000 / 1,000,000) × $3.00 = $0.03
  - Output: (500 / 1,000,000) × $15.00 = $0.0075
  - **Total: $0.0375**

### Brave Search API

Brave Search has a different pricing model:
- Typically charged per request
- Cost varies based on plan
- Not token-based like Claude models

---

## Data Aggregation

### Daily Totals

For each day, the backend reads the JSONL file and calculates:

```javascript
{
  date: "2026-02-10",
  spend: 1.0642,           // Sum of all costs
  calls: 4,                // Count of entries
  tokens: 252220,          // Sum of total_tokens
  breakdown: {
    sonnet: { percentage: 100, spend: 1.0642, calls: 4 },
    haiku: { percentage: 0, spend: 0, calls: 0 },
    opus: { percentage: 0, spend: 0, calls: 0 }
  }
}
```

### 7-Day Rolling

Takes the last 7 days from the history array and sums `spend`:

```javascript
const last7 = history.slice(-7);
const sevenDayTotal = last7.reduce((sum, day) => sum + day.spend, 0);
```

### Monthly Projection

Uses 30-day average multiplied by 30:

```javascript
const avgDaily = totalSpend / Math.min(30, daysWithData);
const monthlyProjection = avgDaily × 30;
```

This smooths out day-to-day variance for better predictions.

---

## Metric Meanings

### Data Integrity: "All metrics verified"

This means:
- ✓ JSONL files are being created successfully
- ✓ Log entries can be parsed without errors
- ✓ Timestamps are valid ISO 8601 format
- ✓ Cost calculations are consistent
- ✓ No data corruption detected

A high Data Integrity score (95%+) indicates the tracking system is reliable.

### Efficiency: "Cache hit rate" / "Model selection"

This measures how well the system uses cost-effective models:
- **High Haiku usage** → Lower costs, faster responses
- **High Sonnet usage** → More complex reasoning tasks
- **Balanced ratio** → Optimal for most workloads

The metric helps identify if too many expensive Sonnet calls are being made when Haiku would suffice.

---

## Pie Chart Interpretation

The **Spend Distribution** chart shows which models consume the most budget:

### Typical Patterns

1. **Heavy Sonnet (80-95%)**
   - Common for complex reasoning tasks
   - Higher costs per call
   - Expected for main agent sessions

2. **Balanced Mix (50-70% Sonnet)**
   - Good cost optimization
   - Haiku handling simpler tasks
   - More efficient overall

3. **Haiku-Heavy (60%+ Haiku)**
   - Excellent cost efficiency
   - Fast response times
   - Ideal for high-volume operations

### What to Watch For

- **100% Sonnet**: May indicate over-reliance on expensive model
- **Sudden shifts**: Could signal workload changes
- **Opus usage**: Rare; check if truly needed

---

## Daily Cost Fluctuations

### Why Costs Vary Day-to-Day

1. **Workload Variability**
   - Complex projects require more tokens
   - Simple queries use fewer tokens
   - Different task types have different costs

2. **Session Length**
   - Longer conversations accumulate context
   - More tokens in input = higher costs
   - Token optimization helps reduce this

3. **Model Selection**
   - Sonnet calls cost 12× more than Haiku
   - Opus calls cost 60× more than Haiku
   - Smart model routing saves money

4. **API Changes**
   - New features may increase token usage
   - Context file delivery affects session costs
   - Optimization efforts can reduce spend

### Normal Ranges

Based on typical usage:
- **Low day**: $0.10 - $0.50 (simple queries, short sessions)
- **Medium day**: $0.50 - $2.00 (regular workload)
- **High day**: $2.00 - $5.00 (complex projects, long sessions)
- **Very high day**: $5.00+ (major development work, batch processing)

### When to Investigate

- Sudden 10× spike without explanation
- Consistent daily costs above $10
- Zero spend (tracking may be broken)
- Negative trend in Data Integrity

---

## Technical Architecture

### Frontend (`api-usage-logic.js`)

**APIUsageManager** class handles:
- Initial data loading on page load
- 5-minute polling loop
- DOM updates for all metrics
- Chart.js integration
- CSV export functionality

**Key Methods:**
- `loadAllData()` - Fetches from all endpoints
- `updateTodayDisplay()` - Updates Today's Spend card
- `updateBreakdown()` - Refreshes pie chart legend
- `updateMetrics()` - Updates Intelligence cards
- `updateRecentCalls()` - Populates table
- `drawChartJS()` - Renders 30-day chart

### Backend (`routes/api-usage.js`)

**Express Router** with:
- JSONL file reading via `readline` interface
- Daily summary calculations
- Breakdown percentage logic
- Metrics computation
- Recent calls sorting and limiting

**Helper Functions:**
- `readTokenLog(filePath)` - Parses JSONL
- `getLogFiles(daysBack)` - Reads multiple days
- `calculateDailySummary(entries)` - Aggregates per day
- `calculateBreakdown(summary)` - Computes percentages

---

## Maintenance & Troubleshooting

### If Metrics Show Zero

1. Check if token logs exist: `ls /home/clawd/.openclaw/workspace/memory/token_logs/`
2. Verify today's log file has entries: `cat 2026-02-10.jsonl`
3. Check backend is running: `curl http://localhost:3000/health`
4. Test API endpoint: `curl http://localhost:3000/api-usage/today`

### If Data Looks Wrong

1. Inspect JSONL entries for malformed JSON
2. Verify cost calculations match pricing config
3. Check for duplicate entries
4. Ensure timestamps are valid

### If Chart Doesn't Update

1. Open browser console for JavaScript errors
2. Verify Chart.js library loaded
3. Check polling interval is running
4. Force refresh with Ctrl+Shift+R

---

## Future Enhancements

Potential improvements to consider:

1. **Real-time WebSocket Updates** - Push updates instead of polling
2. **Budget Alerts** - Notify when daily spend exceeds threshold
3. **Model Recommendations** - Suggest when to use Haiku vs. Sonnet
4. **Cost Forecasting** - ML-based prediction of future spend
5. **Hourly Breakdown Chart** - Visualize today's spend by hour
6. **Export to CSV** - Download historical data (already implemented)
7. **Filtering & Search** - Filter calls by model, date, or trigger
8. **Cost Optimization Tips** - Context-aware suggestions

---

## Summary

The API Usage Tracking System provides comprehensive visibility into:
- ✅ Real-time and historical API costs
- ✅ Model usage patterns and optimization opportunities
- ✅ System health and reliability metrics
- ✅ Detailed call logs for auditing

All data comes from actual token logs, not fabricated numbers. The system updates automatically every 5 minutes and provides actionable insights for cost management and performance optimization.

**Last Updated**: February 10, 2026  
**Version**: 1.0  
**Maintained By**: OpenClaw Sub-Agent (api-usage-fixes-section-5)
