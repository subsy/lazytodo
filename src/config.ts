import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';
import * as TOML from 'toml';

export interface Config {
  priorityMode: 'letter' | 'number'; // A-Z or 0-9
  theme: string; // Theme name (catppuccin, dracula, nord, etc.)
}

const DEFAULT_CONFIG: Config = {
  priorityMode: 'letter',
  theme: 'catppuccin',
};

function getConfigPath(): string {
  return process.env.TODO_CONFIG || join(homedir(), '.config', 'todo-tui', 'config.toml');
}

function ensureConfigDir(): void {
  const configPath = getConfigPath();
  const configDir = dirname(configPath);
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
  }
}

export async function loadConfig(): Promise<Config> {
  const configPath = getConfigPath();

  if (!existsSync(configPath)) {
    return DEFAULT_CONFIG;
  }

  try {
    const file = Bun.file(configPath);
    const content = await file.text();
    const config = TOML.parse(content);
    return { ...DEFAULT_CONFIG, ...config };
  } catch (error) {
    console.error('Failed to load config, using defaults:', error);
    return DEFAULT_CONFIG;
  }
}

export async function saveConfig(partialConfig: Partial<Config>): Promise<void> {
  const configPath = getConfigPath();
  ensureConfigDir();

  try {
    // Load existing config first to merge
    const existingConfig = await loadConfig();
    const config = { ...existingConfig, ...partialConfig };

    // Create TOML content manually (simple enough structure)
    const tomlContent = `# Todo TUI Configuration

# Priority mode: 'letter' (A-Z) or 'number' (0-9)
priorityMode = "${config.priorityMode}"

# Color theme
theme = "${config.theme}"
`;
    await Bun.write(configPath, tomlContent);
  } catch (error) {
    console.error('Failed to save config:', error);
    throw error;
  }
}

// Convert letter priority (A-Z) to number priority (0-9)
// A=0 (highest), B=1, C=2, ..., J=9 (lowest)
// K-Z map to 9 (lowest)
export function letterToNumber(letter: string): string {
  const code = letter.charCodeAt(0) - 'A'.charCodeAt(0);
  return Math.min(code, 9).toString();
}

// Convert number priority (0-9) to letter priority (A-Z)
// 0=A (highest), 1=B, 2=C, ..., 9=J (lowest)
export function numberToLetter(number: string): string {
  const num = parseInt(number);
  if (num < 0 || num > 9 || isNaN(num)) {
    return 'A'; // Default to A if invalid
  }
  return String.fromCharCode('A'.charCodeAt(0) + num);
}

// Validate priority based on mode
export function isValidPriority(priority: string, mode: 'letter' | 'number'): boolean {
  if (mode === 'letter') {
    return /^[A-Z]$/.test(priority);
  } else {
    return /^[0-9]$/.test(priority);
  }
}

// Normalize priority based on mode
export function normalizePriority(priority: string | null, mode: 'letter' | 'number'): string | null {
  if (!priority) return null;

  // If priority is already in the correct format, return as-is
  if (mode === 'letter' && /^[A-Z]$/.test(priority)) {
    return priority;
  }
  if (mode === 'number' && /^[0-9]$/.test(priority)) {
    return priority;
  }

  // Convert if needed
  if (mode === 'letter' && /^[0-9]$/.test(priority)) {
    return numberToLetter(priority);
  }
  if (mode === 'number' && /^[A-Z]$/.test(priority)) {
    return letterToNumber(priority);
  }

  return priority;
}
