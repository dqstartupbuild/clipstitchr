import {
  Clapperboard,
  FileVideo,
  Film,
  Home,
  LayoutDashboard,
  PlusCircle,
  UploadCloud,
} from "lucide-react";
import Link from "next/link";
import { BrandMark } from "@/app/_components/BrandMark";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard#upload-panel", label: "Uploads", icon: UploadCloud },
  { href: "/dashboard#ugc-clips", label: "UGC Clips", icon: Film },
  { href: "/dashboard#demo-videos", label: "Demo Videos", icon: Clapperboard },
  { href: "/dashboard#created-videos", label: "Created Videos", icon: FileVideo },
  { href: "/dashboard/create", label: "Create Video", icon: PlusCircle },
];

export function DashboardSidebar() {
  return (
    <aside className="border-b border-border bg-white px-4 py-4 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between lg:block">
        <BrandMark />
        <Link
          href="/"
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm font-semibold text-text-secondary hover:text-accent lg:mt-8"
        >
          <Home aria-hidden className="h-4 w-4" />
          Home
        </Link>
      </div>
      <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:mt-8 lg:flex-col lg:overflow-visible lg:pb-0">
        {links.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex min-w-max items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-muted hover:text-accent"
            >
              <Icon aria-hidden className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
