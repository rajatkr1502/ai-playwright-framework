import { test, expect } from '@playwright/test';
import { collectDomContext, buildDomContextPrompt } from './domContext';

test('collectDomContext returns title and links from a real page', async () => {
  const snapshot = await collectDomContext('https://playwright.dev/');

  expect(snapshot.title.toLowerCase()).toContain('playwright');
  expect(snapshot.links.length).toBeGreaterThan(0);
  expect(snapshot.textPreview.length).toBeGreaterThan(0);
});

test('buildDomContextPrompt includes page context for test generation', async () => {
  const prompt = await buildDomContextPrompt('https://playwright.dev/');

  expect(prompt).toContain('DOM context captured from the provided page:');
  expect(prompt).toContain('URL:');
  expect(prompt).toContain('Title:');
  expect(prompt).toContain('Links:');
});
