#!/usr/bin/env node

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { generateStructuredApplicationBundle, closeStructuredResumeRenderer } from './lib/structured-resume/generate-assets.mjs';

function printUsage() {
  console.error('Usage: node generate-structured-application.mjs <request.json>');
}

async function main() {
  const [inputPath] = process.argv.slice(2);

  if (!inputPath) {
    printUsage();
    process.exit(1);
  }

  const resolvedPath = resolve(inputPath);
  const request = JSON.parse(readFileSync(resolvedPath, 'utf-8'));
  const result = await generateStructuredApplicationBundle(request);

  console.log(JSON.stringify(result, null, 2));
}

main()
  .catch((error) => {
    console.error(error.message);
    if (error.details) {
      console.error(JSON.stringify({ details: error.details, warnings: error.warnings || [] }, null, 2));
    }
    process.exit(1);
  })
  .finally(async () => {
    await closeStructuredResumeRenderer();
  });
