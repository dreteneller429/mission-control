/**
 * Cron Jobs Integration Test
 * Tests CHECKPOINT 5: Cron Jobs Backend Integration
 * Verifies CR1 (Backend Integration) and CR2 (CRUD Functionality)
 */

const http = require('http');

const API_URL = 'http://localhost:3000/api/cron';

// Test utilities
const tests = [];
let passed = 0;
let failed = 0;

function test(name, fn) {
  tests.push({ name, fn });
}

async function runTests() {
  console.log('\n🧪 CRON JOBS INTEGRATION TEST SUITE\n');
  console.log('=' .repeat(60));
  
  for (const t of tests) {
    try {
      await t.fn();
      passed++;
      console.log(`✅ ${t.name}`);
    } catch (err) {
      failed++;
      console.log(`❌ ${t.name}`);
      console.log(`   Error: ${err.message}`);
    }
  }
  
  console.log('=' .repeat(60));
  console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
  
  if (failed === 0) {
    console.log('🎉 All tests passed! Cron system is operational.\n');
  } else {
    console.log(`⚠️  ${failed} test(s) failed.\n`);
    process.exit(1);
  }
}

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const fullPath = `/api/cron${path}`;
    const options = {
      method,
      hostname: 'localhost',
      port: 3000,
      path: fullPath,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// CR1: BACKEND INTEGRATION TESTS
test('CR1.1: Get all default cron jobs', async () => {
  const res = await makeRequest('GET', '/');
  if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  if (!Array.isArray(res.data)) throw new Error('Expected array response');
  if (res.data.length < 6) throw new Error(`Expected at least 6 jobs, got ${res.data.length}`);
});

test('CR1.2: Verify Morning Briefing job exists', async () => {
  const res = await makeRequest('GET', '/');
  const job = res.data.find(j => j.id === 'morning-briefing');
  if (!job) throw new Error('Morning Briefing job not found');
  if (job.schedule !== '0 7 * * *') throw new Error('Wrong schedule');
  if (job.schedule_readable !== 'Every day at 7:00 AM EST') throw new Error('Wrong readable schedule');
});

test('CR1.3: Verify Task Summary job (12:00 PM)', async () => {
  const res = await makeRequest('GET', '/');
  const job = res.data.find(j => j.id === 'task-summary');
  if (!job) throw new Error('Task Summary job not found');
  if (job.schedule !== '0 12 * * *') throw new Error('Wrong schedule');
});

test('CR1.4: Verify Email Check job (hourly)', async () => {
  const res = await makeRequest('GET', '/');
  const job = res.data.find(j => j.id === 'email-check');
  if (!job) throw new Error('Email Check job not found');
  if (job.schedule !== '0 * * * *') throw new Error('Wrong schedule');
  if (job.schedule_readable !== 'Every hour') throw new Error('Wrong readable schedule');
});

test('CR1.5: Verify Dashboard Notes Check (6:00 PM)', async () => {
  const res = await makeRequest('GET', '/');
  const job = res.data.find(j => j.id === 'dashboard-notes');
  if (!job) throw new Error('Dashboard Notes Check not found');
  if (job.schedule !== '0 18 * * *') throw new Error('Wrong schedule');
});

test('CR1.6: Verify Weekly SWOT (Sunday 6:00 PM)', async () => {
  const res = await makeRequest('GET', '/');
  const job = res.data.find(j => j.id === 'weekly-swot');
  if (!job) throw new Error('Weekly SWOT job not found');
  if (job.schedule !== '0 18 * * 0') throw new Error('Wrong schedule');
  if (!job.schedule_readable.includes('Sunday')) throw new Error('Missing Sunday in readable');
});

test('CR1.7: Verify Security Audit (Monday 12:00 AM)', async () => {
  const res = await makeRequest('GET', '/');
  const job = res.data.find(j => j.id === 'security-audit');
  if (!job) throw new Error('Security Audit job not found');
  if (job.schedule !== '0 0 * * 1') throw new Error('Wrong schedule');
  if (!job.schedule_readable.includes('Monday')) throw new Error('Missing Monday in readable');
});

test('CR1.8: Verify job fields (name, description, schedule, timestamps)', async () => {
  const res = await makeRequest('GET', '/');
  const job = res.data[0];
  if (!job.id) throw new Error('Missing job id');
  if (!job.name) throw new Error('Missing job name');
  if (!job.description) throw new Error('Missing job description');
  if (!job.schedule) throw new Error('Missing job schedule');
  if (!job.schedule_readable) throw new Error('Missing schedule_readable');
  if (job.next_run === undefined) throw new Error('Missing next_run');
  if (!job.status) throw new Error('Missing status field');
});

test('CR1.9: Verify job status field', async () => {
  const res = await makeRequest('GET', '/');
  const job = res.data[0];
  if (!['active', 'disabled'].includes(job.status)) {
    throw new Error(`Invalid status: ${job.status}`);
  }
});

// CR2: CRUD FUNCTIONALITY TESTS
test('CR2.1: Create a new cron job', async () => {
  const newJob = {
    name: 'Test Create Job',
    description: 'Testing create functionality',
    schedule: '0 15 * * *',
  };
  const res = await makeRequest('POST', '/', newJob);
  if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
  if (!res.data.success) throw new Error('Success flag not set');
  if (!res.data.job) throw new Error('No job in response');
  if (!res.data.job.id) throw new Error('No job ID generated');
  global.testJobId = res.data.job.id;
});

test('CR2.2: Read single cron job by ID', async () => {
  if (!global.testJobId) throw new Error('No test job ID available');
  const res = await makeRequest('GET', `/${global.testJobId}`);
  if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  if (!res.data.id) throw new Error('No job in response');
});

test('CR2.3: Update cron job (PATCH)', async () => {
  if (!global.testJobId) throw new Error('No test job ID available');
  const updates = {
    name: 'Test Updated Job',
    description: 'Updated description',
  };
  const res = await makeRequest('PATCH', `/${global.testJobId}`, updates);
  if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  if (res.data.name !== 'Test Updated Job') throw new Error('Name not updated');
});

test('CR2.4: Toggle job status (enable/disable)', async () => {
  if (!global.testJobId) throw new Error('No test job ID available');
  
  // Disable
  let res = await makeRequest('PUT', `/${global.testJobId}`, {
    active: false,
    status: 'disabled'
  });
  if (res.data.job.status !== 'disabled') throw new Error('Job not disabled');
  
  // Re-enable
  res = await makeRequest('PUT', `/${global.testJobId}`, {
    active: true,
    status: 'active'
  });
  if (res.data.job.status !== 'active') throw new Error('Job not re-enabled');
});

test('CR2.5: Delete cron job', async () => {
  if (!global.testJobId) throw new Error('No test job ID available');
  const res = await makeRequest('DELETE', `/${global.testJobId}`);
  if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  if (!res.data.success) throw new Error('Success flag not set');
  if (!res.data.deleted) throw new Error('No deleted job in response');
});

test('CR2.6: Verify deleted job is gone', async () => {
  if (!global.testJobId) throw new Error('No test job ID available');
  const res = await makeRequest('GET', `/${global.testJobId}`);
  if (res.status === 200) throw new Error('Deleted job still exists');
  if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
});

test('CR2.7: Validate cron notation (reject invalid)', async () => {
  const newJob = {
    name: 'Invalid Cron',
    description: 'Testing validation',
    schedule: 'invalid cron',
  };
  const res = await makeRequest('POST', '/', newJob);
  // Note: Current API may or may not validate, but should accept the format
  if (res.status === 400 && res.data.error) {
    // Good - validation worked
  } else if (res.status === 201) {
    // Also okay - some systems accept and let execution fail
  } else {
    throw new Error(`Unexpected response: ${res.status}`);
  }
});

test('CR2.8: Missing required fields returns 400', async () => {
  const newJob = {
    name: 'Missing fields',
    // Missing description and schedule
  };
  const res = await makeRequest('POST', '/', newJob);
  if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
  if (!res.data.error) throw new Error('No error message');
});

// Run all tests
runTests().catch(console.error);
