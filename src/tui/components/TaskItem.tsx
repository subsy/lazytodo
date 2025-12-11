import React from 'react';
import type { Task } from '../../parser/index.ts';
import { useTodoStore } from '../store/useTodoStore.ts';
import { useTheme } from '../themes/ThemeContext.tsx';
import { getPriorityColor } from '../themes/index.ts';

interface TaskItemProps {
  task: Task;
  isSelected: boolean;
  availableWidth?: number;
}

// Fixed column widths for table layout
const COL_CHECKBOX = 2;   // "○ " or "✓ "
const COL_PRIORITY = 4;   // "(A) " or "    "
const COL_DATE = 11;      // "2025-12-10 " or spaces
const COL_PROJECT = 16;   // "+project " padded
const COL_CONTEXT = 13;   // "@context " padded
const COL_DUE = 15;       // "due:2025-12-10 " or spaces
const COL_META = 20;      // "key:value " padded

// Total fixed columns width
const FIXED_COLS_WIDTH = COL_CHECKBOX + COL_PRIORITY + COL_DATE + COL_PROJECT + COL_CONTEXT + COL_DUE + COL_META;

// Pad string to fixed width (right-pad with spaces)
function pad(str: string, width: number): string {
  if (str.length >= width) return str.substring(0, width);
  return str + ' '.repeat(width - str.length);
}

