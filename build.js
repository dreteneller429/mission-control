#!/usr/bin/env node
/**
 * Build script for Mission Control V4
 * Prepares the application for production
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\n========================================');
console.log('🏗️  Building Mission Control V4');
console.log('========================================\n');

// 1. Create dist directory structure
console.log('📁 Creating dist directory structure...');
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir);
if (!fs.existsSync(path.join(distDir, 'server'))) fs.mkdirSync(path.join(distDir, 'server'));
if (!fs.existsSync(path.join(distDir, 'frontend'))) fs.mkdirSync(path.join(distDir, 'frontend'));
console.log('✅ Created dist directories\n');

// 2. Copy server files
console.log('📦 Copying backend server files...');
const serverSrc = path.join(__dirname, 'server');
const serverDest = path.join(distDir, 'server');
execSync(`cp -r ${serverSrc}/* ${serverDest}/`);
console.log('✅ Backend files copied\n');

// 3. Copy frontend files
console.log('📦 Copying frontend files...');
const frontendDest = path.join(distDir, 'frontend');
execSync(`cp -r ${path.join(__dirname, 'src')}/pages ${frontendDest}/`);
execSync(`cp -r ${path.join(__dirname, 'src')}/styles ${frontendDest}/`);
execSync(`cp -r ${path.join(__dirname, 'src')}/js ${frontendDest}/`);
execSync(`cp -r ${path.join(__dirname, 'public')} ${frontendDest}/`);
console.log('✅ Frontend files copied\n');

// 4. Create production config
console.log('⚙️  Creating production configuration...');
const prodEnv = `# Mission Control V4 - Production Environment

NODE_ENV=production
PORT=3000
FRONTEND_PORT=8081

# Repository paths
REPO_PATH=/mission-control
MEMORY_PATH=/mission-control/memory

# Database
DB_TYPE=file
DB_PATH=/mission-control/server/db/data

# API Configuration
API_URL=http://76.13.119.105:3000
FRONTEND_URL=http://76.13.119.105:8081

# Feature flags
ENABLE_REAL_TIME_UPDATES=true
ENABLE_AUTO_REFRESH=true
DEBUG=false
`;

fs.writeFileSync(path.join(distDir, '.env.production'), prodEnv);
console.log('✅ Production config created\n');

// 5. Create deployment checklist
console.log('📋 Creating deployment documentation...');
const deploymentChecklist = `# Production Deployment Checklist

## Pre-deployment
- [ ] All tests passing (npm test or test suites)
- [ ] Code reviewed
- [ ] Environment variables configured
- [ ] Database backup created
- [ ] CORS configured for production domain
- [ ] SSL certificates ready
- [ ] Firewall rules updated

## Backend Deployment
- [ ] Copy /dist/server to /mission-control/server
- [ ] Update .env with production variables
- [ ] Install dependencies: npm install
- [ ] Start backend: npm start
- [ ] Verify health check: curl http://localhost:3000/health
- [ ] Check logs for errors

## Frontend Deployment
- [ ] Copy /dist/frontend to /mission-control/frontend
- [ ] Start frontend server (nginx or Node.js)
- [ ] Verify assets loaded correctly
- [ ] Test responsive design (mobile, tablet, desktop)
- [ ] Verify API connectivity

## Verification
- [ ] All pages load without errors
- [ ] API endpoints respond correctly
- [ ] Database operations work
- [ ] Real-time features functional
- [ ] No console errors in browser
- [ ] Performance metrics acceptable

## Post-deployment
- [ ] Monitor logs for issues
- [ ] Verify all user workflows
- [ ] Check external integrations
- [ ] Document any deployment issues
- [ ] Create backup of production database
- [ ] Update status page/incident tracking
`;

fs.writeFileSync(path.join(distDir, 'DEPLOYMENT_CHECKLIST.md'), deploymentChecklist);
console.log('✅ Deployment documentation created\n');

// 6. Create build stats
const stats = {
  timestamp: new Date().toISOString(),
  version: '1.0.0',
  environment: 'production',
  files: {
    backend: fs.readdirSync(path.join(distDir, 'server')).length,
    frontend: fs.readdirSync(path.join(distDir, 'frontend')).length,
  },
  distSize: calculateDirSize(distDir),
};

fs.writeFileSync(path.join(distDir, 'BUILD_INFO.json'), JSON.stringify(stats, null, 2));

console.log('\n========================================');
console.log('✅ Build Complete');
console.log('========================================');
console.log(`📊 Build Statistics:`);
console.log(`   - Backend Files: ${stats.files.backend}`);
console.log(`   - Frontend Files: ${stats.files.frontend}`);
console.log(`   - Total Size: ${(stats.distSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`   - Output: ./dist`);
console.log('========================================\n');

function calculateDirSize(dir) {
  let size = 0;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      size += calculateDirSize(filePath);
    } else {
      size += stat.size;
    }
  }
  return size;
}
