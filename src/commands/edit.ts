import { updateTask, loadTasks } from '../storage.ts';
import { formatSuccess, formatError } from '../ui/index.ts';

export async function editCommand(id: number, newText: string, filePath?: string): Promise<void> {
  try {
    const tasks = await loadTasks(filePath);
    const task = tasks.find(t => t.id === id);

    if (!task) {
      console.error(formatError(`Task ${id} not found`));
      process.exit(1);
    }

    // Parse priority from new text if present
    let priority: string | null = task.priority;
    let cleanText = newText;

    const priorityMatch = newText.match(/^\(([A-Z])\)\s+(.+)$/);
    if (priorityMatch) {
      priority = priorityMatch[1];
      cleanText = priorityMatch[2];
    }

    // Extract contexts, projects, and metadata from new text
    const contexts: string[] = [];
    const projects: string[] = [];
    const metadata: Record<string, string> = {};

    const contextMatches = cleanText.match(/@\S+/g);
    if (contextMatches) {
      contexts.push(...contextMatches.map(c => c.substring(1)));
    }

    const projectMatches = cleanText.match(/\+\S+/g);
    if (projectMatches) {
      projects.push(...projectMatches.map(p => p.substring(1)));
    }

    const metadataMatches = cleanText.match(/(\S+):(\S+)/g);
    if (metadataMatches) {
      for (const match of metadataMatches) {
        const [key, value] = match.split(':');
        if (key && value && !key.startsWith('@') && !key.startsWith('+')) {
          metadata[key] = value;
        }
      }
    }

    await updateTask(id, {
      text: cleanText,
      priority,
      contexts,
      projects,
      metadata,
    }, filePath);

    console.log(formatSuccess(`Updated task ${id}: ${cleanText}`));
  } catch (error) {
    console.error(formatError(`${error}`));
    process.exit(1);
  }
}
