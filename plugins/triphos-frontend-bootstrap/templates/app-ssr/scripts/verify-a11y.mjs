#!/usr/bin/env node

import { resolve } from 'node:path';

import { withHarnessServer } from './harness/harness-lib.mjs';

const appRoot = process.cwd();

const skip = String(process.env['TRIPHOS_SKIP_A11Y'] ?? '').toLowerCase();
if (['1', 'true', 'yes', 'on'].includes(skip)) {
  console.log('a11y check skipped via TRIPHOS_SKIP_A11Y.');
  process.exit(0);
}

async function main() {
  let chromium;
  let AxeBuilder;
  try {
    ({ chromium } = await import('playwright'));
    ({ default: AxeBuilder } = await import('@axe-core/playwright'));
  } catch (error) {
    console.error('a11y check skipped: playwright/@axe-core/playwright not installed.');
    console.error(error?.message ?? error);
    process.exit(1);
  }

  await withHarnessServer(appRoot, async ({ origin }) => {
    const browser = await chromium.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const allViolations = [];
    try {
      for (const route of ['/', '/starter']) {
        const context = await browser.newContext();
        const page = await context.newPage();
        await page.goto(`${origin}${route}`, { waitUntil: 'networkidle' });
        const result = await new AxeBuilder({ page }).analyze();
        const blocking = (result.violations ?? []).filter(
          (violation) => violation.impact === 'serious' || violation.impact === 'critical',
        );
        for (const violation of blocking) {
          allViolations.push({
            route,
            id: violation.id,
            impact: violation.impact,
            description: violation.description,
            nodes: violation.nodes.length,
          });
        }
        await context.close();
      }
    } finally {
      await browser.close();
    }

    if (allViolations.length > 0) {
      console.error('a11y check failed:');
      for (const violation of allViolations) {
        console.error(
          `- ${violation.route} ${violation.impact} ${violation.id} (${violation.nodes} node(s)): ${violation.description}`,
        );
      }
      process.exit(1);
    }

    console.log('a11y verification passed.');
  });
}

await main();

void resolve;
