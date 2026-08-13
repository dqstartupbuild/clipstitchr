const CLERK_USER_ID_PATTERN = /^user_[A-Za-z0-9_-]+$/;

export function assertStudioBetaOwnerId(ownerId: string) {
  if (
    ownerId.length > 128 ||
    !CLERK_USER_ID_PATTERN.test(ownerId) ||
    ownerId.includes("@")
  ) {
    throw new Error("A valid Clerk user ID is required.");
  }
}
