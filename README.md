# AI Playwright Framework

This repository is a Playwright-based automation framework with AI-related project structure, logging utilities, and Allure reporting support.

## Features

- Playwright test automation for Chromium, Firefox, and WebKit
- Allure reporting integration
- Structured project folders for tests, pages, fixtures, utilities, and AI helpers
- Sample smoke tests to get started quickly

## Project Structure

- `src/tests/` – Playwright test specs
- `src/pages/` – Page Object Model helpers
- `src/fixtures/` – Test fixtures and shared setup
- `src/utils/` – Logging and utility functions
- `src/ai/` – AI-related modules and configuration
- `allure-results/` and `allure-report/` – test reports

## Prerequisites

- Node.js (recommended: latest LTS)
- npm

## Getting Started

1. Install dependencies

   ```bash
   npm install
   ```

2. Install Playwright browsers

   ```bash
   npx playwright install
   ```

3. Run the tests

   ```bash
   npm test
   ```

## Useful Commands

Run tests with Allure reporting:

```bash
npm run test:allure
```

Generate an Allure report:

```bash
npm run allure:generate
```

Open the generated Allure report:

```bash
npm run allure:open
```

## Configuration

- Playwright configuration is defined in `playwright.config.ts`
- The current setup uses Allure as the main reporter and runs tests across Chromium, Firefox, and WebKit

## Notes

This repository currently includes example tests in `src/tests/example.spec.ts` as a starting point for building your own automation suite.
