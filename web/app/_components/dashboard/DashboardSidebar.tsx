import { UserButton } from "@clerk/nextjs";
import {
  Home,
  Images,
  Library,
  CirclePlay,
  Scissors,
  Settings,
  Shuffle,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { BrandMark } from "@/app/_components/BrandMark";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/uploads", label: "Library", icon: Library },
  { href: "/dashboard/avatars", label: "Avatars", icon: UserRound },
  { href: "/dashboard/stitchr", label: "Stitchr", icon: Scissors },
  { href: "/dashboard/clipr", label: "Clipr", icon: CirclePlay },
  { href: "/dashboard/swipr", label: "Swipr", icon: Images },
  { href: "/dashboard/swapr", label: "Swapr", icon: Shuffle },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar() {
  return (
    <aside className="border-b border-border bg-white px-4 py-4 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between lg:block">
        <BrandMark />
        <div className="lg:hidden">
          <UserButton />
        </div>
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
      <div className="mt-auto hidden items-center gap-3 border-t border-border pt-4 text-sm font-semibold text-text-secondary lg:flex">
        <UserButton />
        Account
      </div>
    </aside>
  );
}
