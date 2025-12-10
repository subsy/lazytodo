import React from 'react';
import { useTodoStore } from '../store/useTodoStore.ts';
import { TaskItem } from './TaskItem.tsx';

export function TaskList() {
  const filteredTasks = useTodoStore(state => state.filteredTasks);
  const currentTaskIndex = useTodoStore(state => state.currentTaskIndex);
  const focusedPanel = useTodoStore(state => state.focusedPanel);

  if (filteredTasks.length === 0) {
    return (
      <box padding={1}>
        <text color="gray">No tasks found. Press 'n' to add a task.</text>
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
        />
      ))}
    </box>
  );
}
