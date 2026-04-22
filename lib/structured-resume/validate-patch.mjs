export function validateStructuredResumePatch(baseResume, patch) {
  const errors = [];
  const warnings = [];

  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) {
    errors.push('patch must be a plain object');
    return { valid: false, errors, warnings };
  }

  const workIds = new Set((baseResume.content.work?.entries || []).map((entry) => entry.id));
  const skillIds = new Set((baseResume.content.skill?.entries || []).map((entry) => entry.id));
  const projectIds = new Set((baseResume.content.project?.entries || []).map((entry) => entry.id));

  const hasActionableContent = Boolean(
    (typeof patch.jobTitle === 'string' && patch.jobTitle.trim()) ||
    (typeof patch.profile === 'string' && patch.profile.trim()) ||
    (Array.isArray(patch.work) && patch.work.length > 0) ||
    (Array.isArray(patch.skills) && patch.skills.length > 0) ||
    (Array.isArray(patch.projects) && patch.projects.length > 0) ||
    patch.showCertificates === false ||
    patch.showProjects === false ||
    (Array.isArray(patch.competencies) && patch.competencies.length > 0)
  );

  if (!hasActionableContent) {
    errors.push('patch has no actionable content');
    return { valid: false, errors, warnings };
  }

  if (patch.work !== undefined && !Array.isArray(patch.work)) errors.push('patch.work must be an array if present');
  if (patch.skills !== undefined && !Array.isArray(patch.skills)) errors.push('patch.skills must be an array if present');
  if (patch.projects !== undefined && !Array.isArray(patch.projects)) errors.push('patch.projects must be an array if present');

  if (errors.length > 0) {
    return { valid: false, errors, warnings };
  }

  for (const item of patch.work || []) {
    if (!item?.id) {
      warnings.push('work item missing id');
      continue;
    }
    if (!workIds.has(item.id)) warnings.push(`unknown work id "${item.id}" will be ignored`);
  }

  for (const item of patch.skills || []) {
    if (!item?.id) {
      warnings.push('skill item missing id');
      continue;
    }
    if (!skillIds.has(item.id)) warnings.push(`unknown skill id "${item.id}" will be ignored`);
  }

  for (const item of patch.projects || []) {
    if (!item?.id) {
      warnings.push('project item missing id');
      continue;
    }
    if (!projectIds.has(item.id)) warnings.push(`unknown project id "${item.id}" will be ignored`);
  }

  return { valid: true, errors, warnings };
}
