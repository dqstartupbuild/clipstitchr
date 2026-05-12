export function getCliprFinalClipName(productName: string, createdAt: string) {
  const date = new Date(createdAt);
  const datePart = Number.isNaN(date.getTime())
    ? "clip"
    : date.toISOString().slice(0, 10);

  return `Clipr - ${productName.trim() || "Product"} - ${datePart}`;
}
