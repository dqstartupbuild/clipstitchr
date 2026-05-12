export function getCliprTemplateRequiredVariables(template: string) {
  return Array.from(
    new Set(
      Array.from(template.matchAll(/{{\s*([a-zA-Z0-9_]+)\s*}}/g))
        .map((match) => match[1])
        .filter(Boolean),
    ),
  );
}
