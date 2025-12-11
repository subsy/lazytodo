import React from 'react';
import { useTheme } from '../themes/ThemeContext.tsx';

// Fixed-width padding for each line to prevent overlap
const LINE_WIDTH = 76;
function pad(str: string): string {
  if (str.length >= LINE_WIDTH) return str.substring(0, LINE_WIDTH);
  return str + ' '.repeat(LINE_WIDTH - str.length);
}

export function HelpScreen() {
  const theme = useTheme();

  // Build help text as array of lines
  const lines = [
    { text: 'Keyboard Shortcuts', color: 'highlight', bold: true },
    { text: ' ', color: 'text' },
    { text: 'Navigation:', color: 'project', bold: true },
    { text: '  j/k, Up/Down    Move up/down in list', color: 'text' },
    { text: '  TAB             Cycle through panels', color: 'text' },
    { text: '  g, G            Go to top/bottom', color: 'text' },
    { text: ' ', color: 'text' },
    { text: 'Task Actions:', color: 'project', bold: true },
    { text: '  space           Toggle task completion', color: 'text' },
    { text: '  Enter, e, i     Edit task text', color: 'text' },
    { text: '  Shift+A-Z / 0-9 Set priority', color: 'text' },
    { text: '  n, a            Add new task', color: 'text' },
    { text: '  y / p           Yank / Paste task', color: 'text' },
    { text: '  x               Delete task', color: 'text' },
    { text: ' ', color: 'text' },
    { text: 'View:', color: 'project', bold: true },
    { text: '  v               Toggle completed tasks', color: 'text' },
    { text: '  /               Search tasks', color: 'text' },
    { text: '  s               Cycle sort mode', color: 'text' },
    { text: '  u               Undo last action', color: 'text' },
    { text: ' ', color: 'text' },
    { text: 'Commands:', color: 'project', bold: true },
    { text: '  :q :quit        Quit', color: 'text' },
    { text: '  :w :write       Save file', color: 'text' },
    { text: '  :wq :x          Save and quit', color: 'text' },
    { text: '  :set            Open settings', color: 'text' },
    { text: '  :help           Show this help', color: 'text' },
    { text: ' ', color: 'text' },
    { text: 'Press any key to close...', color: 'muted' },
  ];

  const getColor = (colorName: string) => {
    switch (colorName) {
      case 'highlight': return theme.colors.highlight;
      case 'project': return theme.colors.project;
      case 'muted': return theme.colors.muted;
      default: return theme.colors.text;
    }
  };

  return (
    <box flexDirection="column" padding={1} backgroundColor={theme.colors.background} width="100%" height="100%">
      {lines.map((line, i) => (
        <text key={i} fg={getColor(line.color)} bold={line.bold}>{pad(line.text)}</text>
      ))}
    </box>
  );
}
