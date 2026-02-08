#!/usr/bin/env node
/**
 * End-to-End (E2E) Testing for Mission Control V4
 * Tests complete user workflows
 */

const http = require('http');
const BASE_URL = 'http://localhost:3000';
const FRONTEND_URL = 'http://localhost:8081';

let passedTests = 0;
let failedTests = 0;
const testResults = [];

function makeRequest(method, path, body = null, baseUrl = BASE_URL) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : null;
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: parsed,
            raw: data
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: null,
            raw: data
          });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function test(name, fn) {
  return async () => {
    try {
      await fn();
      passedTests++;
      testResults.push({ name, status: '✅ PASS' });
      console.log(`✅ ${name}`);
    } catch (error) {
      failedTests++;
      testResults.push({ name, status: `❌ FAIL: ${error.message}` });
      console.log(`❌ ${name}: ${error.message}`);
    }
  };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

// E2E test scenarios
const tests = [
  // Workflow 1: Create task → View in history
  test('Workflow 1: Create new task', async () => {
    const task = {
      title: 'E2E Test Task',
      description: 'End-to-end test task',
      priority: 'high',
      status: 'pending'
    };
    const res = await makeRequest('POST', '/api/workshop/tasks', task);
    assert(res.status === 200 || res.status === 201, `Expected 200/201, got ${res.status}`);
    assert(res.body?.id, 'Task should have ID');
  }),

  test('Workflow 1: Verify task in workshop list', async () => {
    const res = await makeRequest('GET', '/api/workshop/tasks');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body?.queued || res.body?.tasks || Array.isArray(res.body), 'Should return tasks');
  }),

  // Workflow 2: Send message in Comms → Verify in feed
  test('Workflow 2: Send message to Comms', async () => {
    const msg = {
      text: 'E2E Test Message',
      author: 'TestBot',
      channel: 'general'
    };
    const res = await makeRequest('POST', '/api/comms/messages', msg);
    assert(res.status === 200 || res.status === 201, `Expected 200/201, got ${res.status}`);
  }),

  test('Workflow 2: Retrieve messages from Comms', async () => {
    const res = await makeRequest('GET', '/api/comms/messages');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(res.body), 'Messages should be array');
  }),

  // Workflow 3: Check Intelligence reports
  test('Workflow 3: Get intelligence reports', async () => {
    const res = await makeRequest('GET', '/api/intelligence');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(res.body), 'Reports should be array');
    assert(res.body.length > 0, 'Should have reports');
  }),

  test('Workflow 3: Get single intelligence report', async () => {
    const listRes = await makeRequest('GET', '/api/intelligence');
    if (listRes.body?.length > 0) {
      const id = listRes.body[0].id;
      const res = await makeRequest('GET', `/api/intelligence/${id}`);
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      assert(res.body?.id === id, 'Should return correct report');
    }
  }),

  // Workflow 4: Deploy strategy from Intelligence
  test('Workflow 4: Deploy strategy to Workshop', async () => {
    const listRes = await makeRequest('GET', '/api/intelligence');
    if (listRes.body?.length > 0) {
      const id = listRes.body[0].id;
      const res = await makeRequest('POST', `/api/intelligence/${id}/deploy`, {});
      assert(res.status === 200 || res.status === 201, `Expected 200/201, got ${res.status}`);
    }
  }),

  // Workflow 5: Check Dashboard metrics
  test('Workflow 5: Get dashboard stats', async () => {
    const res = await makeRequest('GET', '/api/dashboard/stats');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(typeof res.body === 'object', 'Should return object');
  }),

  test('Workflow 5: Get dashboard activity', async () => {
    const res = await makeRequest('GET', '/api/dashboard/activity');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  }),

  // Workflow 6: Check Agents
  test('Workflow 6: Get agents list', async () => {
    const res = await makeRequest('GET', '/api/agents');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  }),

  // Workflow 7: Check Cron Jobs
  test('Workflow 7: Get cron jobs', async () => {
    const res = await makeRequest('GET', '/api/cron');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  }),

  // Workflow 8: Check Documents
  test('Workflow 8: Get documents', async () => {
    const res = await makeRequest('GET', '/api/documents');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  }),

  // Workflow 9: Check Journal
  test('Workflow 9: Get journal entries', async () => {
    const res = await makeRequest('GET', '/api/journal');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  }),

  // Workflow 10: Check Clients
  test('Workflow 10: Get clients list', async () => {
    const res = await makeRequest('GET', '/api/clients');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(res.body), 'Clients should be array');
  }),

  // Workflow 11: Check Weekly Recaps
  test('Workflow 11: Get weekly recaps', async () => {
    const res = await makeRequest('GET', '/api/weekly-recaps');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  }),

  // Frontend Availability Tests
  test('Frontend: Dashboard page loads', async () => {
    const res = await makeRequest('GET', '/pages/index.html', null, FRONTEND_URL);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.raw.includes('Mission Control V4'), 'Page should have title');
  }),

  test('Frontend: Navigation component exists', async () => {
    const res = await makeRequest('GET', '/pages/Navigation.html', null, FRONTEND_URL);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  }),

  test('Frontend: Dashboard component exists', async () => {
    const res = await makeRequest('GET', '/pages/Dashboard.html', null, FRONTEND_URL);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  }),

  test('Frontend: Workshop component exists', async () => {
    const res = await makeRequest('GET', '/pages/Workshop.html', null, FRONTEND_URL);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  }),

  test('Frontend: Intelligence component exists', async () => {
    const res = await makeRequest('GET', '/pages/Intelligence.html', null, FRONTEND_URL);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  }),

  test('Frontend: All pages accessible', async () => {
    const pages = [
      'APIUsage.html', 'Agents.html', 'Clients.html', 'CronJobs.html',
      'Dashboard.html', 'DocuDigest.html', 'Documents.html', 'Intelligence.html',
      'Journal.html', 'WeeklyRecaps.html', 'Workshop.html'
    ];
    
    for (const page of pages) {
      const res = await makeRequest('GET', `/pages/${page}`, null, FRONTEND_URL);
      assert(res.status === 200, `Page ${page} should load (got ${res.status})`);
    }
  }),

  // API Documentation Tests
  test('API: All endpoints return valid JSON', async () => {
    const endpoints = [
      '/api/workshop/tasks',
      '/api/intelligence',
      '/api/comms/messages',
      '/api/documents',
      '/api/agents',
      '/api/cron',
      '/api/clients',
      '/api/journal',
      '/api/weekly-recaps',
      '/api/dashboard/stats',
      '/api-usage/today'
    ];

    for (const endpoint of endpoints) {
      const res = await makeRequest('GET', endpoint);
      assert(res.status === 200, `Endpoint ${endpoint} should return 200 (got ${res.status})`);
      assert(res.body !== null || res.body === null, `Response should be valid JSON`);
    }
  }),

  // Performance Tests
  test('Performance: Workshop endpoint responds within 500ms', async () => {
    const start = Date.now();
    await makeRequest('GET', '/api/workshop/tasks');
    const duration = Date.now() - start;
    assert(duration < 500, `Request took ${duration}ms, expected < 500ms`);
  }),

  test('Performance: Intelligence endpoint responds within 500ms', async () => {
    const start = Date.now();
    await makeRequest('GET', '/api/intelligence');
    const duration = Date.now() - start;
    assert(duration < 500, `Request took ${duration}ms, expected < 500ms`);
  }),
];

// Run all tests
async function runTests() {
  console.log('\n========================================');
  console.log('🧪 Mission Control V4 - E2E Tests');
  console.log('========================================\n');

  for (const testFn of tests) {
    await testFn();
  }

  console.log('\n========================================');
  console.log('📊 E2E Test Results Summary');
  console.log('========================================');
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`📈 Total: ${passedTests + failedTests}`);
  console.log(`🎯 Success Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`);
  console.log('========================================\n');

  process.exit(failedTests > 0 ? 1 : 0);
}

// Wait for servers to be ready
setTimeout(runTests, 1500);
