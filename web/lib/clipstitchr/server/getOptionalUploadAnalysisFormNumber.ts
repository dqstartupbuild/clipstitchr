export function getOptionalUploadAnalysisFormNumber(
  formData: FormData,
  key: string,
) {
  const value = formData.get(key);

  if (typeof value !== "string" || !value) {
    return undefined;
  }

  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : undefined;
}
