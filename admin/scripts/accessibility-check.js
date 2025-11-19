#!/usr/bin/env node

/**
 * Accessibility Testing Script
 * Automated WCAG 2.1 AA compliance testing for CI/CD
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  // Test files to run
  testFiles: [
    'src/**/*.a11y.test.tsx',
    'src/**/*.accessibility.test.tsx'
  ],
  
  // Accessibility standards
  standards: {
    wcag2a: true,
    wcag2aa: true,
    wcag21aa: true
  },
  
  // Coverage thresholds
  coverage: {
    components: 90, // 90% of components must have accessibility tests
    violations: 0,  // Zero accessibility violations allowed
  },
  
  // Report configuration
  reports: {
    html: true,
    json: true,
    junit: true,
    console: true
  }
};

/**
 * Run accessibility tests
 */
async function runAccessibilityTests() {
  console.log('🔍 Running accessibility tests...\n');
  
  try {
    // Run accessibility-specific tests
    await runCommand('npm run test:a11y');
    
    // Run ESLint accessibility rules
    await runESLintA11yChecks();
    
    // Generate accessibility report
    await generateA11yReport();
    
    console.log('✅ All accessibility tests passed!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Accessibility tests failed:', error.message);
    process.exit(1);
  }
}

/**
 * Run ESLint accessibility checks
 */
async function runESLintA11yChecks() {
  console.log('🔧 Running ESLint accessibility checks...');
  
  const eslintCommand = [
    'npx eslint',
    '--ext .tsx,.ts',
    'src/',
    '--config .eslintrc.json',
    '--format json',
    '--output-file reports/eslint-a11y.json'
  ].join(' ');
  
  try {
    await runCommand(eslintCommand);
    console.log('✅ ESLint accessibility checks passed');
  } catch (error) {
    // Parse ESLint output to show accessibility-specific errors
    const eslintReport = JSON.parse(fs.readFileSync('reports/eslint-a11y.json', 'utf8'));
    const a11yErrors = eslintReport
      .flatMap(file => file.messages)
      .filter(message => message.ruleId && message.ruleId.startsWith('jsx-a11y/'));
    
    if (a11yErrors.length > 0) {
      console.error('\n❌ Accessibility ESLint errors found:');
      a11yErrors.forEach(error => {
        console.error(`  ${error.ruleId}: ${error.message} (${error.line}:${error.column})`);
      });
      throw new Error(`Found ${a11yErrors.length} accessibility ESLint errors`);
    }
  }
}

/**
 * Generate comprehensive accessibility report
 */
async function generateA11yReport() {
  console.log('📊 Generating accessibility report...');
  
  // Ensure reports directory exists
  if (!fs.existsSync('reports')) {
    fs.mkdirSync('reports', { recursive: true });
  }
  
  const report = {
    timestamp: new Date().toISOString(),
    standards: config.standards,
    summary: {
      totalComponents: 0,
      testedComponents: 0,
      coverage: 0,
      violations: 0,
      warnings: 0,
      passed: false
    },
    details: {
      components: [],
      violations: [],
      recommendations: []
    }
  };
  
  // Analyze test coverage
  await analyzeTestCoverage(report);
  
  // Check for common accessibility patterns
  await checkA11yPatterns(report);
  
  // Calculate final score
  calculateA11yScore(report);
  
  // Write reports
  writeReports(report);
  
  if (!report.summary.passed) {
    throw new Error(`Accessibility standards not met: ${report.summary.coverage}% coverage`);
  }
}

/**
 * Analyze accessibility test coverage
 */
async function analyzeTestCoverage(report) {
  const componentFiles = await findFiles('src/components/**/*.tsx');
  const testFiles = await findFiles('src/**/*.a11y.test.tsx');
  
  report.summary.totalComponents = componentFiles.length;
  report.summary.testedComponents = testFiles.length;
  report.summary.coverage = Math.round((testFiles.length / componentFiles.length) * 100);
  
  // Find components without accessibility tests
  const testedComponents = testFiles.map(file => 
    path.basename(file, '.a11y.test.tsx')
  );
  
  componentFiles.forEach(componentFile => {
    const componentName = path.basename(componentFile, '.tsx');
    const isTested = testedComponents.includes(componentName);
    
    report.details.components.push({
      name: componentName,
      file: componentFile,
      tested: isTested
    });
    
    if (!isTested) {
      report.details.recommendations.push({
        type: 'missing_test',
        component: componentName,
        message: `Component ${componentName} lacks accessibility tests`,
        severity: 'warning'
      });
    }
  });
}

/**
 * Check for accessibility patterns in code
 */
