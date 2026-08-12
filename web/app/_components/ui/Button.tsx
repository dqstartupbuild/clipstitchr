import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "subtle" | "danger";
  size?: "sm" | "md";
  icon?: ReactNode;
  isLoading?: boolean;
};

const variantClasses = {
  primary: "bg-accent text-text-inverse hover:bg-accent-dark",
  secondary:
    "border border-border bg-surface text-text-primary hover:border-accent",
  subtle: "bg-surface-muted text-text-primary hover:bg-white",
  danger:
    "border border-accent/40 bg-surface-muted text-accent-dark hover:bg-surface-elevated",
};

const sizeClasses = {
  sm: "min-h-9 px-3 py-2 text-sm",
  md: "min-h-10 px-4 py-2 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  icon,
  isLoading = false,
  className = "",
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      aria-busy={isLoading || undefined}
      className={[
        "ui-button inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        sizeClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
      ) : (
        icon
      )}
      {children}
    </button>
  );
}
