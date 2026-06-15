# AI Playwright Framework

This repository is a Playwright-based automation framework with AI-related project structure, logging utilities, and Allure reporting support.

## Features

- Playwright test automation for Chromium, Firefox, and WebKit
- Allure reporting integration
- Structured project folders for tests, pages, fixtures, utilities, and AI helpers
- AI test-case generator for turning requirements into Playwright steps
- AI failure analyzer for summarizing Playwright failures and suggesting fixes
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

## AI features overview

The current AI layer in this repo includes three practical capabilities:

1. AI test-case generator — turns a business requirement into Playwright-style test steps.
2. DOM context collector — captures page title, headings, links, inputs, and visible text from a provided URL to improve prompt quality.
3. AI failure analyzer — reviews Playwright errors, screenshot references, and Allure log snippets to suggest likely root causes and fixes.

These features are implemented under `src/ai/` and are designed to support faster test creation and faster debugging.

## AI test-case generator

This repository now includes a starter AI method under `src/ai/testCaseGenerator.ts` that converts a business requirement into Playwright-friendly test steps.
It also includes a DOM parser in `src/ai/domContext.ts` that captures the page URL, headings, links, inputs, and visible text from a provided page URL to improve test generation.
A new failure analyzer in `src/ai/failureAnalyzer.ts` can review Playwright errors, screenshot paths, and Allure log snippets and return a root-cause summary plus a suggested fix.

1. Copy `.env.example` to `.env` and add your `OPENAI_API_KEY`.
2. Import and call `generatePlaywrightTestCase('Your requirement here')` from your code.
3. Or pass a real page URL with `generatePlaywrightTestCaseWithContext('Your requirement here', 'https://example.com')` to enrich the prompt with live DOM context.
4. Use the returned `title`, `description`, and `steps` to build or review a Playwright test scenario.

Example:

```ts
import { generatePlaywrightTestCase } from './src/ai/testCaseGenerator';

const generated = await generatePlaywrightTestCase('User should be able to log in with valid credentials.');
console.log(generated);
```

## AI failure analyzer

The failure analyzer in `src/ai/failureAnalyzer.ts` can take Playwright error text, a screenshot path, and an Allure log excerpt and return:

- a short root-cause summary,
- a suggested fix,
- and a confidence level.

Example:

```ts
import { analyzePlaywrightFailure } from './src/ai/failureAnalyzer';

const result = await analyzePlaywrightFailure(
  'Timeout 30000ms exceeded while waiting for locator("text=Dashboard")',
  'allure-results/screenshots/failure.png',
  'Expected text "Dashboard" was not found in the page.'
);

console.log(result.rootCause);
console.log(result.suggestedFix);
console.log(result.confidence);
```

## Notes

This repository currently includes example tests in `src/tests/example.spec.ts` as a starting point for building your own automation suite.
