const { v4: uuidv4 } = require('uuid');

const generateInitialData = () => {
  const now = new Date().toISOString();
  const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
  const oneDayAgo = new Date(Date.now() - 86400000).toISOString();

  return {
    tasks: [
      {
        id: uuidv4(),
        title: 'Setup project infrastructure',
        description: 'Initialize all necessary systems and configurations',
        tags: ['infrastructure', 'setup', 'priority-high'],
        priority: 'high',
        progress: 75,
        status: 'active',
        created_at: oneDayAgo,
        started_at: oneHourAgo,
        completed_at: null,
        activity_log: [
          { timestamp: oneDayAgo, action: 'created', user: 'system' },
          { timestamp: oneHourAgo, action: 'started', user: 'agent-main' }
        ]
      },
      {
        id: uuidv4(),
        title: 'API Documentation',
        description: 'Create comprehensive API documentation',
        tags: ['documentation', 'api'],
        priority: 'medium',
        progress: 30,
        status: 'pending',
        created_at: oneDayAgo,
        started_at: null,
        completed_at: null,
        activity_log: [{ timestamp: oneDayAgo, action: 'created', user: 'system' }]
      }
    ],

    intelligence: [
      {
        id: uuidv4(),
        title: 'Q1 Strategy Analysis',
        category: 'strategic',
        content: 'Detailed analysis of Q1 market trends and opportunities',
        impact_summary: 'Could increase efficiency by 40%',
        strategy_summary: 'Implement new workflow automation',
        created_at: oneDayAgo,
        source: 'market-analysis',
        deployed: false
      }
    ],

    cron_jobs: [
      {
        id: uuidv4(),
        name: 'Daily Sync',
        description: 'Synchronize data across all systems',
        schedule: '0 0 * * *',
        next_run: new Date(Date.now() + 86400000).toISOString(),
        last_run: oneDayAgo,
        status: 'active'
      },
      {
        id: uuidv4(),
        name: 'Weekly Report',
        description: 'Generate weekly recap report',
        schedule: '0 9 * * 1',
        next_run: new Date(Date.now() + 604800000).toISOString(),
        last_run: null,
        status: 'active'
      }
    ],

    api_usage: [
      {
        id: uuidv4(),
        date: new Date().toISOString().split('T')[0],
        service: 'openai',
        model: 'gpt-4',
        cost: 2.45,
        requests: 15,
        timestamp: now
      },
      {
        id: uuidv4(),
        date: new Date().toISOString().split('T')[0],
        service: 'anthropic',
        model: 'claude-haiku',
        cost: 0.89,
        requests: 42,
        timestamp: now
      }
    ],

    agents: [
      {
        id: 'dave-001',
        name: 'DAVE',
        role: 'COO to David Himself',
        title: 'Digital Autonomous Virtual Executive',
        status: 'active',
        specialty: 'System Orchestration, Task Management, Accountability',
        description: 'Primary AI executive assistant. Manages sub-agents, coordinates projects, monitors systems, and keeps David accountable.',
        capabilities: ['Task delegation', 'Code review', 'Research', 'System monitoring', 'Proactive scheduling'],
        created: '2026-02-01',
        current_task: 'Mission Control V4 Fix Sprint',
        avatar: '🥷🏼'
      }
    ],

    // FIX 3C: No fake messages - only real activity from actual operations
    messages: [],

    documents: [
      {
        id: uuidv4(),
        title: 'API Implementation Guide',
        date: oneDayAgo,
        category: 'technical',
        content: 'Complete guide for implementing REST API endpoints'
      },
      {
        id: uuidv4(),
        title: 'Q1 Planning Document',
        date: oneDayAgo,
        category: 'planning',
        content: 'Strategic planning document for Q1 initiatives'
      }
    ],

    journal: [
      {
        id: uuidv4(),
        date: new Date().toISOString().split('T')[0],
        entries: [
          {
            timestamp: now,
            entry: 'Started API backend implementation',
            tags: ['development', 'api']
          }
        ]
      }
    ],

    clients: [
      {
        id: uuidv4(),
        name: 'Acme Corp',
        company: 'Acme Corporation',
        status: 'active',
        mrr: 5000,
        last_activity: now,
        next_action: 'Schedule Q1 review'
      },
      {
        id: uuidv4(),
        name: 'Tech Startup Inc',
        company: 'Tech Startup Inc',
        status: 'active',
        mrr: 2500,
        last_activity: oneHourAgo,
        next_action: 'Follow up on feature request'
      }
    ],

    weekly_recaps: [
      {
        id: uuidv4(),
        week: '2026-W06',
        start_date: new Date(2026, 1, 2).toISOString(),
        end_date: new Date(2026, 1, 8).toISOString(),
        summary: 'Productive week with focus on API development',
        metrics: {
          tasks_completed: 5,
          tasks_created: 8,
          focus_time_hours: 32,
          intelligence_deployed: 2
        }
      }
    ]
  };
};

module.exports = { generateInitialData };
