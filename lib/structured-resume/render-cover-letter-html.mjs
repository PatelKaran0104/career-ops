import { buildStructuredFontCss } from './font-css.mjs';
import { escapeHtml } from './common.mjs';

function wrapParagraph(text = '') {
  if (!text) return '';
  if (String(text).trimStart().startsWith('<')) return text;
  return `<p>${escapeHtml(text)}</p>`;
}

export function buildStructuredCoverLetterHtml(content = {}) {
  const {
    role = 'Software Engineer',
    company = '',
    companyAddress = '',
    paragraph1 = '',
    paragraph2 = '',
    paragraph3 = '',
    language = 'en',
  } = content;

  const isGerman = language === 'de';
  const dateText = new Date().toLocaleDateString(isGerman ? 'de-DE' : 'en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return `<!DOCTYPE html>
<html lang="${isGerman ? 'de' : 'en'}">
<head>
  <meta charset="UTF-8" />
  <title>Cover Letter - Karan Patel</title>
  <style>
    ${buildStructuredFontCss()}
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'DM Sans', sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #1a1a1a;
      background: #fff;
    }
    .page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      padding: 18mm 20mm 16mm 20mm;
      display: flex;
      flex-direction: column;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid hsl(187, 74%, 32%);
      padding-bottom: 10px;
      margin-bottom: 18px;
    }
    .header-name {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 20pt;
      font-weight: 700;
      color: #1e3a5f;
    }
    .header-title {
      font-size: 10pt;
      color: hsl(187, 74%, 32%);
      margin-top: 2px;
    }
    .header-contact {
      text-align: right;
      font-size: 9pt;
      color: #444;
      line-height: 1.7;
    }
    .subject {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 12pt;
      font-weight: 700;
      color: #1e3a5f;
      margin: 18px 0;
      border-left: 3px solid hsl(187, 74%, 32%);
      padding-left: 10px;
    }
    .body-text p {
      margin-bottom: 13px;
      text-align: justify;
      hyphens: auto;
    }
    .closing {
      margin-top: 24px;
    }
    .footer {
      margin-top: auto;
      padding-top: 10px;
      border-top: 1px solid #d1d5db;
      font-size: 8.5pt;
      color: #666;
      display: flex;
      justify-content: space-between;
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div>
        <div class="header-name">Karan Patel</div>
        <div class="header-title">${escapeHtml(role)}</div>
      </div>
      <div class="header-contact">
        khpatel0104@gmail.com<br/>
        +49 15210894179<br/>
        Hesse, Germany<br/>
        linkedin.com/in/patelkaran0104/<br/>
        karanpatel.live
      </div>
    </div>
    <div style="text-align:right; font-size:10pt; color:#555; margin-bottom:18px;">${escapeHtml(dateText)}</div>
    <div style="margin-bottom:18px; font-size:10.5pt; line-height:1.8;">
      <div>${escapeHtml(company)}</div>
      <div>${escapeHtml(companyAddress)}</div>
    </div>
    <div class="subject">${isGerman ? `Bewerbung als ${escapeHtml(role)}` : `Application for ${escapeHtml(role)}`}</div>
    <div style="margin-bottom:13px;">${isGerman ? 'Sehr geehrte Damen und Herren,' : 'Dear Hiring Team,'}</div>
    <div class="body-text">
      ${wrapParagraph(paragraph1)}
      ${wrapParagraph(paragraph2)}
      ${wrapParagraph(paragraph3)}
    </div>
    <div class="closing">
      <div style="margin-bottom:32px;">${isGerman ? 'Mit freundlichen Grussen,' : 'Best regards,'}</div>
      <div style="font-weight:700;">Karan Patel</div>
      <div style="font-size:9.5pt; color:#555;">${escapeHtml(role)}</div>
    </div>
    <div class="footer">
      <span>Karan Patel · khpatel0104@gmail.com · +49 15210894179</span>
      <span>${escapeHtml(company)}</span>
    </div>
  </div>
</body>
</html>`;
}
