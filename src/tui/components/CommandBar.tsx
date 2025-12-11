import React, { useState } from 'react';
import { useKeyboard } from '@opentui/react';
import { useTheme } from '../themes/ThemeContext.tsx';

interface CommandBarProps {
  prompt: string;
  defaultValue?: string;
  onSubmit: (value: string) => void;
  onCancel: () => void;
  onChange?: (value: string) => void;
}

export function CommandBar({ prompt, defaultValue = '', onSubmit, onCancel, onChange }: CommandBarProps) {
  const [value, setValue] = useState(defaultValue);
  const [cursorPos, setCursorPos] = useState(defaultValue.length);
  const theme = useTheme();

  useKeyboard((key: any) => {
    const keyName = key.name || key.sequence || '';
    const char = key.sequence || key.char || '';

    if (keyName === 'return' || keyName === 'enter') {
      onSubmit(value);
    } else if (keyName === 'escape') {
      onCancel();
    } else if (keyName === 'backspace') {
      if (cursorPos > 0) {
        const newValue = value.slice(0, cursorPos - 1) + value.slice(cursorPos);
        setValue(newValue);
        setCursorPos(cursorPos - 1);
        onChange?.(newValue);
      }
    } else if (keyName === 'delete') {
      if (cursorPos < value.length) {
        const newValue = value.slice(0, cursorPos) + value.slice(cursorPos + 1);
        setValue(newValue);
        onChange?.(newValue);
      }
    } else if (keyName === 'left') {
      if (cursorPos > 0) {
        setCursorPos(cursorPos - 1);
      }
    } else if (keyName === 'right') {
      if (cursorPos < value.length) {
        setCursorPos(cursorPos + 1);
      }
    } else if (keyName === 'home') {
      setCursorPos(0);
    } else if (keyName === 'end') {
      setCursorPos(value.length);
    } else if (char.length === 1 && !key.ctrl && !key.meta && char.charCodeAt(0) >= 32) {
      // Printable character (ASCII 32+)
      const newValue = value.slice(0, cursorPos) + char + value.slice(cursorPos);
      setValue(newValue);
      setCursorPos(cursorPos + 1);
      onChange?.(newValue);
    }
  });

  // Render value with cursor - use block cursor for visibility
  const beforeCursor = value.slice(0, cursorPos);
  const afterCursor = value.slice(cursorPos);

  return (
    <box
      borderStyle="single"
      borderColor={theme.colors.highlight}
      padding={1}
    >
      <box flexDirection="row">
        <text fg={theme.colors.highlight}>{prompt} </text>
        <text fg={theme.colors.text}>{beforeCursor}</text>
        <text fg={theme.colors.highlight}>█</text>
        <text fg={theme.colors.text}>{afterCursor}</text>
      </box>
      <text fg={theme.colors.muted}>Enter to save, ESC to cancel</text>
    </box>
  );
}
