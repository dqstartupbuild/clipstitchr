import { UploadDestinationMenuButton } from "@/app/_components/dashboard/UploadDestinationMenuButton";

export function DashboardHeaderActions() {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <UploadDestinationMenuButton />
    </div>
  );
}