// Word wrap text to fit within maxWidth, breaking at word boundaries
function wordWrap(text: string, maxWidth: number): string[] {
  if (maxWidth <= 0) return [text];
  if (text.length <= maxWidth) return [text];

  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if (currentLine.length === 0) {
      // First word on line - always add it even if too long
      currentLine = word;
    } else if (currentLine.length + 1 + word.length <= maxWidth) {
      // Word fits on current line
      currentLine += ' ' + word;
    } else {
      // Word doesn't fit, start new line
      lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length > 0 ? lines : [''];
}

export function TaskItem({ task, isSelected, availableWidth = 80 }: TaskItemProps) {
  const highlightOverdue = useTodoStore(state => state.highlightOverdue);
  const theme = useTheme();

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

  // Build fixed-width table columns
  const checkbox = (task.completed ? '✓' : '○') + ' ';
  const priority = task.priority ? `(${task.priority}) ` : '';
  const creationDate = task.creationDate ? task.creationDate + ' ' : '';

  // Strip tags and metadata from task text to get clean description
  let cleanText = task.text;
  for (const project of task.projects) {
    cleanText = cleanText.replace(new RegExp(`\\+${project}\\b`, 'g'), '');
  }
  for (const context of task.contexts) {
    cleanText = cleanText.replace(new RegExp(`@${context}\\b`, 'g'), '');
  }
  for (const key of Object.keys(task.metadata)) {
    cleanText = cleanText.replace(new RegExp(`${key}:\\S+`, 'g'), '');
  }
  cleanText = cleanText.trim().replace(/\s+/g, ' ');

  // Format projects, contexts, due date, and other metadata
  const projectsRaw = task.projects.map(p => `+${p}`).join(' ');
  const contextsRaw = task.contexts.map(c => `@${c}`).join(' ');
  const dueRaw = task.metadata.due ? `due:${task.metadata.due}` : '';

  // Collect non-due metadata
  const otherMeta = Object.entries(task.metadata)
    .filter(([key]) => key !== 'due')
    .map(([key, value]) => `${key}:${value}`)
    .join(' ');

  // Calculate text column width (available width minus fixed columns and borders)
  const textColWidth = Math.max(10, availableWidth - FIXED_COLS_WIDTH - 4);

  // Word wrap the description text, tag columns, and metadata
  const wrappedText = wordWrap(cleanText, textColWidth);
  const wrappedProjects = wordWrap(projectsRaw, COL_PROJECT - 1);
  const wrappedContexts = wordWrap(contextsRaw, COL_CONTEXT - 1);
  const wrappedMeta = wordWrap(otherMeta, COL_META - 1);

  // Calculate max lines needed
  const maxLines = Math.max(wrappedText.length, wrappedProjects.length, wrappedContexts.length, wrappedMeta.length);

  // Determine colors
  const checkboxColor = task.completed ? theme.colors.success : theme.colors.text;
  const priorityColor = getPriorityColor(task.priority, theme);
  const dateColor = theme.colors.date;
  const textColor = task.completed ? theme.colors.muted : theme.colors.text;
  const projectColor = theme.colors.project;
  const contextColor = theme.colors.context;
  const dueColor = isOverdue() ? theme.colors.overdue : isDueToday() ? theme.colors.highlight : theme.colors.date;
  const metaColor = theme.colors.muted;

  // Background color for row
  const bgColor = isSelected
    ? theme.colors.selection
    : shouldHighlight
      ? theme.colors.overdue
      : undefined;

  // Render first line with all columns
  // Subsequent lines show wrapped content for text and tags
  const indentWidth = COL_CHECKBOX + COL_PRIORITY + COL_DATE;
  const indent = ' '.repeat(indentWidth);

  if (maxLines === 1) {
    // Single line - simple case
    return (
      <box backgroundColor={bgColor} flexDirection="row">
        <text fg={checkboxColor}>{pad(checkbox, COL_CHECKBOX)}</text>
        <text fg={priorityColor}>{pad(priority, COL_PRIORITY)}</text>
        <text fg={dateColor}>{pad(creationDate, COL_DATE)}</text>
        <text fg={textColor}>{pad(wrappedText[0] || '', textColWidth)}</text>
        <text fg={projectColor}>{pad(wrappedProjects[0] || '', COL_PROJECT)}</text>
        <text fg={contextColor}>{pad(wrappedContexts[0] || '', COL_CONTEXT)}</text>
        <text fg={dueColor}>{pad(dueRaw, COL_DUE)}</text>
        <text fg={metaColor}>{pad(wrappedMeta[0] || '', COL_META)}</text>
      </box>
    );
  }

  // Multiple lines - render as column with wrapped content
  const lines = [];
  for (let i = 0; i < maxLines; i++) {
    const textLine = wrappedText[i] || '';
    const projectLine = wrappedProjects[i] || '';
    const contextLine = wrappedContexts[i] || '';
    const dueLine = i === 0 ? dueRaw : ''; // Due date only on first line
    const metaLine = wrappedMeta[i] || '';

    if (i === 0) {
      // First line with checkbox, priority, date
      lines.push(
        <box key={i} flexDirection="row">
          <text fg={checkboxColor}>{pad(checkbox, COL_CHECKBOX)}</text>
          <text fg={priorityColor}>{pad(priority, COL_PRIORITY)}</text>
          <text fg={dateColor}>{pad(creationDate, COL_DATE)}</text>
          <text fg={textColor}>{pad(textLine, textColWidth)}</text>
          <text fg={projectColor}>{pad(projectLine, COL_PROJECT)}</text>
          <text fg={contextColor}>{pad(contextLine, COL_CONTEXT)}</text>
          <text fg={dueColor}>{pad(dueLine, COL_DUE)}</text>
          <text fg={metaColor}>{pad(metaLine, COL_META)}</text>
        </box>
      );
    } else {
      // Continuation lines - indented
      lines.push(
        <box key={i} flexDirection="row">
          <text>{indent}</text>
          <text fg={textColor}>{pad(textLine, textColWidth)}</text>
          <text fg={projectColor}>{pad(projectLine, COL_PROJECT)}</text>
          <text fg={contextColor}>{pad(contextLine, COL_CONTEXT)}</text>
          <text fg={dueColor}>{pad(dueLine, COL_DUE)}</text>
          <text fg={metaColor}>{pad(metaLine, COL_META)}</text>
        </box>
      );
    }
  }

  return (
    <box backgroundColor={bgColor} flexDirection="column">
      {lines}
    </box>
  );
}
