type CustomerDocCommandBlockProps = {
  commands: string[];
};

export function CustomerDocCommandBlock({
  commands,
}: CustomerDocCommandBlockProps) {
  return (
    <pre className="mt-5 overflow-x-auto rounded-lg border border-border bg-surface-elevated px-4 py-3 text-sm font-semibold leading-7 text-text-primary">
      <code>{commands.join("\n")}</code>
    </pre>
  );
}
