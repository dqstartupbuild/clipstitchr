import type { PostBridgeSocialAccount } from "@/lib/clipstitchr/types/PostBridgeSocialAccount";
import { getPostBridgePlatformLabel } from "@/lib/clipstitchr/utils/getPostBridgePlatformLabel";

type PostBridgeAccountCheckboxProps = {
  account: PostBridgeSocialAccount;
  checked: boolean;
  disabled?: boolean;
  onChange: (accountId: number, checked: boolean) => void;
};

export function PostBridgeAccountCheckbox({
  account,
  checked,
  disabled = false,
  onChange,
}: PostBridgeAccountCheckboxProps) {
  return (
    <label className="flex items-center gap-3 rounded-lg border border-border bg-white px-3 py-2 text-sm font-semibold text-text-primary">
      <input
        type="checkbox"
        className="h-4 w-4 accent-accent"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(account.id, event.target.checked)}
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate">{account.username}</span>
        <span className="mt-0.5 block text-xs text-text-tertiary">
          {getPostBridgePlatformLabel(account.platform)}
        </span>
      </span>
    </label>
  );
}
