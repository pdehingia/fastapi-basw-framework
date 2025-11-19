{
  "e2e": {
    "baseUrl": "http://localhost:5173",
    "viewportWidth": 1280,
    "viewportHeight": 720,
    "video": true,
    "screenshotOnRunFailure": true,
    "defaultCommandTimeout": 10000,
    "requestTimeout": 10000,
    "responseTimeout": 10000,
    "supportFile": "cypress/support/e2e.ts",
    "specPattern": "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    "excludeSpecPattern": [
      "cypress/e2e/1-getting-started/**/*",
      "cypress/e2e/2-advanced-examples/**/*"
    ],
    "setupNodeEvents": "cypress/support/tasks.ts",
    "env": {
      "CYPRESS_RECORD_KEY": "test-key",
      "coverage": true
    }
  },
  "component": {
    "devServer": {
      "framework": "vite",
      "bundler": "vite"
    },
    "specPattern": "src/**/*.cy.{js,jsx,ts,tsx}",
    "supportFile": "cypress/support/component.ts"
  },
  "chromeWebSecurity": false,
  "retries": {
    "runMode": 2,
    "openMode": 0
  },
  "experimentalStudio": true,
  "experimentalMemoryManagement": true
}