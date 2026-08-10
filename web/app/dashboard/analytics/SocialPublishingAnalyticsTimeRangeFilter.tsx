import type { ChangeEvent } from "react";
import { SelectInput } from "@/app/_components/ui/SelectInput";
import type { SocialPublishingAnalyticsTimeRange } from "@/lib/clipstitchr/types/SocialPublishingAnalyticsTimeRange";
import { socialPublishingAnalyticsTimeRangeOptions } from "@/lib/clipstitchr/utils/socialPublishingAnalyticsTimeRangeOptions";

type SocialPublishingAnalyticsTimeRangeFilterProps = {
  onChange: (timeRange: SocialPublishingAnalyticsTimeRange) => void;
  value: SocialPublishingAnalyticsTimeRange;
};

export function SocialPublishingAnalyticsTimeRangeFilter({
  onChange,
  value,
}: SocialPublishingAnalyticsTimeRangeFilterProps) {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value as SocialPublishingAnalyticsTimeRange);
  };

  return (
    <SelectInput
      className="bg-white"
      label="Time range"
      onChange={handleChange}
      options={socialPublishingAnalyticsTimeRangeOptions}
      value={value}
      wrapperClassName="w-full sm:w-56"
    />
  );
}
