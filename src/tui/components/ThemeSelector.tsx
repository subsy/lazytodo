import React from 'react';
import { themes, themeNames, type Theme } from '../themes/index.ts';
import { useKeyboard } from '@opentui/react';
import { useTheme } from '../themes/ThemeContext.tsx';

interface ThemeSelectorProps {
  onClose: () => void;
  onSelect: (themeName: string) => void;
  currentTheme: string;
}

function ColorSwatch({ color }: { color: string }) {
  return <text backgroundColor={color}>{'  '}</text>;
}

function ThemePreview({ theme, isSelected, activeTheme }: { theme: Theme; isSelected: boolean; activeTheme: Theme }) {
  const c = theme.colors;

  return (
    <box flexDirection="row" backgroundColor={isSelected ? activeTheme.colors.selection : undefined}>
      <text fg={isSelected ? activeTheme.colors.highlight : activeTheme.colors.text}>
        {isSelected ? '> ' : '  '}
      </text>
      <text fg={isSelected ? activeTheme.colors.highlight : activeTheme.colors.text} bold={isSelected}>
        {theme.name.padEnd(14)}
      </text>
      <ColorSwatch color={c.priorityHigh} />
      <ColorSwatch color={c.priorityMedium} />
      <ColorSwatch color={c.priorityLow} />
      <text> </text>
      <ColorSwatch color={c.success} />
      <ColorSwatch color={c.highlight} />
      <text> </text>
      <ColorSwatch color={c.project} />
      <ColorSwatch color={c.context} />
      <ColorSwatch color={c.date} />
      <text> </text>
      <ColorSwatch color={c.text} />
      <ColorSwatch color={c.border} />
    </box>
  );
}

export function ThemeSelector({ onClose, onSelect, currentTheme }: ThemeSelectorProps) {
  const [selectedIndex, setSelectedIndex] = React.useState(
    themeNames.indexOf(currentTheme) >= 0 ? themeNames.indexOf(currentTheme) : 0
  );
  const activeTheme = useTheme();

  useKeyboard((key: any) => {
    const keyName = key.name || key.char;

    if (keyName === 'escape' || keyName === 'q') {
      onClose();
      return;
    }

    if (keyName === 'up' || keyName === 'k') {
      setSelectedIndex(prev => Math.max(0, prev - 1));
      return;
    }

    if (keyName === 'down' || keyName === 'j') {
      setSelectedIndex(prev => Math.min(themeNames.length - 1, prev + 1));
      return;
    }

    if (keyName === 'return' || keyName === 'enter') {
      onSelect(themeNames[selectedIndex]!);
      onClose();
      return;
    }
  });

  return (
    <box flexDirection="column" padding={2} backgroundColor={activeTheme.colors.background}>
      <text fg={activeTheme.colors.highlight} bold>Select Theme</text>
      <text> </text>

      <box flexDirection="row">
        <text fg={activeTheme.colors.muted}>{'                '.padEnd(16)}</text>
        <text fg={activeTheme.colors.muted}>Pri   </text>
        <text fg={activeTheme.colors.muted}>UI  </text>
        <text fg={activeTheme.colors.muted}>Tags    </text>
        <text fg={activeTheme.colors.muted}>Base</text>
      </box>
      <text> </text>

      {themeNames.map((name, index) => (
        <ThemePreview
          key={name}
          theme={themes[name]!}
          isSelected={index === selectedIndex}
          activeTheme={activeTheme}
        />
      ))}

      <text> </text>
      <text fg={activeTheme.colors.muted}>↑/↓ or j/k to navigate • Enter to select • ESC to cancel</text>
      <text fg={activeTheme.colors.textDim}>Current theme: {themes[currentTheme]?.name || currentTheme}</text>
    </box>
  );
}
