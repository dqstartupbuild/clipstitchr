import Link from "next/link";

export function SocialMigrationNotice() {
  return (
    <aside className="rounded-lg bg-surface-elevated p-4 text-sm leading-6 text-text-secondary">
      <p className="font-bold text-text-primary">
        Moving from Post Bridge?
      </p>
      <p className="mt-1">
        Connect TikTok and Instagram here. ClipStitchr cannot copy credentials
        from Post Bridge. Your old schedule and analytics stay available as
        read-only history.
      </p>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
        <Link
          className="font-semibold text-accent-dark hover:text-white"
          href="/dashboard/schedule?legacy=1"
        >
          View old schedule
        </Link>
        <Link
          className="font-semibold text-accent-dark hover:text-white"
          href="/dashboard/analytics?legacy=1"
        >
          View old analytics
        </Link>
      </div>
    </aside>
  );
}
