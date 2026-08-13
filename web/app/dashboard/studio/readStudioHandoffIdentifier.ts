const STUDIO_HANDOFF_IDENTIFIER = /^[A-Za-z0-9_-]{1,120}$/;

export function readStudioHandoffIdentifier(value: string | null) {
  const identifier = value?.trim();

  return identifier && STUDIO_HANDOFF_IDENTIFIER.test(identifier)
    ? identifier
    : undefined;
}
