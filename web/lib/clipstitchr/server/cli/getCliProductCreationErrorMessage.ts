const fallbackMessage = "Unable to save this product.";

export function getCliProductCreationErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "data" in error) {
    const data = (error as { data?: { message?: unknown } }).data;

    if (typeof data?.message === "string" && data.message.trim()) {
      return data.message;
    }
  }

  return error instanceof Error && error.message.trim()
    ? error.message
    : fallbackMessage;
}
