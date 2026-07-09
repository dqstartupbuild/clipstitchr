export function getIsInteractivePromptCancelError(error: unknown) {
  return (
    error instanceof Error &&
    (error.name === "ExitPromptError" ||
      error.message.includes("User force closed the prompt"))
  );
}
