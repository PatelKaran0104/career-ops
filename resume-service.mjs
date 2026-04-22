#!/usr/bin/env node

import express from 'express';
import { existsSync, mkdirSync } from 'fs';
import { projectRoot, structuredResumePath } from './lib/structured-resume/common.mjs';
import { getStructuredResumeContext } from './lib/structured-resume/context.mjs';
import { closeStructuredResumeRenderer, generateStructuredCoverLetter, generateStructuredResume } from './lib/structured-resume/generate-assets.mjs';

const port = Number(process.env.CAREER_OPS_RESUME_PORT || 3010);
const app = express();
app.use(express.json({ limit: '10mb' }));

mkdirSync(projectRoot, { recursive: true });

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'career-ops structured resume service',
    port,
    resumeJsonPresent: existsSync(structuredResumePath),
  });
});

app.get('/context', (_req, res) => {
  try {
    res.json(getStructuredResumeContext());
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
});

app.post('/generate-resume', async (req, res) => {
  try {
    const result = await generateStructuredResume(req.body);
    res.json({
      success: true,
      html: result.htmlPath,
      file: result.pdfPath,
      fileName: result.fileName,
      warnings: result.warnings,
      jobId: result.jobId,
    });
  } catch (error) {
    const statusCode = Array.isArray(error.details) ? 422 : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message,
      details: error.details || [],
      warnings: error.warnings || [],
    });
  }
});

app.post('/generate-coverletter', async (req, res) => {
  try {
    const result = await generateStructuredCoverLetter(req.body);
    res.json({
      success: true,
      html: result.htmlPath,
      file: result.pdfPath,
      fileName: result.fileName,
      jobId: result.jobId,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`career-ops structured resume service running on port ${port}`);
});

async function shutdown() {
  server.close(async () => {
    await closeStructuredResumeRenderer();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
