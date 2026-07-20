"use client";

import type { MouseEvent, ReactNode } from "react";
import { useEffect, useRef } from "react";

type DashboardDialogViewportProps = {
  children: ReactNode;
  className?: string;
  elevated?: boolean;
  notification?: boolean;
  onClose?: () => void;
};

export function DashboardDialogViewport({
  children,
  className = "",
  elevated = false,
  notification = false,
  onClose,
}: DashboardDialogViewportProps) {
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    viewportRef.current?.scrollTo(0, 0);
  }, []);

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.currentTarget === event.target) {
      onClose?.();
    }
  };

  const classes = [
    "dashboard-dialog-viewport",
    elevated ? "dashboard-dialog-viewport-elevated" : "",
    notification ? "dashboard-dialog-viewport-notification" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={viewportRef}
      className={classes}
      onClick={onClose ? handleClick : undefined}
    >
      {children}
    </div>
  );
}
