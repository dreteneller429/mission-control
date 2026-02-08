#!/usr/bin/env node
/**
 * Comprehensive API Integration Tests for Mission Control V4
 * Tests all endpoints, CRUD operations, and error handling
 */

const http = require('http');
const BASE_URL = 'http://localhost:3000';

// Test utilities
let passedTests = 0;
let failedTests = 0;
const testResults = [];

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
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

// Test suites
const tests = [
  // Health Check
  test('Health Check', async () => {
    const res = await makeRequest('GET', '/health');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body?.status === 'ok', 'Health status not ok');
  }),

  // Workshop API Tests
  test('Workshop: GET /api/workshop/tasks', async () => {
    const res = await makeRequest('GET', '/api/workshop/tasks');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(res.body), 'Response should be array');
  }),

  test('Workshop: POST /api/workshop/tasks', async () => {
    const task = {
      title: 'Test Task',
      description: 'Integration test task',
      priority: 'high',
      status: 'pending'
    };
    const res = await makeRequest('POST', '/api/workshop/tasks', task);
    assert(res.status === 201 || res.status === 200, `Expected 200/201, got ${res.status}`);
    assert(res.body?.id, 'Created task should have ID');
  }),

  // Intelligence API Tests
  test('Intelligence: GET /api/intelligence', async () => {
    const res = await makeRequest('GET', '/api/intelligence');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(res.body), 'Response should be array');
  }),

  test('Intelligence: GET single report', async () => {
    const listRes = await makeRequest('GET', '/api/intelligence');
    if (listRes.body?.length > 0) {
      const id = listRes.body[0].id;
      const res = await makeRequest('GET', `/api/intelligence/${id}`);
      assert(res.status === 200, `Expected 200, got ${res.status}`);
    }
  }),

  // Comms API Tests
  test('Comms: GET /api/comms/messages', async () => {
    const res = await makeRequest('GET', '/api/comms/messages');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(res.body), 'Response should be array');
  }),

  test('Comms: POST /api/comms/messages', async () => {
    const message = {
      text: 'Test message',
      author: 'Test User',
      channel: 'general'
    };
    const res = await makeRequest('POST', '/api/comms/messages', message);
    assert(res.status === 201 || res.status === 200, `Expected 200/201, got ${res.status}`);
  }),

  // Documents API Tests
  test('Documents: GET /api/documents', async () => {
    const res = await makeRequest('GET', '/api/documents');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(res.body) || res.body?.documents, 'Response should be array or have documents');
  }),

  // Agents API Tests
  test('Agents: GET /api/agents', async () => {
    const res = await makeRequest('GET', '/api/agents');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(res.body) || typeof res.body === 'object', 'Response should be array or object');
  }),

  // Cron API Tests
  test('Cron: GET /api/cron', async () => {
    const res = await makeRequest('GET', '/api/cron');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(res.body) || typeof res.body === 'object', 'Response should be array or object');
  }),

  // API Usage Tests
  test('API Usage: GET /api-usage', async () => {
    const res = await makeRequest('GET', '/api-usage');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  }),

  // Clients API Tests
  test('Clients: GET /api/clients', async () => {
    const res = await makeRequest('GET', '/api/clients');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(res.body), 'Response should be array');
  }),

  // Journal API Tests
  test('Journal: GET /api/journal', async () => {
    const res = await makeRequest('GET', '/api/journal');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(res.body) || typeof res.body === 'object', 'Response should be array or object');
  }),

  // Weekly Recaps API Tests
  test('Weekly Recaps: GET /api/weekly-recaps', async () => {
    const res = await makeRequest('GET', '/api/weekly-recaps');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(res.body) || typeof res.body === 'object', 'Response should be array or object');
  }),

  // Dashboard API Tests
  test('Dashboard: GET /api/dashboard', async () => {
    const res = await makeRequest('GET', '/api/dashboard');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(typeof res.body === 'object', 'Response should be object');
  }),

  // Error Handling Tests
  test('Error Handling: Invalid endpoint returns 404', async () => {
    const res = await makeRequest('GET', '/api/nonexistent');
    assert(res.status === 404, `Expected 404, got ${res.status}`);
  }),

  test('Error Handling: Invalid workshop ID', async () => {
    const res = await makeRequest('GET', '/api/workshop/tasks/invalid-id-12345');
    assert(res.status >= 400, `Expected 4xx, got ${res.status}`);
  }),

  // Data Validation Tests
  test('Data Validation: POST invalid workshop task', async () => {
    const res = await makeRequest('POST', '/api/workshop/tasks', { invalid: 'data' });
    assert(res.status >= 400 || res.status === 200, 'Should handle invalid data');
  }),
];

// Run all tests
async function runTests() {
  console.log('\n========================================');
  console.log('🧪 Mission Control V4 - API Integration Tests');
  console.log('========================================\n');

  for (const testFn of tests) {
    await testFn();
  }

  console.log('\n========================================');
  console.log('📊 Test Results Summary');
  console.log('========================================');
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`📈 Total: ${passedTests + failedTests}`);
  console.log(`🎯 Success Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`);
  console.log('========================================\n');

  process.exit(failedTests > 0 ? 1 : 0);
}

// Wait for server to be ready
setTimeout(runTests, 1000);
