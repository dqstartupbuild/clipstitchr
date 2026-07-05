import type { ReactNode } from "react";

type PanelHeaderProps = {
  actions?: ReactNode;
  description?: string;
  eyebrow?: string;
  title: string;
};

export function PanelHeader({
  actions,
  description,
  eyebrow,
  title,
}: PanelHeaderProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-xs font-bold uppercase text-accent-dark">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-1 text-lg font-bold text-text-primary">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-text-secondary">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
