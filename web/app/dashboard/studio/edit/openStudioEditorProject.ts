export function openStudioEditorProject(
  projectId: string,
  replace: (href: string) => void,
) {
  replace(`/dashboard/studio/edit?projectId=${encodeURIComponent(projectId)}`);
}
