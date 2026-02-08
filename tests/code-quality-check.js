#!/usr/bin/env node
/**
 * Code Quality Checker for Mission Control V4
 * Scans for potential issues, console errors, and optimization opportunities
 */

const fs = require('fs');
const path = require('path');

const issues = [];
const warnings = [];
const optimizations = [];

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.relative(process.cwd(), filePath);

    // Check for console statements (should be removed in production)
    const consoleMatches = content.match(/console\.(log|warn|error|debug)\(/g) || [];
    if (consoleMatches.length > 0) {
      warnings.push(`${fileName}: Found ${consoleMatches.length} console statements`);
    }

    // Check for undefined variables (basic check)
    if (content.includes('undefined') && !content.includes('typeof')) {
      warnings.push(`${fileName}: Potential undefined variable reference`);
    }

    // Check for deprecated methods
    if (content.includes('eval(')) {
      issues.push(`${fileName}: Uses eval() - SECURITY RISK`);
    }

    if (content.includes('document.write')) {
      warnings.push(`${fileName}: Uses document.write - avoid in modern code`);
    }

    // Check for global variables (non-const declarations)
    const globalVarMatches = content.match(/\bvar\s+\w+/g) || [];
    if (globalVarMatches.length > 5) {
      optimizations.push(`${fileName}: Uses 'var' ${globalVarMatches.length} times - consider 'const/let'`);
    }

    // Check for missing error handling
    const asyncMatches = content.match(/async\s+function|\.then\(|\.catch\(/g) || [];
    const catchMatches = content.match(/\.catch\(/g) || [];
    if (asyncMatches.length > catchMatches.length) {
      warnings.push(`${fileName}: May have async operations without error handling`);
    }

    // Check for large functions
    const functionMatches = content.match(/function\s+\w+\s*\([^)]*\)\s*\{/g) || [];
    for (const fn of functionMatches) {
      // This is a basic check - would need more sophisticated parsing for true accuracy
      const functionName = fn.match(/function\s+(\w+)/)?.[1];
      if (functionName) {
        const startIdx = content.indexOf(fn);
        let braceCount = 0;
        let foundBrace = false;
        let lineCount = 0;

        for (let i = startIdx; i < content.length && lineCount < 500; i++) {
          if (content[i] === '{') {
            braceCount++;
            foundBrace = true;
          } else if (content[i] === '}') {
            braceCount--;
            if (foundBrace && braceCount === 0) {
              break;
            }
          } else if (content[i] === '\n') {
            lineCount++;
          }
        }

        if (lineCount > 100) {
          optimizations.push(`${fileName}: Function "${functionName}" has ${lineCount}+ lines - consider breaking it up`);
        }
      }
    }

    // Check for missing const/let assignments
    if (content.match(/\s+=[^=]/g) && !content.includes('const ') && !content.includes('let ')) {
      warnings.push(`${fileName}: May have implicit global assignments`);
    }

  } catch (error) {
    // File doesn't exist or can't be read
  }
}

function scanDirectory(dir, ext = '.js') {
  try {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory() && !file.includes('node_modules')) {
        scanDirectory(filePath, ext);
      } else if (file.endsWith(ext)) {
        scanFile(filePath);
      }
    });
  } catch (error) {
    // Directory doesn't exist
  }
}

// Run scans
console.log('\n========================================');
console.log('🔍 Code Quality Analysis');
console.log('========================================\n');

console.log('Scanning server code...');
scanDirectory('server');

console.log('Scanning frontend code...');
scanDirectory('src/js', '.js');
scanDirectory('src/pages', '.html');

// Print results
console.log('\n========================================');
console.log('📊 Code Quality Report');
console.log('========================================\n');

if (issues.length > 0) {
  console.log(`❌ Critical Issues (${issues.length}):`);
  issues.forEach(issue => console.log(`   - ${issue}`));
} else {
  console.log('✅ No critical issues found');
}

console.log();

if (warnings.length > 0) {
  console.log(`⚠️  Warnings (${warnings.length}):`);
  warnings.forEach(warning => console.log(`   - ${warning}`));
} else {
  console.log('✅ No warnings found');
}

console.log();

if (optimizations.length > 0) {
  console.log(`💡 Optimization Suggestions (${optimizations.length}):`);
  optimizations.forEach(opt => console.log(`   - ${opt}`));
} else {
  console.log('✅ No optimization suggestions');
}

console.log('\n========================================');
console.log(`Total: ${issues.length} critical, ${warnings.length} warnings, ${optimizations.length} suggestions`);
console.log('========================================\n');
