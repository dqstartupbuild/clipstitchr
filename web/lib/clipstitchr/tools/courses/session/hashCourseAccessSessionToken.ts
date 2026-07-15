export async function hashCourseAccessSessionToken(token: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(token),
  );

  return Buffer.from(digest).toString("hex");
}
