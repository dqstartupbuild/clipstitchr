export function requireSlashCommandArgument(input: {
  argument: string | undefined;
  message: string;
}) {
  if (!input.argument) {
    throw new Error(input.message);
  }

  return input.argument;
}
