type BillingRenewalDisclosureProps = {
  className?: string;
};

export function BillingRenewalDisclosure({
  className,
}: BillingRenewalDisclosureProps) {
  return (
    <p className={className}>
      Plans renew monthly until canceled. Cancel in Settings at any time. Your
      plan stays active through the end of the paid month.
    </p>
  );
}
