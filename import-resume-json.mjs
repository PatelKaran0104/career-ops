#!/usr/bin/env node

import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { projectRoot, structuredResumePath } from './lib/structured-resume/common.mjs';

const defaultSource = resolve(projectRoot, '..', 'job-automation-n8n', 'data', 'resume.json');
const source = process.argv[2] ? resolve(process.argv[2]) : defaultSource;

if (!existsSync(source)) {
  console.error(`Source resume.json not found: ${source}`);
  process.exit(1);
}

mkdirSync(dirname(structuredResumePath), { recursive: true });
copyFileSync(source, structuredResumePath);
console.log(`Imported structured resume source to ${structuredResumePath}`);
