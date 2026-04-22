import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join, relative } from 'path';
import { applyStructuredResumePatch } from './apply-patch.mjs';
import { loadStructuredResumeOrThrow, pickFormat, projectRoot, toSlug } from './common.mjs';
import { buildStructuredManifestPath, buildStructuredOutputPaths } from './output-paths.mjs';
import { buildStructuredCoverLetterHtml } from './render-cover-letter-html.mjs';
import { buildResumeHtmlFromStructuredResume } from './render-resume-html.mjs';
import { validateStructuredResumePatch } from './validate-patch.mjs';

let browserPromise = null;

function normalizePathForMarkdown(path) {
  return String(path).replace(/\\/g, '/');
}

function toRelativeProjectPath(path) {
  return normalizePathForMarkdown(relative(projectRoot, path));
}

function parseWhen(value) {
  if (!value) return new Date();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function hasCoverLetterContent(input = {}) {
  return Boolean(
    input.companyAddress ||
    input.paragraph1 ||
    input.paragraph2 ||
    input.paragraph3
  );
}

function normalizeBundleInput(input = {}) {
  const coverLetter = input.coverLetter && typeof input.coverLetter === 'object'
    ? input.coverLetter
    : {};

  return {
    company: input.company || coverLetter.company || 'company',
    role: input.role || coverLetter.role || 'role',
    language: input.language || coverLetter.language || 'en',
    format: input.format || coverLetter.format || 'a4',
    jobId: input.jobId || coverLetter.jobId || null,
    patch: input.patch || null,
    coverLetter: {
      company: input.company || coverLetter.company || 'company',
      role: input.role || coverLetter.role || 'role',
      companyAddress: coverLetter.companyAddress || input.companyAddress || '',
      paragraph1: coverLetter.paragraph1 || input.paragraph1 || '',
      paragraph2: coverLetter.paragraph2 || input.paragraph2 || '',
      paragraph3: coverLetter.paragraph3 || input.paragraph3 || '',
      language: coverLetter.language || input.language || 'en',
      format: coverLetter.format || input.format || 'a4',
      jobId: coverLetter.jobId || input.jobId || null,
    },
    tracker: input.tracker || null,
    when: parseWhen(input.when),
  };
}

function validateBundleInput(input) {
  if (!input.company || !String(input.company).trim()) {
    throw new Error('company is required');
  }

  if (!input.role || !String(input.role).trim()) {
    throw new Error('role is required');
  }

  if (!input.patch && !hasCoverLetterContent(input.coverLetter)) {
    throw new Error('bundle must include a patch, cover letter content, or both');
  }
}

async function getBrowser() {
  if (!browserPromise) {
    browserPromise = chromium.launch({ headless: true });
  }
  return browserPromise;
}

async function renderPdf({ html, pdfPath, format = 'a4' }) {
  const browser = await getBrowser();
  const context = await browser.newContext();

  try {
    const page = await context.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.pdf({
      path: pdfPath,
      format: pickFormat(format),
      printBackground: true,
      margin: { top: '0.6in', right: '0.6in', bottom: '0.6in', left: '0.6in' },
    });
  } finally {
    await context.close();
  }
}

function writeTrackerAddition({ company, role, tracker, resumeResult }) {
  if (!tracker) return null;

  const num = String(tracker.num || '').trim();
  const date = String(tracker.date || '').trim();
  const score = String(tracker.score || '').trim();
  const report = String(tracker.report || '').trim();

  if (!num || !date || !score || !report) {
    throw new Error('tracker requires num, date, score, and report');
  }

  const status = String(tracker.status || 'Evaluated').trim();
  const pdf = String(tracker.pdf || resumeResult?.relativePdfPath || '❌').trim();
  const notes = String(tracker.notes || '').trim();
  const fileName = `${String(num).padStart(3, '0')}-${toSlug(company)}.tsv`;
  const outputPath = join(projectRoot, 'batch', 'tracker-additions', fileName);
  const content = [
    num,
    date,
    company,
    role,
    status,
    score,
    pdf,
    report,
    notes,
  ].join('\t');

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, content, 'utf-8');

  return {
    path: outputPath,
    relativePath: toRelativeProjectPath(outputPath),
    fileName,
  };
}

