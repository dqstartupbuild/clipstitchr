import { Box, Text } from "ink";
import type { SlashCommandSuggestion } from "../interactiveShell/SlashCommandSuggestion.js";

export function InteractiveTuiSuggestions(input: {
  selectedIndex: number;
  suggestions: SlashCommandSuggestion[];
}) {
  if (input.suggestions.length === 0) {
    return null;
  }

  return (
    <Box flexDirection="column" marginTop={1}>
      {input.suggestions.slice(0, 6).map((suggestion, index) => {
        const isSelected = index === input.selectedIndex;

        return (
          <Box key={suggestion.value}>
            <Text color={isSelected ? "cyan" : undefined}>
              {isSelected ? "> " : "  "}
              {suggestion.value}
            </Text>
            <Text dimColor>  {suggestion.description}</Text>
          </Box>
        );
      })}
    </Box>
  );
}
