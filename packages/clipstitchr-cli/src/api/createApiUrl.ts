export function createApiUrl(apiBaseUrl: string, pathname: string) {
  return new URL(pathname, `${apiBaseUrl.replace(/\/$/, "")}/`).toString();
}
