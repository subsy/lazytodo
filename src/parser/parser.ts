import type { Task } from './types.ts';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const PRIORITY_REGEX = /^\([A-Z0-9]\)$/;

export function parseLine(line: string, id: number): Task | null {
  // Skip empty lines
  if (!line.trim()) {
    return null;
  }

  const task: Task = {
    id,
    completed: false,
    priority: null,
    completionDate: null,
    creationDate: null,
    text: '',
    contexts: [],
    projects: [],
    metadata: {},
  };

  let remaining = line.trim();

  // Check for completion marker
  if (remaining.startsWith('x ')) {
    task.completed = true;
    remaining = remaining.substring(2).trim();

    // Check for completion date
    const firstToken = remaining.split(/\s+/)[0];
    if (firstToken && DATE_REGEX.test(firstToken)) {
      task.completionDate = firstToken;
      remaining = remaining.substring(firstToken.length).trim();
    }
  }

  // Check for priority (only for incomplete tasks at start, or after completion info)
  if (!task.completed || task.completionDate) {
    const firstToken = remaining.split(/\s+/)[0];
    if (firstToken && PRIORITY_REGEX.test(firstToken)) {
      task.priority = firstToken[1]; // Extract letter/number from (A) or (0)
      remaining = remaining.substring(firstToken.length).trim();
    }
  }

  // Check for creation date
  const firstToken = remaining.split(/\s+/)[0];
  if (firstToken && DATE_REGEX.test(firstToken)) {
    task.creationDate = firstToken;
    remaining = remaining.substring(firstToken.length).trim();
  }

  // The rest is the task text
  task.text = remaining;

  // Extract contexts (@word)
  const contextMatches = remaining.match(/@\S+/g);
  if (contextMatches) {
    task.contexts = contextMatches.map(c => c.substring(1));
  }

  // Extract projects (+word)
  const projectMatches = remaining.match(/\+\S+/g);
  if (projectMatches) {
    task.projects = projectMatches.map(p => p.substring(1));
  }

  // Extract metadata (key:value)
  const metadataMatches = remaining.match(/(\S+):(\S+)/g);
  if (metadataMatches) {
    for (const match of metadataMatches) {
      const [key, value] = match.split(':');
      if (key && value && !key.startsWith('@') && !key.startsWith('+')) {
        task.metadata[key] = value;
      }
    }
  }

  return task;
}

export function serializeTask(task: Task): string {
  const parts: string[] = [];

  // Completion marker
  if (task.completed) {
    parts.push('x');
    if (task.completionDate) {
      parts.push(task.completionDate);
    }
  }

  // Priority
  if (task.priority) {
    parts.push(`(${task.priority})`);
  }

  // Creation date
  if (task.creationDate) {
    parts.push(task.creationDate);
  }

  // Task text
  parts.push(task.text);

  return parts.join(' ');
}

export function parseTodoFile(content: string): Task[] {
  const lines = content.split('\n');
  const tasks: Task[] = [];

  lines.forEach((line, index) => {
    const task = parseLine(line, index + 1);
    if (task) {
      tasks.push(task);
    }
  });

  return tasks;
}

export function serializeTodoFile(tasks: Task[]): string {
  return tasks.map(serializeTask).join('\n') + '\n';
}
