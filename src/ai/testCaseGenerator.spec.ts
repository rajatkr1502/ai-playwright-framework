import { test, expect } from '@playwright/test';
import { buildPrompt, normalizeResponse } from './testCaseGenerator';

test('buildPrompt includes the business requirement and Playwright guidance', () => {
  const prompt = buildPrompt('User should be able to sign in with valid credentials.');

  expect(prompt).toContain('User should be able to sign in with valid credentials.');
  expect(prompt).toContain('Playwright-friendly test steps');
  expect(prompt).toContain('Return valid JSON only');
});

test('normalizeResponse converts AI output into a usable test case structure', () => {
  const generated = normalizeResponse(`{
    "title": "Login flow",
    "description": "Validates the sign-in path",
    "steps": [
      { "step": "1", "action": "Open the login page", "expectedResult": "The page loads" },
      { "step": "2", "action": "Enter valid credentials", "expectedResult": "The dashboard is shown" }
    ]
  }`);

  expect(generated.title).toBe('Login flow');
  expect(generated.description).toContain('sign-in path');
  expect(generated.steps).toHaveLength(2);
  expect(generated.steps[0]?.action).toBe('Open the login page');
});
