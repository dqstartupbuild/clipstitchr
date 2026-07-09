export function toSlashOptionKey(flag: string) {
  return flag.replace(/-([a-z])/g, (_match, letter: string) =>
    letter.toUpperCase(),
  );
}
