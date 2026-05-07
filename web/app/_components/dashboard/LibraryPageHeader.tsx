import { DashboardPageHeader } from "@/app/_components/dashboard/DashboardPageHeader";

type LibraryPageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function LibraryPageHeader({
  eyebrow,
  title,
  description,
}: LibraryPageHeaderProps) {
  return (
    <DashboardPageHeader
      eyebrow={eyebrow}
      title={title}
      description={description}
    />
  );
}
