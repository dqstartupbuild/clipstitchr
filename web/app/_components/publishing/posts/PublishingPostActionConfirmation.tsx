type PublishingPostActionConfirmationProps = {
  actionLabel: string;
  busy: boolean;
  explanation: string;
  onCancel: () => void;
  onConfirm: () => void;
  tone?: "danger" | "neutral";
};

export function PublishingPostActionConfirmation({
  actionLabel,
  busy,
  explanation,
  onCancel,
  onConfirm,
  tone = "neutral",
}: PublishingPostActionConfirmationProps) {
  return (
    <div className="publishing-action-confirmation" data-tone={tone} role="alert">
      <p>{explanation}</p>
      <div>
        <button type="button" onClick={onCancel} disabled={busy}>
          Keep post
        </button>
        <button type="button" onClick={onConfirm} disabled={busy}>
          {busy ? "Working…" : actionLabel}
        </button>
      </div>
    </div>
  );
}
