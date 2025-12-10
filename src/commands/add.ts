import { addTask } from '../storage.ts';
import type { Task } from '../parser/index.ts';
import { formatSuccess } from '../ui/index.ts';

export async function addCommand(text: string, filePath?: string): Promise<void> {
  const today = new Date().toISOString().split('T')[0];

  // Parse priority if it starts with (A)-(Z)
  let priority: string | null = null;
  let cleanText = text;

  const priorityMatch = text.match(/^\(([A-Z])\)\s+(.+)$/);
  if (priorityMatch) {
    priority = priorityMatch[1];
    cleanText = priorityMatch[2];
  }

  const task: Task = {
    id: 0, // Will be assigned by addTask
    completed: false,
    priority,
    completionDate: null,
    creationDate: today,
    text: cleanText,
    contexts: [],
    projects: [],
    metadata: {},
  };

  // Extract contexts, projects, and metadata from text
  const contextMatches = cleanText.match(/@\S+/g);
  if (contextMatches) {
    task.contexts = contextMatches.map(c => c.substring(1));
  }

  const projectMatches = cleanText.match(/\+\S+/g);
  if (projectMatches) {
    task.projects = projectMatches.map(p => p.substring(1));
  }

  const metadataMatches = cleanText.match(/(\S+):(\S+)/g);
  if (metadataMatches) {
    for (const match of metadataMatches) {
      const [key, value] = match.split(':');
      if (key && value && !key.startsWith('@') && !key.startsWith('+')) {
        task.metadata[key] = value;
      }
    }
  }

  await addTask(task, filePath);
  console.log(formatSuccess(`Added task: ${text}`));
}
