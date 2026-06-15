import { chromium } from '@playwright/test';

export interface DomContextSnapshot {
  url: string;
  title: string;
  headings: string[];
  links: Array<{ text: string; href: string }>;
  inputs: Array<{ type: string; name: string; placeholder: string; label: string }>;
  textPreview: string;
}

export async function collectDomContext(url: string): Promise<DomContextSnapshot> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

    const snapshot = await page.evaluate(() => {
      const cleanText = (value: string | null | undefined) =>
        (value ?? '').replace(/\s+/g, ' ').trim();

      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4'))
        .map((element) => cleanText(element.textContent))
        .filter(Boolean)
        .slice(0, 20);

      const links = Array.from(document.querySelectorAll('a[href]'))
        .map((element) => ({
          text: cleanText(element.textContent),
          href: (element as HTMLAnchorElement).href,
        }))
        .filter((item) => item.text.length > 0 || item.href.length > 0)
        .slice(0, 50);

      const inputs = Array.from(document.querySelectorAll('input, textarea, select'))
        .map((element) => {
          const input = element as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

          return {
            type: input instanceof HTMLInputElement ? input.type : element.tagName.toLowerCase(),
            name: cleanText(input.getAttribute('name') || ''),
            placeholder:
              input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement
                ? cleanText(input.placeholder || '')
                : '',
            label: cleanText(
              (input.labels && input.labels.length > 0
                ? input.labels[0]?.textContent
                : '') || ''
            ),
          };
        })
        .filter((item) => item.name.length > 0 || item.placeholder.length > 0 || item.label.length > 0)
        .slice(0, 100);

      return {
        url: location.href,
        title: cleanText(document.title),
        headings,
        links,
        inputs,
        textPreview: cleanText(document.body?.innerText ?? '').slice(0, 4000),
      };
    });

    return snapshot;
  } finally {
    await browser.close();
  }
}

export async function buildDomContextPrompt(url: string): Promise<string> {
  const snapshot = await collectDomContext(url);

  return [
    'DOM context captured from the provided page:',
    `URL: ${snapshot.url}`,
    `Title: ${snapshot.title}`,
    `Headings: ${snapshot.headings.join(' | ') || 'None found'}`,
    `Links: ${snapshot.links.map((link) => `${link.text} -> ${link.href}`).join(' | ') || 'None found'}`,
    `Inputs: ${snapshot.inputs.map((input) => `${input.label || input.name || input.placeholder || input.type}`).join(' | ') || 'None found'}`,
    'Visible text preview:',
    snapshot.textPreview,
  ].join('\n');
}
