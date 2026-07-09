export function normalizeSlashCommandSearchTerm(term: string | undefined) {
  return (term ?? "").trimStart().replace(/\s+/g, " ");
}
