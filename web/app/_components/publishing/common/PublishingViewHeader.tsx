import type { ReactNode } from "react";

type PublishingViewHeaderProps = {
  action?: ReactNode;
  description: string;
  title: string;
  titleId?: string;
};

export function PublishingViewHeader({
  action,
  description,
  title,
  titleId,
}: PublishingViewHeaderProps) {
  return (
    <header className="publishing-view-header">
      <div className="publishing-view-header-copy">
        <h1 id={titleId}>{title}</h1>
        <p>{description}</p>
      </div>
      {action ? <div className="publishing-view-header-action">{action}</div> : null}
    </header>
  );
}
