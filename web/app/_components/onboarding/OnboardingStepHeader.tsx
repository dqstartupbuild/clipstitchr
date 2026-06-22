type OnboardingStepHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function OnboardingStepHeader({
  eyebrow,
  title,
  description,
}: OnboardingStepHeaderProps) {
  return (
    <div className="min-w-0">
      <p className="text-sm font-semibold text-accent-dark">{eyebrow}</p>
      <h2 className="mt-1 text-xl font-bold text-text-primary">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
        {description}
      </p>
    </div>
  );
}
