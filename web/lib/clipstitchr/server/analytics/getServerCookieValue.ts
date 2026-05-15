export function getServerCookieValue(cookieHeader: string | null, name: string) {
  if (!cookieHeader) {
    return null;
  }

  const encodedName = `${encodeURIComponent(name)}=`;
  const cookie = cookieHeader
    .split(";")
    .map((cookiePart) => cookiePart.trim())
    .find((cookiePart) => cookiePart.startsWith(encodedName));

  if (!cookie) {
    return null;
  }

  try {
    return decodeURIComponent(cookie.slice(encodedName.length));
  } catch {
    return null;
  }
}
