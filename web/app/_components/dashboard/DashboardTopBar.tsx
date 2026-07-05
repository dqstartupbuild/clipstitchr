import { DashboardNotificationBell } from "@/app/_components/dashboard/DashboardNotificationBell";

export function DashboardTopBar() {
  return (
    <div className="mb-5 hidden items-center justify-end lg:flex">
      <DashboardNotificationBell />
    </div>
  );
}
