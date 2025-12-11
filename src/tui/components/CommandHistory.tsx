import React from 'react';
import { useTodoStore } from '../store/useTodoStore.ts';
import { useTheme } from '../themes/ThemeContext.tsx';

export function CommandHistory() {
  const commandLog = useTodoStore(state => state.commandLog);
  const theme = useTheme();

  // Show last entries that fit in the panel (roughly 6-7 lines with borders/padding)
  // Most recent at top
  const visibleLines = 6;
  const displayedCommands = commandLog.slice(-visibleLines).reverse();

  return (
    <box borderStyle="single" borderColor={theme.colors.border} paddingLeft={1} paddingRight={1} flexDirection="column" height="100%">
      <text fg={theme.colors.context}>History</text>
      {displayedCommands.length === 0 ? (
        <text fg={theme.colors.muted}>No commands yet</text>
      ) : (
        displayedCommands.map((cmd, i) => (
          <text key={i} fg={theme.colors.muted}>{cmd}</text>
        ))
      )}
    </box>
  );
}
