import type { ChangeEvent } from "react";
import { SelectInput } from "@/app/_components/ui/SelectInput";
import type { ContentAnalyticsSourceFilter as ContentAnalyticsSourceFilterValue } from "@/lib/clipstitchr/types/ContentAnalyticsSourceFilter";
import { contentAnalyticsSourceFilterOptions } from "@/lib/clipstitchr/utils/contentAnalyticsSourceFilterOptions";

type ContentAnalyticsSourceFilterProps = {
  onChange: (source: ContentAnalyticsSourceFilterValue) => void;
  value: ContentAnalyticsSourceFilterValue;
};

export function ContentAnalyticsSourceFilter({
  onChange,
  value,
}: ContentAnalyticsSourceFilterProps) {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value as ContentAnalyticsSourceFilterValue);
  };

  return (
    <SelectInput
      className="bg-white"
      label="Posts"
      onChange={handleChange}
      options={contentAnalyticsSourceFilterOptions}
      value={value}
      wrapperClassName="w-full sm:w-56"
    />
  );
}
