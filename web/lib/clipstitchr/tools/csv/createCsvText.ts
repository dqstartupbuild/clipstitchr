export function createCsvText(rows: readonly (readonly string[])[]) {
  return rows
    .map((row) =>
      row
        .map((value) => {
          const escaped = value.replaceAll('"', '""');
          return /[",\n\r]/.test(value) ? `"${escaped}"` : escaped;
        })
        .join(","),
    )
    .join("\r\n");
}
