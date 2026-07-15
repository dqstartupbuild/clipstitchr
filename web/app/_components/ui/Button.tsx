import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "subtle" | "danger";
  size?: "sm" | "md";
  icon?: ReactNode;
  isLoading?: boolean;
};

const variantClasses = {
  primary: "bg-accent text-white hover:bg-accent-dark",
  secondary:
    "border border-border bg-surface text-text-primary hover:border-accent",
  subtle: "bg-surface-muted text-text-primary hover:bg-white",
  danger: "border border-red-200 bg-white text-red-600 hover:bg-red-50",
};

const sizeClasses = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
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
