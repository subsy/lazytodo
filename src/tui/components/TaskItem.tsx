import React from 'react';
import type { Task } from '../../parser/index.ts';
import { useTodoStore } from '../store/useTodoStore.ts';

interface TaskItemProps {
  task: Task;
  isSelected: boolean;
}

export function TaskItem({ task, isSelected }: TaskItemProps) {
  const highlightOverdue = useTodoStore(state => state.highlightOverdue);

  // Check if task is overdue/due today
  const isOverdue = (): boolean => {
    if (!task.metadata.due) return false;
    const dueDate = task.metadata.due;
    const today = new Date().toISOString().split('T')[0];
    return dueDate < today && !task.completed;
  };

  const isDueToday = (): boolean => {
    if (!task.metadata.due) return false;
    const today = new Date().toISOString().split('T')[0];
    return task.metadata.due === today && !task.completed;
  };

  const shouldHighlight = highlightOverdue && (isOverdue() || isDueToday());

  // Build task text
  const checkbox = task.completed ? '✓' : '○';
  const priorityText = task.priority ? `(${task.priority}) ` : '';
  const dateText = task.creationDate ? `${task.creationDate} ` : '';

  // Combine all parts
  let taskText = `${checkbox} ${priorityText}${dateText}${task.text}`;

  // Add tags
  const projectTags = task.projects.map(p => `+${p}`).join(' ');
  const contextTags = task.contexts.map(c => `@${c}`).join(' ');
  const metadataTags = Object.entries(task.metadata)
    .map(([k, v]) => `${k}:${v}`)
    .join(' ');

  if (projectTags) taskText += ` ${projectTags}`;
  if (contextTags) taskText += ` ${contextTags}`;
  if (metadataTags) taskText += ` ${metadataTags}`;

  const textColor = task.completed ? 'gray' : shouldHighlight ? 'red' : 'white';
  const bgColor = isSelected ? 'blue' : undefined;

  return (
    <box backgroundColor={bgColor} paddingX={1}>
      <text color={textColor}>{taskText}</text>
    </box>
  );
}
