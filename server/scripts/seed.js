#!/usr/bin/env node
/**
 * Database Seeding Script
 * Initialize database with default data
 */

require('dotenv').config();
const storage = require('../db/storage');

console.log('🌱 Seeding Mission Control V4 Database...\n');

try {
  // Initialize all collections with default data
  console.log('✓ Initializing Tasks...');
  storage.initCollection('tasks', [
    {
      id: 'task-phase1-ui',
      title: 'Phase 1: Glassmorphism Framework',
      description: 'Design and implement the complete glassmorphism CSS framework with theme variables, glass effects, and component library.',
      tags: ['building', 'ui'],
      priority: 'critical',
      progress: 100,
      status: 'completed',
      created_at: '2026-02-08T18:00:00Z',
      started_at: '2026-02-08T18:00:00Z',
      completed_at: '2026-02-08T18:30:00Z',
      activity_log: [
        { timestamp: '18:00 EST', event: 'Task created by User' },
        { timestamp: '18:05 EST', event: 'Task started by DAVE' },
        { timestamp: '18:30 EST', event: 'Task completed' }
      ]
    },
    {
      id: 'task-phase2-nav',
      title: 'Phase 2: Navigation + Dashboard',
      description: 'Build frosted glass sidebar with DAVE status, main dashboard with stat cards, and responsive navigation.',
      tags: ['building', 'ui'],
      priority: 'high',
      progress: 65,
      status: 'active',
      created_at: '2026-02-08T18:00:00Z',
      started_at: '2026-02-08T18:35:00Z',
      completed_at: null,
      activity_log: [
        { timestamp: '18:35 EST', event: 'Task started by DAVE' },
        { timestamp: '18:50 EST', event: 'Progress updated to 65%' }
      ]
    }
  ]);

  console.log('✓ Initializing Clients...');
  storage.initCollection('clients', [
    {
      id: 'client-8unit',
      name: '8-Unit Portfolio',
      type: 'Real Estate',
      status: 'active',
      deals: 8,
      value: '$2.4M',
      roi: '12.5%',
      manager: 'Team A',
      created_at: '2025-06-15T10:00:00Z'
    },
    {
      id: 'client-7unit',
      name: '7-Unit Portfolio',
      type: 'Real Estate',
      status: 'active',
      deals: 7,
      value: '$1.8M',
      roi: '11.2%',
      manager: 'Team B',
      created_at: '2025-07-20T10:00:00Z'
    },
    {
      id: 'client-159unit',
      name: '159-Unit Development',
      type: 'Real Estate',
      status: 'planning',
      deals: 159,
      value: '$45.8M',
      roi: '15.3%',
      manager: 'Executive Team',
      created_at: '2025-09-01T10:00:00Z'
    },
    {
      id: 'client-mario',
      name: 'Mario Properties',
      type: 'Real Estate',
      status: 'active',
      deals: 12,
      value: '$3.2M',
      roi: '10.8%',
      manager: 'Mario',
      created_at: '2025-08-10T10:00:00Z'
    },
    {
      id: 'client-home-warranty',
      name: 'Home Warranty Program',
      type: 'Service',
      status: 'active',
      deals: 450,
      value: '$1.2M',
      roi: '18.5%',
      manager: 'Operations',
      created_at: '2025-10-05T10:00:00Z'
    },
    {
      id: 'client-tanner',
      name: 'Tanner Ventures',
      type: 'Partnership',
      status: 'active',
      deals: 8,
      value: '$2.0M',
      roi: '9.5%',
      manager: 'Tanner',
      created_at: '2025-11-12T10:00:00Z'
    }
  ]);

  console.log('✓ Initializing Cron Jobs...');
  storage.initCollection('cron', [
    {
      id: 'cron-1',
      name: 'Daily Status Check',
      description: 'Check system status and health',
      schedule: '0 6 * * *',
      schedule_readable: 'Every day at 6:00 AM',
      status: 'active',
      last_run: '2026-02-08T10:00:00Z',
      next_run: '2026-02-09T06:00:00Z',
      last_result: 'success',
      created_at: '2026-01-15T10:00:00Z'
    },
    {
      id: 'cron-2',
      name: 'Activity Feed Update',
      description: 'Fetch and log recent activities',
      schedule: '*/30 * * * *',
      schedule_readable: 'Every 30 minutes',
      status: 'active',
      last_run: '2026-02-08T18:10:00Z',
      next_run: '2026-02-08T18:40:00Z',
      last_result: 'success',
      created_at: '2026-01-20T10:00:00Z'
    },
    {
      id: 'cron-3',
      name: 'Weekly Recap Generation',
      description: 'Generate weekly recap and summary',
      schedule: '0 0 * * 0',
      schedule_readable: 'Every Sunday at midnight',
      status: 'active',
      last_run: '2026-02-01T00:00:00Z',
      next_run: '2026-02-08T00:00:00Z',
      last_result: 'success',
      created_at: '2026-01-10T10:00:00Z'
    }
  ]);

  console.log('✓ Initializing Agents...');
  storage.initCollection('agents', [
    {
      id: 'dave-main',
      name: 'DAVE',
      role: 'Primary Agent',
      status: 'online',
      description: 'Main autonomous agent',
      uptime: '24d 12h',
      lastActivity: '2026-02-08T18:10:30Z',
      capabilities: ['planning', 'execution', 'analysis'],
      health: 'optimal'
    }
  ]);

  console.log('✓ Initializing Intelligence Reports...');
  storage.initCollection('intelligence', [
    {
      id: 'intel-1',
      title: 'Market Expansion Strategy Q1 2026',
      description: 'Comprehensive market analysis and expansion plan',
      status: 'active',
      priority: 'high',
      created_at: '2026-02-01T10:00:00Z',
      strategies: [
        {
          id: 'strat-1',
          name: 'Digital Marketing Push',
          description: 'Increase digital presence',
          tasks: 3,
          effort: 'high'
        }
      ]
    }
  ]);

  console.log('✓ Initializing Documents...');
  storage.initCollection('documents', [
    {
      id: 'doc-1',
      title: 'DESIGN_SYSTEM.md',
      type: 'markdown',
      created_at: '2026-02-08T18:09:00Z',
      updated_at: '2026-02-08T18:09:00Z',
      tags: ['design', 'system']
    }
  ]);

  console.log('✓ Initializing Activity Feed...');
  storage.initCollection('activity', [
    {
      id: '1',
      action: 'Commit',
      description: 'feat(design): iOS Liquid Glass Design System',
      source: 'DAVE',
      timestamp: '2026-02-08T18:10:30Z',
      color: '#64D2FF'
    }
  ]);

  console.log('✓ Initializing Weekly Recaps...');
  storage.initCollection('weekly-recaps', [
    {
      id: 'recap-w6-2026',
      week: 'Week 6 (Feb 1-7, 2026)',
      summary: 'Major progress on Mission Control V4',
      tasks_completed: 4,
      highlights: ['Completed Glassmorphism CSS Framework'],
      metrics: {
        completion_rate: '85%',
        productivity: 'high',
        uptime: '99.8%'
      },
      created_at: '2026-02-07T20:00:00Z'
    }
  ]);

  console.log('✓ Initializing Messages...');
  storage.initCollection('messages', [
    {
      id: 'msg-1',
      sender: 'User',
      recipient: 'DAVE',
      message: 'Start Phase 2 development',
      timestamp: '2026-02-08T18:00:00Z',
      channel: 'telegram',
      read: true
    }
  ]);

  console.log('✓ Initializing API Usage...');
  storage.initCollection('api-usage', [
    {
      id: 'usage-1',
      date: '2026-02-08',
      provider: 'OpenAI',
      model: 'claude-haiku',
      tokens_used: 15000,
      cost: '$0.75'
    }
  ]);

  console.log('\n✅ Database seeded successfully!');
  console.log('\n📁 Collections initialized:');
  console.log('   • Tasks');
  console.log('   • Clients');
  console.log('   • Cron Jobs');
  console.log('   • Agents');
  console.log('   • Intelligence Reports');
  console.log('   • Documents');
  console.log('   • Activity Feed');
  console.log('   • Weekly Recaps');
  console.log('   • Messages');
  console.log('   • API Usage');
  console.log('\n🚀 Ready to start server with: npm start');

} catch (error) {
  console.error('❌ Seeding failed:', error.message);
  process.exit(1);
}
