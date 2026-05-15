export function setCookieValue(
  name: string,
  value: string,
  maxAgeSeconds: number,
) {
  if (typeof document === "undefined") {
    return;
  }

  const secureAttribute =
    window.location.protocol === "https:" ? "; Secure" : "";

  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
    value,
  )}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax${secureAttribute}`;
}
