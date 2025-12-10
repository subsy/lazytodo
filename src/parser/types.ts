export interface Task {
  id: number;
  completed: boolean;
  priority: string | null; // A-Z
  completionDate: string | null; // YYYY-MM-DD
  creationDate: string | null; // YYYY-MM-DD
  text: string;
  contexts: string[]; // @context
  projects: string[]; // +project
  metadata: Record<string, string>; // key:value pairs
}

export interface TodoList {
  tasks: Task[];
}
