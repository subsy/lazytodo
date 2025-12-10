import React, { useState } from 'react';
import { useKeyboard } from '@opentui/react';

interface CommandBarProps {
  prompt: string;
  defaultValue?: string;
  onSubmit: (value: string) => void;
  onCancel: () => void;
}

export function CommandBar({ prompt, defaultValue = '', onSubmit, onCancel }: CommandBarProps) {
  const [value, setValue] = useState(defaultValue);

  useKeyboard((key) => {
    if (key === '\r') {
      // Enter key
      onSubmit(value);
    } else if (key === '\x1b') {
      // Escape key
      onCancel();
    } else if (key === '\x7f' || key === '\b') {
      // Backspace
      setValue(prev => prev.slice(0, -1));
    } else if (key.length === 1 && key >= ' ' && key <= '~') {
      // Printable character
      setValue(prev => prev + key);
    }
  });

  return (
    <box
      position="absolute"
      bottom={0}
      left={0}
      right={0}
      borderStyle="single"
      borderColor="yellow"
      backgroundColor="black"
      padding={1}
    >
      <text color="yellow">{prompt} </text>
      <text color="white">{value}</text>
      <text color="gray">█</text>
    </box>
  );
}
