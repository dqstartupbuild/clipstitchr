export function getSwaprFormBoolean(formData: FormData, key: string) {
  return formData.get(key) === "true";
}
