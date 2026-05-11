export function getCliprTemplateVariables(template: string) {
  return Array.from(template.matchAll(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g))
    .map((match) => match[1])
    .filter((variable, index, variables) => variables.indexOf(variable) === index);
}
