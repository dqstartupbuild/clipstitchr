type DashboardGateStateProps = {
  message: string;
};

export function DashboardGateState({ message }: DashboardGateStateProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <p className="text-center text-sm font-semibold text-text-secondary">
        {message}
      </p>
    </div>
  );
}
