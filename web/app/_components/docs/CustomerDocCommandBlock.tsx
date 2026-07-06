import { CopyTextButton } from "@/app/_components/ui/CopyTextButton";

type CustomerDocCommandBlockProps = {
  commands: string[];
};

export function CustomerDocCommandBlock({
  commands,
}: CustomerDocCommandBlockProps) {
  const commandText = commands.join("\n");

  return (
    <div className="mt-5 overflow-hidden rounded-lg border border-border bg-surface-elevated">
      <div className="flex justify-end border-b border-border bg-surface px-3 py-2">
        <CopyTextButton
          text={commandText}
          label="Copy"
          copiedLabel="Copied"
        />
      </div>
      <pre className="overflow-x-auto px-4 py-3 text-sm font-semibold leading-7 text-text-primary">
        <code>{commandText}</code>
      </pre>
    </div>
  );
}
