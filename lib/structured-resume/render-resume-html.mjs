import { escapeHtml, formatPageSize, inlineHtml, readResumeTemplate, sanitizeHtml, stripHtml } from './common.mjs';

function inferCompetencies(resume) {
  if (Array.isArray(resume.meta?.competencies) && resume.meta.competencies.length > 0) {
    return resume.meta.competencies.slice(0, 8);
  }

  const seen = new Set();
  const picks = [];
  const maybeAdd = (value) => {
    const cleaned = String(value || '').trim();
    if (!cleaned) return;
    const key = cleaned.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    picks.push(cleaned);
  };

  const defaults = [
    'Software Engineering',
    'APIs',
    'Automation',
    'React',
    'TypeScript',
    'Node.js',
    'Cloud Infrastructure',
    'AI-Assisted Engineering',
  ];

  for (const value of defaults) maybeAdd(value);
  for (const skill of resume.content.skill?.entries || []) maybeAdd(skill.skill);

  return picks.slice(0, 8);
}

function renderCompetencies(resume) {
  return inferCompetencies(resume)
    .map((value) => `<span class="competency-tag">${escapeHtml(value)}</span>`)
    .join('\n');
}

function renderExperience(resume) {
  return (resume.content.work?.entries || []).map((entry) => {
    const period = [entry.startDateNew, entry.endDateNew].filter(Boolean).join(' - ');
    const roleLine = [entry.jobTitle, entry.location].filter(Boolean).join(' | ');
    return `
      <div class="job">
        <div class="job-header">
          <div class="job-company">${escapeHtml(entry.employer || '')}</div>
          <div class="job-period">${escapeHtml(period)}</div>
        </div>
        <div class="job-role">${escapeHtml(roleLine)}</div>
        ${sanitizeHtml(entry.description || '')}
      </div>`;
  }).join('\n');
}

function renderProjects(resume) {
  if (resume.meta?.showProjects === false) return '';
  return (resume.content.project?.entries || []).slice(0, 4).map((entry) => `
      <div class="project">
        <div class="project-title">${escapeHtml(entry.name || '')}</div>
        ${entry.techStack ? `<div class="project-tech">${escapeHtml(entry.techStack)}</div>` : ''}
        <div class="project-desc">${inlineHtml(entry.description || '')}</div>
      </div>`).join('\n');
}

function renderEducation(resume) {
  return (resume.content.education?.entries || []).map((entry) => {
    const period = [entry.startDateNew, entry.endDateNew].filter(Boolean).join(' - ');
    const title = [entry.degree, entry.school].filter(Boolean).join(' - ');
    const description = entry.description ? `<div class="edu-desc">${inlineHtml(entry.description)}</div>` : '';
    return `
      <div class="edu-item">
        <div class="edu-header">
          <div class="edu-title">${escapeHtml(title)}</div>
          <div class="edu-year">${escapeHtml(period)}</div>
        </div>
        ${entry.location ? `<div class="edu-desc">${escapeHtml(entry.location)}</div>` : ''}
        ${description}
      </div>`;
  }).join('\n');
}

function renderCertifications(resume) {
  if (resume.meta?.showCertificates === false) return '';
  return (resume.content.certificate?.entries || []).map((entry) => `
      <div class="cert-item">
        <div class="cert-title">${escapeHtml(entry.certificate || '')}</div>
      </div>`).join('\n');
}

function renderSkills(resume) {
  return `
    <div class="skills-grid">
      ${(resume.content.skill?.entries || []).map((entry) => `
        <div class="skill-item">
          <span class="skill-category">${escapeHtml(entry.skill || '')}:</span>
          ${inlineHtml(entry.infoHtml || '')}
        </div>`).join('\n')}
    </div>`;
}

export function buildResumeHtmlFromStructuredResume(resume, options = {}) {
  const template = readResumeTemplate();
  const personal = resume.personalDetails || {};
  const format = options.format || 'a4';
  const linkedinDisplay = personal.social?.linkedIn?.display || '';
  const linkedinUrl = linkedinDisplay.startsWith('http') ? linkedinDisplay : `https://${linkedinDisplay}`;
  const websiteDisplay = personal.website || '';
  const websiteUrl = websiteDisplay.startsWith('http') ? websiteDisplay : `https://${websiteDisplay}`;
  const summaryText = stripHtml(resume.content.profile?.entries?.[0]?.text || '');

  const replacements = {
    '{{LANG}}': options.language || 'en',
    '{{PAGE_WIDTH}}': formatPageSize(format),
    '{{NAME}}': escapeHtml(personal.fullName || ''),
    '{{PHONE}}': escapeHtml(personal.phone || ''),
    '{{EMAIL}}': escapeHtml(personal.displayEmail || ''),
    '{{LINKEDIN_URL}}': escapeHtml(linkedinUrl),
    '{{LINKEDIN_DISPLAY}}': escapeHtml(linkedinDisplay),
    '{{PORTFOLIO_URL}}': escapeHtml(websiteUrl),
    '{{PORTFOLIO_DISPLAY}}': escapeHtml(websiteDisplay),
    '{{LOCATION}}': escapeHtml(personal.address || ''),
    '{{SECTION_SUMMARY}}': 'Professional Summary',
    '{{SUMMARY_TEXT}}': escapeHtml(summaryText),
    '{{SECTION_COMPETENCIES}}': 'Core Competencies',
    '{{COMPETENCIES}}': renderCompetencies(resume),
    '{{SECTION_EXPERIENCE}}': 'Work Experience',
    '{{EXPERIENCE}}': renderExperience(resume),
    '{{SECTION_PROJECTS}}': 'Projects',
    '{{PROJECTS}}': renderProjects(resume),
    '{{SECTION_EDUCATION}}': 'Education',
    '{{EDUCATION}}': renderEducation(resume),
    '{{SECTION_CERTIFICATIONS}}': 'Certifications',
    '{{CERTIFICATIONS}}': renderCertifications(resume),
    '{{SECTION_SKILLS}}': 'Skills',
    '{{SKILLS}}': renderSkills(resume),
  };

  let html = template;
  for (const [needle, value] of Object.entries(replacements)) {
    html = html.split(needle).join(value);
  }

  return html;
}
