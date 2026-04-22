import { loadStructuredResumeOrThrow, stripHtml, stripHtmlPreserveBullets } from './common.mjs';

export function getStructuredResumeContext() {
  const resume = loadStructuredResumeOrThrow();

  return {
    currentJobTitle: resume.personalDetails.jobTitle || '',
    currentProfile: stripHtml(resume.content.profile?.entries?.[0]?.text || ''),
    currentWork: (resume.content.work?.entries || []).map((entry) => ({
      id: entry.id,
      employer: entry.employer,
      jobTitle: entry.jobTitle,
      location: entry.location,
      startDate: entry.startDateNew,
      endDate: entry.endDateNew,
      description: stripHtmlPreserveBullets(entry.description || ''),
    })),
    currentSkills: (resume.content.skill?.entries || []).map((entry) => ({
      id: entry.id,
      skill: entry.skill,
      details: stripHtml(entry.infoHtml || ''),
    })),
    currentProjects: (resume.content.project?.entries || []).map((entry) => ({
      id: entry.id,
      name: entry.name,
      techStack: entry.techStack,
      url: entry.url || null,
      description: stripHtmlPreserveBullets(entry.description || ''),
    })),
  };
}
