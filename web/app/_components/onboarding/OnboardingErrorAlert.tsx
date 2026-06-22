type OnboardingErrorAlertProps = {
  message: string | null;
};

export function OnboardingErrorAlert({ message }: OnboardingErrorAlertProps) {
  if (!message) {
    return null;
  }

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
      {message}
    </div>
  );
}
