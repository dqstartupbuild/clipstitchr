export function getGenerationRequiredForAutomationTask(taskType: string) {
  return new Set([
    "stitchr-draft",
    "stitchr-render",
    "swapr-video",
    "clipr-video",
    "avatar-photo",
    "swipr-draft",
  ]).has(taskType);
}
