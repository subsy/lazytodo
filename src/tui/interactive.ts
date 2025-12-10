import * as clack from '@clack/prompts';
import { loadTasks, saveTasks } from '../storage.ts';
import { formatTask } from '../ui/index.ts';
import type { Task } from '../parser/index.ts';
import chalk from 'chalk';

export async function interactiveMode(filePath?: string): Promise<void> {
  clack.intro(chalk.bold.cyan('📝 Todo.txt Interactive Mode'));

  let running = true;

  while (running) {
    const tasks = await loadTasks(filePath);
    const incompleteTasks = tasks.filter(t => !t.completed);

    if (incompleteTasks.length === 0) {
      clack.note('No active tasks. Add one to get started!');

      const addNew = await clack.confirm({
        message: 'Would you like to add a task?',
      });

      if (clack.isCancel(addNew) || !addNew) {
        running = false;
        continue;
      }

      const text = await clack.text({
        message: 'Task description:',
        placeholder: 'e.g., (A) Call Mom +Family @phone',
        validate: (value) => {
          if (!value.trim()) return 'Task cannot be empty';
        },
      });

      if (clack.isCancel(text)) {
        running = false;
        continue;
      }

      const today = new Date().toISOString().split('T')[0];

      // Parse the task
      let priority: string | null = null;
      let cleanText = text as string;

      const priorityMatch = (text as string).match(/^\(([A-Z])\)\s+(.+)$/);
      if (priorityMatch) {
        priority = priorityMatch[1];
        cleanText = priorityMatch[2];
      }

      const newTask: Task = {
        id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
        completed: false,
        priority,
        completionDate: null,
        creationDate: today,
        text: cleanText,
        contexts: (cleanText.match(/@\S+/g) || []).map(c => c.substring(1)),
        projects: (cleanText.match(/\+\S+/g) || []).map(p => p.substring(1)),
        metadata: {},
      };

      // Extract metadata
      const metadataMatches = cleanText.match(/(\S+):(\S+)/g);
      if (metadataMatches) {
        for (const match of metadataMatches) {
          const [key, value] = match.split(':');
          if (key && value && !key.startsWith('@') && !key.startsWith('+')) {
            newTask.metadata[key] = value;
          }
        }
      }

      tasks.push(newTask);
      await saveTasks(tasks, filePath);

      clack.log.success('Task added!');
      continue;
    }

    // Show task list
    const taskChoices = incompleteTasks.map(task => ({
      value: task.id.toString(),
      label: formatTask(task, false),
      hint: task.contexts.length > 0 || task.projects.length > 0
        ? `${task.contexts.map(c => '@' + c).join(' ')} ${task.projects.map(p => '+' + p).join(' ')}`.trim()
        : undefined,
    }));

    const action = await clack.select({
      message: 'Select a task or action:',
      options: [
        ...taskChoices,
        { value: 'add', label: chalk.green('+ Add new task') },
        { value: 'filter', label: chalk.blue('🔍 Filter tasks') },
        { value: 'show-all', label: chalk.gray('📋 Show all tasks') },
        { value: 'exit', label: chalk.red('✖ Exit') },
      ],
    });

    if (clack.isCancel(action) || action === 'exit') {
      running = false;
      continue;
    }

    if (action === 'add') {
      const text = await clack.text({
        message: 'Task description:',
        placeholder: 'e.g., (A) Call Mom +Family @phone',
        validate: (value) => {
          if (!value.trim()) return 'Task cannot be empty';
        },
      });

      if (clack.isCancel(text)) {
        continue;
      }

      const today = new Date().toISOString().split('T')[0];

      // Parse the task
      let priority: string | null = null;
      let cleanText = text as string;

      const priorityMatch = (text as string).match(/^\(([A-Z])\)\s+(.+)$/);
      if (priorityMatch) {
        priority = priorityMatch[1];
        cleanText = priorityMatch[2];
      }

      const newTask: Task = {
        id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
        completed: false,
        priority,
        completionDate: null,
        creationDate: today,
        text: cleanText,
        contexts: (cleanText.match(/@\S+/g) || []).map(c => c.substring(1)),
        projects: (cleanText.match(/\+\S+/g) || []).map(p => p.substring(1)),
        metadata: {},
      };

      // Extract metadata
      const metadataMatches = cleanText.match(/(\S+):(\S+)/g);
      if (metadataMatches) {
        for (const match of metadataMatches) {
          const [key, value] = match.split(':');
          if (key && value && !key.startsWith('@') && !key.startsWith('+')) {
            newTask.metadata[key] = value;
          }
        }
      }

      tasks.push(newTask);
      await saveTasks(tasks, filePath);

      clack.log.success('Task added!');
      continue;
    }

    if (action === 'show-all') {
      clack.note(
        tasks
          .sort((a, b) => {
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            return a.id - b.id;
          })
          .map(t => formatTask(t))
          .join('\n'),
        'All Tasks'
      );
      continue;
    }

    if (action === 'filter') {
      clack.note('Filtering coming soon!', 'Info');
      continue;
    }

    // Task selected - show actions
    const taskId = parseInt(action as string);
    const selectedTask = tasks.find(t => t.id === taskId);

    if (!selectedTask) {
      continue;
    }

    const taskAction = await clack.select({
      message: `What would you like to do with: ${selectedTask.text}?`,
      options: [
        { value: 'complete', label: chalk.green('✓ Mark as complete') },
        { value: 'priority', label: chalk.yellow('🔢 Set priority') },
        { value: 'edit', label: chalk.blue('✏️  Edit task') },
        { value: 'delete', label: chalk.red('🗑️  Delete task') },
        { value: 'back', label: chalk.dim('← Back') },
      ],
    });

    if (clack.isCancel(taskAction) || taskAction === 'back') {
      continue;
    }

    if (taskAction === 'complete') {
      const today = new Date().toISOString().split('T')[0];
      const index = tasks.findIndex(t => t.id === taskId);
      tasks[index]!.completed = true;
      tasks[index]!.completionDate = today;
      await saveTasks(tasks, filePath);
      clack.log.success('Task completed!');
    } else if (taskAction === 'priority') {
      const priority = await clack.text({
        message: 'Enter priority (A-Z) or leave empty to remove:',
        placeholder: 'A',
        validate: (value) => {
          if (value && !/^[A-Z]$/.test(value)) {
            return 'Priority must be a single uppercase letter (A-Z)';
          }
        },
      });

      if (!clack.isCancel(priority)) {
        const index = tasks.findIndex(t => t.id === taskId);
        tasks[index]!.priority = (priority as string).trim() || null;
        await saveTasks(tasks, filePath);
        clack.log.success('Priority updated!');
      }
    } else if (taskAction === 'edit') {
      const newText = await clack.text({
        message: 'New task description:',
        placeholder: selectedTask.text,
        initialValue: selectedTask.text,
        validate: (value) => {
          if (!value.trim()) return 'Task cannot be empty';
        },
      });

      if (!clack.isCancel(newText)) {
        const index = tasks.findIndex(t => t.id === taskId);
        tasks[index]!.text = newText as string;

        // Re-parse contexts, projects, and metadata
        tasks[index]!.contexts = ((newText as string).match(/@\S+/g) || []).map(c => c.substring(1));
        tasks[index]!.projects = ((newText as string).match(/\+\S+/g) || []).map(p => p.substring(1));
        tasks[index]!.metadata = {};

        const metadataMatches = (newText as string).match(/(\S+):(\S+)/g);
        if (metadataMatches) {
          for (const match of metadataMatches) {
            const [key, value] = match.split(':');
            if (key && value && !key.startsWith('@') && !key.startsWith('+')) {
              tasks[index]!.metadata[key] = value;
            }
          }
        }

        await saveTasks(tasks, filePath);
        clack.log.success('Task updated!');
      }
    } else if (taskAction === 'delete') {
      const confirmDelete = await clack.confirm({
        message: 'Are you sure you want to delete this task?',
      });

      if (!clack.isCancel(confirmDelete) && confirmDelete) {
        const filtered = tasks.filter(t => t.id !== taskId);
        await saveTasks(filtered, filePath);
        clack.log.success('Task deleted!');
      }
    }
  }

  clack.outro(chalk.green('✨ Done! Your tasks are saved.'));
}
