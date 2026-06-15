import dotenv from 'dotenv';
import path from 'path';
import OpenAI from 'openai';
import { buildDomContextPrompt } from './domContext';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export interface TestStep {
  step: string;
  action: string;
  expectedResult: string;
}

export interface GeneratedTestCase {
  title: string;
  description: string;
  steps: TestStep[];
}

export function buildPrompt(requirement: string): string {
  return [
    'You are generating Playwright test cases from a user story or business requirement.',
    'Return valid JSON only with this structure:',
    '{',
    '  "title": "Short test name",',
    '  "description": "What the scenario validates",',
    '  "steps": [',
    '    { "step": "1", "action": "Open the page and navigate to the relevant flow", "expectedResult": "The page loads successfully" }',
    '  ]',
    '}',
    '',
    'Requirements to follow:',
    '- Use Playwright-friendly test steps.',
    '- Prefer realistic user actions such as clicking, filling forms, and verifying visible text.',
    '- Keep the steps concise and deterministic.',
    '- Include at least 3 steps when the requirement is complex.',
    '',
    'Business requirement:',
    requirement,
  ].join('\n');
}

export function normalizeResponse(rawResponse: string): GeneratedTestCase {
  const parsed = JSON.parse(rawResponse) as Partial<GeneratedTestCase>;

  return {
    title: typeof parsed.title === 'string' && parsed.title.trim().length > 0
      ? parsed.title.trim()
      : 'Generated Playwright Test Case',
    description: typeof parsed.description === 'string' && parsed.description.trim().length > 0
      ? parsed.description.trim()
      : 'Generated from the provided business requirement.',
    steps: Array.isArray(parsed.steps)
      ? parsed.steps.map((step, index) => ({
          step: typeof step.step === 'string' && step.step.trim().length > 0
            ? step.step.trim()
            : `${index + 1}`,
          action: typeof step.action === 'string' && step.action.trim().length > 0
            ? step.action.trim()
            : 'Perform the next user action.',
          expectedResult: typeof step.expectedResult === 'string' && step.expectedResult.trim().length > 0
            ? step.expectedResult.trim()
            : 'The expected outcome is visible.',
        }))
      : [],
  };
}

export async function generatePlaywrightTestCase(requirement: string): Promise<GeneratedTestCase> {
  return generatePlaywrightTestCaseWithContext(requirement, undefined);
}

export async function generatePlaywrightTestCaseWithContext(
  requirement: string,
  pageUrl?: string,
): Promise<GeneratedTestCase> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set. Add it to your .env file before generating test cases.');
  }

  const client = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';

  const domContext = pageUrl ? await buildDomContextPrompt(pageUrl) : '';
  const enrichedRequirement = [
    requirement,
    domContext ? '\n\nAdditional page context for test generation:\n' + domContext : '',
  ].join('\n');

  const response = await client.chat.completions.create({
    model,
    temperature: 0.2,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: 'You convert business requirements into Playwright test scenarios in JSON format.',
      },
      {
        role: 'user',
        content: buildPrompt(enrichedRequirement),
      },
    ],
  });

  const content = response.choices[0]?.message?.content ?? '{}';

  return normalizeResponse(content);
}
