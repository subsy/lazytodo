import React, { useState } from 'react';
import { useKeyboard } from '@opentui/react';
import { useTheme } from '../themes/ThemeContext.tsx';
import { themes, themeNames } from '../themes/index.ts';
import { useTodoStore } from '../store/useTodoStore.ts';
import { letterToNumber, numberToLetter, saveConfig } from '../../config.ts';
import { saveTasks } from '../../storage.ts';

interface SettingsScreenProps {
  onClose: () => void;
  filePath?: string;
}

type SettingsState = 'menu' | 'confirm' | 'theme';
type MenuItem = 'priority' | 'theme';

const MENU_ITEMS: MenuItem[] = ['priority', 'theme'];

function ColorSwatch({ color }: { color: string }) {
  return <text backgroundColor={color}>{'  '}</text>;
}

export function SettingsScreen({ onClose, filePath }: SettingsScreenProps) {
  const theme = useTheme();
  const priorityMode = useTodoStore(state => state.priorityMode);
  const setPriorityMode = useTodoStore(state => state.setPriorityMode);
  const currentTheme = useTodoStore(state => state.currentTheme);
  const setTheme = useTodoStore(state => state.setTheme);
  const tasks = useTodoStore(state => state.tasks);
  const saveHistory = useTodoStore(state => state.saveHistory);
  const updateFilteredTasks = useTodoStore(state => state.updateFilteredTasks);

  const [settingsState, setSettingsState] = useState<SettingsState>('menu');
  const [menuIndex, setMenuIndex] = useState(0);
  const [pendingMode, setPendingMode] = useState<'letter' | 'number' | null>(null);
  const [themeIndex, setThemeIndex] = useState(
    themeNames.indexOf(currentTheme) >= 0 ? themeNames.indexOf(currentTheme) : 0
  );

  // Count tasks with priorities
  const tasksWithPriorities = tasks.filter(t => t.priority);

  useKeyboard((key: any) => {
    const keyName = key.name || key.sequence || '';

    // Handle theme selection state
    if (settingsState === 'theme') {
      if (keyName === 'escape') {
        setSettingsState('menu');
        return;
      }

      if (keyName === 'up' || keyName === 'k') {
        setThemeIndex(prev => Math.max(0, prev - 1));
        return;
      }

      if (keyName === 'down' || keyName === 'j') {
        setThemeIndex(prev => Math.min(themeNames.length - 1, prev + 1));
        return;
      }

      if (keyName === 'return' || keyName === 'enter') {
        const selectedTheme = themeNames[themeIndex]!;
        setTheme(selectedTheme);
        saveConfig({ theme: selectedTheme });
        setSettingsState('menu');
        return;
      }
      return;
    }

    // Handle confirmation for priority conversion
    if (settingsState === 'confirm') {
      if (keyName === 'y' || keyName === 'Y') {
        // Convert priorities
        if (pendingMode) {
          saveHistory();
          for (const task of tasks) {
            if (task.priority) {
              if (pendingMode === 'number') {
                task.priority = letterToNumber(task.priority);
              } else {
                task.priority = numberToLetter(task.priority);
              }
            }
          }
          saveTasks(tasks, filePath);
          updateFilteredTasks();
          setPriorityMode(pendingMode);
          saveConfig({ priorityMode: pendingMode });
        }
        setSettingsState('menu');
        setPendingMode(null);
      } else if (keyName === 'n' || keyName === 'N') {
        // Just change mode without converting
        if (pendingMode) {
          setPriorityMode(pendingMode);
          saveConfig({ priorityMode: pendingMode });
        }
        setSettingsState('menu');
        setPendingMode(null);
      } else if (keyName === 'escape') {
        // Cancel
        setSettingsState('menu');
        setPendingMode(null);
      }
      return;
    }

    // Menu state navigation
    if (keyName === 'escape' || keyName === 'q' || keyName === ',') {
      onClose();
      return;
    }

    if (keyName === 'up' || keyName === 'k') {
      setMenuIndex(prev => Math.max(0, prev - 1));
      return;
    }

    if (keyName === 'down' || keyName === 'j') {
      setMenuIndex(prev => Math.min(MENU_ITEMS.length - 1, prev + 1));
      return;
    }

    if (keyName === 'return' || keyName === 'enter') {
      const selectedItem = MENU_ITEMS[menuIndex];

      if (selectedItem === 'priority') {
        // Toggle priority mode
        const newMode = priorityMode === 'letter' ? 'number' : 'letter';

        if (tasksWithPriorities.length > 0) {
          // Need to ask about conversion
          setPendingMode(newMode);
          setSettingsState('confirm');
        } else {
          // No priorities to convert, just toggle
          setPriorityMode(newMode);
          saveConfig({ priorityMode: newMode });
        }
      } else if (selectedItem === 'theme') {
        setSettingsState('theme');
      }
      return;
    }
  });

  const convertLabel = pendingMode === 'number'
    ? 'letters to numbers (A→0, B→1, etc.)'
    : 'numbers to letters (0→A, 1→B, etc.)';

  // Theme selection view
  if (settingsState === 'theme') {
    return (
      <box flexDirection="column" width="100%" height="100%" backgroundColor={theme.colors.background}>
        <box borderStyle="single" borderColor={theme.colors.border} padding={1} flexDirection="column">
          <text fg={theme.colors.highlight}>Settings › Theme</text>
          <text> </text>

          <box flexDirection="row">
            <text fg={theme.colors.muted}>{'                '.padEnd(16)}</text>
            <text fg={theme.colors.muted}>Pri   </text>
            <text fg={theme.colors.muted}>UI  </text>
            <text fg={theme.colors.muted}>Tags    </text>
            <text fg={theme.colors.muted}>Base</text>
          </box>
          <text> </text>

          {themeNames.map((name, index) => {
            const t = themes[name]!;
            const isSelected = index === themeIndex;
            const c = t.colors;

            return (
              <box key={name} flexDirection="row" backgroundColor={isSelected ? theme.colors.selection : undefined}>
                <text fg={isSelected ? theme.colors.highlight : theme.colors.text}>
                  {isSelected ? '> ' : '  '}
                </text>
                <text fg={isSelected ? theme.colors.highlight : theme.colors.text}>
                  {t.name.padEnd(14)}
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
          })}

          <text> </text>
          <text fg={theme.colors.muted}>↑/↓ Navigate • Enter Select • ESC Back</text>
        </box>
      </box>
    );
  }

  // Confirmation view
  if (settingsState === 'confirm') {
    return (
      <box flexDirection="column" width="100%" height="100%" backgroundColor={theme.colors.background}>
        <box borderStyle="single" borderColor={theme.colors.border} padding={1} flexDirection="column">
          <text fg={theme.colors.highlight}>Settings › Priority Mode</text>
          <text> </text>
          <text fg={theme.colors.highlight}>
            Convert {tasksWithPriorities.length} priorities {convertLabel}?
          </text>
          <text> </text>
          <text fg={theme.colors.muted}>
            Y - Convert existing priorities
          </text>
          <text fg={theme.colors.muted}>
            N - Keep existing values (just change mode)
          </text>
          <text fg={theme.colors.muted}>
            ESC - Cancel
          </text>
        </box>
      </box>
    );
  }

  // Main menu view
  return (
    <box flexDirection="column" width="100%" height="100%" backgroundColor={theme.colors.background}>
      <box borderStyle="single" borderColor={theme.colors.border} padding={1} flexDirection="column">
        <text fg={theme.colors.highlight}>Settings</text>
        <text> </text>

        {/* Priority Mode option */}
        <box flexDirection="row" backgroundColor={menuIndex === 0 ? theme.colors.selection : undefined}>
          <text fg={menuIndex === 0 ? theme.colors.highlight : theme.colors.text}>
            {menuIndex === 0 ? '> ' : '  '}Priority Mode: {priorityMode === 'letter' ? 'Letter (A-Z)' : 'Number (0-9)'}
          </text>
        </box>

        {/* Theme option */}
        <box flexDirection="row" backgroundColor={menuIndex === 1 ? theme.colors.selection : undefined}>
          <text fg={menuIndex === 1 ? theme.colors.highlight : theme.colors.text}>
            {menuIndex === 1 ? '> ' : '  '}Theme: {themes[currentTheme]?.name || currentTheme}
          </text>
        </box>

        <text> </text>
        <text fg={theme.colors.muted}>↑/↓ Navigate • Enter Select • ESC/q Close</text>
      </box>
    </box>
  );
}
