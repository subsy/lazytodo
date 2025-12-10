import { updateTask, loadTasks } from '../storage.ts';
import { formatSuccess, formatError } from '../ui/index.ts';

export async function doCommand(id: number, filePath?: string): Promise<void> {
  try {
    const tasks = await loadTasks(filePath);
    const task = tasks.find(t => t.id === id);

    if (!task) {
      console.error(formatError(`Task ${id} not found`));
      process.exit(1);
    }

    if (task.completed) {
      console.log(formatError(`Task ${id} is already completed`));
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    await updateTask(id, {
      completed: true,
      completionDate: today,
    }, filePath);

    console.log(formatSuccess(`Completed task ${id}: ${task.text}`));
  } catch (error) {
    console.error(formatError(`${error}`));
    process.exit(1);
  }
}
