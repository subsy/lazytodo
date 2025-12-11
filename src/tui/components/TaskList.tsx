import React, { useState, useEffect } from 'react';
import { useTodoStore } from '../store/useTodoStore.ts';
import { TaskItem } from './TaskItem.tsx';
import { useTheme } from '../themes/ThemeContext.tsx';

export function TaskList() {
  const filteredTasks = useTodoStore(state => state.filteredTasks);
  const currentTaskIndex = useTodoStore(state => state.currentTaskIndex);
  const focusedPanel = useTodoStore(state => state.focusedPanel);
  const theme = useTheme();

  // Get terminal width
  const [termWidth, setTermWidth] = useState(process.stdout.columns || 80);

  useEffect(() => {
    const handleResize = () => {
      setTermWidth(process.stdout.columns || 80);
    };

    process.stdout.on('resize', handleResize);
    return () => {
      process.stdout.off('resize', handleResize);
    };
  }, []);

  if (filteredTasks.length === 0) {
    return (
      <box padding={1}>
        <text fg={theme.colors.muted}>No tasks found. Press 'n' to add a task.</text>
      </box>
    );
  }

  return (
    <box flexDirection="column">
      {filteredTasks.map((task, index) => (
        <TaskItem
          key={task.id}
          task={task}
          isSelected={focusedPanel === 'tasks' && index === currentTaskIndex}
          availableWidth={termWidth}
        />
      ))}
    </box>
  );
}