export async function generateStructuredResume(input = {}) {
  const baseResume = loadStructuredResumeOrThrow();
  const patch = input.patch || input;
  const validation = validateStructuredResumePatch(baseResume, patch);

  if (!validation.valid) {
    const error = new Error('Invalid structured resume patch');
    error.details = validation.errors;
    error.warnings = validation.warnings;
    throw error;
  }

  const company = input.company || patch.company || 'company';
  const role = input.role || patch.role || baseResume.personalDetails?.jobTitle || 'role';
  const language = input.language || patch.language || 'en';
  const format = input.format || patch.format || 'a4';
  const when = parseWhen(input.when);
  const output = buildStructuredOutputPaths('resume', company, role, when);
  const mergedResume = applyStructuredResumePatch(baseResume, patch);
  const html = buildResumeHtmlFromStructuredResume(mergedResume, { language, format });

  mkdirSync(dirname(output.htmlPath), { recursive: true });
  writeFileSync(output.htmlPath, html, 'utf-8');
  await renderPdf({ html, pdfPath: output.pdfPath, format });

  return {
    success: true,
    htmlPath: output.htmlPath,
    pdfPath: output.pdfPath,
    relativeHtmlPath: toRelativeProjectPath(output.htmlPath),
    relativePdfPath: toRelativeProjectPath(output.pdfPath),
    fileName: output.fileName,
    warnings: validation.warnings,
    jobId: input.jobId || patch.jobId || null,
  };
}

export async function generateStructuredCoverLetter(input = {}) {
  const company = input.company || 'company';
  const role = input.role || 'role';
  const format = input.format || 'a4';
  const when = parseWhen(input.when);
  const output = buildStructuredOutputPaths('coverletter', company, role, when);
  const html = buildStructuredCoverLetterHtml(input);

  mkdirSync(dirname(output.htmlPath), { recursive: true });
  writeFileSync(output.htmlPath, html, 'utf-8');
  await renderPdf({ html, pdfPath: output.pdfPath, format });

  return {
    success: true,
    htmlPath: output.htmlPath,
    pdfPath: output.pdfPath,
    relativeHtmlPath: toRelativeProjectPath(output.htmlPath),
    relativePdfPath: toRelativeProjectPath(output.pdfPath),
    fileName: output.fileName,
    jobId: input.jobId || null,
  };
}

export async function generateStructuredApplicationBundle(input = {}) {
  const normalized = normalizeBundleInput(input);
  validateBundleInput(normalized);

  const result = {
    success: true,
    generatedAt: normalized.when.toISOString(),
    company: normalized.company,
    role: normalized.role,
    language: normalized.language,
    format: normalized.format,
    jobId: normalized.jobId,
  };

  if (normalized.patch) {
    result.resume = await generateStructuredResume({
      company: normalized.company,
      role: normalized.role,
      language: normalized.language,
      format: normalized.format,
      jobId: normalized.jobId,
      patch: normalized.patch,
      when: normalized.when,
    });
  }

  if (hasCoverLetterContent(normalized.coverLetter)) {
    result.coverLetter = await generateStructuredCoverLetter({
      ...normalized.coverLetter,
      company: normalized.company,
      role: normalized.role,
      when: normalized.when,
    });
  }

  if (normalized.tracker) {
    result.tracker = writeTrackerAddition({
      company: normalized.company,
      role: normalized.role,
      tracker: normalized.tracker,
      resumeResult: result.resume,
    });
  }

  const manifest = buildStructuredManifestPath(normalized.company, normalized.role, normalized.when);
  writeFileSync(manifest.manifestPath, JSON.stringify(result, null, 2), 'utf-8');
  result.manifestPath = manifest.manifestPath;
  result.relativeManifestPath = toRelativeProjectPath(manifest.manifestPath);

  return result;
}

export async function closeStructuredResumeRenderer() {
  if (!browserPromise) return;
  const browser = await browserPromise;
  browserPromise = null;
  await browser.close();
}
