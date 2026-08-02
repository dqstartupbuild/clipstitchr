import type { ReactNode } from "react";

type PublishingStateMessageProps = {
  action?: ReactNode;
  message: string;
  title: string;
  tone?: "error" | "neutral" | "warning";
};

export function PublishingStateMessage({
  action,
  message,
  title,
  tone = "neutral",
}: PublishingStateMessageProps) {
  return (
    <section
      aria-live={tone === "error" ? "assertive" : "polite"}
      className="publishing-state-message"
      data-tone={tone}
    >
      <h2>{title}</h2>
      <p>{message}</p>
      {action ? <div className="publishing-state-message-action">{action}</div> : null}
    </section>
  );
}
