import { updateTask, loadTasks } from '../storage.ts';
import { formatSuccess, formatError } from '../ui/index.ts';

export async function priCommand(id: number, priority: string, filePath?: string): Promise<void> {
  try {
    // Validate priority
    if (!/^[A-Z]$/.test(priority)) {
      console.error(formatError('Priority must be a single uppercase letter (A-Z)'));
      process.exit(1);
    }

    const tasks = await loadTasks(filePath);
    const task = tasks.find(t => t.id === id);

    if (!task) {
      console.error(formatError(`Task ${id} not found`));
      process.exit(1);
    }

    await updateTask(id, { priority }, filePath);
    console.log(formatSuccess(`Set priority (${priority}) for task ${id}: ${task.text}`));
  } catch (error) {
    console.error(formatError(`${error}`));
    process.exit(1);
  }
}

export async function depriCommand(id: number, filePath?: string): Promise<void> {
  try {
    const tasks = await loadTasks(filePath);
    const task = tasks.find(t => t.id === id);

    if (!task) {
      console.error(formatError(`Task ${id} not found`));
      process.exit(1);
    }

    if (!task.priority) {
      console.log(formatError(`Task ${id} has no priority`));
      return;
    }

    await updateTask(id, { priority: null }, filePath);
    console.log(formatSuccess(`Removed priority from task ${id}: ${task.text}`));
  } catch (error) {
    console.error(formatError(`${error}`));
    process.exit(1);
  }
}
