import { describe, it, expect, beforeEach } from 'bun:test';
import { useTodoStore } from './useTodoStore.ts';
import type { Task } from '../../parser/index.ts';

// Helper to reset store between tests
function resetStore() {
  const store = useTodoStore.getState();
  store.setTasks([]);
  store.setCurrentTaskIndex(0);
  store.setFocusedPanel('tasks');
  store.setShowCompleted(false);
  store.setActiveFilter(undefined);
  store.setSearchFilter('');
  store.setSortMode('priority');
  store.closeCommandBar();
  // Reset help and theme via toggle if needed
  if (useTodoStore.getState().showHelp) {
    store.toggleHelp();
  }
  if (useTodoStore.getState().showThemeSelector) {
    store.toggleThemeSelector();
  }
}

// Sample tasks for testing
const sampleTasks: Task[] = [
  {
    id: 1,
    completed: false,
    priority: 'A',
    completionDate: null,
    creationDate: '2025-12-10',
    text: 'High priority task +Work @office',
    contexts: ['office'],
    projects: ['Work'],
    metadata: { due: '2025-12-15' },
  },
  {
    id: 2,
    completed: false,
    priority: 'C',
    completionDate: null,
    creationDate: '2025-12-09',
    text: 'Medium priority task +Home @phone',
    contexts: ['phone'],
    projects: ['Home'],
    metadata: {},
  },
  {
    id: 3,
    completed: true,
    priority: null,
    completionDate: '2025-12-10',
    creationDate: '2025-12-08',
    text: 'Completed task +Work',
    contexts: [],
    projects: ['Work'],
    metadata: {},
  },
  {
    id: 4,
    completed: false,
    priority: 'B',
    completionDate: null,
    creationDate: '2025-12-10',
    text: 'Another task @home',
    contexts: ['home'],
    projects: [],
    metadata: {},
  },
];

