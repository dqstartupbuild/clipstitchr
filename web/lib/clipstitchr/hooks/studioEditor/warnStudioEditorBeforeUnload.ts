export function warnStudioEditorBeforeUnload(event: BeforeUnloadEvent): void {
  event.preventDefault();
  event.returnValue = "";
}
