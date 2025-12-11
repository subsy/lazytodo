# Development Guide for lazytodo

A vim-centric TUI for todo.txt, built with Bun, TypeScript, and OpenTUI.

## Quick Start

```bash
bun install          # Install dependencies
bun run dev          # Run in development mode
bun run build        # Compile to ./lazytodo binary
bun test             # Run tests
```

## Project Structure

```
lazytodo/
├── src/
│   ├── parser/              # Todo.txt format parser
│   ├── commands/            # CLI command implementations
│   ├── ui/                  # CLI output formatting
│   ├── tui/                 # TUI mode (OpenTUI + React)
│   │   ├── opentui-app.tsx  # Main TUI app entry
│   │   ├── components/      # React components
│   │   │   ├── Layout.tsx         # App container, header, footer
│   │   │   ├── TaskList.tsx       # Main task list
│   │   │   ├── TaskItem.tsx       # Individual task row
│   │   │   ├── PanelContainer.tsx # Side panels container
│   │   │   ├── PriorityChart.tsx  # Braille bar chart
│   │   │   ├── TagsPanel.tsx      # Projects/Contexts panels
│   │   │   ├── StatsPanel.tsx     # Stats in header
│   │   │   ├── CommandBar.tsx     # Input bar for commands
│   │   │   ├── HelpScreen.tsx     # Help overlay
│   │   │   ├── SettingsScreen.tsx # Settings screen
│   │   │   ├── ThemeSelector.tsx  # Theme picker
│   │   │   └── Logo.tsx           # Animated ASCII logo
│   │   ├── store/
│   │   │   └── useTodoStore.ts    # Zustand state management
│   │   ├── hooks/
│   │   │   └── useKeyboard.ts     # Keyboard navigation
│   │   └── themes/                # Theme definitions
│   ├── storage.ts           # File I/O (Bun.file/Bun.write)
│   └── config.ts            # Config file (~/.config/todo-tui/config.toml)
├── index.ts                 # CLI entry point
└── package.json
```

## Building

```bash
bun build index.ts --compile --outfile lazytodo
```

Creates a standalone binary (~114MB) with no runtime dependencies.

## Key Technologies

- **OpenTUI** (`@opentui/react`, `@opentui/core`) - React-based terminal UI framework
- **Zustand** - State management in `useTodoStore.ts`
- **Commander.js** - CLI argument parsing
- **TOML** - Config file parsing

## Architecture

### State Management

All TUI state lives in `src/tui/store/useTodoStore.ts`:
- `tasks` / `filteredTasks` - Task data
- `focusedPanel` - Current panel (tasks, priorities, projects, contexts)
- `currentTaskIndex` / `panelCursorIndex` - Cursor positions
- `commandBarMode` - Input mode (command, search, newTask, editTask, addDueDate)
- `commandLog` - History panel entries

### Keyboard Handling

`src/tui/hooks/useKeyboard.ts` handles all keyboard input:
- Panel navigation: TAB cycles through `['tasks', 'priorities', 'projects', 'contexts']`
- Vim commands: `:` opens command bar with mode='command'
- Task actions: space (toggle), n/a (new), e/i (edit), y (yank), p (paste)

### Priority Chart (Braille)

`src/tui/components/PriorityChart.tsx` uses braille characters for high-resolution bars:
- `⣀⣤⣶⣿` - 4 levels per character (both columns filled)
- 5 rows × 4 dots = 20 total granularity levels
- Proportional scaling: `Math.round((count / maxCount) * totalDots)`

### Themes

8 themes defined in `src/tui/themes/index.ts`:
- catppuccin, dracula, nord, gruvbox, tokyonight, solarized, onedark, monokai
- Each theme defines: background, text, border, highlight, priority colors, etc.

## Todo.txt Format

```
(A) 2025-12-10 Task text +Project @context due:2025-12-15
x 2025-12-11 (A) 2025-12-10 Completed task
```

- Priority: `(A)` through `(Z)` or `(0)` through `(9)`
- Projects: `+ProjectName`
- Contexts: `@ContextName`
- Due dates: `due:YYYY-MM-DD`

## Config

File: `~/.config/todo-tui/config.toml`

```toml
priorityMode = "number"  # or "letter"
theme = "catppuccin"
```

## Development Tips

- Use `bun run dev` for quick iteration (no compile step)
- OpenTUI renders React components to terminal - use `<box>`, `<text>` elements
- Zustand store updates trigger re-renders automatically
- Test binary after changes: `./lazytodo tui`
- Check braille rendering: characters may display differently across terminals/fonts
