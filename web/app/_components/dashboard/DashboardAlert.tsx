import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";

type DashboardAlertVariant = "error" | "info" | "success" | "warning";

type DashboardAlertProps = {
  children: ReactNode;
  title?: string;
  variant?: DashboardAlertVariant;
};

const variantClasses: Record<DashboardAlertVariant, string> = {
  error: "border-red-200 bg-red-50 text-red-700",
  info: "border-accent/30 bg-surface-muted text-accent-dark",
  success: "border-accent/30 bg-surface-muted text-accent-dark",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
};

const variantIcons = {
  error: AlertCircle,
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
};

export function DashboardAlert({
  children,
  title,
  variant = "info",
}: DashboardAlertProps) {
  const Icon = variantIcons[variant];

  return (
    <div
      className={[
        "rounded-lg border p-4 text-sm shadow-[0_14px_42px_rgba(0,0,0,0.12)]",
        variantClasses[variant],
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <Icon aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="min-w-0">
          {title ? <p className="font-bold">{title}</p> : null}
          <div className={title ? "mt-1" : ""}>{children}</div>
        </div>
      </div>
    </div>
  );
}
