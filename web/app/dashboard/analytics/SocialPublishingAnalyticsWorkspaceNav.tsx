import { SegmentedControl } from "@/app/_components/ui/SegmentedControl";

export type SocialPublishingAnalyticsWorkspace =
  | "overview"
  | "strategy"
  | "posts";

type SocialPublishingAnalyticsWorkspaceNavProps = {
  postCount: number;
  value: SocialPublishingAnalyticsWorkspace;
  onChange: (value: SocialPublishingAnalyticsWorkspace) => void;
};

const workspaceOptions = [
  { label: "Overview", value: "overview" },
  { label: "Strategy", value: "strategy" },
  { label: "Posts", value: "posts" },
] satisfies {
  label: string;
  value: SocialPublishingAnalyticsWorkspace;
}[];

export function SocialPublishingAnalyticsWorkspaceNav({
  postCount,
  value,
  onChange,
}: SocialPublishingAnalyticsWorkspaceNavProps) {
  return (
    <SegmentedControl
      ariaLabel="Analytics views"
      className="w-full sm:w-auto"
      onChange={onChange}
      options={workspaceOptions.map((option) => ({
        ...option,
        count: option.value === "posts" ? postCount : undefined,
      }))}
      value={value}
    />
  );
}
