import dotenv from 'dotenv';
import path from 'path';
import OpenAI from 'openai';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export interface FailureAnalysisResult {
  rootCause: string;
  suggestedFix: string;
  confidence: string;
}

export function buildFailureAnalysisPrompt(errorText: string, screenshotPath?: string, allureLog?: string): string {
  return [
    'You are analyzing a Playwright test failure.',
    'Return valid JSON only with this structure:',
    '{',
    '  "rootCause": "Short statement of the likely reason for failure",',
    '  "suggestedFix": "One concrete fix or next step",',
    '  "confidence": "High / Medium / Low"',
    '}',
    '',
    'Use the provided error details, screenshot context, and Allure log if available.',
    'Keep the output concise and practical for an automation engineer.',
    '',
    'Error details:',
    errorText || 'No error text provided.',
    '',
    screenshotPath ? `Screenshot path: ${screenshotPath}` : 'Screenshot path: not provided.',
    '',
    allureLog ? `Allure log excerpt:\n${allureLog}` : 'Allure log excerpt: not provided.',
  ].join('\n');
}

export function normalizeFailureAnalysis(rawResponse: string): FailureAnalysisResult {
  const parsed = JSON.parse(rawResponse) as Partial<FailureAnalysisResult>;

  return {
    rootCause: typeof parsed.rootCause === 'string' && parsed.rootCause.trim().length > 0
      ? parsed.rootCause.trim()
      : 'Unable to determine a root cause from the provided failure details.',
    suggestedFix: typeof parsed.suggestedFix === 'string' && parsed.suggestedFix.trim().length > 0
      ? parsed.suggestedFix.trim()
      : 'Review the failing step and the associated locator or environment setup.',
    confidence: typeof parsed.confidence === 'string' && parsed.confidence.trim().length > 0
      ? parsed.confidence.trim()
      : 'Medium',
  };
}

export async function analyzePlaywrightFailure(
  errorText: string,
  screenshotPath?: string,
  allureLog?: string,
): Promise<FailureAnalysisResult> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set. Add it to your .env file before analyzing failures.');
  }

  const client = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';

  const response = await client.chat.completions.create({
    model,
    temperature: 0.1,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: 'You analyze Playwright failures and suggest practical fixes.',
      },
      {
        role: 'user',
        content: buildFailureAnalysisPrompt(errorText, screenshotPath, allureLog),
      },
    ],
  });

  const content = response.choices[0]?.message?.content ?? '{}';

  return normalizeFailureAnalysis(content);
}
