export function updateStudioEditorValue<T extends object>(
  current: T,
  change: Partial<T>,
  onChange: (value: T) => void,
) {
  onChange({ ...current, ...change });
}
