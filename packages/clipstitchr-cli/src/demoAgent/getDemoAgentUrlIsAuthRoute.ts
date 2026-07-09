export function getDemoAgentUrlIsAuthRoute(url: string) {
  const parsedUrl = new URL(url);

  return /\/(auth|login|log-in|signin|sign-in|signup|sign-up|session|sessions)(\/|$)/i.test(
    parsedUrl.pathname,
  );
}
