type SocialConnectionNoticeProps = {
  platform?: string;
  reason?: string;
  status?: string;
};

export function SocialConnectionNotice({
  platform,
  reason,
  status,
}: SocialConnectionNoticeProps) {
  const platformLabel =
    platform === "tiktok"
      ? "TikTok"
      : platform === "instagram"
        ? "Instagram"
        : "That account";

  if (status === "connected") {
    return (
      <p
        className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700"
        role="status"
      >
        {platformLabel} is connected.
      </p>
    );
  }

  if (status === "connection_canceled") {
    return (
      <p
        className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800"
        role="status"
      >
        {platformLabel} was not connected. Nothing was saved.
      </p>
    );
  }

  if (status !== "connection_failed") {
    return null;
  }

  const message =
    reason === "state" || reason === "session"
      ? "That connection expired before it could finish. Start it again."
      : reason === "token_exchange"
        ? `${platformLabel} approved access, but we could not finish the secure connection. Try again.`
        : reason === "token_encryption" || reason === "account_save"
          ? `We could not safely save the ${platformLabel} connection. Try again.`
          : `We could not connect ${platformLabel}. Try again.`;

  return (
    <p
      className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700"
      role="alert"
    >
      {message}
    </p>
  );
}
