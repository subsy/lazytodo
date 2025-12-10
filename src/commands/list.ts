import { loadTasks } from '../storage.ts';
import type { Task } from '../parser/index.ts';
import { formatTaskList, formatInfo } from '../ui/index.ts';

export interface ListOptions {
  all?: boolean;
  context?: string;
  project?: string;
  priority?: string;
  search?: string;
}

export async function listCommand(options: ListOptions = {}, filePath?: string): Promise<void> {
  let tasks = await loadTasks(filePath);

  // Filter by completion status (default: show incomplete only)
  if (!options.all) {
    tasks = tasks.filter(t => !t.completed);
  }

  // Filter by context
  if (options.context) {
    tasks = tasks.filter(t => t.contexts.includes(options.context!));
  }

  // Filter by project
  if (options.project) {
    tasks = tasks.filter(t => t.projects.includes(options.project!));
  }

  // Filter by priority
  if (options.priority) {
    tasks = tasks.filter(t => t.priority === options.priority);
  }

  // Filter by search text
  if (options.search) {
    const searchLower = options.search.toLowerCase();
    tasks = tasks.filter(t => t.text.toLowerCase().includes(searchLower));
  }

  // Sort: incomplete first, then by priority, then by creation date
  tasks.sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    if (a.priority !== b.priority) {
      if (!a.priority) return 1;
      if (!b.priority) return -1;
      return a.priority.localeCompare(b.priority);
    }

    if (a.creationDate !== b.creationDate) {
      if (!a.creationDate) return 1;
      if (!b.creationDate) return -1;
      return a.creationDate.localeCompare(b.creationDate);
    }

    return a.id - b.id;
  });

  // Build title
  const filters: string[] = [];
  if (options.context) filters.push(`@${options.context}`);
  if (options.project) filters.push(`+${options.project}`);
  if (options.priority) filters.push(`(${options.priority})`);
  if (options.search) filters.push(`"${options.search}"`);

  const title = filters.length > 0
    ? `Tasks (${filters.join(', ')})`
    : options.all
    ? 'All Tasks'
    : 'Active Tasks';

  console.log(formatTaskList(tasks, title));
}
