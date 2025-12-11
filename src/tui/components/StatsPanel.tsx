import React from 'react';
import { useTodoStore } from '../store/useTodoStore.ts';
import { useTheme } from '../themes/ThemeContext.tsx';

// Calculate the required width for stats panel based on content
export function useStatsPanelWidth(): number {
  const tasks = useTodoStore(state => state.tasks);
  const today = new Date().toISOString().split('T')[0];

  const activeTasks = tasks.filter(t => !t.completed);
  const dueOverdue = activeTasks.filter(t => {
    if (!t.metadata.due) return false;
    return t.metadata.due <= today;
  });
  const completedToday = tasks.filter(t => t.completed && t.completionDate === today);

  // Calculate max line width: "> LABEL: VALUE"
  const lines = [
    `> DUE/OVERDUE: ${dueOverdue.length}`,
    `> DONE TODAY: ${completedToday.length}`,
    `> ACTIVE: ${activeTasks.length}/${tasks.length}`,
  ];

  const maxLineWidth = Math.max(...lines.map(l => l.length));
  // Add border (2) + padding (2) + 1 extra
  return maxLineWidth + 5;
}

export function StatsPanel() {
  const tasks = useTodoStore(state => state.tasks);
  const focusedPanel = useTodoStore(state => state.focusedPanel);
  const panelCursorIndex = useTodoStore(state => state.panelCursorIndex);
  const theme = useTheme();

  const today = new Date().toISOString().split('T')[0];

  // Calculate stats
  const activeTasks = tasks.filter(t => !t.completed);
  const dueOverdue = activeTasks.filter(t => {
    if (!t.metadata.due) return false;
    return t.metadata.due <= today;
  });
  const completedToday = tasks.filter(t => t.completed && t.completionDate === today);

  const stats = [
    { label: 'DUE/OVERDUE', value: dueOverdue.length, color: theme.colors.overdue },
    { label: 'DONE TODAY', value: completedToday.length, color: theme.colors.success },
    { label: 'ACTIVE', value: `${activeTasks.length}/${tasks.length}`, color: theme.colors.textDim },
  ];

  const isFocused = focusedPanel === 'stats';
  const borderColor = isFocused ? theme.colors.highlight : theme.colors.border;

  // Calculate line width for padding
  const lines = stats.map(stat => `  ${stat.label}: ${stat.value}`);
  const maxWidth = Math.max(...lines.map(l => l.length));

  // Pad string to fixed width
  const pad = (str: string): string => {
    if (str.length >= maxWidth) return str;
    return str + ' '.repeat(maxWidth - str.length);
  };

  // Build lines with padding
  const renderedLines = stats.map((stat, idx) => {
    const isSelected = isFocused && panelCursorIndex === idx;
    const cursor = isSelected ? '> ' : '  ';
    return {
      line: pad(`${cursor}${stat.label}: ${stat.value}`),
      color: isSelected ? theme.colors.highlight : stat.color,
    };
  });

  return (
    <box borderStyle="single" borderColor={borderColor} paddingLeft={1} paddingRight={1} flexDirection="column" height="100%">
      {renderedLines.map((item, idx) => (
        <text key={idx} fg={item.color}>{item.line}</text>
      ))}
    </box>
  );
}
