import React from 'react';
import { useTodoStore } from '../store/useTodoStore.ts';
import { useTheme } from '../themes/ThemeContext.tsx';

interface TagsPanelProps {
  type: 'projects' | 'contexts';
}

// Panel inner width - flexible, pad to reasonable width
const PANEL_WIDTH = 18;
// Max visible rows in panel (height 10 - 2 border - 2 padding - 1 title = 5)
const MAX_VISIBLE_ROWS = 5;

// Pad string to fixed width
function pad(str: string, width: number): string {
  if (str.length >= width) return str.substring(0, width);
  return str + ' '.repeat(width - str.length);
}

export function TagsPanel({ type }: TagsPanelProps) {
  const tasks = useTodoStore(state => state.tasks);
  const focusedPanel = useTodoStore(state => state.focusedPanel);
  const projectsCursorIndex = useTodoStore(state => state.projectsCursorIndex);
  const contextsCursorIndex = useTodoStore(state => state.contextsCursorIndex);
  const theme = useTheme();

  // Use the appropriate cursor index for this panel type
  const cursorIndex = type === 'projects' ? projectsCursorIndex : contextsCursorIndex;

  // Collect all unique tags
  const allTags = new Set<string>();
  for (const task of tasks) {
    const tags = type === 'projects' ? task.projects : task.contexts;
    for (const tag of tags) {
      allTags.add(tag);
    }
  }

  const tagsList = Array.from(allTags).sort();
  const prefix = type === 'projects' ? '+' : '@';
  const title = type === 'projects' ? 'Projects' : 'Contexts';
  const tagColor = type === 'projects' ? theme.colors.project : theme.colors.context;

  const isFocused = focusedPanel === type;
  const borderColor = isFocused ? theme.colors.highlight : theme.colors.border;

  // Calculate visible window for scrolling
  const scrollOffset = Math.max(0, cursorIndex - MAX_VISIBLE_ROWS + 1);
  const visibleTags = tagsList.slice(scrollOffset, scrollOffset + MAX_VISIBLE_ROWS);

  // Build lines array - each tag on its own line
  const lines: Array<{ tag: string; isSelected: boolean; idx: number }> = [];
  visibleTags.forEach((tag, visibleIdx) => {
    const actualIdx = scrollOffset + visibleIdx;
    lines.push({
      tag,
      isSelected: isFocused && cursorIndex === actualIdx,
      idx: actualIdx,
    });
  });

  // Pad to fill remaining rows with empty lines
  while (lines.length < MAX_VISIBLE_ROWS) {
    lines.push({ tag: '', isSelected: false, idx: -1 });
  }

  return (
    <box borderStyle="single" borderColor={borderColor} paddingLeft={1} paddingRight={1} flexDirection="column" height="100%">
      <text fg={theme.colors.context}>{pad(title, PANEL_WIDTH)}</text>
      {tagsList.length === 0 ? (
        <>
          <text fg={theme.colors.muted}>{pad(`No ${type}`, PANEL_WIDTH)}</text>
          <text>{pad('', PANEL_WIDTH)}</text>
          <text>{pad('', PANEL_WIDTH)}</text>
          <text>{pad('', PANEL_WIDTH)}</text>
          <text>{pad('', PANEL_WIDTH)}</text>
        </>
      ) : (
        lines.map((line, idx) => {
          if (line.tag === '') {
            return <text key={`empty-${idx}`}>{pad('', PANEL_WIDTH)}</text>;
          }
          const cursor = line.isSelected ? '> ' : '  ';
          const content = pad(`${cursor}${prefix}${line.tag}`, PANEL_WIDTH);

          if (line.isSelected) {
            return (
              <text key={line.tag} fg={theme.colors.highlight} backgroundColor={theme.colors.selection}>
                {content}
              </text>
            );
          }
          return (
            <text key={line.tag} fg={tagColor}>
              {content}
            </text>
          );
        })
      )}
    </box>
  );
}
