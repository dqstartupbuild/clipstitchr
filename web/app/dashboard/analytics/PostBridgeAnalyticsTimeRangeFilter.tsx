import type { ChangeEvent } from "react";
import { SelectInput } from "@/app/_components/ui/SelectInput";
import type { PostBridgeAnalyticsTimeRange } from "@/lib/clipstitchr/types/PostBridgeAnalyticsTimeRange";
import { postBridgeAnalyticsTimeRangeOptions } from "@/lib/clipstitchr/utils/postBridgeAnalyticsTimeRangeOptions";

type PostBridgeAnalyticsTimeRangeFilterProps = {
  onChange: (timeRange: PostBridgeAnalyticsTimeRange) => void;
  value: PostBridgeAnalyticsTimeRange;
};

export function PostBridgeAnalyticsTimeRangeFilter({
  onChange,
  value,
}: PostBridgeAnalyticsTimeRangeFilterProps) {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value as PostBridgeAnalyticsTimeRange);
  };

  return (
    <SelectInput
      className="bg-white"
      label="Time range"
      onChange={handleChange}
      options={postBridgeAnalyticsTimeRangeOptions}
      value={value}
      wrapperClassName="w-full sm:w-56"
    />
  );
}
