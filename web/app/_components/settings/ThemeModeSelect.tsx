"use client";

import { SelectInput } from "@/app/_components/ui/SelectInput";
import { isThemeMode } from "@/lib/clipstitchr/theme/isThemeMode";
import { useThemeMode } from "@/lib/clipstitchr/theme/useThemeMode";

const themeModeOptions = [
  { label: "System", value: "system" },
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
];

export function ThemeModeSelect() {
  const { themeMode, setThemeMode } = useThemeMode();

  return (
    <SelectInput
      label="Color mode"
      options={themeModeOptions}
      value={themeMode}
      onChange={(event) => {
        const nextThemeMode = event.currentTarget.value;

        if (isThemeMode(nextThemeMode)) {
          setThemeMode(nextThemeMode);
        }
      }}
    />
  );
}
