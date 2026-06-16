export function getMusicUploadDurationSeconds(value: FormDataEntryValue | null) {
  const duration = typeof value === "string" ? Number(value) : 0;

  if (!Number.isFinite(duration) || duration < 0) {
    return 0;
  }

  return Math.round(duration * 100) / 100;
}
