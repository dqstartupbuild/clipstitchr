type NotificationUnreadBadgeProps = {
  count: number;
};

export function NotificationUnreadBadge({
  count,
}: NotificationUnreadBadgeProps) {
  if (count <= 0) {
    return null;
  }

  return (
    <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold leading-none text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}
