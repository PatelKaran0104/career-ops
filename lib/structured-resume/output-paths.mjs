import { mkdirSync } from 'fs';
import { join } from 'path';
import { projectRoot, toSlug } from './common.mjs';

function datePart(date) {
  return date.toISOString().slice(0, 10);
}

function timePart(date) {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${hh}${mm}${ss}`;
}

export function buildStructuredOutputPaths(kind, company, role, when = new Date()) {
  const date = datePart(when);
  const time = timePart(when);
  const folder = kind === 'coverletter' ? 'Coverletter' : 'Resume';
  const prefix = kind === 'coverletter' ? 'coverletter' : 'resume';
  const base = role
    ? `${toSlug(company)}--${toSlug(role)}-${time}`
    : `${toSlug(company)}-${time}`;

  const dir = join(projectRoot, 'output', 'structured', date, folder);
  mkdirSync(dir, { recursive: true });

  return {
    htmlPath: join(dir, `${prefix}-${base}.html`),
    pdfPath: join(dir, `${prefix}-${base}.pdf`),
    fileName: `${prefix}-${base}.pdf`,
  };
}

export function buildStructuredManifestPath(company, role, when = new Date()) {
  const date = datePart(when);
  const time = timePart(when);
  const dir = join(projectRoot, 'output', 'structured', date, 'Applications');
  const fileName = `application-${toSlug(company)}--${toSlug(role)}-${time}.json`;

  mkdirSync(dir, { recursive: true });

  return {
    manifestPath: join(dir, fileName),
    fileName,
  };
}
