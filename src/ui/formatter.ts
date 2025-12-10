import chalk from 'chalk';
import type { Task } from '../parser/index.ts';

export function getPriorityColor(priority: string | null): (text: string) => string {
  if (!priority) return chalk.white;

  const code = priority.charCodeAt(0);
  if (code <= 'C'.charCodeAt(0)) return chalk.red; // A-C: High priority
  if (code <= 'F'.charCodeAt(0)) return chalk.yellow; // D-F: Medium priority
  return chalk.blue; // G-Z: Low priority
}

export function formatTask(task: Task, showId: boolean = true): string {
  const parts: string[] = [];

  // ID
  if (showId) {
    parts.push(chalk.dim(`[${task.id}]`));
  }

  // Completion status
  if (task.completed) {
    parts.push(chalk.green('✓'));
  } else {
    parts.push(chalk.dim('○'));
  }

  // Priority
  if (task.priority) {
    const priorityColor = getPriorityColor(task.priority);
    parts.push(priorityColor(`(${task.priority})`));
  }

  // Dates
  if (task.creationDate) {
    parts.push(chalk.dim(task.creationDate));
  }

  // Task text with contexts and projects highlighted
  let styledText = task.text;

  // Highlight contexts
  for (const context of task.contexts) {
    styledText = styledText.replace(
      new RegExp(`@${context}\\b`, 'g'),
      chalk.cyan(`@${context}`)
    );
  }

  // Highlight projects
  for (const project of task.projects) {
    styledText = styledText.replace(
      new RegExp(`\\+${project}\\b`, 'g'),
      chalk.magenta(`+${project}`)
    );
  }

  // Highlight metadata
  for (const [key, value] of Object.entries(task.metadata)) {
    styledText = styledText.replace(
      new RegExp(`${key}:${value}\\b`, 'g'),
      chalk.gray(`${key}:`) + chalk.white(value)
    );
  }

  // Strikethrough if completed
  if (task.completed) {
    styledText = chalk.dim.strikethrough(styledText);
  }

  parts.push(styledText);

  return parts.join(' ');
}

export function formatTaskList(tasks: Task[], title?: string): string {
  const output: string[] = [];

  if (title) {
    output.push('');
    output.push(chalk.bold.underline(title));
    output.push('');
  }

  if (tasks.length === 0) {
    output.push(chalk.dim('  No tasks found.'));
    output.push('');
    return output.join('\n');
  }

  for (const task of tasks) {
    output.push('  ' + formatTask(task));
  }

  output.push('');
  output.push(chalk.dim(`  ${tasks.length} task(s)`));
  output.push('');

  return output.join('\n');
}

export function formatSuccess(message: string): string {
  return chalk.green('✓ ') + message;
}

export function formatError(message: string): string {
  return chalk.red('✗ ') + message;
}

export function formatWarning(message: string): string {
  return chalk.yellow('⚠ ') + message;
}

export function formatInfo(message: string): string {
  return chalk.blue('ℹ ') + message;
}
