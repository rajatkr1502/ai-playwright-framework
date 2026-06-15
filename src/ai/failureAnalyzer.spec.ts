import { test, expect } from '@playwright/test';
import { buildFailureAnalysisPrompt, normalizeFailureAnalysis } from './failureAnalyzer';

test('buildFailureAnalysisPrompt includes error, screenshot, and log context', () => {
  const prompt = buildFailureAnalysisPrompt(
    'Timeout 30000ms exceeded',
    'artifacts/screenshot.png',
    'Expected text not found',
  );

  expect(prompt).toContain('Timeout 30000ms exceeded');
  expect(prompt).toContain('artifacts/screenshot.png');
  expect(prompt).toContain('Expected text not found');
});

test('normalizeFailureAnalysis converts the LLM response into a usable result', () => {
  const analysis = normalizeFailureAnalysis(`{
    "rootCause": "The locator is stale after the UI changed",
    "suggestedFix": "Update the selector to use a stable role or text locator",
    "confidence": "High"
  }`);

  expect(analysis.rootCause).toContain('stale');
  expect(analysis.suggestedFix).toContain('stable');
  expect(analysis.confidence).toBe('High');
});
