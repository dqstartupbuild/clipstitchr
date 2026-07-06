export function createStartCommandForDirectory(
  directory: string,
  startCommand?: string,
) {
  if (!startCommand) {
    return undefined;
  }

  return directory === "." ? startCommand : `cd ${directory} && ${startCommand}`;
}
