import { DashboardAlert } from "@/app/_components/dashboard/DashboardAlert";

type OnboardingErrorAlertProps = {
  message: string | null;
};

export function OnboardingErrorAlert({ message }: OnboardingErrorAlertProps) {
  if (!message) {
    return null;
  }

  return <DashboardAlert variant="error">{message}</DashboardAlert>;
}
