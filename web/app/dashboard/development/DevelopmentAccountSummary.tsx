import { KeyRound } from "lucide-react";
import { developmentIdentity } from "@/lib/clipstitchr/development/auth/developmentIdentity";

export function DevelopmentAccountSummary() {
  return (
    <div className="flex items-center gap-3 px-2 py-3 text-sm text-text-secondary">
      <KeyRound aria-hidden className="h-4 w-4 shrink-0 text-text-tertiary" />
      <div className="min-w-0">
        <p className="truncate font-bold text-text-primary">
          {developmentIdentity.id}
        </p>
        <p className="truncate text-xs">{developmentIdentity.email}</p>
      </div>
    </div>
  );
}