async function checkA11yPatterns(report) {
  const patterns = [
    {
      name: 'alt_text',
      regex: /<img(?![^>]*alt=)/g,
      message: 'Images should have alt text',
      severity: 'error'
    },
    {
      name: 'button_type',
      regex: /<button(?![^>]*type=)/g,
      message: 'Buttons should have explicit type attribute',
      severity: 'warning'
    },
    {
      name: 'input_labels',
      regex: /<input(?![^>]*(?:aria-label|aria-labelledby))/g,
      message: 'Form inputs should have associated labels',
      severity: 'error'
    },
    {
      name: 'heading_order',
      regex: /<h[1-6]/g,
      message: 'Check heading hierarchy order',
      severity: 'info'
    }
  ];
  
  const sourceFiles = await findFiles('src/**/*.tsx');
  
  for (const file of sourceFiles) {
    const content = fs.readFileSync(file, 'utf8');
    
    patterns.forEach(pattern => {
      const matches = content.match(pattern.regex);
      if (matches) {
        matches.forEach(() => {
          report.details.violations.push({
            type: pattern.name,
            file: file,
            message: pattern.message,
            severity: pattern.severity
          });
          
          if (pattern.severity === 'error') {
            report.summary.violations++;
          } else {
            report.summary.warnings++;
          }
        });
      }
    });
  }
}

/**
 * Calculate overall accessibility score
 */
function calculateA11yScore(report) {
  const coverageScore = report.summary.coverage;
  const violationPenalty = report.summary.violations * 10;
  const warningPenalty = report.summary.warnings * 2;
  
  const finalScore = Math.max(0, coverageScore - violationPenalty - warningPenalty);
  
  report.summary.score = finalScore;
  report.summary.passed = finalScore >= 80 && report.summary.violations === 0;
}

/**
 * Write accessibility reports
 */
function writeReports(report) {
  // JSON report
  fs.writeFileSync(
    'reports/accessibility-report.json',
    JSON.stringify(report, null, 2)
  );
  
  // HTML report
  const htmlReport = generateHTMLReport(report);
  fs.writeFileSync(
    'reports/accessibility-report.html',
    htmlReport
  );
  
  // Console summary
  console.log('\n📋 Accessibility Report Summary:');
  console.log(`   Coverage: ${report.summary.coverage}%`);
  console.log(`   Violations: ${report.summary.violations}`);
  console.log(`   Warnings: ${report.summary.warnings}`);
  console.log(`   Score: ${report.summary.score}%`);
  console.log(`   Status: ${report.summary.passed ? '✅ PASSED' : '❌ FAILED'}`);
}

/**
 * Generate HTML report
 */
function generateHTMLReport(report) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accessibility Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
    .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .status.passed { color: #28a745; }
    .status.failed { color: #dc3545; }
    .metric { display: inline-block; margin: 10px; padding: 15px; background: #fff; border: 1px solid #ddd; border-radius: 4px; }
    .violations { margin: 20px 0; }
    .violation { padding: 10px; margin: 5px 0; border-left: 4px solid #dc3545; background: #f8f9fa; }
    .warning { border-left-color: #ffc107; }
    .component-list { margin: 20px 0; }
    .component { padding: 8px; margin: 2px 0; }
    .tested { background: #d4edda; border-left: 4px solid #28a745; }
    .untested { background: #f8d7da; border-left: 4px solid #dc3545; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Accessibility Report</h1>
    <p class="status ${report.summary.passed ? 'passed' : 'failed'}">
      Status: ${report.summary.passed ? 'PASSED' : 'FAILED'}
    </p>
    <p>Generated: ${report.timestamp}</p>
  </div>
  
  <div class="metrics">
    <div class="metric">
      <h3>Coverage</h3>
      <p>${report.summary.coverage}%</p>
      <small>${report.summary.testedComponents}/${report.summary.totalComponents} components tested</small>
    </div>
    <div class="metric">
      <h3>Violations</h3>
      <p>${report.summary.violations}</p>
    </div>
    <div class="metric">
      <h3>Warnings</h3>
      <p>${report.summary.warnings}</p>
    </div>
    <div class="metric">
      <h3>Overall Score</h3>
      <p>${report.summary.score}%</p>
    </div>
  </div>
  
  ${report.details.violations.length > 0 ? `
  <div class="violations">
    <h2>Violations & Warnings</h2>
    ${report.details.violations.map(v => `
      <div class="violation ${v.severity === 'warning' ? 'warning' : ''}">
        <strong>${v.type}</strong> in ${v.file}<br>
        ${v.message}
      </div>
    `).join('')}
  </div>
  ` : ''}
  
  <div class="component-list">
    <h2>Component Test Coverage</h2>
    ${report.details.components.map(c => `
      <div class="component ${c.tested ? 'tested' : 'untested'}">
        ${c.name} ${c.tested ? '✅' : '❌'}
      </div>
    `).join('')}
  </div>
</body>
</html>
  `.trim();
}

/**
 * Utility functions
 */
async function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`Command failed: ${command}\n${stderr || stdout}`));
      } else {
        resolve(stdout);
      }
    });
  });
}

async function findFiles(pattern) {
  const { glob } = require('glob');
  return glob(pattern);
}

// Run the accessibility tests
if (require.main === module) {
  runAccessibilityTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = {
  runAccessibilityTests,
  config
};