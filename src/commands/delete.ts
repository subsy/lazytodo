import { deleteTask, loadTasks } from '../storage.ts';
import { formatSuccess, formatError } from '../ui/index.ts';

export async function deleteCommand(id: number, filePath?: string): Promise<void> {
  try {
    const tasks = await loadTasks(filePath);
    const task = tasks.find(t => t.id === id);

    if (!task) {
      console.error(formatError(`Task ${id} not found`));
      process.exit(1);
    }

    await deleteTask(id, filePath);
    console.log(formatSuccess(`Deleted task ${id}: ${task.text}`));
  } catch (error) {
    console.error(formatError(`${error}`));
    process.exit(1);
  }
}
