export function getSwaprFormFile(formData: FormData, key: string) {
  const value = formData.get(key);

  if (!(value instanceof File)) {
    throw new Error(`Missing ${key} file.`);
  }

  return value;
}
