import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

export const projectRoot = fileURLToPath(new URL('../../', import.meta.url));
export const structuredResumePath = join(projectRoot, 'data', 'resume.json');
export const resumeTemplatePath = join(projectRoot, 'templates', 'cv-template.html');
export const fontsDir = join(projectRoot, 'fonts');

const ALLOWED_TAGS = new Set(['p', 'ul', 'ol', 'li', 'strong', 'em', 'b', 'i', 'br', 'span']);

export function loadStructuredResumeOrThrow() {
  if (!existsSync(structuredResumePath)) {
    throw new Error(`Structured resume source not found: ${structuredResumePath}`);
  }
  return JSON.parse(readFileSync(structuredResumePath, 'utf-8'));
}

export function readResumeTemplate() {
  return readFileSync(resumeTemplatePath, 'utf-8');
}

export function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

export function sanitizeHtml(html = '') {
  return String(html).replace(/<\/?([a-z0-9]+)[^>]*>/gi, (match, tag) =>
    ALLOWED_TAGS.has(tag.toLowerCase()) ? match : ''
  );
}

export function stripHtml(html = '') {
  return String(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function stripHtmlPreserveBullets(html = '') {
  return String(html)
    .replace(/<\/li>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*/g, '\n')
    .replace(/^\n+|\n+$/g, '')
    .trim();
}

export function inlineHtml(html = '') {
  return sanitizeHtml(html)
    .replace(/<\/?(p|ul|ol|li)[^>]*>/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function toSlug(str = '') {
  return String(str)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'item';
}

export function formatPageSize(format = 'a4') {
  return String(format).toLowerCase() === 'letter' ? '8.5in' : '210mm';
}

export function pickFormat(format = 'a4') {
  return String(format).toLowerCase() === 'letter' ? 'Letter' : 'A4';
}
