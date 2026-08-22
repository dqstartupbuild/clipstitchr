const excludedPrefixes = [
  "/api",
  "/dashboard",
  "/email/confirm",
  "/ingest",
  "/sign-in",
  "/sign-up",
  "/__clerk",
];

export function getPagePathUsesContentNegotiation(pathname: string) {
  const lastSegment = pathname.split("/").at(-1) ?? "";

  return (
    !lastSegment.includes(".") &&
    !excludedPrefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
  );
}
