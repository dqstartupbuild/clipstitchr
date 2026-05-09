export function getOptionalUploadAnalysisFormFile(
  formData: FormData,
  key: string,
) {
  const value = formData.get(key);

  if (value === null) {
    return undefined;
  }

  if (!(value instanceof File)) {
    throw new Error(`Invalid ${key} file.`);
  }

  return value;
}
