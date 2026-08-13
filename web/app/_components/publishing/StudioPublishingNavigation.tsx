"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const destinations = [
  ["Compose", "/dashboard/studio/publishing/compose"],
  ["Calendar", "/dashboard/studio/publishing/calendar"],
  ["Posts", "/dashboard/studio/publishing/posts"],
  ["Analytics", "/dashboard/studio/publishing/analytics"],
  ["Connections", "/dashboard/studio/publishing/connections"],
] as const;

type StudioPublishingNavigationProps = {
  productName: string;
};

export function StudioPublishingNavigation({
  productName,
}: StudioPublishingNavigationProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Postiz Beta workspace">
      <p className="publishing-workspace-name">Postiz Beta</p>
      <p className="publishing-workspace-product">
        Publishing for <strong>{productName}</strong>
      </p>
      <div className="publishing-workspace-links">
        {destinations.map(([label, href]) => {
          const isCurrent = pathname === href;
          return (
            <Link
              aria-current={isCurrent ? "page" : undefined}
              className="publishing-workspace-link"
              data-current={isCurrent || undefined}
              href={href}
              key={href}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
