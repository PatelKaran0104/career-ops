export function applyStructuredResumePatch(baseResume, patch = {}) {
  const resume = JSON.parse(JSON.stringify(baseResume));

  if (patch.jobTitle) {
    resume.personalDetails.jobTitle = patch.jobTitle;
  }

  if (patch.profile) {
    resume.content.profile.entries[0].text = patch.profile;
  }

  if (Array.isArray(patch.work)) {
    for (const workPatch of patch.work) {
      const entry = resume.content.work.entries.find((item) => item.id === workPatch.id);
      if (!entry) continue;
      if (workPatch.description) entry.description = workPatch.description;
      if (workPatch.jobTitle) entry.jobTitle = workPatch.jobTitle;
      if (workPatch.employer) entry.employer = workPatch.employer;
    }
  }

  if (Array.isArray(patch.skills)) {
    for (const skillPatch of patch.skills) {
      const entry = resume.content.skill.entries.find((item) => item.id === skillPatch.id);
      if (!entry) continue;
      if (skillPatch.skill) entry.skill = skillPatch.skill;
      if (skillPatch.infoHtml) entry.infoHtml = skillPatch.infoHtml;
    }
  }

  if (Array.isArray(patch.projects)) {
    for (const projectPatch of patch.projects) {
      const entry = resume.content.project?.entries?.find((item) => item.id === projectPatch.id);
      if (!entry) continue;
      if (projectPatch.name) entry.name = projectPatch.name;
      if (projectPatch.techStack) entry.techStack = projectPatch.techStack;
      if (projectPatch.description) entry.description = projectPatch.description;
    }
  }

  resume.meta = resume.meta || {};

  if (patch.showCertificates === false) {
    resume.meta.showCertificates = false;
  }

  if (patch.showProjects === false) {
    resume.meta.showProjects = false;
  }

  if (Array.isArray(patch.competencies) && patch.competencies.length > 0) {
    resume.meta.competencies = patch.competencies;
  }

  return resume;
}