describe('useTodoStore', () => {
  beforeEach(() => {
    resetStore();
  });

  describe('task management', () => {
    it('should set tasks and compute filtered tasks', () => {
      const store = useTodoStore.getState();
      store.setTasks(sampleTasks);

      const state = useTodoStore.getState();
      expect(state.tasks).toHaveLength(4);
      // By default, completed tasks are hidden
      expect(state.filteredTasks).toHaveLength(3);
    });

    it('should show completed tasks when showCompleted is true', () => {
      const store = useTodoStore.getState();
      store.setTasks(sampleTasks);
      store.setShowCompleted(true);

      const state = useTodoStore.getState();
      expect(state.filteredTasks).toHaveLength(4);
    });

    it('should sort tasks by priority', () => {
      const store = useTodoStore.getState();
      store.setTasks(sampleTasks);

      const state = useTodoStore.getState();
      // A comes before B comes before C
      expect(state.filteredTasks[0]?.priority).toBe('A');
      expect(state.filteredTasks[1]?.priority).toBe('B');
      expect(state.filteredTasks[2]?.priority).toBe('C');
    });
  });

  describe('navigation', () => {
    it('should update current task index', () => {
      const store = useTodoStore.getState();
      store.setTasks(sampleTasks);
      store.setCurrentTaskIndex(2);

      expect(useTodoStore.getState().currentTaskIndex).toBe(2);
    });

    it('should change focused panel', () => {
      const store = useTodoStore.getState();
      store.setFocusedPanel('priorities');

      expect(useTodoStore.getState().focusedPanel).toBe('priorities');
    });

    it('should change to each panel', () => {
      const store = useTodoStore.getState();

      expect(store.focusedPanel).toBe('tasks');
      store.setFocusedPanel('priorities');
      expect(useTodoStore.getState().focusedPanel).toBe('priorities');
      store.setFocusedPanel('stats');
      expect(useTodoStore.getState().focusedPanel).toBe('stats');
      store.setFocusedPanel('projects');
      expect(useTodoStore.getState().focusedPanel).toBe('projects');
      store.setFocusedPanel('contexts');
      expect(useTodoStore.getState().focusedPanel).toBe('contexts');
      store.setFocusedPanel('tasks');
      expect(useTodoStore.getState().focusedPanel).toBe('tasks');
    });
  });

  describe('filtering', () => {
    it('should filter by project', () => {
      const store = useTodoStore.getState();
      store.setTasks(sampleTasks);
      store.setActiveFilter({ type: 'project', value: 'Work' });

      const state = useTodoStore.getState();
      // Work project has 2 tasks (1 active, 1 completed)
      // When activeFilter is set, showCompleted is ignored
      expect(state.filteredTasks).toHaveLength(2);
      expect(state.filteredTasks.every(t => t.projects.includes('Work'))).toBe(true);
    });

    it('should filter by context', () => {
      const store = useTodoStore.getState();
      store.setTasks(sampleTasks);
      store.setActiveFilter({ type: 'context', value: 'office' });

      const state = useTodoStore.getState();
      expect(state.filteredTasks).toHaveLength(1);
      expect(state.filteredTasks[0]?.contexts).toContain('office');
    });

    it('should filter by priority', () => {
      const store = useTodoStore.getState();
      store.setTasks(sampleTasks);
      store.setActiveFilter({ type: 'priority', value: 'B' });

      const state = useTodoStore.getState();
      expect(state.filteredTasks).toHaveLength(1);
      expect(state.filteredTasks[0]?.priority).toBe('B');
    });

    it('should search tasks by text', () => {
      const store = useTodoStore.getState();
      store.setTasks(sampleTasks);
      store.setSearchFilter('high');

      const state = useTodoStore.getState();
      expect(state.filteredTasks).toHaveLength(1);
      expect(state.filteredTasks[0]?.text).toContain('High');
    });

    it('should search tasks by project', () => {
      const store = useTodoStore.getState();
      store.setTasks(sampleTasks);
      store.setSearchFilter('home');

      const state = useTodoStore.getState();
      // Should match "Home" project and "@home" context
      expect(state.filteredTasks.length).toBeGreaterThan(0);
    });
  });

  describe('sorting', () => {
    it('should cycle sort mode', () => {
      const store = useTodoStore.getState();

      expect(store.sortMode).toBe('priority');
      store.cycleSortMode();
      expect(useTodoStore.getState().sortMode).toBe('date');
      store.cycleSortMode();
      expect(useTodoStore.getState().sortMode).toBe('project');
      store.cycleSortMode();
      expect(useTodoStore.getState().sortMode).toBe('context');
      store.cycleSortMode();
      expect(useTodoStore.getState().sortMode).toBe('priority');
    });

    it('should sort by date', () => {
      const store = useTodoStore.getState();
      store.setTasks(sampleTasks);
      store.setSortMode('date');

      const state = useTodoStore.getState();
      const dates = state.filteredTasks.map(t => t.creationDate);
      // Should be sorted chronologically
      for (let i = 1; i < dates.length; i++) {
        if (dates[i - 1] && dates[i]) {
          expect(dates[i - 1]! <= dates[i]!).toBe(true);
        }
      }
    });
  });

  describe('command bar', () => {
    it('should open command bar with prompt', () => {
      const store = useTodoStore.getState();
      store.openCommandBar('newTask', 'Enter task:', 'default value');

      const state = useTodoStore.getState();
      expect(state.commandBarActive).toBe(true);
      expect(state.commandBarMode).toBe('newTask');
      expect(state.commandBarPrompt).toBe('Enter task:');
      expect(state.commandBarDefaultValue).toBe('default value');
    });

    it('should close command bar', () => {
      const store = useTodoStore.getState();
      store.openCommandBar('search', 'Search:', '');
      store.closeCommandBar();

      const state = useTodoStore.getState();
      expect(state.commandBarActive).toBe(false);
      expect(state.commandBarMode).toBe('none');
    });
  });

  describe('help screen', () => {
    it('should toggle help screen', () => {
      const store = useTodoStore.getState();

      expect(store.showHelp).toBe(false);
      store.toggleHelp();
      expect(useTodoStore.getState().showHelp).toBe(true);
      store.toggleHelp();
      expect(useTodoStore.getState().showHelp).toBe(false);
    });
  });

  describe('theme', () => {
    it('should have default theme as catppuccin', () => {
      const state = useTodoStore.getState();
      expect(state.currentTheme).toBe('catppuccin');
    });

    it('should change theme', () => {
      const store = useTodoStore.getState();
      store.setTheme('dracula');

      expect(useTodoStore.getState().currentTheme).toBe('dracula');
    });

    it('should toggle theme selector', () => {
      const store = useTodoStore.getState();

      expect(store.showThemeSelector).toBe(false);
      store.toggleThemeSelector();
      expect(useTodoStore.getState().showThemeSelector).toBe(true);
      store.toggleThemeSelector();
      expect(useTodoStore.getState().showThemeSelector).toBe(false);
    });
  });

  describe('task data access', () => {
    it('should get all unique projects from tasks', () => {
      const store = useTodoStore.getState();
      store.setTasks(sampleTasks);

      const state = useTodoStore.getState();
      const allProjects = new Set<string>();
      for (const task of state.tasks) {
        for (const project of task.projects) {
          allProjects.add(project);
        }
      }

      expect(allProjects.has('Work')).toBe(true);
      expect(allProjects.has('Home')).toBe(true);
      expect(allProjects.size).toBe(2);
    });

    it('should get all unique contexts from tasks', () => {
      const store = useTodoStore.getState();
      store.setTasks(sampleTasks);

      const state = useTodoStore.getState();
      const allContexts = new Set<string>();
      for (const task of state.tasks) {
        for (const context of task.contexts) {
          allContexts.add(context);
        }
      }

      expect(allContexts.has('office')).toBe(true);
      expect(allContexts.has('phone')).toBe(true);
      expect(allContexts.has('home')).toBe(true);
      expect(allContexts.size).toBe(3);
    });

    it('should identify active tasks', () => {
      const store = useTodoStore.getState();
      store.setTasks(sampleTasks);

      const state = useTodoStore.getState();
      const activeTasks = state.tasks.filter(t => !t.completed);
      expect(activeTasks).toHaveLength(3);
      expect(activeTasks.every(t => !t.completed)).toBe(true);
    });

    it('should identify completed tasks', () => {
      const store = useTodoStore.getState();
      store.setTasks(sampleTasks);

      const state = useTodoStore.getState();
      const completedTasks = state.tasks.filter(t => t.completed);
      expect(completedTasks).toHaveLength(1);
      expect(completedTasks.every(t => t.completed)).toBe(true);
    });
  });
});
