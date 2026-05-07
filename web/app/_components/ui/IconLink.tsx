import type { AnchorHTMLAttributes, ReactNode } from "react";

type IconLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  label: string;
  icon: ReactNode;
  variant?: "default" | "danger";
};

export function IconLink({
  label,
  icon,
  variant = "default",
  className = "",
  ...props
}: IconLinkProps) {
  return (
    <a
      aria-label={label}
      title={label}
      className={[
        "inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        variant === "danger"
          ? "border-red-200 bg-white text-red-600 hover:bg-red-50"
          : "border-border bg-white text-text-secondary hover:border-accent hover:text-accent",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {icon}
    </a>
  );
}
