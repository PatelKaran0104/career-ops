# Structured Resume Integration

Career-ops now supports an alternate structured resume source at `data/resume.json`.

This integration is adapted from your `job-automation-n8n` repo, but wired into the current `career-ops` setup instead of replacing it.

## What It Adds

- Patch-based resume tailoring using stable entry IDs
- Validation before patch application
- A local HTTP service for:
  - `GET /health`
  - `GET /context`
  - `POST /generate-resume`
  - `POST /generate-coverletter`
- A CLI bundle generator that fits the existing `career-ops` tracker flow
- Resume PDF rendering that reuses the current `career-ops` fonts and CV template

## Import Your Existing resume.json

If your older repo exists next to `career-ops`, run:

```bash
npm run resume:import
```

Or import from a custom file path:

```bash
node import-resume-json.mjs /absolute/path/to/resume.json
```

## Start The Local Service

```bash
npm run resume:server
```

Default port: `3010`

Override with `CAREER_OPS_RESUME_PORT`.

## Generate An Application Bundle

Use the shared CLI bridge when you want the structured resume engine to participate in the normal `career-ops` application flow.

```bash
npm run resume:bundle -- path/to/request.json
```

The request JSON can include:

```json
{
  "company": "Example Co",
  "role": "Backend Engineer",
  "language": "en",
  "format": "a4",
  "patch": {
    "jobTitle": "Backend Engineer",
    "profile": "<p>Backend-focused software developer...</p>",
    "competencies": ["Backend Engineering", "REST APIs", "Node.js", "AWS"]
  },
  "coverLetter": {
    "companyAddress": "Berlin, Germany",
    "paragraph1": "Why this company and role",
    "paragraph2": "Why your background fits",
    "paragraph3": "Why you want to continue the conversation"
  },
  "tracker": {
    "num": 11,
    "date": "2026-04-22",
    "score": "4.40/5",
    "status": "Evaluated",
    "report": "reports/011-example-co-backend-engineer-2026-04-22.md",
    "notes": "Strong backend fit with good Berlin alignment"
  }
}
```

What it writes:

- Tailored resume HTML + PDF
- Tailored cover letter HTML + PDF
- Bundle manifest JSON under `output/structured/YYYY-MM-DD/Applications/`
- Optional tracker TSV under `batch/tracker-additions/`

If you include `tracker`, the TSV is ready for `node merge-tracker.mjs`.

## Endpoints

### `GET /health`

Returns service status and whether `data/resume.json` exists.

### `GET /context`

Returns the structured resume in plain-text AI-friendly form:

- `currentJobTitle`
- `currentProfile`
- `currentWork`
- `currentSkills`
- `currentProjects`

### `POST /generate-resume`

Accepts a patch and renders a tailored resume HTML + PDF.

Example body:

```json
{
  "company": "Example Co",
  "role": "Backend Engineer",
  "language": "en",
  "format": "a4",
  "patch": {
    "jobTitle": "Backend Engineer",
    "profile": "<p>Backend-focused software developer...</p>",
    "competencies": ["Backend Engineering", "REST APIs", "Node.js", "AWS"],
    "work": [
      {
        "id": "286ca64e-9ab1-4d32-9905-0996d5d6a5c1",
        "description": "<ul><li><p>Tailored bullet...</p></li></ul>"
      }
    ]
  }
}
```

### `POST /generate-coverletter`

Accepts role/company paragraphs and renders a cover letter HTML + PDF.

## Output Paths

Generated files are written to:

```text
output/structured/YYYY-MM-DD/Resume/
output/structured/YYYY-MM-DD/Coverletter/
output/structured/YYYY-MM-DD/Applications/
```

## Design Notes

- `career-ops` remains the primary workflow and tracker
- `cv.md`, `profile.yml`, and reports are still the main human-facing layer
- `data/resume.json` is an alternate machine-friendly source for patch-based generation
- `generate-structured-application.mjs` is the bridge into the standard tracker/report pipeline
- This reuses the strongest architecture from `job-automation-n8n` without abandoning the newer repo
