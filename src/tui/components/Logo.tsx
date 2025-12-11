import React, { useState, useEffect } from 'react';
import { useTheme } from '../themes/ThemeContext.tsx';

// ASCII art for "lazytodo" - compact 3-line version
const LOGO_LINES = [
  '┬  ┌─┐┌─┐┬ ┬┌┬┐┌─┐┌┬┐┌─┐',
  '│  ├─┤┌─┘└┬┘ │ │ │ │││ │',
  '┴─┘┴ ┴└─┘ ┴  ┴ └─┘─┴┘└─┘',
];

// Color cycle for animation - using theme-aware colors
const COLOR_CYCLE = [
  'highlight',
  'project',
  'context',
  'success',
  'priority',
] as const;

export function Logo() {
  const theme = useTheme();
  const [colorIndex, setColorIndex] = useState(0);
  const [charOffset, setCharOffset] = useState(0);

  // Animate colors on mount
  useEffect(() => {
    const interval = setInterval(() => {
      setColorIndex((prev) => (prev + 1) % COLOR_CYCLE.length);
      setCharOffset((prev) => (prev + 1) % LOGO_LINES[0].length);
    }, 150);

    // Stop animation after 2 seconds
    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  // Get color for a character based on position
  const getCharColor = (charIndex: number): string => {
    const offset = (charIndex + charOffset) % LOGO_LINES[0].length;
    const wavePosition = offset / LOGO_LINES[0].length;
    const cyclePosition = Math.floor(wavePosition * COLOR_CYCLE.length + colorIndex) % COLOR_CYCLE.length;
    const colorKey = COLOR_CYCLE[cyclePosition];

    // Map color key to actual theme color
    switch (colorKey) {
      case 'highlight': return theme.colors.highlight;
      case 'project': return theme.colors.project;
      case 'context': return theme.colors.context;
      case 'success': return theme.colors.success;
      case 'priority': return theme.colors.overdue;
      default: return theme.colors.highlight;
    }
  };

  return (
    <box flexDirection="column">
      {LOGO_LINES.map((line, lineIdx) => (
        <box key={lineIdx} flexDirection="row">
          {line.split('').map((char, charIdx) => (
            <text key={charIdx} fg={getCharColor(charIdx)}>{char}</text>
          ))}
        </box>
      ))}
    </box>
  );
}
